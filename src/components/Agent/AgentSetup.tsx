"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Info, User, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

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
}

const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if the number is valid (assuming US format)
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        const intlCode = match[1] ? '+1 ' : '';
        return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    
    // If the number doesn't match the expected format, return the original input
    return phoneNumber;
};

export const AgentSetup: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [agentState, setAgentState] = useState<Agent>({
        ...agent,
        businessHours: agent.businessHours,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAgentState({
            ...agent,
            businessHours: agent.businessHours,
        });
    }, [agent]);

    const saveData = async (data: Agent) => {
        try {
            setSaving(true);
            setError(null);

            const response = await fetch(`/api/editAgent/${agent.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.status === 200) {
                const updatedAgent = await response.json();
                setAgentState(updatedAgent);
                setSaved(true);
                toast.success('Data saved successfully');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update agent');
                toast.error('Failed to save data. Please try again.');
            }
        } catch (error) {
            console.error('Error updating agent:', error);
            setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <Info className="w-5 h-5 mr-2" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-[#5D4037]">Agent Name</Label>
                            <Input 
                                id="name" 
                                value={agentState.name} 
                                onChange={(e) => setAgentState({ ...agentState, name: e.target.value })} 
                                className="border-[#8B4513] text-[#5D4037]" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="phoneNumber" className="text-[#5D4037]">Phone Number</Label>
                            <Input 
                                id="phoneNumber" 
                                value={agentState.phoneNumber ? formatPhoneNumber(agentState.phoneNumber) : ''}
                                onChange={(e) => setAgentState({ ...agentState, phoneNumber: e.target.value })}
                                className="border-[#8B4513] text-[#5D4037]"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="isActive" 
                                checked={agentState.isActive || false} 
                                onCheckedChange={(checked) => setAgentState({ ...agentState, isActive: checked })} 
                            />
                            <Label htmlFor="isActive" className="text-[#5D4037]">Active</Label>
                        </div>
                        <Button 
                            onClick={() => saveData(agentState)}
                            className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
                            disabled={saving}
                        >
                            {saved ? 'Saved' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        AI Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="systemPrompt" className="text-[#5D4037]">System Prompt</Label>
                            <Textarea 
                                id="systemPrompt" 
                                value={agentState.systemPrompt} 
                                onChange={(e) => setAgentState({ ...agentState, systemPrompt: e.target.value })} 
                                placeholder="Enter instructions for your AI agent" 
                                className="border-[#8B4513] text-[#5D4037]" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="voiceType" className="text-[#5D4037]">Voice Type</Label>
                            <Select 
                                value={agentState.voiceType || ''} 
                                onValueChange={(value) => setAgentState({ ...agentState, voiceType: value })}
                            >
                                <SelectTrigger id="voiceType" className="border-[#8B4513] text-[#5D4037]">
                                    <SelectValue placeholder="Select a voice type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button 
                            onClick={() => saveData(agentState)}
                            className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
                            disabled={saving}
                        >
                            {saved ? 'Saved' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Business Hours
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        {agentState.businessHours && Object.entries(agentState.businessHours).map(([day, isChecked]) => (
                            <div key={day} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={day} 
                                    checked={isChecked}
                                    onCheckedChange={(checked) => 
                                        setAgentState(prev => ({ 
                                            ...prev, 
                                            businessHours: { 
                                                ...prev.businessHours, 
                                                [day]: checked as boolean
                                            } 
                                        }))
                                    }
                                />
                                <Label htmlFor={day} className="text-[#5D4037] capitalize">{day}</Label>
                            </div>
                        ))}
                        <Button 
                            onClick={() => saveData(agentState)}
                            className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
                            disabled={saving}
                        >
                            {saved ? 'Saved' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && <div className="text-red-500 mt-2 col-span-2">{error}</div>}
        </div>
    );
};