import json
import logging
import os

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, silero
from pinecone import Pinecone

logger = logging.getLogger("rag-worker")

class PineconeRagAgent:
    def __init__(self, index_name: str, business_name: str):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(index_name)
        self.business_name = business_name
        self.embeddings_dimension = 1536

    async def query_knowledge(self, query: str) -> str:
        user_embedding = await openai.create_embeddings(
            input=[query],
            model="text-embedding-3-small",
            dimensions=self.embeddings_dimension,
        )

        query_response = self.index.query(
            vector=user_embedding[0].embedding,
            top_k=3,  # Get top 3 matches for better context
            include_metadata=True
        )

        contexts = []
        for match in query_response.matches:
            if match.score > 0.7:  # Only use relevant matches
                contexts.append(match.metadata.get('text', ''))
        
        return "\n".join(contexts) if contexts else ''

async def entrypoint(ctx: JobContext):
    logger.info("Starting RAG agent")
    
    # Extract all metadata
    metadata = json.loads(ctx.room.metadata)
    token_metadata = json.loads(ctx.token.metadata)
    
    index_name = metadata.get('pineconeIndex')
    business_name = metadata.get('businessName')
    custom_instructions = token_metadata.get('customInstructions', '')
    initiate_conversation = metadata.get('initiateConversation')
    initial_message = metadata.get('initialMessage')

    if not index_name:
        raise ValueError("No Pinecone index specified")

    # Initialize agent with business context
    rag_agent = PineconeRagAgent(index_name, business_name)
    
    # Set up chat context with all custom instructions
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            f"You are an AI assistant for {business_name}. "
            "Keep responses concise and natural for voice interaction. "
            f"{custom_instructions}\n"
            "Use the query_knowledge function when you need specific information about the business."
        ),
    )

    fnc_ctx = llm.FunctionContext()

    @fnc_ctx.ai_callable(description="Query business knowledge base")
    async def query_knowledge(query: str) -> str:
        result = await rag_agent.query_knowledge(query)
        logger.info(f"Knowledge query result: {result}")
        return result

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=openai.LLM(),
        tts=openai.TTS(),
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx
    )
    
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    
    agent.start(ctx.room, participant)
    if initiate_conversation:
        await agent.say(initial_message, allow_interruptions=True)

if __name__ == "__main__":
    cli.run(entrypoint, WorkerOptions(room_name="test-room"))
