"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Info, User, Mic, Clock, MessageSquare, Save } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    phoneNumber: string | null;
    isActive: boolean;
    systemPrompt: string;
    voiceType: string;
    
}

export const AgentSetup: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [isActive, setIsActive] = useState(agent.isActive);
    const [businessHours, setBusinessHours] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });
    const [customResponses, setCustomResponses] = useState([
        { trigger: "greeting", response: "Hello! How may I assist you today?" },
        { trigger: "goodbye", response: "Thank you for calling. Have a great day!" },
    ]);

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
                            <Input id="name" defaultValue={agent.name} className="border-[#8B4513] text-[#5D4037]" />
                        </div>
                        <div>
                            <Label htmlFor="phoneNumber" className="text-[#5D4037]">Phone Number</Label>
                            <Input id="phoneNumber" defaultValue={agent.phoneNumber || ''} placeholder="Enter Twilio phone number" className="border-[#8B4513] text-[#5D4037]" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                            <Label htmlFor="isActive" className="text-[#5D4037]">Active</Label>
                        </div>
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
                            <Textarea id="systemPrompt" defaultValue={agent.systemPrompt} placeholder="Enter instructions for your AI agent" className="border-[#8B4513] text-[#5D4037]" />
                        </div>
                        <div>
                            <Label htmlFor="voiceType" className="text-[#5D4037]">Voice Type</Label>
                            <Select defaultValue={agent.voiceType}>
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
                        {Object.entries(businessHours).map(([day, isChecked]) => (
                            <div key={day} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={day} 
                                    checked={isChecked}
                                    onCheckedChange={(checked) => 
                                        setBusinessHours(prev => ({ ...prev, [day]: checked }))
                                    }
                                />
                                <Label htmlFor={day} className="text-[#5D4037] capitalize">{day}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Custom Responses
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {customResponses.map((response, index) => (
                            <div key={index} className="space-y-2">
                                <Input 
                                    placeholder="Trigger phrase" 
                                    value={response.trigger}
                                    onChange={(e) => {
                                        const newResponses = [...customResponses];
                                        newResponses[index].trigger = e.target.value;
                                        setCustomResponses(newResponses);
                                    }}
                                    className="border-[#8B4513] text-[#5D4037]"
                                />
                                <Textarea 
                                    placeholder="Custom response" 
                                    value={response.response}
                                    onChange={(e) => {
                                        const newResponses = [...customResponses];
                                        newResponses[index].response = e.target.value;
                                        setCustomResponses(newResponses);
                                    }}
                                    className="border-[#8B4513] text-[#5D4037]"
                                />
                            </div>
                        ))}
                        <Button 
                            onClick={() => setCustomResponses([...customResponses, { trigger: "", response: "" }])}
                            variant="outline"
                            className="w-full border-[#8B4513] text-[#8B4513] hover:bg-[#E6CCB2]"
                        >
                            Add Custom Response
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Button className="col-span-2 w-full bg-[#8B4513] hover:bg-[#A0522D] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
            </Button>
        </div>
    );
};