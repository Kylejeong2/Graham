"use client"

import React, { useState, useEffect } from 'react';
// import { AgentEditing } from './AgentEditing';
import type { Agent } from '@graham/db';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Upload, Volume2, UploadCloud, Download, Loader2 } from 'lucide-react'

interface Voice {
    id: string;
    name: string;
    description: string;
    language: string;
}

export const AgentSetup: React.FC<{ agent: Agent; }> = ({ agent }) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [customInstructions, setCustomInstructions] = useState('');
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [voices, setVoices] = useState<Voice[]>([]);
    const [isLoadingVoices, setIsLoadingVoices] = useState(false);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    
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

    const handleCompleteSetup = async () => {
        setIsCompleting(true);
        try {
            // TODO: Upload file to storage
            // TODO: Process document for RAG
            // TODO: Update agent with voice and instructions
            
            const response = await fetch(`/api/agent/completeSetup/${agent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isSetupComplete: true,
                    customInstructions,
                    selectedVoice,
                    // Add other fields as needed
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
                const response = await fetch('/api/agent/getVoices');
                if (!response.ok) throw new Error('Failed to fetch voices');
                const data = await response.json();
                setVoices(data);
            } catch (error) {
                console.error('Error fetching voices:', error);
                toast.error('Failed to load voices');
            } finally {
                setIsLoadingVoices(false);
            }
        };

        fetchVoices();
    }, []);

    const handleVoiceSelect = (voice: Voice) => {
        setSelectedVoice(voice.id);
        setSelectedVoiceName(voice.name);
        closeVoiceModal();
    };

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
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Textarea
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder="Add any specific instructions for your AI agent..."
                                    className="min-h-[150px] border-blue-200"
                                />
                                <div className="text-sm text-blue-600">
                                    {customInstructions.length}/1000 characters
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
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleDownloadTemplate}
                                variant="outline"
                                className="w-full border-blue-200 text-blue-900"
                            >
                                Download Business Information Template
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Complete Setup Button - At Bottom */}
            <div className="mt-auto pt-6">
                <Button 
                    onClick={handleCompleteSetup}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isCompleting || !selectedVoice || !uploadedFile}
                >
                    {isCompleting ? 'Completing Setup...' : 'Complete Setup'}
                </Button>
            </div>

            {/* Voice Selection Modal */}
            <Dialog open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen}>
                <DialogContent className="max-w-4xl">
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
                                    key={voice.id} 
                                    className={`p-4 cursor-pointer hover:border-blue-500 transition-all ${
                                        selectedVoice === voice.id ? 'border-2 border-blue-500' : ''
                                    }`}
                                    onClick={() => handleVoiceSelect(voice)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-blue-900">{voice.name}</h3>
                                            <p className="text-sm text-blue-600">English</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-orange-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // TODO: Implement voice preview using Cartesia's TTS endpoint
                                                toast.info('Voice preview coming soon!');
                                            }}
                                        >
                                            Preview
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