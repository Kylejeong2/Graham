"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Upload, Volume2, UploadCloud, Download, Loader2, Play, Square, Phone, Settings, Calendar, CreditCard, BrainCircuit, ExternalLink, Mail } from 'lucide-react'
import debounce from 'lodash/debounce';
import type { Agent } from '@graham/db';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from '@radix-ui/react-switch';
import { Badge } from "@/components/ui/badge"
import type { User } from '@graham/db';

export const AgentSetup: React.FC<{ agentId: string; user: User }> = ({ agentId, user }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [customInstructions, setCustomInstructions] = useState<string>('');
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [voices, setVoices] = useState<any[]>([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [userPhoneNumbers, setUserPhoneNumbers] = useState<string[]>([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>('');
    const [isEnrichingInstructions, setIsEnrichingInstructions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [selectedAreaCode, setSelectedAreaCode] = useState('');
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
    const [searchStep, setSearchStep] = useState<'input' | 'results'>('input');
    const [countryCode, setCountryCode] = useState('US');
    const [searchError, setSearchError] = useState('');

    // Voice selection modal handlers
    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);
    
    // File upload handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type and size
        if (!file.type.includes('pdf')) {
            toast.error('Only PDF files are currently supported');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploadedFile(file);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('agentId', agentId);

            const response = await fetch('/api/agent/upload-document', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            if (data.success) {
                toast.success('File uploaded and processed successfully');
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
            setUploadedFile(null);
        }
    };

    // const handleDownloadTemplate = () => {
    //     // TODO: Implement template download
    //     toast.info('Template download coming soon!');
    // };

    const handleCompleteSetup = async () => {
        // TODO: Complete setup
        setIsCompleting(true);
        toast.info('Setup completed successfully!');
    };

    useEffect(() => {
        const fetchVoices = async () => {
            setIsLoadingVoices(true);
            try {
                // const response = await fetch('/api/agent/getVoices-cartesia');
                const response = await fetch('/api/agent/getVoices-eleven');
                if (!response.ok) throw new Error('Failed to fetch voices');
                const data = await response.json();
                setVoices(data.voices);
            } catch (error) {
                console.error('Error fetching voices:', error);
                toast.error('Failed to load voices');
            } finally {
                setIsLoadingVoices(false);
            }
        };

        fetchVoices();
    }, []);

    const handleVoiceSelect = async (voice: any) => {
        try {
            setSelectedVoice(voice.voice_id);
            setSelectedVoiceName(voice.name);
            closeVoiceModal();

            const updateData = {
                agentId,
                systemPrompt: customInstructions,
                voiceId: voice.voice_id,  
                voiceName: voice.name,    
            };
            
            const response = await fetch(`/api/agent/updateAgent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();
            
            if (response.ok) {
                toast.success('Voice updated successfully');
            } else {
                throw new Error(result.error || 'Failed to update voice');
            }
        } catch (error) {
            console.error('Error updating voice:', error);
            toast.error('Failed to update voice selection');
        }
    };

    // Create debounced save function
    const debouncedInstructionUpdate = useCallback(
        debounce(async (newInstructions: string) => {
            setIsSaving(true);
            try {
                const response = await fetch(`/api/agent/updateAgent`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentId,
                        systemPrompt: newInstructions,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update instructions');
                }
    
            } catch (error) {
                console.error('Error updating instructions:', error);
                toast.error('Failed to update instructions');
            } finally {
                setIsSaving(false);
            }
        }, 2000),
        [agentId]
    );

    // Update the instructions textarea handler
    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInstructions = e.target.value;
        setCustomInstructions(newInstructions);
        debouncedInstructionUpdate(newInstructions);
    };

    // Add audio preview handler
    const handlePreviewVoice = async (voice: any, e: React.MouseEvent) => {
        e.stopPropagation();
        
        // If there's currently playing audio, stop it
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // If clicking the same voice that's playing, stop it
        if (playingVoiceId === voice.voice_id) {
            setPlayingVoiceId(null);
            return;
        }

        // Play the new voice preview
        if (voice.preview_url) {
            const audio = new Audio(voice.preview_url);
            audioRef.current = audio;
            
            try {
                setPlayingVoiceId(voice.voice_id);
                await audio.play();
                
                // Reset playing state when audio ends
                audio.onended = () => {
                    setPlayingVoiceId(null);
                };
            } catch (error) {
                console.error('Error playing audio:', error);
                toast.error('Failed to play voice preview');
                setPlayingVoiceId(null);
            }
        } else {
            toast.error('No preview available for this voice');
        }
    };

    // Update the initial data fetch
    useEffect(() => {
        const fetchAgentData = async () => {
            if (!agentId) {
                setIsLoading(false);
                toast.error('No agent ID provided');
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/agent/getAgentData/${agentId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch agent data');
                }
                const agent: Agent = await response.json();
                
                // Initialize states with database values
                if (agent.systemPrompt) {
                    setCustomInstructions(agent.systemPrompt);
                }
                if (agent.voiceId) {
                    setSelectedVoice(agent.voiceId);
                }
                if (agent.voiceName) {
                    setSelectedVoiceName(agent.voiceName);
                }
            } catch (error) {
                console.error('Error fetching agent data:', error);
                toast.error('Failed to load agent data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAgentData();
    }, [agentId]);

    // Add phone numbers fetch
    useEffect(() => {
        const fetchUserPhoneNumbers = async () => {
            try {
                const response = await fetch('/api/user/getPhoneNumbers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user?.id })
                });
                if (!response.ok) throw new Error('Failed to fetch phone numbers');
                const data = await response.json();
                setUserPhoneNumbers(JSON.parse(data.phoneNumbers || '[]'));
            } catch (error) {
                console.error('Error fetching phone numbers:', error);
                toast.error('Failed to load phone numbers');
            }
        };

        fetchUserPhoneNumbers();
    }, []);

    // Add instruction enhancement handler
    const handleEnhanceInstructions = async () => {
        if (!customInstructions) {
            toast.warn('Please add some instructions first');
            return;
        }

        setIsEnrichingInstructions(true);
        try {
            const response = await fetch('/api/agent/enrich-instructions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instructions: customInstructions,
                    agentId,
                }),
            });

            if (!response.ok) throw new Error('Failed to enhance instructions');
            
            const data = await response.json();
            setCustomInstructions(data.enhancedInstructions as string);
            toast.success('Instructions enhanced successfully');
        } catch (error) {
            console.error('Error enhancing instructions:', error);
            toast.error('Failed to enhance instructions');
        } finally {
            setIsEnrichingInstructions(false);
        }
    };

    // Update the phone number selection handler
    const handlePhoneNumberSelect = async (phoneNumber: string) => {
        try {
            setSelectedPhoneNumber(phoneNumber);
            
            const response = await fetch(`/api/agent/updateAgent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    phoneNumber,
                }),
            });

            if (!response.ok) throw new Error('Failed to update phone number');
            toast.success('Phone number updated successfully');
        } catch (error) {
            console.error('Error updating phone number:', error);
            toast.error('Failed to update phone number');
        }
    };

    // Add this animation component
    const EnhancingAnimation = () => (
        <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-orange-500/10"
            initial={{ scaleX: 0 }}
            animate={{ 
                scaleX: 1,
                transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
            }}
        />
    );

    // Update the return statement to handle loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleSearchNumbers = async () => {
        setIsLoadingNumbers(true);
        setSearchError('');

        try {
            if (!selectedAreaCode || selectedAreaCode.length !== 3) {
                throw new Error('Please enter a valid 3-digit area code');
            }

            const response = await fetch('/api/twilio/get-phone-numbers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    areaCode: selectedAreaCode,
                    countryCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch numbers');
            }

            if (data.numbers.length === 0) {
                throw new Error('No available numbers found for this area code');
            }

            setAvailableNumbers(data.numbers);
            setSearchStep('results');
        } catch (error: any) {
            setSearchError(error.message);
            toast.error(error.message);
        } finally {
            setIsLoadingNumbers(false);
        }
    };

    const handleBuyNumber = async (phoneNumber: string) => {
        try {
            const response = await fetch('/api/twilio/buy-phone-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    phoneNumber,
                })
            });

            const data = await response.json();
            if (data.number) {
                toast.success('Phone number purchased successfully');
                setIsPhoneModalOpen(false);
                // Refresh phone numbers list
                const updatedNumbers = [...userPhoneNumbers, data.number];
                setUserPhoneNumbers(updatedNumbers);
            }
        } catch (error) {
            toast.error('Failed to purchase number');
        }
    };

    return (
        <div className="flex flex-col min-h-full gap-6">
            <div className="grid grid-cols-12 gap-6">
                {/* Left Half - Custom Instructions */}
                <Card className="col-span-12 lg:col-span-6 bg-white shadow-lg">
                    <CardHeader className="border-b border-blue-100">
                        <CardTitle className="text-blue-900 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
                            Custom Instructions
                        </CardTitle>
                        <p className="text-sm text-gray-500">Guide your AI's behavior</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <AnimatePresence>
                                    {isEnrichingInstructions && <EnhancingAnimation />}
                                </AnimatePresence>
                                <Textarea
                                    value={customInstructions}
                                    onChange={handleInstructionsChange}
                                    placeholder="Add any specific instructions for your AI agent..."
                                    className={cn(
                                        "min-h-[400px] border-blue-200 transition-all duration-200",
                                        isEnrichingInstructions && "bg-blue-50"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-blue-600">
                                        {(customInstructions?.length || 0)}/2000 characters
                                    </div>
                                    {isSaving && (
                                        <div className="flex items-center text-sm text-blue-600">
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Saving...
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleEnhanceInstructions}
                                    disabled={isEnrichingInstructions || !customInstructions.trim()}
                                    className={cn(
                                        "relative overflow-hidden",
                                        isEnrichingInstructions ? "bg-orange-500" : "bg-blue-600",
                                        "text-white hover:bg-blue-700 transition-colors duration-200"
                                    )}
                                >
                                    {isEnrichingInstructions ? (
                                        <div className="flex items-center">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Enhancing...
                                        </div>
                                    ) : (
                                        "Enhance Instructions"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Half - Split into quarters */}
                <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-6">
                    {/* Top Row - Two 1/4 cards side by side */}
                    <Card className="col-span-2 sm:col-span-1 bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <Volume2 className="w-5 h-5 mr-2 text-orange-500" />
                                Voice Configuration
                            </CardTitle>
                            <p className="text-sm text-gray-500">Select your AI agent's voice</p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <Button
                                onClick={openVoiceModal}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md group"
                            >
                                <Volume2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                {selectedVoiceName ? `${selectedVoiceName}` : 'Select Voice'}
                            </Button>
                            {selectedVoiceName && (
                                <div className="text-sm text-gray-600 flex items-center">
                                    <Badge variant="secondary" className="mr-2">Active</Badge>
                                    Click to change voice
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 sm:col-span-1 bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <Phone className="w-5 h-5 mr-2 text-orange-500" />
                                Phone Number
                            </CardTitle>
                            <p className="text-sm text-gray-500">Connect or purchase a number</p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <select
                                value={selectedPhoneNumber}
                                onChange={(e) => handlePhoneNumberSelect(e.target.value)}
                                className="w-full p-2 border border-blue-200 rounded-md text-sm"
                            >
                                <option value="">Select existing number</option>
                                {userPhoneNumbers.map((number) => (
                                    <option key={number} value={number}>{number}</option>
                                ))}
                            </select>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => setIsPhoneModalOpen(true)}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Buy New Number
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/dashboard/phone-number"}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Connect Existing
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Numbers start at $2/month
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bottom Row - Two 1/4 cards side by side */}
                    <Card className="col-span-2 sm:col-span-1 bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <UploadCloud className="w-5 h-5 mr-2 text-orange-500" />
                                Business Information
                            </CardTitle>
                            <p className="text-sm text-gray-500">Upload documents & templates</p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                <Input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.doc,.docx"
                                />
                                <Label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="bg-blue-50 p-2 rounded-full mb-2">
                                        <Upload className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className="text-sm text-blue-900 font-medium mb-1">
                                        {uploadedFile ? uploadedFile.name : 'Drop files here'}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                        PDF, DOC up to 5MB
                                    </span>
                                </Label>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 text-xs h-auto py-2">
                                    <Download className="w-3 h-3 mr-1" />
                                    Template
                                </Button>
                                <Button variant="outline" className="flex-1 text-xs h-auto py-2">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Google Docs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 sm:col-span-1 bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-blue-900 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-orange-500" />
                                    Functions
                                </CardTitle>
                                <Badge variant="outline" className="bg-blue-50">Beta</Badge>
                            </div>
                            <p className="text-sm text-gray-500">Enable AI capabilities</p>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {/* Core Features */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-medium text-blue-900">Core Features</h4>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Calendar, label: 'Appointment Booking', desc: 'Schedule meetings' },
                                            { icon: CreditCard, label: 'Payment Processing', desc: 'Handle transactions' },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
                                                <div className="flex items-center gap-2">
                                                    <feature.icon className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm">{feature.label}</p>
                                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch className="scale-75" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Integrations */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-medium text-blue-900">Integrations</h4>
                                    <div className="space-y-2">
                                        {[
                                            { icon: BrainCircuit, label: 'CRM Integration', desc: 'Connect your CRM' },
                                            { icon: Mail, label: 'Email Notifications', desc: 'Auto-send updates' },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
                                                <div className="flex items-center gap-2">
                                                    <feature.icon className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm">{feature.label}</p>
                                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch className="scale-75" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Complete Setup Button */}
            <div className="mt-auto pt-6">
                <Button 
                    onClick={handleCompleteSetup}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isCompleting}
                >
                    {isCompleting ? 'Completing Setup...' : 'Complete Setup'}
                </Button>
            </div>

            {/* Voice Selection Modal */}
            <Dialog open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-blue-900">Select a Voice</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoadingVoices ? (
                            <div className="col-span-full flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : voices.length > 0 ? (
                            voices.map((voice) => (
                                <Card 
                                    key={voice.voice_id} 
                                    className={`p-4 cursor-pointer hover:border-blue-500 transition-all ${
                                        selectedVoice === voice.voice_id ? 'border-2 border-blue-500' : ''
                                    }`}
                                    onClick={() => handleVoiceSelect(voice)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-blue-900">{voice.name}</h3>
                                            <p className="text-sm text-blue-600">
                                                {voice.labels?.accent || 'English'}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={`text-orange-500 ${playingVoiceId === voice.voice_id ? 'bg-orange-50' : ''}`}
                                            onClick={(e) => handlePreviewVoice(voice, e)}
                                        >
                                            {playingVoiceId === voice.voice_id ? (
                                                <Square className="w-4 h-4" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-blue-900">
                                No voices available
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Purchase Phone Number</DialogTitle>
                    </DialogHeader>
                    
                    {searchStep === 'input' ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <select 
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="US">United States (+1)</option>
                                    <option value="CA">Canada (+1)</option>
                                    {/* Add more countries as needed */}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Area Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., 415"
                                        value={selectedAreaCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setSelectedAreaCode(value);
                                        }}
                                        maxLength={3}
                                        className="font-mono"
                                    />
                                    <Button 
                                        onClick={handleSearchNumbers} 
                                        disabled={isLoadingNumbers || selectedAreaCode.length !== 3}
                                    >
                                        {isLoadingNumbers ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Search'
                                        )}
                                    </Button>
                                </div>
                                {searchError && (
                                    <p className="text-sm text-red-500">{searchError}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    Found {availableNumbers.length} numbers in {selectedAreaCode}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSearchStep('input')}
                                >
                                    New Search
                                </Button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {availableNumbers.map((number: any) => (
                                    <div 
                                        key={number.phoneNumber} 
                                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-mono font-medium">{number.friendlyName}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary">
                                                    {number.locality || number.region}
                                                </Badge>
                                                {number.capabilities.voice && (
                                                    <Badge variant="outline">Voice</Badge>
                                                )}
                                                {number.capabilities.SMS && (
                                                    <Badge variant="outline">SMS</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => handleBuyNumber(number.phoneNumber)}
                                            className="ml-4"
                                        >
                                            Purchase
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};