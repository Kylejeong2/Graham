import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#5D4037]">
          What Our Customers Say
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#F5E6D3]">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-[#795548] mb-4">
                  "Graham has transformed how we handle customer calls. It's like having a full-time receptionist without the cost!"
                </p>
                <p className="font-bold text-[#5D4037]">- Sarah J., Small Business Owner</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}