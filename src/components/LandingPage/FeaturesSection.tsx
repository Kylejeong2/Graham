import * as React from "react"
import { Phone, MessageSquare, ShieldCheck } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-[#E6CCB2]">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#5D4037]">
          Why Choose Graham?
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg bg-[#F5E6D3]">
            <Phone className="h-8 w-8 text-[#8B4513]" />
            <h3 className="text-xl font-bold text-[#5D4037]">24/7 Availability</h3>
            <p className="text-[#795548] text-center">Never miss a call, even outside business hours.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg bg-[#F5E6D3]">
            <MessageSquare className="h-8 w-8 text-[#8B4513]" />
            <h3 className="text-xl font-bold text-[#5D4037]">Natural Conversations</h3>
            <p className="text-[#795548] text-center">AI-powered responses that sound human and professional.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg bg-[#F5E6D3]">
            <ShieldCheck className="h-8 w-8 text-[#8B4513]" />
            <h3 className="text-xl font-bold text-[#5D4037]">Secure & Reliable</h3>
            <p className="text-[#795548] text-center">Your data is protected with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </section>
  )
}