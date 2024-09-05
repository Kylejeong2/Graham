'use client'

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { Coffee, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      toast.success('Thank you for joining our waitlist!');
      setEmail('');
      setShowAlert(true);
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#F5E6D3] to-[#E6CCB2]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Coffee className="w-24 h-24 text-[#8B4513] mx-auto mb-8" />
          <h2 className="text-5xl font-bold text-[#8B4513] mb-6">
            Be the First to Experience Graham
          </h2>
          <p className="text-xl text-[#5D4037] mb-8 max-w-2xl mx-auto">
            Join our exclusive waitlist and get early access to the future of AI-powered customer service.
          </p>
          {showAlert && (
            <Alert className="mb-8 bg-[#8B4513] text-white">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                You&apos;ve successfully joined our waitlist. We&apos;ll keep you updated on our progress!
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow text-lg py-6 px-4 border-2 border-[#8B4513] text-[#5D4037] placeholder-[#A0522D] bg-white rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white text-lg py-6 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Coffee className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Join Waitlist
                </>
              )}
            </Button>
          </form>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-[#8B4513] mr-2" />
              <span className="text-[#5D4037]">Early Access</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-[#8B4513] mr-2" />
              <span className="text-[#5D4037]">Exclusive Updates</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-[#8B4513] mr-2" />
              <span className="text-[#5D4037]">Priority Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};