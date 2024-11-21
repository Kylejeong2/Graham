"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneCall, Send, User, Bot, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Agent } from '@graham/db';

export const AgentTesting: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [customerMessage, setCustomerMessage] = useState('');
    const [conversation, setConversation] = useState<{ sender: 'customer' | 'agent', message: string }[]>([]);
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [isCallInProgress, setIsCallInProgress] = useState(false);

    if (!agent.isSetupComplete) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-4 w-full">
                <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Deployed</h2>
                <p className="text-gray-600 mb-6">Please complete the agent setup before testing.</p>
            </div>
        );
    }

    const handleSendMessage = () => {
        if (customerMessage.trim()) {
            setConversation([...conversation, { sender: 'customer', message: customerMessage }]);

            setTimeout(() => {
                setConversation(prev => [...prev, { sender: 'agent', message: "Thank you for your message. How can I assist you today?" }]);
            }, 1000);
            setCustomerMessage('');
        }
    };

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="bg-white shadow-lg">
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

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-blue-100">
                    <CardTitle className="text-blue-600 flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        Simulate Customer Interaction
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <Input 
                                placeholder="Type a customer message..." 
                                value={customerMessage}
                                onChange={(e) => setCustomerMessage(e.target.value)}
                                className="border-blue-200 text-gray-700"
                            />
                            <Button 
                                onClick={handleSendMessage}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                Send
                            </Button>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md min-h-[200px] max-h-[400px] overflow-y-auto">
                            {conversation.map((msg, index) => (
                                <div key={index} className={`flex items-start space-x-2 mb-4 ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'agent' && (
                                        <Bot className="w-6 h-6 text-blue-600 mt-1" />
                                    )}
                                    <div className={`p-3 rounded-lg ${msg.sender === 'customer' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}>
                                        {msg.message}
                                    </div>
                                    {msg.sender === 'customer' && (
                                        <User className="w-6 h-6 text-blue-600 mt-1" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};