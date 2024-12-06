'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'

export default function OnboardingPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    phoneNumber: '',
    email: '',
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) {
    return null
  }

  const handleBusinessDetailsSubmit = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
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
      console.error('Business details update failed:', error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
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
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input
              placeholder="123 Main St"
              value={formData.businessAddress.street}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessAddress: {
                  ...prev.businessAddress,
                  street: e.target.value
                }
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Input
                placeholder="City"
                value={formData.businessAddress.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessAddress: {
                    ...prev.businessAddress,
                    city: e.target.value
                  }
                }))}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                placeholder="CA"
                maxLength={2}
                value={formData.businessAddress.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessAddress: {
                    ...prev.businessAddress,
                    state: e.target.value.toUpperCase()
                  }
                }))}
              />
            </div>
          </div>
          <div>
            <Label>ZIP Code</Label>
            <Input
              placeholder="12345"
              maxLength={5}
              value={formData.businessAddress.postalCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                businessAddress: {
                  ...prev.businessAddress,
                  postalCode: e.target.value.replace(/\D/g, '')
                }
              }))}
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
    }
  ]

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.fullName.trim().length > 0
      case 2:
        return formData.businessName.trim().length > 0 &&
               formData.businessAddress.street.trim().length > 0 &&
               formData.businessAddress.city.trim().length > 0 &&
               formData.businessAddress.state.length === 2 &&
               formData.businessAddress.postalCode.length === 5 &&
               formData.phoneNumber.trim().length > 0 &&
               formData.email.includes('@')
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === steps.length && isStepValid(step)) {
      await handleBusinessDetailsSubmit();
    } else if (step < steps.length && isStepValid(step)) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 justify-center items-center to-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {steps[step - 1].fields}
              
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="submit"
                  className="ml-auto"
                  disabled={!isStepValid(step) || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {step === steps.length ? 'Complete' : 'Continue'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
