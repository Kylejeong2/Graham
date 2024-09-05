import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PhoneCall, User, Mail, Phone } from "lucide-react"
import { Label } from "@/components/ui/label"

export function HeroSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/demo-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phoneNumber }),
      })
      if (!response.ok) throw new Error('Failed to initiate demo call')
      toast.success('Demo call initiated! You should receive a call shortly.')
    } catch (error) {
      console.error('Error initiating demo call:', error)
      toast.error('Failed to initiate demo call. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full py-4 md:py-4 lg:py-16 xl:py-24 bg-[#F5E6D3]">
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
              <Link href="/dashboard">
                <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Start Free Trial</Button>
              </Link>
              <Button variant="outline" className="border-[#8B4513] text-white hover:bg-[#F5E6D3] hover:text-[#8B4513]">Watch Demo</Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
              <CardHeader className="text-center border-b border-[#E6CCB2] pb-6">
                <div className="flex justify-center mb-4">
                  <PhoneCall className="w-16 h-16 text-[#8B4513]" />
                </div>
                <CardTitle className="text-3xl font-bold text-[#8B4513]">
                  Experience Graham in Action
                </CardTitle>
                <p className="mt-2 text-[#5D4037]">
                  Get a personalized demo call and see how Graham can transform your customer service
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#5D4037] font-semibold">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-10 border-2 border-[#8B4513] text-[#5D4037] placeholder-[#A0522D] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#5D4037] font-semibold">Your Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 border-2 border-[#8B4513] text-[#5D4037] placeholder-[#A0522D] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-[#5D4037] font-semibold">Your Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={phoneNumber}
                        onChange={(e) => {
                          const input = e.target.value.replace(/\D/g, '');
                          if (input.length <= 10) {
                            const formatted = input.replace(/(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3').trim();
                            setPhoneNumber(formatted);
                          }
                        }}
                        required
                        pattern="\(\d{3}\)\s\d{3}-\d{4}"
                        maxLength={14}
                        className="pl-10 border-2 border-[#8B4513] text-[#5D4037] placeholder-[#A0522D] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#8B4513] text-white hover:bg-[#A0522D] transition-colors duration-300 py-6 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <PhoneCall className="animate-pulse mr-2" />
                        Initiating Call...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="mr-2" />
                        Get a Demo Call
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}