# Copyright 2023 LiveKit, Inc.\
    
# Edited by Kyle Jeong
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

import inspect
import json
import os
import logging
from dataclasses import dataclass
from typing import (
    Any,
    Awaitable,
    List,
    Literal,
    Tuple,
    Union,
    get_args,
    get_origin,
)

import httpx
from livekit.agents import (
    # APIConnectionError,
    # APIStatusError,
    # APITimeoutError,
    llm,
)
from livekit.agents.llm import ToolChoice
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

from cerebras.cloud.sdk import AsyncCerebras

from .models import (
    ChatModels,
)

logger = logging.getLogger(__name__)


@dataclass
class LLMOptions:
    model: str | ChatModels
    user: str | None
    temperature: float | None
    parallel_tool_calls: bool | None
    tool_choice: Union[ToolChoice, Literal["auto", "required", "none"]] | None


class LLM(llm.LLM):
    def __init__(
        self,
        *,
        model: str | ChatModels = "llama3.1-8b",  # Default to Cerebras's fast model
        api_key: str | None = None,
        base_url: str | None = None,
        user: str | None = None,
        client: AsyncCerebras | None = None,
        temperature: float | None = None,
        parallel_tool_calls: bool | None = None,
        tool_choice: Union[ToolChoice, Literal["auto", "required", "none"]] = "auto",
    ) -> None:
        """
        Create a new instance of Cerebras LLM.

        ``api_key`` must be set to your Cerebras API key, either using the argument or by setting
        the ``CEREBRAS_API_KEY`` environmental variable.
        """
        super().__init__()

        api_key = api_key or os.environ.get("CEREBRAS_API_KEY")
        if api_key is None:
            raise ValueError("Cerebras API key is required")

        self._opts = LLMOptions(
            model=model,
            user=user,
            temperature=temperature,
            parallel_tool_calls=parallel_tool_calls,
            tool_choice=tool_choice,
        )
        
        self._client = client or AsyncCerebras(
            api_key=api_key,
            base_url=base_url,
            timeout=httpx.Timeout(60.0, read=30.0, write=30.0, connect=5.0),
            max_retries=2,
            warm_tcp_connection=True,  # Enable TCP warming for better TTFT
        )

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = 1,
        parallel_tool_calls: bool | None = None,
        tool_choice: Union[ToolChoice, Literal["auto", "required", "none"]]
        | None = None,
    ) -> "LLMStream":
        if temperature is None:
            temperature = self._opts.temperature
        if parallel_tool_calls is None:
            parallel_tool_calls = self._opts.parallel_tool_calls
        if tool_choice is None:
            tool_choice = self._opts.tool_choice

        opts: dict[str, Any] = dict()
        if fnc_ctx and len(fnc_ctx.ai_functions) > 0:
            tools = []
            for fnc in fnc_ctx.ai_functions.values():
                tools.append(_build_function_description(fnc))
            opts["tools"] = tools

            if tool_choice is not None:
                if isinstance(tool_choice, ToolChoice):
                    if tool_choice.type == "function":
                        opts["tool_choice"] = {"type": "function", "function": {"name": tool_choice.name}}
                elif isinstance(tool_choice, str):
                    if tool_choice == "required":
                        opts["tool_choice"] = {"type": "function"}

        messages = _build_cerebras_messages(chat_ctx.messages)
        
        stream = self._client.chat.completions.create(
            model=self._opts.model,
            messages=messages,
            temperature=temperature or 0.7,
            stream=True,
            max_tokens=opts.get("max_tokens", 1024),
            **opts,
        )

        return LLMStream(
            self,
            cerebras_stream=stream,
            chat_ctx=chat_ctx,
            fnc_ctx=fnc_ctx,
            conn_options=conn_options,
        )


