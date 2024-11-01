"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Calculator } from "lucide-react"
import { motion } from "framer-motion"

// Minimum wage by state (2024 data)
const STATE_MIN_WAGES: { [key: string]: number } = {
  AL: 7.25, AK: 11.73, AZ: 14.35, AR: 11.00, CA: 16.00, CO: 14.42,
  CT: 15.69, DE: 13.25, FL: 12.00, GA: 7.25, HI: 14.00, ID: 7.25,
  IL: 14.00, IN: 7.25, IA: 7.25, KS: 7.25, KY: 7.25, LA: 7.25,
  ME: 14.15, MD: 15.00, MA: 15.00, MI: 10.33, MN: 10.85, MS: 7.25,
  MO: 12.30, MT: 10.30, NE: 12.00, NV: 12.00, NH: 7.25, NJ: 15.13,
  NM: 12.00, NY: 15.00, NC: 7.25, ND: 7.25, OH: 10.45, OK: 7.25,
  OR: 14.20, PA: 7.25, RI: 14.00, SC: 7.25, SD: 11.20, TN: 7.25,
  TX: 7.25, UT: 7.25, VT: 13.67, VA: 12.00, WA: 16.28, WV: 8.75,
  WI: 7.25, WY: 7.25
}

const AnimatedValue = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={value}
      className="text-5xl font-bold text-blue-600"
    >
      ${value.toLocaleString()}
    </motion.span>
  )
}

export default function SavingsCalculator() {
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(300)
  const [selectedState, setSelectedState] = useState<string>("CA")
  const [benefitsPercentage, setBenefitsPercentage] = useState<number>(25)
  const [showYearly, setShowYearly] = useState<boolean>(false)
  const [hoursPerDay, setHoursPerDay] = useState<number>(8)
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5)

  // Calculate traditional receptionist cost
  const calculateTraditionalCost = () => {
    const hourlyWage = STATE_MIN_WAGES[selectedState]
    const hoursPerMonth = hoursPerDay * daysPerWeek * 4.33 // 4.33 weeks per month average
    const baseMonthlyCost = hourlyWage * hoursPerMonth
    const totalMonthlyCost = baseMonthlyCost * (1 + benefitsPercentage / 100)
    return showYearly ? totalMonthlyCost * 12 : totalMonthlyCost
  }

  // Calculate Graham cost
  const calculateGrahamCost = () => {
    const costPerMinute = 0.20
    const monthlyCost = monthlyMinutes * costPerMinute
    return showYearly ? monthlyCost * 12 : monthlyCost
  }

  // Calculate savings
  const calculateSavings = () => {
    return calculateTraditionalCost() - calculateGrahamCost()
  }

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter text-black sm:text-5xl">
            Calculate your Savings
          </h2>
          <p className="text-gray-500 text-xl">
            Graham users save a LOT of money.
          </p>
        </div>

        <Card className="max-w-6xl mx-auto bg-white shadow-xl">
          <CardHeader className="border-b border-blue-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-900 text-2xl">
              <Calculator className="w-6 h-6 text-orange-600" />
              Graham vs Human Receptionist
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Monthly Minutes Slider */}
              <div className="space-y-2">
                <Label className="text-blue-900 text-lg">Average Monthly Call Minutes: {monthlyMinutes}</Label>
                <Slider
                  value={[monthlyMinutes]}
                  onValueChange={(value) => setMonthlyMinutes(value[0])}
                  min={100}
                  max={1000}
                  step={50}
                  className="py-4"
                />
              </div>

              {/* State Selection */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-blue-900 text-lg">Select your State's Minimum Wage</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="border-blue-200 text-lg">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATE_MIN_WAGES).sort().map(([state, wage]) => (
                      <SelectItem key={state} value={state} className="text-lg">
                        {state} (${wage}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Benefits and Coverage Controls in one row */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-blue-900 text-lg">Employee Benefits & Overhead: {benefitsPercentage}%</Label>
                <Slider
                  value={[benefitsPercentage]}
                  onValueChange={(value) => setBenefitsPercentage(value[0])}
                  min={20}
                  max={30}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-900 text-lg">Human Employee Hours per Day: {hoursPerDay}</Label>
                <Slider
                  value={[hoursPerDay]}
                  onValueChange={(value) => setHoursPerDay(value[0])}
                  min={4}
                  max={24}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-900 text-lg">Days per Week: {daysPerWeek}</Label>
                <Slider
                  value={[daysPerWeek]}
                  onValueChange={(value) => setDaysPerWeek(value[0])}
                  min={5}
                  max={7}
                  step={1}
                />
              </div>
            </div>

            {/* Monthly/Yearly Toggle and Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-end space-x-2">
                <Label htmlFor="yearly" className="text-blue-900 text-lg">Show Yearly</Label>
                <Switch
                  id="yearly"
                  checked={showYearly}
                  onCheckedChange={setShowYearly}
                />
              </div>

              {/* Results Section */}
              <div className="grid gap-4 md:grid-cols-3 bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-lg text-blue-600 mb-1">Traditional Cost</p>
                  <AnimatedValue value={Math.round(calculateTraditionalCost())} />
                </div>
                <div className="text-center">
                  <p className="text-lg text-blue-600 mb-1">Graham Cost</p>
                  <AnimatedValue value={Math.round(calculateGrahamCost())} />
                </div>
                <div className="text-center">
                  <p className="text-lg text-orange-600 mb-1">Your Savings</p>
                  <AnimatedValue value={Math.round(calculateSavings())} />
                </div>
              </div>

              <Progress 
                value={(calculateSavings() / calculateTraditionalCost()) * 100} 
                className="h-2 bg-blue-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
