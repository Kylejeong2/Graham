"use client";

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PhoneCall, User, Mail, Phone } from "lucide-react"
import { Label } from "@/components/ui/label"

export function Demo() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/demo-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phoneNumber }),
      })
      if (!response.ok) throw new Error('Failed to initiate demo call')
      toast.success('Demo call initiated! You should receive a call shortly.')
    } catch (error) {
      console.error('Error initiating demo call:', error)
      toast.error('Failed to initiate demo call. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
      <CardHeader className="text-center border-b border-blue-100 pb-6">
        <div className="flex justify-center mb-4">
          <PhoneCall className="w-16 h-16 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-blue-900">
          Try Graham Yourself
        </CardTitle>
        <p className="mt-2 text-blue-700">
          Take a demo call and see how Graham can transform your business.
        </p>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-900 font-semibold">Your Name</Label>
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
            <Label htmlFor="email" className="text-blue-900 font-semibold">Your Email</Label>
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
            <Label htmlFor="phoneNumber" className="text-blue-900 font-semibold">Your Phone Number (to receive the call)</Label>
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