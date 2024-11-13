'use client'

// import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Demo } from "./demo"
import Link from "next/link"


export default function Hero() {
  return (
    <section className="min-h-full pt-8 sm:pt-12 md:pt-16 bg-white pb-16 sm:pb-20 md:pb-24">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="flex flex-col items-center justify-center text-center h-[600px]">
            <div className="space-y-3 sm:space-y-4 max-w-[600px]">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-black md:text-5xl lg:text-6xl xl:text-7xl px-2">
                Never Miss A Phone Call Again.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
                Make more revenue and keep customers happier with Graham.
              </p>
            </div>
            <div className="flex flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto justify-center sm:justify-start px-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                >How Graham works</Link>
              </Button>
              <Button asChild variant="outline" className="hover:bg-orange-100 hover:text-black bg-orange-500 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto">
                {/* <Link href="/sign-up">Get Started</Link> */}
                <Link href="#waitlist"
                 className="w-full bg-orange-500 hover:bg-orange-700 text-white text-lg py-2 rounded-xl transition-all duration-300 text-center"
                 onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                >Get Started</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-start">
            <Demo />
          </div>
        </div>
      </div>
    </section>
  )
}