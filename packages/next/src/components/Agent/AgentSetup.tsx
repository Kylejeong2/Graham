"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { AgentEditing } from './AgentEditing';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Upload, Volume2, UploadCloud, Download, Loader2, Play, Square } from 'lucide-react'
import debounce from 'lodash/debounce';
import type { Agent } from '@graham/db';

export const AgentSetup: React.FC<{ agentId: string; }> = ({ agentId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [customInstructions, setCustomInstructions] = useState('');
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [voices, setVoices] = useState<any[]>([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Voice selection modal handlers
    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);
    
    // File upload handlers
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleDownloadTemplate = () => {
        // TODO: Implement template download
        toast.info('Template download coming soon!');
    };

    const handleUpdateAgent = async () => {
        setIsCompleting(true);
        try {
            // TODO: Upload file to storage
            // TODO: Process document for RAG
            
            const response = await fetch(`/api/agent/updateAgent/${agentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: customInstructions,
                    voiceId: selectedVoice,
                }),
            });

            if (response.ok) {
                toast.success('Setup completed successfully');
                window.location.reload();
            } else {
                throw new Error('Failed to complete setup');
            }
        } catch (error) {
            console.error('Error completing setup:', error);
            toast.error('Failed to complete setup');
        } finally {
            setIsCompleting(false);
        }
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
            // Update local state
            setSelectedVoice(voice.voice_id);
            setSelectedVoiceName(voice.name);

            // Update in database
            handleUpdateAgent();

            closeVoiceModal();
            toast.success('Voice updated successfully');
        } catch (error) {
            console.error('Error updating voice:', error);
            toast.error('Failed to update voice selection');
        }
    };

    // Add debounced instruction update
    const debouncedInstructionUpdate = useCallback(
        debounce(async (instructions: string) => {
            try {
                const response = await fetch('/api/agent/enrich-instructions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instructions,
                        agentId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update instructions');
                }

                const data = await response.json();
                setCustomInstructions(data.enhancedInstructions);
                toast.success('Instructions enhanced and updated');
            } catch (error) {
                console.error('Error updating instructions:', error);
                toast.error('Failed to update instructions');
            }
        }, 1000),
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

    // Update the return statement to handle loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Voice and Instructions */}
                <div className="space-y-6">
                    {/* Voice Selection Section */}
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <Volume2 className="w-5 h-5 mr-2 text-orange-500" />
                                Voice Configuration
                            </CardTitle>
                            <p className="text-sm text-gray-500">Choose a voice for your AI agent to use during conversations</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Button
                                onClick={openVoiceModal}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {selectedVoiceName ? `Selected: ${selectedVoiceName}` : 'Select Voice'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Custom Instructions Section */}
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
                                Custom Instructions
                            </CardTitle>
                            <p className="text-sm text-gray-500">Provide specific instructions to guide your AI agent's behavior and responses</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Textarea
                                    value={customInstructions}
                                    onChange={handleInstructionsChange}
                                    placeholder="Add any specific instructions for your AI agent..."
                                    className="min-h-[150px] border-blue-200"
                                />
                                <div className="text-sm text-blue-600">
                                    {customInstructions.length}/2000 characters
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Document Upload and Template */}
                <div className="space-y-6">
                    {/* Document Upload Section */}
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <UploadCloud className="w-5 h-5 mr-2 text-orange-500" />
                                Business Information
                            </CardTitle>
                            <p className="text-sm text-gray-500">Upload documents containing your business information for the AI to learn from</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center flex flex-col items-center justify-center">
                                <Input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <Label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="w-12 h-12 text-blue-500 mb-2" />
                                    <span className="text-blue-900 font-medium">
                                        {uploadedFile ? uploadedFile.name : 'Drop your file here or click to upload'}
                                    </span>
                                    <span className="text-sm text-blue-600 mt-1">
                                        Supports PDF, DOC, DOCX, TXT
                                    </span>
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template Download Section */}
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <Download className="w-5 h-5 mr-2 text-orange-500" />
                                Template
                            </CardTitle>
                            <p className="text-sm text-gray-500">Download a template to help structure your business information properly</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Button
                                    onClick={handleDownloadTemplate}
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-900"
                                >
                                    Download Business Information Template
                                </Button>    
                                <Button
                                    onClick={handleDownloadTemplate}
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-900"
                                >
                                    Go to Google Docs Template
                                </Button>    
                            </div>
                           
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Complete Setup Button - At Bottom */}
            <div className="mt-auto pt-6">
                <Button 
                    onClick={handleUpdateAgent}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isCompleting || !selectedVoice || !uploadedFile}
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
        </div>
    );
};