"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => (
    <Tabs defaultValue="0" className="w-40 mx-auto mb-8" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2 border-2">
      <TabsTrigger value="0" className="text-base">Monthly</TabsTrigger>
      <TabsTrigger value="1" className="text-base">Yearly</TabsTrigger>
    </TabsList>
  </Tabs>
)

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  const togglePricingPeriod = (value: string) => setIsYearly(parseInt(value) === 1)
  const router = useRouter()
  const { user } = useUser()

  const handlePlanClick = () => {
    if (!user) {
      router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/sign-up`)
      return
    }
  }

  const plans = [
    {
      title: "Simple",
      description: "Best for new businesses and startups",
      monthlyPrice: 40,
      yearlyPrice: 432, // 40 * 12 * 0.9 (10% discount)
      features: [
        "Full-service payroll",
        "Employee self-service",
        "Health insurance administration",
        "Workers' comp administration"
      ]
    },
    {
      title: "Plus",
      description: "Best for growing businesses",
      monthlyPrice: 80,
      yearlyPrice: 864, // 80 * 12 * 0.9 (10% discount)
      features: [
        "Everything in Simple",
        "Multi-state payroll",
        "Time tracking",
        "PTO policies and approvals",
        "Employee onboarding tools"
      ]
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6">
        <div className="mb-12"> 
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">
          Only pay for what you use
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl text-center">
          Add limits to stay within your budget (we'll notify you when you're close).
        </p>
        </div>
        
        <PricingSwitch onSwitch={togglePricingPeriod} />
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => {

            return (
              <Card key={plan.title}>
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}/{isYearly ? 'yr' : 'mo'}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-teal-600" /> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handlePlanClick}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}