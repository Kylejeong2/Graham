import { Button } from "@/components/ui/button"
// import Image from "next/image"
import { Demo } from "./demo"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="pt-8 sm:pt-12 md:pt-16 bg-white pb-16 sm:pb-20 md:pb-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="flex flex-col items-center text-center w-full md:w-1/2">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-black md:text-5xl lg:text-6xl xl:text-7xl px-2">
                Never Miss A Phone Call Again.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
                Make more revenue and keep customers happier with Graham.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto justify-center sm:justify-start px-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto">How Graham works</Button>
              <Button asChild variant="outline" className="hover:bg-orange-100 hover:text-black bg-orange-500 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
            <Demo />
          </div>
        </div>
      </div>
    </section>
  )
}