"use client";

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PhoneCall, User, Mail, Phone } from "lucide-react"
import { Label } from "@/components/ui/label"
import { initiateDemo } from '@/components/actions/demo-call';

export function Demo() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [demoNumber, setDemoNumber] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // initiateDemo({ name, email, phoneNumber })
    //   .then(() => {
    //     toast.success('Demo call initiated! You should receive a call shortly.')
    //   })
    //   .catch((error: any) => {
    //     console.error('Error initiating demo call:', error)
    //     toast.error('Failed to initiate demo call. Please try again.')
    //   })
    //   .finally(() => {
    //     setIsSubmitting(false)
    //   })
    initiateDemo({ name, email, phoneNumber })
      .then((response) => {
        setDemoNumber(response.phoneNumber)
        toast.success('Demo number ready!')
      })
      .catch((error: any) => {
        console.error('Error processing demo request:', error)
        toast.error('Failed to process request. Please try again.')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  if (demoNumber) {
    return (
      <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
        <CardHeader className="text-center border-b border-blue-100 pb-6">
          <div className="flex justify-center mb-4">
            <PhoneCall className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Ready for Your Demo!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 text-center">
          <p className="text-lg mb-4">Please call:</p>
          <p className="text-4xl font-bold text-blue-600 mb-6">
            {demoNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
          </p>
          <p className="text-gray-600">
            Our team is ready to give you a personalized demo of Graham.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
      <CardHeader className="text-center border-b border-blue-100 pb-6">
        <div className="flex justify-center mb-4">
          <PhoneCall className="w-16 h-16 text-orange-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-black">
          Try Graham Yourself
        </CardTitle>
        <p className="mt-2 text-black">
          Take a demo call and see how Graham can transform your business.
        </p>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black font-semibold">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-black font-semibold">Your Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-black font-semibold">Your Phone Number (to receive the call)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(123) 456-7890"
                value={phoneNumber}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, '');
                  if (input.length <= 10) {
                    const formatted = input.replace(/(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3').trim();
                    setPhoneNumber(formatted);
                  }
                }}
                required
                pattern="\(\d{3}\)\s\d{3}-\d{4}"
                maxLength={14}
                className="pl-10 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 py-6 text-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <PhoneCall className="animate-pulse mr-2" />
                Initiating Call...
              </>
            ) : (
              <>
                <PhoneCall className="mr-2" />
                Get a Demo Call
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}