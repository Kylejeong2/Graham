"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Upload, Volume2, UploadCloud, Download, Loader2, Phone, Settings, Calendar, CreditCard, ExternalLink, Mail, BrainCircuit, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link';
import type { User, BusinessAddress } from '@graham/db';
import { BuyPhoneNumberModal, CalendarIntegrationModal, VoiceSelectionModal } from '../setup/modals';
import { handleDocumentSelect, handleVoiceSelect, handlePreviewVoice, handleGoogleAuth, handleFileUpload, 
    fetchAgentData, createDebouncedMessageUpdate, handleCompleteSetup, fetchVoices, handleEnhanceInstructions, 
    createDebouncedInstructionUpdate, handlePhoneNumberSelect, fetchUserPhoneNumbers, handleDownloadTemplate, 
    formatPhoneNumber, fetchBusinessDocuments
} from '../setup/setup-functions';
import type { ConversationInitType } from '../setup/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { BusinessDocument } from '../setup/types/business';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AgentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  user: User;
}

type Step = {
  title: string;
  description: string;
}; 

const STEPS: Step[] = [
  {
    title: "Voice",
    description: "Choose your agent's voice"
  },
  {
    title: "Instructions",
    description: "Define how your agent should behave"
  },
  {
    title: "Phone",
    description: "Set up phone numbers"
  },
  {
    title: "Documents",
    description: "Upload business documents"
  },
  {
    title: "Functions",
    description: "Enable AI capabilities"
  },
  {
    title: "Conversation Setup",
    description: "Configure how calls begin"
  },
  {
    title: "Review",
    description: "Review and deploy"
  }
];

