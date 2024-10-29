import * as React from "react"
import Image from "next/image"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#5D4037]">
          How Graham Works
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#5D4037]">1. Set Up Your Account</h3>
            <p className="text-[#795548]">Sign up and configure your business details and preferences.</p>
            <h3 className="text-2xl font-bold text-[#5D4037]">2. Train Your AI Agent</h3>
            <p className="text-[#795548]">Provide information about your business for personalized responses.</p>
            <h3 className="text-2xl font-bold text-[#5D4037]">3. Go Live</h3>
            <p className="text-[#795548]">Activate Graham and start handling calls automatically.</p>
            <h3 className="text-2xl font-bold text-[#5D4037]">4. Monitor & Improve</h3>
            <p className="text-[#795548]">Review call logs and adjust settings for optimal performance.</p>
          </div>
          <div className="relative w-full h-[400px]">
            <Image
              src="/placeholder.svg?height=400&width=400"
              alt="How Graham Works"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}