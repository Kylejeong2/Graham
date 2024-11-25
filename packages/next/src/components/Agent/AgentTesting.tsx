"use client"

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneCall, Send, User, Bot, AlertCircle, Download } from 'lucide-react';
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
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 gap-6 px-4">
            <Card className="w-full bg-white shadow-lg h-full">
                <CardHeader className="border-b border-blue-100">
                    <CardTitle className="text-blue-600 flex items-center">
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Test Your Agent
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-600 mb-2">Call this number to test your agent:</p>
                            <p className="text-2xl font-semibold text-blue-600">
                                {formatPhoneNumber(agent.phoneNumber || '')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className="text-gray-600 font-medium">Common Test Scenarios:</p>
                                <div className="space-y-2">
                                    {[
                                        "Ask about business hours",
                                        "Request pricing information",
                                        "Schedule an appointment",
                                        "Handle a complaint",
                                        "Ask for directions",
                                        "Request a callback"
                                    ].map((scenario, index) => (
                                        <Button 
                                            key={index}
                                            variant="outline"
                                            className="w-full text-left justify-start h-auto py-2"
                                        >
                                            {scenario}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-600 font-medium">Edge Cases:</p>
                                <div className="space-y-2">
                                    {[
                                        "Multiple questions at once",
                                        "Unclear or ambiguous request",
                                        "Non-English inquiry",
                                        "Request outside business scope",
                                        "Complex technical question",
                                        "Emergency situation handling"
                                    ].map((edgeCase, index) => (
                                        <Button 
                                            key={index}
                                            variant="outline"
                                            className="w-full text-left justify-start h-auto py-2 text-orange-600"
                                        >
                                            {edgeCase}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full bg-white shadow-lg h-full">
                <CardHeader className="border-b border-blue-100">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-blue-600 flex items-center">
                            <Send className="w-5 h-5 mr-2" />
                            Chat Simulation
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={handleExportChat}
                                title="Export chat"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Button 
                        variant="outline" 
                        className="w-full mb-4 py-6 text-lg font-medium bg-blue-50 hover:bg-blue-100"
                    >
                        Start chatting with your agent
                    </Button>
                    <div 
                        ref={chatContainerRef}
                        className="bg-blue-50 p-4 rounded-md min-h-[300px] max-h-[500px] overflow-y-auto"
                    >
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start space-x-2 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <Bot className="w-6 h-6 text-blue-600 mt-1" />
                                )}
                                <div className={`p-3 rounded-lg max-w-[80%] ${
                                    msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
                                }`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <User className="w-6 h-6 text-blue-600 mt-1" />
                                )}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <Input 
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..." 
                            className="border-blue-200 text-gray-700"
                        />
                        <Button 
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Send
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};