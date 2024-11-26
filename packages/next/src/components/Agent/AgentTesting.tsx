"use client"

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { PhoneCall, Send, User, Bot, AlertCircle, Download, PlayCircle } from 'lucide-react';
import type { Agent } from '@graham/db';
import { useChat } from 'ai/react';
import { formatPhoneNumber } from './setup/setup-functions/formatPhoneNumber';

export const AgentTesting: React.FC<{ agent: Agent }> = ({ agent }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/agent/testing/test-message',
        body: {
            agentId: agent.id,
            systemPrompt: agent.systemPrompt,
            ragDocumentId: agent.ragDocumentId,
        }
    });

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleExportChat = () => {
        const chatText = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n\n');
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString()}.txt`;
        a.click();
    };

    if (!agent.deployed) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-4 w-full">
                <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Deployed</h2>
                <p className="text-gray-600 mb-6">Please complete the agent setup before testing.</p>
                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    Go to Setup
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-6 p-6">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center text-blue-600">
                                <PhoneCall className="w-5 h-5 mr-2" />
                                Test Your Agent
                            </CardTitle>
                            <CardDescription>
                                Try out different scenarios to test your agent's responses
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className={agent.deployed ? "bg-green-100 text-green-600 border-green-600" : "bg-red-100 text-red-600 border-red-600"}>
                            {agent.deployed ? 'Deployed' : 'Not Deployed'}
                        </Badge>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="text-center bg-blue-50 p-6 rounded-lg">
                            <p className="text-gray-600 mb-2">Test your agent by calling:</p>
                            <p className="text-3xl font-semibold text-blue-600 font-mono">
                                {formatPhoneNumber(agent.phoneNumber || '')}
                            </p>
                        </div>
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Common Test Scenarios</CardTitle>
                                    <CardDescription>Try these typical use cases</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ScrollArea className="h-[300px] pr-4">
                                        {[
                                            "Ask about business hours",
                                            "Request pricing information",
                                            "Schedule an appointment",
                                            "Handle a complaint",
                                            "Ask for directions",
                                            "Request a callback",
                                            "Multiple questions at once",
                                            "Unclear or ambiguous request",
                                            "Non-English inquiry",
                                            "Request outside business scope",
                                            "Complex technical question",
                                            "Emergency situation handling",
                                        ].map((scenario, index) => (
                                            <TooltipProvider key={index}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="outline"
                                                            className="w-full text-left justify-start h-auto py-3 mb-2 hover:border-blue-500 hover:text-blue-600"
                                                        >
                                                            <PlayCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                                            {scenario}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Click to test this scenario</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl flex items-center text-blue-600">
                                <Send className="w-5 h-5 mr-2" />
                                Chat Simulation
                            </CardTitle>
                            <CardDescription>
                                Test your agent's responses in real-time
                            </CardDescription>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={handleExportChat}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Export chat history</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                        <div ref={chatContainerRef}>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start space-x-2 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-blue-600" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-lg max-w-[80%] ${
                                        msg.role === 'user' 
                                            ? 'bg-orange-500 text-white' 
                                            : 'bg-blue-100 text-gray-700'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-orange-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="flex space-x-2 mt-4">
                        <Input 
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..." 
                            className="flex-1"
                        />
                        <Button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};