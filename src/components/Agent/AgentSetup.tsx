"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Clock, MessageSquare, Volume2, X, Phone, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { RETELL_VOICES } from '@/constants/voices';
import { AGENT_TEMPLATES, AgentTemplate } from '@/constants/template';
import { createRetellAgent, updateRetellPhoneNumber, getRetellLLM, createRetellLLM, updateRetellLLM } from '@/services/retellAI';
import { $users } from '@/lib/db/schema';
import { loadStripe } from '@stripe/stripe-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type User = {
    id: string;
    name: string;
    phoneNumbers: string[];
}

type Agent = {
    id: string;
    name: string;
    createdAt: Date;
    userId: string;
    phoneNumber: string;
    systemPrompt: string;
    isActive: boolean | null;
    voiceType: string | null;
    callHistory: unknown;
    minutesUsed: number;
    retellAgentId: string | null;
    retellPhoneNumberId: string | null;
    areaCode: string;
    llmId: string;
    llmWebsocketUrl: string;
}

type Voice = {
    voice_id: string;
    voice_type: string;
    voice_name: string;
    provider: string;
    gender: string;
    avatar_url: string;
    preview_audio_url: string;
    accent?: string;
    age?: string;
}

export const AgentSetup: React.FC<{ agent: Agent; user: User }> = ({ agent, user }) => {
    const [agentState, setAgentState] = useState<Agent>({
        ...agent,
        areaCode: agent.areaCode || '',
        systemPrompt: agent.systemPrompt || '',
        voiceType: agent.voiceType || '',
        phoneNumber: agent.phoneNumber || ''
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voices] = useState<Voice[]>(RETELL_VOICES);
    const [creatingRetellAgent, setCreatingRetellAgent] = useState(false);
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [userPhoneNumbers, setUserPhoneNumbers] = useState<string[]>(user.phoneNumbers || []);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchaseAreaCode, setPurchaseAreaCode] = useState('');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const saveData = async (data: Agent) => {
        try {
            setSaving(true);
            setError(null);

            const response = await fetch(`/api/editAgent/${agent.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data
                }),
            });

            if (response.status === 200) {
                const updatedAgent = await response.json();
                setAgentState(updatedAgent);
                if(data.retellAgentId) {
                    if (data.systemPrompt) {
                        // Update the RetellAgent LLM
                        await updateRetellLLM(agentState.llmId, {
                            general_prompt: data.systemPrompt
                        });
                    }
                    if (data.phoneNumber) {
                        // Update the RetellPhoneNumber
                        await updateRetellPhoneNumber(data.phoneNumber, {
                        inbound_agent_id: data.retellAgentId,
                        outbound_agent_id: data.retellAgentId,
                        });
                    }
                }
                setSaved(true);
                toast.success('Agent updated successfully');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update agent');
            }
        } catch (error) {
            console.error("Error saving agent:", error);
            setError('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const createRetellAIAgent = async () => {
        try {
            setCreatingRetellAgent(true);
            setError(null);

            if (!agentState.name || !agentState.voiceType || !agentState.systemPrompt || !agentState.areaCode) {
                setError('Please fill in all required fields (Name, Voice Type, System Prompt, and Area Code)');
                return;
            }

            let LLM;
            try {
                LLM = await createRetellLLM({
                    model: "gpt-4o-mini",
                    general_prompt: agentState.systemPrompt
                });
            } catch (llmError: any) {
                console.error("Error creating Retell LLM:", llmError);
                setError(`Failed to create Retell LLM: ${llmError.message || 'Unknown error'}`);
                return;
            }

            let retellAgent;
            try {
                retellAgent = await createRetellAgent({
                    llm_websocket_url: LLM.llm_websocket_url,
                    agent_name: agentState.name,
                    voice_id: agentState.voiceType,
                });
            } catch (agentError: any) {
                console.error("Error creating Retell agent:", agentError);
                setError(`Failed to create Retell agent: ${agentError.message || 'Unknown error'}`);
                return;
            }

            let retellPhoneNumber;
            try {
                const number = agentState.phoneNumber;
                retellPhoneNumber = await updateRetellPhoneNumber(number, {
                    inbound_agent_id: retellAgent.agent_id,
                    outbound_agent_id: retellAgent.agent_id,
                });
            } catch (phoneError: any) {
                console.error("Error updating Retell phone number:", phoneError);
                setError(`Failed to update Retell phone number: ${phoneError.message || 'Unknown error'}`);
                return;
            }

            const updatedAgent: Agent = {
                ...agentState,
                llmId: LLM.llm_id,
                llmWebsocketUrl: LLM.llm_websocket_url,
                areaCode: agentState.areaCode,
                retellAgentId: retellAgent.agent_id,
                phoneNumber: retellPhoneNumber.phone_number,
            };

            try {
                setAgentState(updatedAgent);
                await saveData(updatedAgent);
            } catch (saveError: any) {
                console.error("Error saving updated agent:", saveError);
                setError(`Failed to save updated agent: ${saveError.message || 'Unknown error'}`);
                return;
            }

            toast.success('AI agent created successfully');
        } catch (error: any) {
            console.error("Error creating AI agent:", error);
            setError(`Failed to create AI agent: ${error.message || 'Unknown error'}`);
        } finally {
            setCreatingRetellAgent(false);
        }
    };

    const playVoicePreview = (previewUrl: string) => {
        if (audioPlayer) {
            audioPlayer.pause();
        }
        const newAudioPlayer = new Audio(previewUrl);
        newAudioPlayer.play();
        setAudioPlayer(newAudioPlayer);
    };

    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => {
        setIsVoiceModalOpen(false);
        if (audioPlayer) {
            audioPlayer.pause();
            setAudioPlayer(null);
        }
    };

    // Update the selectVoice function to save the change immediately
    const selectVoice = async (voiceId: string) => {
        const updatedAgent = { ...agentState, voiceType: voiceId };
        setAgentState(updatedAgent);
        closeVoiceModal();
        await saveData(updatedAgent);
    };

    const handlePurchasePhoneNumber = async () => {
        try {
            setIsPurchasing(true);
            setError(null);

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
            const stripePk = process.env.NEXT_PUBLIC_STRIPE_PK;

            if (!baseUrl || !stripePk) {
                console.error('Missing environment variables');
                toast.error('Configuration error. Please contact support.');
                return;
            }

            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: 'Phone Number',
                    price: 5,
                    isYearly: false,
                    userId: user?.id,
                    successUrl: `${baseUrl}/agent/${agent.id}`,
                    cancelUrl: `${baseUrl}/agent/${agent.id}`,
                    areaCode: purchaseAreaCode,
                }),
            });

            if (!response.ok) throw new Error('Failed to create checkout session');

            const { sessionId } = await response.json();
            const stripe = await loadStripe(stripePk);
            if (!stripe) throw new Error('Failed to load Stripe');
            await stripe.redirectToCheckout({ sessionId });
        } catch (error: any) {
            console.error('Error purchasing phone number:', error);
            setError(error.message || 'Failed to purchase phone number');
            toast.error(error.message || 'Failed to purchase phone number');
        } finally {
            setIsPurchasing(false);
        }
    };

    // Function to delete a phone number
    const handleDeletePhoneNumber = async (phoneNumber: string) => {
        if (window.confirm('Are you sure you want to delete this phone number? This will cancel the associated $5/month subscription.')) {
            try {
                // Cancel Stripe subscription
                await fetch('/api/stripe/cancel-phone-number-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, userId: user.id }),
                });

                // Delete Retell phone number
                await fetch('/api/retell/delete-phone-number', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber }),
                });

                // Update local state
                setUserPhoneNumbers(userPhoneNumbers.filter(num => num !== phoneNumber));
                if (agentState.phoneNumber === phoneNumber) {
                    setAgentState({ ...agentState, phoneNumber: '' });
                    await saveData({ ...agentState, phoneNumber: '' });
                }

                toast.success('Phone number deleted successfully');
            } catch (error: any) {
                console.error('Error deleting phone number:', error);
                setError(error.message || 'Failed to delete phone number');
                toast.error(error.message || 'Failed to delete phone number');
            }
        }
    };

    const handleSelectPhoneNumber = async (phoneNumber: string) => {
        try {
            setError(null);

            if (!agentState.retellAgentId) {
                throw new Error('Retell Agent ID is not set. Please create the Retell AI Agent first.');
            }

            await updateRetellPhoneNumber(phoneNumber, {
                inbound_agent_id: agentState.retellAgentId,
                outbound_agent_id: agentState.retellAgentId,
            });

            setAgentState({ ...agentState, phoneNumber });
            await saveData({ ...agentState, phoneNumber });
            toast.success('Phone number assigned to agent');
        } catch (error: any) {
            console.error('Error assigning phone number to agent:', error);
            setError(error.message || 'Failed to assign phone number to agent');
            toast.error(error.message || 'Failed to assign phone number to agent');
        }
    };

    const openTemplateModal = () => setIsTemplateModalOpen(true);
    const closeTemplateModal = () => setIsTemplateModalOpen(false);

    const selectTemplate = (template: AgentTemplate) => {
        setAgentState({ ...agentState, systemPrompt: template.instructions });
        closeTemplateModal();
    };

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeVoiceModal();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Agent Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-[#5D4037]">Name *</Label>
                            <Input 
                                id="name" 
                                value={agentState.name} 
                                onChange={(e) => setAgentState({ ...agentState, name: e.target.value })} 
                                className="border-[#8B4513] text-[#5D4037]" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="areaCode" className="text-[#5D4037]">Area Code *</Label>
                            <Input 
                                id="areaCode" 
                                value={agentState.areaCode} 
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                    setAgentState({ ...agentState, areaCode: String(value) });
                                }} 
                                className="border-[#8B4513] text-[#5D4037]" 
                                placeholder="e.g. 415"
                                maxLength={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phoneNumber" className="text-[#5D4037]">Phone Number</Label>
                            <Select
                                value={agentState.phoneNumber || undefined}
                                onValueChange={(value) => setAgentState({ ...agentState, phoneNumber: value })}
                                disabled={!userPhoneNumbers.length}
                            >
                                <SelectTrigger className="border-[#8B4513] text-[#5D4037]">
                                    <SelectValue placeholder="Select a phone number" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userPhoneNumbers.length ? (
                                        userPhoneNumbers.map((number) => (
                                            <SelectItem key={number} value={number}>
                                                {number}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-numbers" disabled>
                                            No phone numbers available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Card className="bg-white shadow-lg md:col-span-2">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Phone Number Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Button onClick={() => setIsPurchaseModalOpen(true)} className="bg-[#4CAF50] text-white">
                            Purchase New Phone Number
                        </Button>
                        <div>
                            <h3 className="font-semibold mb-2">Your Phone Numbers:</h3>
                            {userPhoneNumbers.length > 0 ? (
                                <ul className="space-y-2">
                                    {userPhoneNumbers.map((number) => (
                                        <li key={number} className="flex items-center justify-between">
                                            <span>{number}</span>
                                            <Button
                                                onClick={() => handleSelectPhoneNumber(number)}
                                                disabled={agentState.phoneNumber === number}
                                                className="bg-[#8B4513] text-white"
                                            >
                                                {agentState.phoneNumber === number ? 'Selected' : 'Select'}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No phone numbers available. Purchase a new one to get started.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        AI Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="systemPrompt" className="text-[#5D4037]">Instructions *</Label>
                            <div className="flex items-center space-x-2 mb-2">
                                <Button onClick={openTemplateModal} className="bg-[#8B4513] text-white">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Use Template
                                </Button>
                            </div>
                            <Textarea 
                                id="systemPrompt" 
                                value={agentState.systemPrompt} 
                                onChange={(e) => setAgentState({ ...agentState, systemPrompt: e.target.value })} 
                                placeholder="Enter instructions for your AI agent" 
                                className="border-[#8B4513] text-[#5D4037] h-96" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="voiceType" className="text-[#5D4037]">Voice Type *</Label>
                            <Button onClick={openVoiceModal} className="w-full justify-start text-left">
                                {agentState.voiceType ? 
                                    voices.find(v => v.voice_id === agentState.voiceType)?.voice_name : 
                                    'Select a voice type'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-4">
                <Button 
                    onClick={() => saveData(agentState)}
                    className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : (saved ? 'Saved' : 'Save Changes')}
                </Button>

                {!agentState.retellAgentId && (
                    <Button 
                        onClick={createRetellAIAgent}
                        className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                        disabled={creatingRetellAgent}
                    >
                        {creatingRetellAgent ? 'Creating AI Agent...' : 'Create AI Agent'}
                    </Button>
                )}
            </div>

            {error && <div className="text-red-500 mt-2 md:col-span-2">{error}</div>}

            {isPurchaseModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-black">Purchase Phone Number</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="purchaseAreaCode" className="text-[#5D4037]">Area Code</Label>
                                <Input
                                    id="purchaseAreaCode"
                                    value={purchaseAreaCode}
                                    onChange={(e) => setPurchaseAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    className="border-[#8B4513] text-[#5D4037]"
                                    placeholder="e.g. 415"
                                    maxLength={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button onClick={() => setIsPurchaseModalOpen(false)} className="bg-gray-300 text-black">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePurchasePhoneNumber}
                                    className="bg-[#4CAF50] text-white"
                                    disabled={isPurchasing || purchaseAreaCode.length !== 3}
                                >
                                    {isPurchasing ? 'Purchasing...' : 'Purchase'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isVoiceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto relative">
                        <Button
                            onClick={closeVoiceModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <h2 className="text-2xl font-bold mb-4 text-black">Select a Voice</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {voices.map((voice) => (
                                <div key={voice.voice_id} className="border p-3 rounded-lg flex flex-col">
                                    <div className="flex items-center mb-2">
                                        <img src={voice.avatar_url} alt={voice.voice_name} className="w-10 h-10 rounded-full mr-2" />
                                        <h3 className="font-bold text-base text-black">{voice.voice_name}</h3>
                                    </div>
                                    <p className="text-sm text-black"><span className="font-semibold">Provider:</span> {voice.provider}</p>
                                    <p className="text-sm text-black"><span className="font-semibold">Gender:</span> {voice.gender}</p>
                                    <p className="text-sm text-black"><span className="font-semibold">Age:</span> {voice.age}</p>
                                    <p className="text-sm text-black"><span className="font-semibold">Accent:</span> {voice.accent}</p>
                                    <div className="mt-auto pt-3 flex justify-between items-center">
                                        <Button
                                            onClick={() => selectVoice(voice.voice_id)}
                                            className="bg-[#8B4513] text-white text-sm px-2 py-1"
                                        >
                                            Select
                                        </Button>
                                        <Button
                                            onClick={() => playVoicePreview(voice.preview_audio_url)}
                                            className="bg-[#4CAF50] text-white text-sm px-2 py-1"
                                        >
                                            <Volume2 className="h-3 w-3 mr-1" /> Preview
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isTemplateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto relative">
                        <Button
                            onClick={closeTemplateModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <h2 className="text-2xl font-bold mb-4 text-black">Select a Template</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {AGENT_TEMPLATES.map((template) => (
                                <div key={template.id} className="border p-3 rounded-lg flex flex-col">
                                    <h3 className="font-bold text-base text-black mb-2">{template.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                                    <div className="mt-auto">
                                        <Button
                                            onClick={() => selectTemplate(template)}
                                            className="bg-[#8B4513] text-white text-sm px-2 py-1 w-full"
                                        >
                                            Use Template
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}