"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface OnboardProps {
  agentId: string;
}

const steps = [
  { id: 'name', title: 'Name Your Agent' },
  { id: 'voice', title: 'Choose Voice' },
  { id: 'phone', title: 'Phone Number' },
  { id: 'instructions', title: 'Instructions' },
  { id: 'conversation', title: 'Conversation Flow' },
//   { id: 'integrations', title: 'Integrations' },
];

export const Onboard: React.FC<OnboardProps> = ({ agentId }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    voice: '',
    phoneNumber: '',
    instructions: '',
    conversationType: 'user',
    initialMessage: '',
  });
  const [voices, setVoices] = useState<any[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch voices and phone numbers on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesRes, numbersRes] = await Promise.all([
          axios.get('/api/agent/fetch/getVoices-eleven'),
          axios.get('/api/twilio/get-phone-numbers')
        ]);
        setVoices(voicesRes.data);
        setPhoneNumbers(numbersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setIsLoading(true);
      try {
        await axios.patch('/api/agent/updateAgent', {
          agentId,
          ...formData,
          initiateConversation: formData.conversationType !== 'user',
        });
        router.push(`/dashboard/agent/${agentId}`);
      } catch (error) {
        console.error('Failed to update agent:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'name':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What's your agent's name?</h2>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter agent name..."
              className="max-w-md"
            />
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose a voice for your agent</h2>
            <Select
              value={formData.voice}
              onValueChange={(value) => setFormData({ ...formData, voice: value })}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Select a phone number</h2>
            <Select
              value={formData.phoneNumber}
              onValueChange={(value) => setFormData({ ...formData, phoneNumber: value })}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((number) => (
                  <SelectItem key={number} value={number}>
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'instructions':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What should your agent do?</h2>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Add instructions for your AI agent..."
              className="min-h-[200px]"
            />
          </div>
        );

      case 'conversation':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">How should conversations start?</h2>
            <Select
              value={formData.conversationType}
              onValueChange={(value) => setFormData({ ...formData, conversationType: value })}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select who starts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User speaks first</SelectItem>
                <SelectItem value="ai-default">AI speaks first (default greeting)</SelectItem>
                <SelectItem value="ai-custom">AI speaks first (custom message)</SelectItem>
              </SelectContent>
            </Select>
            {formData.conversationType === 'ai-custom' && (
              <Input
                value={formData.initialMessage}
                onChange={(e) => setFormData({ ...formData, initialMessage: e.target.value })}
                placeholder="Enter custom greeting message..."
                className="max-w-md mt-4"
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <Card className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                  ${index <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm ml-2">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`h-[2px] w-16 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? (
              'Saving...'
            ) : currentStep === steps.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
