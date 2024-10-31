import { Button } from "@/components/ui/button"
// import Image from "next/image"
import { Demo } from "./demo"

export default function Hero() {
  return (
    <section className="pt-12 md:pt-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="flex flex-col items-center text-center md:w-1/2">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter text-black sm:text-5xl md:text-6xl lg:text-7xl">
                Never Miss A Phone Call Again.
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Make more money and keep customers happy with Graham.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row mt-8">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">How Graham works</Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Get Started</Button>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <Demo />
          </div>
        </div>
      </div>
    </section>
  )
}