"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
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

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const togglePricingPeriod = (value: string) => setIsYearly(parseInt(value) === 1)
  const router = useRouter()
  const { user } = useUser()
  const { subscription, loading, error } = useSubscriptions()

  const handleSubscribe = async (plan: string, price: number) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    if (subscription && subscription.subscriptionStatus === 'active') {
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
          plan,
          price,
          isYearly,
          userId: user.id,
          successUrl: `${baseUrl}/dashboard/profile/${user.id}`,
          cancelUrl: `${baseUrl}/subscription`,
        }),
      })

      if (!response.ok) throw new Error('Failed to create checkout session')

      const { sessionId } = await response.json()
      const stripe = await loadStripe(stripePk)
      if (!stripe) throw new Error('Failed to load Stripe')
      await stripe.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = () => {
    router.push(`/dashboard/profile/${user?.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const isSubscribed = subscription && subscription.subscriptionName !== "Free Plan"

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-[#E6CCB2]">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#5D4037]">
          Simple, Transparent Pricing
        </h2>
        <PricingSwitch onSwitch={togglePricingPeriod} />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {plans.map((plan) => {
            const isPlanSubscribed = subscription?.subscriptionName?.startsWith(plan.title) ?? false
            const isCurrentPlan = isPlanSubscribed && subscription?.isYearly === isYearly

            return (
              <Card key={plan.title} className="bg-[#F5E6D3]">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[#5D4037] mb-2">{plan.title}</h3>
                  <p className="text-4xl font-bold text-[#8B4513] mb-4">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/{isYearly ? 'yr' : 'mo'}
                  </p>
                  <p className="text-[#795548] mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#795548]">
                        <Check className="mr-2 h-4 w-4 text-[#8B4513]" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={cn(
                      "w-full bg-[#8B4513] text-white hover:bg-[#A0522D]",
                      isCurrentPlan && "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    )}
                    onClick={subscription.subscriptionStatus === 'active' 
                      ? handleManageSubscription 
                      : () => handleSubscribe(plan.title, isYearly ? plan.yearlyPrice ?? 0 : plan.monthlyPrice ?? 0)}
                    disabled={isCurrentPlan}
                  >
                    {subscription.subscriptionStatus !== 'active'
                      ? "Subscribe"
                      : isCurrentPlan
                        ? "Current Plan"
                        : isSubscribed
                          ? "Manage Subscription"
                          : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}