"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Upload, Volume2, UploadCloud, Download, Loader2, Phone, Settings, Calendar, CreditCard, ExternalLink, Mail, BrainCircuit } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link';
import type { User, Agent, BusinessAddress } from '@graham/db';
import { BuyPhoneNumberModal, CalendarIntegrationModal, VoiceSelectionModal } from './setup/modals';
import { handleDocumentSelect, handleVoiceSelect, handlePreviewVoice, handleGoogleAuth, handleFileUpload, 
    fetchAgentData, createDebouncedMessageUpdate, handleCompleteSetup, fetchVoices, handleEnhanceInstructions, 
    createDebouncedInstructionUpdate, handlePhoneNumberSelect, fetchUserPhoneNumbers, handleDownloadTemplate, formatPhoneNumber
} from './setup/setup-functions';
import type { ConversationInitType } from './setup/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { BusinessDocument } from './setup/types/business';


export const AgentSetup: React.FC<{ agent: Agent; user: User }> = ({ agent, user }) => {
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
    const [initialMessage, setInitialMessage] = useState('');
    const [conversationType, setConversationType] = useState<ConversationInitType>('user');
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [calendarStep, setCalendarStep] = useState<'select' | 'google' | 'servicetitan'>('select');
    const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
    const [businessDocuments, setBusinessDocuments] = useState<BusinessDocument[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<string>('');

    const debouncedMessageUpdate = useCallback(
        createDebouncedMessageUpdate(agent.id, setIsSaving),
        [agent.id]
    );

    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);

    useEffect(() => {
        fetchVoices(setIsLoadingVoices, setVoices);
    }, []);

    const debouncedInstructionUpdate = useCallback(
        createDebouncedInstructionUpdate(agent.id, setIsSaving),
        [agent.id]
    );

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInstructions = e.target.value;
        setCustomInstructions(newInstructions);
        debouncedInstructionUpdate(newInstructions);
    };

    useEffect(() => {
        fetchAgentData(
            agent.id, 
            setIsLoading, 
            setCustomInstructions, 
            setSelectedVoice, 
            setSelectedVoiceName, 
            setConversationType, 
            setInitialMessage,
            setSelectedPhoneNumber
        );
    }, [agent.id]);

    useEffect(() => {
        if (user?.id) {
            fetchUserPhoneNumbers(user.id, setUserPhoneNumbers, agent.phoneNumber || '');
        }
    }, [user?.id, agent.phoneNumber]);

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

    useEffect(() => {
        const fetchBusinessDocs = async () => {
            try {
                const response = await fetch(`/api/agent/information/get-documents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
                const data = await response.json();
                setBusinessDocuments(data);
            } catch (error) {
                toast.error('Failed to fetch business documents');
            }
        };
        
        if (user?.id) {
            fetchBusinessDocs();
        }
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] w-full px-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full gap-6">
            <div className="grid grid-cols-12 gap-6 w-full">
                {/* Left Half - Custom Instructions */}
                <Card className="col-span-12 lg:col-span-6 bg-white shadow-lg">
                    <CardHeader className="border-b border-blue-100">
                        <CardTitle className="text-blue-900 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
                            Custom Instructions
                        </CardTitle>
                        <p className="text-sm text-gray-500">What do you want your AI agent to do? Just simply describe it below.</p>
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
                                        {(customInstructions?.length || 0)}/2000 characters (recommended)
                                    </div>
                                    {isSaving && (
                                        <div className="flex items-center text-sm text-blue-600">
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Saving...
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleEnhanceInstructions(
                                        customInstructions,
                                        agent.id,
                                        setCustomInstructions,
                                        setIsEnrichingInstructions
                                    )}
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
                        <Card className="col-span-12 bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
                                Conversation Flow
                            </CardTitle>
                            <p className="text-sm text-gray-500">Configure how calls begin</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-blue-900">Who starts the conversation?</Label>
                                    <Select
                                        value={conversationType}
                                        onValueChange={async (newType) => {
                                            setConversationType(newType as ConversationInitType);
                                            try {
                                                await fetch(`/api/agent/updateAgent`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        agentId: agent.id,
                                                        initiateConversation: newType !== 'user',
                                                        initialMessage: newType === 'ai-default' 
                                                            ? "Hello! How can I assist you today?"
                                                            : newType === 'user' ? "" : initialMessage
                                                    }),
                                                });
                                            } catch (error) {
                                                toast.error('Failed to update conversation preference');
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select who starts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User speaks first</SelectItem>
                                            <SelectItem value="ai-default">AI speaks first (default greeting)</SelectItem>
                                            <SelectItem value="ai-custom">AI speaks first (custom message)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <AnimatePresence>
                                    {conversationType === 'ai-custom' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="space-y-4">
                                                <Label className="text-blue-900">Custom Initial Message</Label>
                                                <div className="relative">
                                                    <Input
                                                        value={initialMessage}
                                                        onChange={(e) => {
                                                            setInitialMessage(e.target.value);
                                                            debouncedMessageUpdate(e.target.value);
                                                        }}
                                                        placeholder="Enter custom initial message..."
                                                    />
                                                    {isSaving && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
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
                            <Select
                                value={selectedPhoneNumber}
                                onValueChange={(phoneNumber) => handlePhoneNumberSelect(
                                    phoneNumber,
                                    agent.id,
                                    setSelectedPhoneNumber
                                )}
                            >
                                <SelectTrigger className="w-full border-blue-200">
                                    <SelectValue placeholder="Select existing number" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userPhoneNumbers.map((number) => (
                                        <SelectItem key={number} value={number}>
                                            {formatPhoneNumber(number)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => setIsPhoneModalOpen(true)}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Buy New Number
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/phone-number`, "_blank")}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Connect Existing
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Numbers start at $3/month
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
                            <p className="text-sm text-gray-500">Upload & select documents</p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                <Input
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        await handleFileUpload(file, agent.id, setUploadedFile, user.id);
                                        window.location.reload();
                                    }}
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

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Available Documents</Label>
                                <Select
                                    value={selectedDocument}
                                    onValueChange={(value) => handleDocumentSelect(value, agent.id, setSelectedDocument)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a document" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(businessDocuments) && businessDocuments.length > 0 ? (
                                            businessDocuments.map((doc) => (
                                                <SelectItem 
                                                    key={doc.id} 
                                                    value={doc.id}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="truncate">{doc.fileName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>
                                                No documents uploaded yet
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 text-xs h-auto py-2" onClick={handleDownloadTemplate}>
                                    <Download className="w-3 h-3 mr-1" />
                                    Template
                                </Button>
                                <Link href="https://docs.google.com/document/d/1WcGjJawOhVAuSCyjTXwrUJ3tp-0Ce0QSTVddL2ynWLs/edit?usp=sharing" target="_blank">
                                    <Button variant="outline" className="flex-1 text-xs h-auto py-2">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Google Docs
                                    </Button>
                                </Link>
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
                                            { icon: CreditCard, label: 'Payment Processing', desc: 'Handle transactions', disabled: true },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
                                                <div className="flex items-center gap-2">
                                                    <feature.icon className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm">{feature.label}</p>
                                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                                {feature.label === 'Appointment Booking' ? (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setIsCalendarModalOpen(true)}
                                                    >
                                                        Connect
                                                    </Button>
                                                ) : (
                                                    <Switch className="scale-75" disabled={feature.disabled} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Integrations */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-medium text-blue-900">Integrations</h4>
                                    <div className="space-y-2">
                                        {[
                                            { icon: BrainCircuit, label: 'CRM Integration', desc: 'Connect your CRM', disabled: true },
                                            { icon: Mail, label: 'Email Notifications', desc: 'Auto-send updates', disabled: true },
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
                                                <div className="flex items-center gap-2">
                                                    <feature.icon className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm">{feature.label}</p>
                                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch className="scale-75" disabled={feature.disabled} />
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
                    onClick={() => handleCompleteSetup(agent.id, selectedDocument, setIsCompleting)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isCompleting}
                >
                    {isCompleting ? 'Deploying Agent...' : 'Deploy Agent'}
                </Button>
            </div>

            {/* Voice Selection Modal */}
            <VoiceSelectionModal 
                isOpen={isVoiceModalOpen}
                onClose={closeVoiceModal}
                voices={voices}
                isLoadingVoices={isLoadingVoices}
                selectedVoice={selectedVoice}
                playingVoiceId={playingVoiceId}
                handleVoiceSelect={(voice: any) => handleVoiceSelect({
                    voice,
                    agentId: agent.id,
                    systemPrompt: customInstructions,
                    setSelectedVoice,
                    setSelectedVoiceName,
                    onClose: () => setIsVoiceModalOpen(false)
                })}
                handlePreviewVoice={(voice: any, e: any) => handlePreviewVoice({
                    voice,
                    e,
                    audioRef,
                    playingVoiceId,
                    setPlayingVoiceId
                })}
            />

            <BuyPhoneNumberModal 
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                userPhoneNumbers={userPhoneNumbers}
                setUserPhoneNumbers={setUserPhoneNumbers}
                user={user as User & { businessAddress: BusinessAddress | null }}
                agentId={agent.id}
            />

            <CalendarIntegrationModal 
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                calendarStep={calendarStep}
                setCalendarStep={setCalendarStep}
                isConnectingCalendar={isConnectingCalendar}
                handleGoogleAuth={() => handleGoogleAuth(setIsConnectingCalendar, agent.id)}
            />
        </div>
    );
};