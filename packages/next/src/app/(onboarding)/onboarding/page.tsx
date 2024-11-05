'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { prisma } from '@graham/db';
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@clerk/nextjs/server';

export default function OnboardingPage() {
  const router = useRouter()
  const { userId } = auth()
  if (!userId) {
    router.push('/sign-in')
    return
  }

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phoneNumber: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: formData.fullName,
        businessName: formData.businessName,
        user_phoneNumber: formData.phoneNumber
      }
    })
    router.push('/creating-account')
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
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
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
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type={step === steps.length ? "submit" : "button"}
                  className="ml-auto"
                  onClick={() => step < steps.length && setStep(step + 1)}
                >
                  {step === steps.length ? 'Get Started' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24/7 Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your AI agent handles calls around the clock, never missing an opportunity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Natural Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI enables human-like interactions with your customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Easy Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seamlessly connects with your existing business phone system
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
