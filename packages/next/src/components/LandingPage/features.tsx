import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BarChart, Globe } from "lucide-react"

export default function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-black sm:text-5xl text-center mb-12">
          Your business' receptionist who works 24/7.
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-blue-50 border-blue-100 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-blue-900">Setup in less than 10 minutes.</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              Click a few buttons and get your receptionist up and running in minutes.
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <BarChart className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-blue-900">Call Logs and Transcripts</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              Get insights into customer conversations and see your receptionist work overtime.
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-blue-900">Only pay for what you use</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              Save time and money, while serving more customers with Graham.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}