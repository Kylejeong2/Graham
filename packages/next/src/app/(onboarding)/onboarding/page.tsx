'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { PaymentElementWrapper } from '@/components/Stripe/PaymentElement'

export default function OnboardingPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) {
    return null
  }

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    hasPaymentSetup: false
  })

  const handleBusinessDetailsSubmit = async () => {
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          hasPaymentSetup: false
        })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      const setupResponse = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST'
      })

      if (!setupResponse.ok) throw new Error('Failed to create setup intent')
      
      setStep(3)
    } catch (error: any) {
      console.error('Business details update failed:', error)
      toast.error(error.message)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          hasPaymentSetup: true
        })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      const emailResponse = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          name: formData.fullName
        })
      })

      if (!emailResponse.ok) {
        console.error('Failed to send welcome email')
      }
      
      router.push('/creating-account')
    } catch (error: any) {
      console.error('Final submission failed:', error)
      toast.error(error.message)
    }
  }

  const steps = [
    {
      title: "Welcome to Graham",
      description: "Let's get your AI phone agent set up in just a few steps",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">What's your name?</Label>
            <Input
              id="fullName"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>
      )
    },
    {
      title: "Business Details",
      description: "Tell us about your business",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="Your business name"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Business phone</Label>
            <Input
              id="phoneNumber"
              placeholder="(555) 555-5555"
              value={formData.phoneNumber}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                const truncated = cleaned.slice(0, 10);
                const formatted = truncated.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                setFormData({...formData, phoneNumber: formatted});
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (For invoices and account management)</Label>
            <Input
              id="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>
      )
    },
    {
      title: "Payment Information",
      description: "Set up your payment method to get started",
      fields: (
        <div className="space-y-4">
          <PaymentElementWrapper />
        </div>
      )
    }
  ]
  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.fullName.trim().length > 0
      case 2:
        return formData.businessName.trim().length > 0 &&
               formData.phoneNumber.trim().length > 0 &&
               formData.email.trim().length > 0 &&
               formData.email.includes('@') // Basic email validation
      case 3:
        return formData.hasPaymentSetup
      default:
        return false
    }
  }

  const handleContinue = () => {
    if (step === 2 && isStepValid(step)) {
      handleBusinessDetailsSubmit()
    } else if (step < steps.length && isStepValid(step)) {
      setStep(step + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 justify-center items-center to-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 3 ? handleFinalSubmit : handleBusinessDetailsSubmit} className="space-y-6">
              {steps[step - 1].fields}
              
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type={step === steps.length ? "submit" : "button"}
                  className="ml-auto"
                  onClick={handleContinue}
                  disabled={!isStepValid(step)}
                >
                  {step === steps.length ? 'Get Started' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
