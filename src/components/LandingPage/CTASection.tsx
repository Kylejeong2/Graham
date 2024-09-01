import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-[#E6CCB2]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#5D4037]">
              Ready to Transform Your Business?
            </h2>
            <p className="mx-auto max-w-[600px] text-[#795548] md:text-xl">
              Join the growing number of small businesses using Graham to streamline their communication.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <form className="flex space-x-2">
              <Input className="max-w-lg flex-1 bg-white text-[#5D4037]" placeholder="Enter your email" type="email" />
              <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-[#795548]">
              Start your free 14-day trial. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}