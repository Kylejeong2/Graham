"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneCall, Send, User, Bot, AlertCircle, Mic, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Agent } from '@graham/db';
import { useChat } from 'ai/react';

export const AgentTesting: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [isCallInProgress, setIsCallInProgress] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
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

    const handleStartTestCall = async () => {
        if (!testPhoneNumber) {
            toast.error("Please enter a phone number to test");
            return;
        }

        try {
            setIsCallInProgress(true);
            const response = await fetch('/api/agent/test-call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: testPhoneNumber,
                    agentId: agent.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to initiate test call');
            }

            toast.success(`Test call initiated to ${testPhoneNumber}`);
        } catch (error) {
            console.error("Error starting test call:", error);
            toast.error("Failed to start test call");
        } finally {
            setIsCallInProgress(false);
        }
    };

    const handleStartRecording = () => {
        setIsRecording(true);
    };

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
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="w-full bg-white shadow-lg">
                <CardHeader className="border-b border-blue-100">
                    <CardTitle className="text-blue-600 flex items-center">
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Test Your Agent
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <p className="text-gray-700">Agent&apos;s phone number: <strong className="text-blue-600">{agent.phoneNumber || 'Not set'}</strong></p>
                        <div className="flex items-center space-x-2">
                            <Input 
                                placeholder="Enter test phone number..." 
                                value={testPhoneNumber}
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                className="border-blue-200 text-gray-700"
                            />
                            <Button 
                                onClick={handleStartTestCall}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={isCallInProgress}
                            >
                                {isCallInProgress ? 'Calling...' : 'Start Test Call'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full bg-white shadow-lg">
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
                    <div className="space-y-4">
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
                            <Button
                                type="button"
                                variant="outline"
                                className={isRecording ? 'bg-red-100' : ''}
                                onClick={handleStartRecording}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};