export const AgentSetupModal: React.FC<AgentSetupModalProps> = ({ isOpen, onClose, agentId, user }) => {
    const [currentStep, setCurrentStep] = useState(0);
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
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        const initializeSetup = async () => {
            setIsLoading(true);
            try {
                // Fetch voices
                setIsLoadingVoices(true);
                await fetchVoices(setIsLoadingVoices, setVoices);

                // Fetch phone numbers
                await fetchUserPhoneNumbers(user.id, setUserPhoneNumbers);

                // Fetch business documents
                await fetchBusinessDocuments(user.id, setBusinessDocuments);

                // Fetch agent data
                await fetchAgentData(
                    agentId,
                    setIsLoading,
                    setCustomInstructions,
                    setSelectedVoice,
                    setSelectedVoiceName,
                    setConversationType,
                    setInitialMessage,
                    setSelectedPhoneNumber,
                );

            } catch (error) {
                console.error('Error initializing setup:', error);
                toast.error('Failed to load setup data');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && agentId) {
            initializeSetup();
        }

        return () => {
            // Reset states on cleanup
            setIsLoading(true);
            setCustomInstructions('');
            setInitialMessage('');
            setSelectedVoice(null);
            setSelectedVoiceName('');
            setVoices([]);
            setUserPhoneNumbers([]);
            setBusinessDocuments([]);
            setSelectedDocument('');
            setSelectedPhoneNumber('');
            setCurrentStep(0);
        };
    }, [isOpen, agentId, user.id]);

    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);

    const debouncedInstructionUpdate = useCallback(
        createDebouncedInstructionUpdate(agentId, setIsSaving),
        [agentId]
    );

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInstructions = e.target.value;
        setCustomInstructions(newInstructions);
        debouncedInstructionUpdate(newInstructions);
    };

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

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            // Validate each step
            switch (currentStep) {
                case 0: // Voice
                    if (!selectedVoice) {
                        toast.error('Please select a voice for your agent');
                        return;
                    }
                    break;
                case 1: // Instructions
                    if (!customInstructions.trim()) {
                        toast.error('Please add instructions for your agent');
                        return;
                    }
                    break;
                case 2: // Phone
                    if (!selectedPhoneNumber) {
                        toast.error('Please select or purchase a phone number');
                        return;
                    }
                    break;
                case 3: // Documents
                    if (!selectedDocument && businessDocuments.length > 0) {
                        toast.error('Please select a document or upload one');
                        return;
                    }
                    break;
                case 4: // Functions
                    break;
                case 5: // Conversation Setup
                    break;
            }
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // const handleCalendarAuth = async () => {
    //     setIsConnectingCalendar(true);
    //     try {
    //         await handleGoogleAuth(setIsConnectingCalendar, agentId);
    //         toast.success('Successfully connected to calendar');
    //         setIsCalendarModalOpen(false);
    //     } catch (error) {
    //         console.error('Failed to connect calendar:', error);
    //         toast.error('Failed to connect calendar');
    //     } finally {
    //         setIsConnectingCalendar(false);
    //     }
    // };

    const validateSetup = () => {
        const errors: string[] = [];
        
        if (!customInstructions?.trim()) {
            errors.push("Instructions are required");
        }
        if (!selectedVoice) {
            errors.push("Voice selection is required");
        }
        if (!selectedPhoneNumber) {
            errors.push("Phone number is required");
        }
        if (!businessDocuments.length) {
            errors.push("At least one business document is required");
        }
        if (conversationType === 'ai-custom' && !initialMessage?.trim()) {
            errors.push("Custom initial message is required");
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleDeploy = async () => {
        if (!validateSetup()) {
            toast.error("Please complete all required fields before deploying");
            return;
        }

        try {
            setIsCompleting(true);
            await handleCompleteSetup(agentId, selectedDocument, setIsCompleting);
            toast.success("Agent deployed successfully!");
            onClose();
            // Redirect to agent page
            window.location.href = `/agent/${agentId}`;
        } catch (error) {
            console.error('Error deploying agent:', error);
            toast.error("Failed to deploy agent");
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Voice
                return (
                    <Card className="bg-white shadow-lg">
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
                );

            case 1: // Instructions
                return (
                    <Card className="bg-white shadow-lg">
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
                                            agentId,
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
                    </Card>
                );

            case 2: // Phone
                return (
                    <Card className="bg-white shadow-lg">
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
                                    agentId,
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
                );

            case 3: // Documents
                return (
                    <Card className="bg-white shadow-lg">
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
                                        await handleFileUpload(file, agentId, setUploadedFile, user.id);
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
                                    onValueChange={(value) => handleDocumentSelect(value, agentId, setSelectedDocument)}
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
                );

            case 4: // Functions
                return (
                    <Card className="bg-white shadow-lg">
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
                );

            case 5: // Conversation Setup
                return (
                    <Card className="bg-white shadow-lg">
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
                                                        agentId,
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
                                                            createDebouncedMessageUpdate(agentId, setIsSaving);
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
                );

            case 6: // Review
                return (
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="border-b border-blue-100">
                            <CardTitle className="text-blue-900 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-orange-500" />
                                Review & Deploy
                            </CardTitle>
                            <p className="text-sm text-gray-500">Review your settings and deploy your agent</p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-blue-900">Instructions</h3>
                                    <p className="text-sm text-gray-600 mt-1">{customInstructions || 'Not set'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Voice</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedVoiceName || 'Not selected'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Phone Number</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedPhoneNumber ? formatPhoneNumber(selectedPhoneNumber) : 'Not selected'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Documents</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {businessDocuments.length > 0 
                                            ? `${businessDocuments.length} document(s) uploaded`
                                            : 'No documents uploaded'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Conversation Start</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {conversationType === 'user' ? 'User speaks first' :
                                         conversationType === 'ai-default' ? 'AI speaks first (default greeting)' :
                                         'AI speaks first (custom message)'}
                                    </p>
                                    {conversationType === 'ai-custom' && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Initial message: "{initialMessage}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {validationErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index} className="text-sm text-red-600">{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Button
                                onClick={handleDeploy}
                                className={cn(
                                    "w-full relative",
                                    validationErrors.length > 0 
                                        ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700",
                                    "text-white transition-all duration-200"
                                )}
                                disabled={isCompleting || validationErrors.length > 0}
                            >
                                {isCompleting ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deploying...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        {validationErrors.length > 0 ? (
                                            <>
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Complete Required Fields
                                            </>
                                        ) : (
                                            'Deploy Agent'
                                        )}
                                    </div>
                                )}
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                                After deployment, you'll be redirected to your agent's dashboard
                            </p>
                        </CardContent>
                    </Card>
                );
        }
    };

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Agent Setup</DialogTitle>
                    <p className="text-sm text-gray-500">{STEPS[currentStep].description}</p>
                </DialogHeader>

                <div className="space-y-6">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                    >
                        Back
                    </Button>

                    {currentStep < STEPS.length - 1 && (
                        <Button
                            onClick={handleNext}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Next
                        </Button>
                    )}
                    </div>

                <VoiceSelectionModal 
                    isOpen={isVoiceModalOpen}
                    onClose={closeVoiceModal}
                    voices={voices}
                    isLoadingVoices={isLoadingVoices}
                    selectedVoice={selectedVoice}
                    playingVoiceId={playingVoiceId}
                    handleVoiceSelect={(voice: any) => handleVoiceSelect({
                        voice,
                        agentId,
                        systemPrompt: customInstructions,
                        setSelectedVoice,
                        setSelectedVoiceName,
                        onClose: closeVoiceModal
                    })}
                    handlePreviewVoice={(voice: any, e: React.MouseEvent) => handlePreviewVoice({
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
                    user={user as User & { businessAddress: BusinessAddress }}
                    agentId={agentId}
                />

                <CalendarIntegrationModal 
                    isOpen={isCalendarModalOpen}
                    onClose={() => setIsCalendarModalOpen(false)}
                    calendarStep={calendarStep}
                    setCalendarStep={setCalendarStep}
                    isConnectingCalendar={isConnectingCalendar}
                    handleGoogleAuth={() => handleGoogleAuth(setIsConnectingCalendar, agentId)}
                />
                </DialogContent>
            </Dialog>
        );
}; 