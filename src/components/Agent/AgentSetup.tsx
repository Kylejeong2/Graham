"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { User, Clock, MessageSquare, Volume2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { RETELL_VOICES } from '@/constants/voices';
import { createRetellAgent, updateRetellPhoneNumber, createRetellPhoneNumber, createRetellLLM } from '@/services/retellAI';

type Agent = {
    id: string;
    name: string;
    createdAt: Date;
    userId: string;
    phoneNumber: string | null;
    systemPrompt: string;
    isActive: boolean | null;
    businessHours: Record<string, boolean>;
    voiceType: string | null;
    callHistory: unknown;
    minutesUsed: number;
    retellAgentId: string | null;
    retellPhoneNumberId: string | null;
    areaCode: string;
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

export const AgentSetup: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [agentState, setAgentState] = useState<Agent>({
        ...agent,
        areaCode: agent.areaCode || '',
        systemPrompt: agent.systemPrompt || '',
        voiceType: agent.voiceType || '' // Ensure voiceType is initialized
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voices, setVoices] = useState<Voice[]>(RETELL_VOICES);
    const [creatingRetellAgent, setCreatingRetellAgent] = useState(false);
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

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
                    model: "gpt-3.5-turbo",
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

             // Create Retell AI phone number
            // const retellPhoneNumber = await createRetellPhoneNumber({
            //     inbound_agent_id: retellAgent.agent_id,
            //     outbound_agent_id: retellAgent.agent_id,
            //     area_code: agentState.areaCode,
            // });

            let retellPhoneNumber;
            try {
                const number = "+19785068675";
                retellPhoneNumber = await updateRetellPhoneNumber(number, {
                    inbound_agent_id: retellAgent.agent_id,
                    outbound_agent_id: retellAgent.agent_id,
                });
            } catch (phoneError: any) {
                console.error("Error updating Retell phone number:", phoneError);
                setError(`Failed to update Retell phone number: ${phoneError.message || 'Unknown error'}`);
                return;
            }

            const updatedAgent = {
                ...agentState,
                retellAgentId: retellAgent.agent_id,
                retellPhoneNumberId: retellPhoneNumber.id,
                phoneNumber: retellPhoneNumber.phone_number,
            };

            try {
                await saveData(updatedAgent);
            } catch (saveError: any) {
                console.error("Error saving updated agent:", saveError);
                setError(`Failed to save updated agent: ${saveError.message || 'Unknown error'}`);
                return;
            }

            toast.success('Retell AI agent created successfully');
        } catch (error: any) {
            console.error("Error creating Retell AI agent:", error);
            setError(`Failed to create Retell AI agent: ${error.message || 'Unknown error'}`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {/* <div>
                            <Label htmlFor="phoneNumber" className="text-[#5D4037]">Phone Number</Label>
                            <Input 
                                id="phoneNumber" 
                                value={agentState.phoneNumber || ''} 
                                onChange={(e) => setAgentState({ ...agentState, phoneNumber: e.target.value })} 
                                className="border-[#8B4513] text-[#5D4037]" 
                                disabled={!!agentState.retellPhoneNumberId}
                            />
                        </div> */}
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
                            <Input 
                                id="phoneNumber" 
                                value={agentState.phoneNumber || 'Not assigned yet'} 
                                className="border-[#8B4513] text-[#5D4037]" 
                                disabled={true}
                            />
                        </div>
                        {/* <div className="flex items-center space-x-2">
                            <Switch 
                                id="isActive" 
                                checked={agentState.isActive || false} 
                                onCheckedChange={(checked) => setAgentState({ ...agentState, isActive: checked })} 
                            />
                            <Label htmlFor="isActive" className="text-[#5D4037]">Active</Label>
                        </div> */}
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
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="systemPrompt" className="text-[#5D4037]">System Prompt *</Label>
                            <Textarea 
                                id="systemPrompt" 
                                value={agentState.systemPrompt} 
                                onChange={(e) => setAgentState({ ...agentState, systemPrompt: e.target.value })} 
                                placeholder="Enter instructions for your AI agent" 
                                className="border-[#8B4513] text-[#5D4037]" 
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

            <Card className="bg-white shadow-lg md:col-span-2">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Business Hours
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Implement business hours configuration here */}
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
                        {creatingRetellAgent ? 'Creating Retell AI Agent...' : 'Create Retell AI Agent'}
                    </Button>
                )}
            </div>

            {error && <div className="text-red-500 mt-2 md:col-span-2">{error}</div>}

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
        </div>
    );
}