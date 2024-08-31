"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/Common/Tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Common/Card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/Common/Button"
import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs";
import { loadStripe } from '@stripe/stripe-js';
import useSubscriptions from "@/hooks/getSubscriptionData";
import { toast } from 'react-hot-toast';

type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  isYearly?: boolean
  title: string
  monthlyPrice?: number
  yearlyPrice?: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  exclusive?: boolean
  onSubscribe: () => void
  isCurrentPlan?: boolean
  disabled?: boolean
}

const PricingHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <section className="text-center">
    <h2 className="text-3xl font-bold">{title}</h2>
    <p className="text-xl pt-1">{subtitle}</p>
    <br />
  </section>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs defaultValue="0" className="w-40 mx-auto" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2">
      <TabsTrigger value="0" className="text-base">
        Monthly
      </TabsTrigger>
      <TabsTrigger value="1" className="text-base">
        Yearly
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const PricingCard = ({ isYearly, title, monthlyPrice, yearlyPrice, description, features, actionLabel, popular, exclusive, onSubscribe, isCurrentPlan, disabled }: PricingCardProps) => (
  <Card
    className={cn(`w-72 flex flex-col justify-between py-1 ${popular ? "border-rose-400" : "border-zinc-700"} mx-auto sm:mx-0`, {
      "animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
        exclusive,
    })}>
    <div>
      <CardHeader className="pb-8 pt-4">
        {isYearly && yearlyPrice && monthlyPrice ? (
          <div className="flex justify-between">
            <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">{title}</CardTitle>
            <div
              className={cn("px-2.5 rounded-xl h-fit text-sm py-1 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white", {
                "bg-gradient-to-r from-orange-400 to-rose-400 dark:text-black ": popular,
              })}>
              Save ${monthlyPrice * 12 - yearlyPrice}
            </div>
          </div>
        ) : (
          <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">{title}</CardTitle>
        )}
        <div className="flex gap-0.5">
          <h3 className="text-3xl font-bold">
            {yearlyPrice && isYearly ? "$" + yearlyPrice : monthlyPrice !== undefined ? "$" + monthlyPrice : "Custom"}
          </h3>
          <span className="flex flex-col justify-end text-sm mb-1">
            {yearlyPrice && isYearly ? "/year" : monthlyPrice !== undefined ? "/month" : null}
          </span>
        </div>
        <CardDescription className="pt-1.5 h-12">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {features.map((feature: string) => (
          <CheckItem key={feature} text={feature} />
        ))}
      </CardContent>
    </div>
    <CardFooter className="mt-2">
      <Button
        className={cn(
          "relative inline-flex w-full items-center justify-center rounded-md px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
          isCurrentPlan
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        )}
        onClick={onSubscribe}
        disabled={disabled}
      >
        {isCurrentPlan ? "Current Plan" : actionLabel}
      </Button>
    </CardFooter>
  </Card>
)

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex gap-2">
    <CheckCircle2 size={18} className="my-auto text-green-400" />
    <p className="pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm">{text}</p>
  </div>
)

export default function SubscriptionPage() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          price,
          isYearly,
          userId: user.id,
          successUrl: `${baseUrl}/dashboard/profile/${user.id}`,
          cancelUrl: `${baseUrl}/subscription`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await loadStripe(stripePk)
      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }
      await stripe.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = () => {
    router.push(`/dashboard/profile/${user?.id}`);
  };

  const plans = [
    {
      title: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Everything you need to get started",
      features: ["Example Feature Number 1", "Example Feature Number 2", "Example Feature Number 3"],
      actionLabel: "Get Started",
    },
    {
      title: "Basic",
      monthlyPrice: 10,
      yearlyPrice: 100,
      description: "Want a few more Compadres?",
      features: ["Example Feature Number 1", "Example Feature Number 2", "Example Feature Number 3"],
      actionLabel: "Subscribe",
    },
    {
      title: "Pro",
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: "Full group of Compadres.",
      features: ["Example Feature Number 1", "Example Feature Number 2", "Example Feature Number 3"],
      actionLabel: "Subscribe",
      popular: true,
    },
  ]

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

  const isSubscribed = subscription && subscription.subscriptionName !== "Free Plan";

  return (
    <div className="flex flex-col py-8 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <PricingHeader title="Pricing Plans" subtitle="Choose the plan that's right for you" />
        <PricingSwitch onSwitch={togglePricingPeriod} />
      </div>
      <section className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8">
        {plans.map((plan) => {
          const isPlanSubscribed = subscription?.subscriptionName?.startsWith(plan.title) ?? false;
          const isCurrentPlan = isPlanSubscribed && subscription?.isYearly === isYearly;

          return (
            <PricingCard
              key={plan.title}
              {...plan}
              isYearly={isYearly}
              onSubscribe={subscription.subscriptionStatus === 'active' 
                ? handleManageSubscription 
                : () => handleSubscribe(plan.title, isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
              isCurrentPlan={isCurrentPlan}
              disabled={isCurrentPlan}
              actionLabel={
                subscription.subscriptionStatus !== 'active'
                  ? "Subscribe"
                  : 
                isCurrentPlan
                  ? "Current Plan"
                  : isSubscribed
                    ? "Manage Subscription"
                    : plan.actionLabel
              }
            />
          );
        })}
      </section>
    </div>
  )
}