'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Coffee, Send, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { joinWaitlist } from '@/components/actions/joinWaitlist'

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    joinWaitlist(email)
      .then(() => {
        toast.success('Thank you for joining our waitlist!')
        setEmail('')
        setShowAlert(true)
      })
      .catch((error: any) => {
        console.error('Error submitting to waitlist:', error)
        toast.error('An error occurred. Please try again later.')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-blue-100 to-white py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-7xl font-bold text-gray-900 leading-tight mb-8">
            Transform Your <span className="text-blue-600">Business</span>
          </h2>
          <p className="text-2xl text-gray-700 mb-12 leading-relaxed">
            Join our exclusive waitlist today and be among the first to revolutionize your customer service with cutting-edge AI technology.
          </p>

          {showAlert && (
            <Alert className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none shadow-lg max-w-2xl mx-auto">
              <AlertTitle className="text-lg font-semibold">Welcome aboard! 🎉</AlertTitle>
              <AlertDescription className="text-blue-50">
                You're now on our exclusive waitlist. We'll keep you in the loop with exciting updates!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-16">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow rounded-xl border-2 border-blue-200 bg-white/80 backdrop-blur px-6 py-7 text-lg shadow-lg transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              required
            />
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-7 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-blue-200 hover:shadow-2xl disabled:opacity-80"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['Early Access', 'Exclusive Updates', 'Priority Support'].map((benefit) => (
              <div key={benefit} className="flex items-center justify-center bg-white/60 backdrop-blur rounded-lg p-6 shadow-lg">
                <CheckCircle className="mr-3 h-6 w-6 text-blue-600 flex-shrink-0" />
                <span className="text-blue-900 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}