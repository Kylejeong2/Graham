"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import { loadStripe } from '@stripe/stripe-js'
import useSubscriptions from "@/hooks/getSubscriptionData"
import { toast } from 'react-hot-toast'
import { plans } from "@/constants/plans"

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => (
  <Tabs defaultValue="0" className="w-40 mx-auto" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2">
      <TabsTrigger value="0" className="text-base">Monthly</TabsTrigger>
      <TabsTrigger value="1" className="text-base">Yearly</TabsTrigger>
    </TabsList>
  </Tabs>
)

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { subscription, loading, error } = useSubscriptions()

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    if (subscription && subscription.status === 'active') {
      toast.error('You already have an active subscription. Please manage your subscription in your profile.')
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const stripePk = process.env.NEXT_PUBLIC_STRIPE_PK

    if (!baseUrl || !stripePk) {
      console.error('Missing environment variables')
      toast.error('Configuration error. Please contact support.')
      return
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: process.env.NODE_ENV === 'production' ? 'prod_Qq6JRjPaF15zWq' : 'prod_QoXITUgsloBAwz',
          userId: user?.id,
          successUrl: `${baseUrl}/dashboard/profile/${user?.id}`,
          cancelUrl: `${baseUrl}/subscription`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create subscription')
      }

      const { sessionId } = await response.json()
      const stripe = await loadStripe(stripePk)
      if (!stripe) throw new Error('Failed to load Stripe')
      
      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) {
        toast.error(result.error.message || 'Failed to redirect to checkout')
      } else {
        toast.success('Subscription created successfully')
        router.push(`/dashboard/profile/${user?.id}`)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription. Please try again.')
    }
  }

  const handleManageSubscription = () => {
    if (isSignedIn) {
      router.push(`/dashboard/profile/${user?.id}`)
    } else {
      router.push('/sign-in')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E6CCB2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    if (error === 'User not found') {
      return <div>Error: {error}. Please sign in to your account.</div>
    }
    else if (error === 'Subscription not found') {
      return <div>Error: {error}. Please create a subscription to get started.</div>
    }
  }

  const isSubscribed = isSignedIn && subscription && subscription.status === "active";

  return (
    <div className="min-h-screen bg-[#E6CCB2]">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-[#5D4037] mb-12">
          Choose Your Subscription Plan
        </h1>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2 mt-12">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-[#F5E6D3]">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-[#5D4037] mb-2">{plan.title}</h3>
                {plan.basePrice !== undefined && (
                  <p className="text-4xl font-bold text-[#8B4513] mb-4">
                    ${plan.basePrice}/mo + ${plan.pricePerMinute.toFixed(2)}/min
                  </p>
                )}
                <p className="text-[#795548] mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-[#795548]">
                      <Check className="mr-2 h-4 w-4 text-[#8B4513]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-[#8B4513] text-white hover:bg-[#A0522D]"
                  onClick={() => subscription?.status === "active" ? handleManageSubscription() : handleSubscribe(plan.id)}
                  disabled={plan.id === subscription?.planId} 
                >
                  {subscription && subscription.status === "active" ? "Manage Subscription" : (plan.id === 'enterprise' ? "Contact Us" : "Subscribe")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}