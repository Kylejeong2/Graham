"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

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
      title: "Startup",
      description: "Perfect for startups",
      monthlyPrice: "$399.99/month",
      features: [
        "Unlimited Call Minutes",
        "Basic Call Routing",
        "Email Support",
        "Standard Voices"
      ]
    },
    {
      title: "Scale",
      description: "Looking to scale to the next level?",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      features: [
        "Everything in Growth/Startup",
        "Access to new features first", 
        "Custom Integrations",
        "24/7 Support",
      ]
    }
  ]

  return (
    <section className="w-full py-24 bg-gray-100 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-6xl text-center mb-4">
            Only Pay for <span className="text-orange-500">What You Use</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl text-center">
            Add limits to stay within your budget (we'll notify you when you're close).
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl hover:border-orange-300 mx-auto relative before:absolute before:-inset-3 before:border-2 before:border-orange-300/30 before:rounded-3xl before:blur-sm">
          {plans.map((plan) => (
            <Card key={plan.title} className="bg-white border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100/50 hover:scale-105 transition-all duration-300 rounded-2xl group">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{plan.title}</CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500 mb-8 group-hover:text-orange-500 transition-colors">
                  {plan.monthlyPrice}
                </p>
                <ul className="mt-4 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 text-lg">
                      <Check className="mr-3 h-5 w-5 text-orange-500 flex-shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-8">
                <Link href='/sign-up' className="w-full">
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-200"
                    onClick={handlePlanClick}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}