class LLMStream(llm.LLMStream):
    def __init__(
        self,
        llm: LLM,
        *,
        cerebras_stream: Awaitable[Any],
        chat_ctx: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None,
        conn_options: APIConnectOptions,
    ) -> None:
        super().__init__(
            llm, chat_ctx=chat_ctx, fnc_ctx=fnc_ctx, conn_options=conn_options
        )
        self._awaitable_cerebras_stream = cerebras_stream
        self._cerebras_stream = None

        self._tool_call_id: str | None = None
        self._fnc_name: str | None = None
        self._fnc_raw_arguments: str | None = None

        self._request_id: str = ""
        self._input_tokens = 0
        self._output_tokens = 0

    async def _run(self) -> None:
        try:
            if not self._cerebras_stream:
                self._cerebras_stream = await self._awaitable_cerebras_stream

            async for chunk in self._cerebras_stream:
                chat_chunk = self._parse_chunk(chunk)
                if chat_chunk is not None:
                    self._event_ch.send_nowait(chat_chunk)

                # Update token counts from usage info if available
                if hasattr(chunk, 'usage'):
                    self._input_tokens = getattr(chunk.usage, 'prompt_tokens', 0)
                    self._output_tokens = getattr(chunk.usage, 'completion_tokens', 0)

            self._event_ch.send_nowait(
                llm.ChatChunk(
                    request_id=self._request_id,
                    usage=llm.CompletionUsage(
                        completion_tokens=self._output_tokens,
                        prompt_tokens=self._input_tokens,
                        total_tokens=self._input_tokens + self._output_tokens,
                    ),
                )
            )
        except httpx.HTTPStatusError as e:
            logger.error(f"Cerebras API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise

    def _parse_chunk(self, chunk: Any) -> llm.ChatChunk | None:
        if not chunk.choices:
            return None

        choice = chunk.choices[0]
        if choice.delta.content is not None:
            return llm.ChatChunk(
                request_id=self._request_id,
                choices=[
                    llm.Choice(
                        delta=llm.ChoiceDelta(content=choice.delta.content, role="assistant")
                    )
                ],
            )
        elif hasattr(choice.delta, 'tool_calls') and choice.delta.tool_calls:
            tool_call = choice.delta.tool_calls[0]
            if hasattr(tool_call, 'function'):
                try:
                    self._tool_call_id = tool_call.id
                    self._fnc_name = tool_call.function.name
                    
                    # Handle arguments that might be dict or string
                    if isinstance(tool_call.function.arguments, dict):
                        self._fnc_raw_arguments = json.dumps(tool_call.function.arguments)
                    else:
                        self._fnc_raw_arguments = tool_call.function.arguments

                    if self._fnc_ctx:
                        fnc_info = _create_ai_function_info(
                            self._fnc_ctx,
                            self._tool_call_id,
                            self._fnc_name,
                            self._fnc_raw_arguments,
                        )
                        self._function_calls_info.append(fnc_info)

                        return llm.ChatChunk(
                            request_id=self._request_id,
                            choices=[
                                llm.Choice(
                                    delta=llm.ChoiceDelta(
                                        role="assistant",
                                        tool_calls=[fnc_info],
                                    ),
                                )
                            ],
                        )
                except Exception as e:
                    logger.error(f"Error parsing tool call: {str(e)}")
                    raise

        return None


def _build_cerebras_messages(messages: List[llm.ChatMessage]) -> List[dict]:
    """Build messages in Cerebras API format."""
    result = []
    
    # Always ensure first message is system
    if not messages or messages[0].role != "system":
        result.append({
            "role": "system",
            "content": "You are a helpful assistant."
        })

    for msg in messages:
        content = msg.content
        if isinstance(content, list):
            content = " ".join([c for c in content if isinstance(c, str)])
        elif content is None:
            content = ""

        if msg.role == "system":
            result.append({
                "role": "system",
                "content": content
            })
        elif msg.role == "user":
            result.append({
                "role": "user",
                "content": content
            })
        elif msg.role == "assistant":
            if msg.tool_calls:
                # For tool calls, split into two messages
                result.append({
                    "role": "assistant",
                    "content": content or ""
                })
                result.append({
                    "role": "system",  # Convert tool call to system message
                    "content": json.dumps({
                        "tool_calls": [{
                            "id": tc.tool_call_id,
                            "type": "function",
                            "function": {
                                "name": tc.function_info.name,
                                "arguments": tc.arguments
                            }
                        } for tc in msg.tool_calls]
                    })
                })
            else:
                result.append({
                    "role": "assistant",
                    "content": content
                })
        elif msg.role == "tool":
            # Convert tool responses to system messages
            result.append({
                "role": "system",
                "content": json.dumps({
                    "tool_response": {
                        "content": msg.content or "",
                        "tool_call_id": msg.tool_call_id
                    }
                })
            })
    
    return result


def _build_function_description(
    fnc_info: llm.function_context.FunctionInfo,
) -> dict:
    """Build a function description compatible with Cerebras API format"""
    def build_schema_field(arg_info: llm.function_context.FunctionArgInfo):
        def type2str(t: type) -> str:
            if t is str:
                return "string"
            elif t in (int, float):
                return "number"
            elif t is bool:
                return "boolean"
            raise ValueError(f"unsupported type {t} for ai_property")

        p: dict[str, Any] = {}
        if arg_info.default is inspect.Parameter.empty:
            p["required"] = True

        if arg_info.description:
            p["description"] = arg_info.description

        if get_origin(arg_info.type) is list:
            inner_type = get_args(arg_info.type)[0]
            p["type"] = "array"
            p["items"] = {"type": type2str(inner_type)}
        else:
            p["type"] = type2str(arg_info.type)

        return p

    parameters: dict[str, object] = {}
    required = []

    for arg_info in fnc_info.arguments.values():
        parameters[arg_info.name] = build_schema_field(arg_info)
        if arg_info.default is inspect.Parameter.empty:
            required.append(arg_info.name)

    return {
        "type": "function",
        "function": {
            "name": fnc_info.name,
            "description": fnc_info.description,
            "parameters": {
                "type": "object",
                "properties": parameters,
                "required": required
            }
        }
    }


def _create_ai_function_info(
    fnc_ctx: llm.function_context.FunctionContext,
    tool_call_id: str,
    fnc_name: str,
    raw_arguments: str,  # JSON string
) -> llm.function_context.FunctionCallInfo:
    if fnc_name not in fnc_ctx.ai_functions:
        raise ValueError(f"AI function {fnc_name} not found")

    parsed_arguments: dict[str, Any] = {}
    try:
        if raw_arguments:  # ignore empty string
            parsed_arguments = json.loads(raw_arguments)
    except json.JSONDecodeError:
        raise ValueError(
            f"AI function {fnc_name} received invalid JSON arguments - {raw_arguments}"
        )

    fnc_info = fnc_ctx.ai_functions[fnc_name]

    # Ensure all necessary arguments are present and of the correct type.
    sanitized_arguments: dict[str, Any] = {}
    for arg_info in fnc_info.arguments.values():
        if arg_info.name not in parsed_arguments:
            if arg_info.default is inspect.Parameter.empty:
                raise ValueError(
                    f"AI function {fnc_name} missing required argument {arg_info.name}"
                )
            continue

        arg_value = parsed_arguments[arg_info.name]
        if get_origin(arg_info.type) is not None:
            if not isinstance(arg_value, list):
                raise ValueError(
                    f"AI function {fnc_name} argument {arg_info.name} should be a list"
                )

            inner_type = get_args(arg_info.type)[0]
            sanitized_value = [
                _sanitize_primitive(
                    value=v, expected_type=inner_type, choices=arg_info.choices
                )
                for v in arg_value
            ]
        else:
            sanitized_value = _sanitize_primitive(
                value=arg_value, expected_type=arg_info.type, choices=arg_info.choices
            )

        sanitized_arguments[arg_info.name] = sanitized_value

    return llm.function_context.FunctionCallInfo(
        tool_call_id=tool_call_id,
        raw_arguments=raw_arguments,
        function_info=fnc_info,
        arguments=sanitized_arguments,
    )


def _sanitize_primitive(*, value: Any, expected_type: type, choices: Tuple[Any] | None) -> Any:
    """Sanitize a primitive value to the expected type."""
    try:
        if expected_type is str:
            if isinstance(value, dict):
                return json.dumps(value)
            return str(value)
        elif expected_type in (int, float):
            if not isinstance(value, (int, float, str)):
                raise ValueError(f"expected number, got {type(value)}")

            if expected_type is int:
                if isinstance(value, str):
                    value = float(value)
                if value % 1 != 0:
                    raise ValueError("expected int, got float")
                return int(value)
            return float(value)
        elif expected_type is bool:
            if isinstance(value, str):
                return value.lower() in ('true', '1', 'yes')
            return bool(value)

        if choices and value not in choices:
            raise ValueError(f"invalid value {value}, not in {choices}")

        return value
    except Exception as e:
        logger.error(f"Error sanitizing value {value} to type {expected_type}: {str(e)}")
        raise ValueError(f"Failed to convert {value} to {expected_type}")