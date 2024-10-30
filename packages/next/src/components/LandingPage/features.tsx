import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BarChart, Globe } from "lucide-react"

export default function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
          Your business' receptionist who works 24/7.
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>Setup in less than 10 minutes.</CardTitle>
            </CardHeader>
            <CardContent>
              Click a few buttons and get your receptionist up and running in minutes.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BarChart className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>Call Logs and Transcripts</CardTitle>
            </CardHeader>
            <CardContent>
              Get insights into customer conversations and see your receptionist work overtime.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>Only pay for what you use</CardTitle>
            </CardHeader>
            <CardContent>
                Save time and money, while serving more customers with Graham.
            </CardContent>
          </Card>
          {/* <Card> //TODO: update with SOC 2 status asap
            <CardHeader>
              <Globe className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>SOC</CardTitle>
            </CardHeader>
            <CardContent>
              Have a remote team? Easily register for payroll taxes in all 50 states. We have everything you need to stay compliant.
            </CardContent>
          </Card> */}
        </div>
      </div>
    </section>
  )
}