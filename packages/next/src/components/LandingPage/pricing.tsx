"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"

export default function Pricing() {
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
      title: "Growth",
      description: "Perfect for fast-growing businesses",
      monthlyPrice: "$0.20/min",
      features: [
        "Pay only for what you use",
        "Basic Call Routing",
        "Email Support",
        "Standard Voices"
      ]
    },
    {
      title: "Scale",
      description: "Perfect for businesses looking to scale to the next level.",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      features: [
        "Everything in Growth",
        "Access to new features first",
        "Custom Integrations",
        "24/7 Support",
      ]
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6">
        <div className="mb-12"> 
          <h2 className="text-3xl font-bold tracking-tighter text-black sm:text-5xl text-center mb-4">
            Only Pay for What You Use
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl text-center">
            Add limits to stay within your budget (we'll notify you when you're close).
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.title} className="bg-white border-blue-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">{plan.title}</CardTitle>
                <CardDescription className="text-blue-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-900">
                  {plan.monthlyPrice}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-blue-700">
                      <Check className="mr-2 h-4 w-4 text-blue-600" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
                  onClick={handlePlanClick}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}