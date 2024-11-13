"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"  
import Link from "next/link"

export default function Pricing() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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
      ],
      href: "/sign-up"
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
      ],
      href: "/sign-up"
    },
    {
      title: "Scale",
      description: "Looking to scale to the next level?",
      monthlyPrice: "Custom",
      features: [
        "Everything in Growth/Startup",
        "Access to new features first",
        "Custom Integrations", 
        "24/7 Support",
      ],
      href: "/contact"
    }
  ]

  return (
    <section id="pricing" className="w-full py-24 bg-gray-100 border-t-4 border-gray-200 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-6xl text-center mb-4">
            Only Pay for <span className="text-orange-500">What You Use</span>
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl text-center">
            Add limits to stay within your budget (we'll notify you when you're close).
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto relative before:absolute before:-inset-3 before:border-2 before:border-orange-300/30 before:rounded-3xl before:blur-sm before:-z-10">
          {plans.map((plan) => (
            <Card 
              key={plan.title} 
              className={`relative z-10 bg-white border-2 ${hoveredCard === plan.title ? 'border-orange-300 shadow-2xl shadow-orange-100/50 scale-105' : 'border-gray-100'} transition-all duration-300 rounded-2xl group`}
              onMouseEnter={() => setHoveredCard(plan.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="pb-8">
                <CardTitle className={`text-3xl font-bold ${hoveredCard === plan.title ? 'text-orange-500' : 'text-gray-900'} transition-colors`}>{plan.title}</CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${hoveredCard === plan.title ? 'text-orange-500' : 'text-blue-500'} mb-8 transition-colors`}>
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
                {/* <Link 
                  href={plan.href}
                  className={`w-full bg-orange-500 hover:bg-orange-700 text-white text-lg py-2 rounded-xl transition-all duration-300 text-center ${hoveredCard === plan.title ? 'shadow-lg shadow-orange-200' : ''}`}
                >
                  {plan.title === "Scale" ? "Contact Sales" : "Get Started"}
                </Link> */}
                <Link href="#waitlist"
                 className="w-full bg-orange-500 hover:bg-orange-700 text-white text-lg py-2 rounded-xl transition-all duration-300 text-center"
                 onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                >Get Started</Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}