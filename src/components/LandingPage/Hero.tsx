import * as React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[#F5E6D3]">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-[#5D4037]">
                Your AI Phone Agent for Small Businesses
              </h1>
              <p className="max-w-[600px] text-[#795548] md:text-xl">
                Graham handles your calls, schedules appointments, and answers questions, so you can focus on growing your business.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Start Free Trial</Button>
              <Button variant="outline" className="border-[#8B4513] text-white hover:bg-[#F5E6D3] hover:text-[#8B4513]">Watch Demo</Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-[300px] h-[400px] sm:w-[400px] sm:h-[500px] lg:w-[500px] lg:h-[600px]">
              <Image
                src="/placeholder.svg?height=600&width=500"
                alt="Graham AI Phone Agent"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}