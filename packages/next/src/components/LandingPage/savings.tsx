"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Calculator, DollarSign, Clock, Building2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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

const AnimatedValue = ({ value, prefix = "$" }: { value: number, prefix?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      key={value}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex items-center justify-center gap-1"
    >
      {prefix && <DollarSign className="w-8 h-8 text-current" />}
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={value}
        className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.div>
  )
}

const MINUTES_PER_HOUR = 60
const EFFICIENCY_FACTOR = 0.75 // Receptionist is actively answering calls 75% of their time
const MIN_HOURS_PER_DAY = 4 // Minimum hours needed for a part-time receptionist
const MAX_HOURS_PER_DAY = 12 // Maximum hours for a single receptionist

export default function SavingsCalculator() {
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(300)
  const [selectedState, setSelectedState] = useState<string>("CA")
  const [benefitsPercentage, setBenefitsPercentage] = useState<number>(15)
  const [showYearly, setShowYearly] = useState<boolean>(false)
  const [daysPerWeek, setDaysPerWeek] = useState<string>("5")
  
  // Calculate required hours based on call volume
  const calculateRequiredHours = () => {
    // Calculate minutes per day
    const workingDays = parseInt(daysPerWeek)
    const minutesPerDay = monthlyMinutes / (workingDays * 4.33) // 4.33 weeks per month

    // Convert to hours needed considering efficiency
    const hoursNeeded = minutesPerDay / (MINUTES_PER_HOUR * EFFICIENCY_FACTOR)

    // Clamp between min and max hours
    return Math.max(MIN_HOURS_PER_DAY, Math.min(MAX_HOURS_PER_DAY, Math.ceil(hoursNeeded)))
  }

  const hoursPerDay = calculateRequiredHours()

  // Calculate traditional receptionist cost
  const calculateTraditionalCost = () => {
    const hourlyWage = STATE_MIN_WAGES[selectedState]
    const hoursPerMonth = hoursPerDay * parseInt(daysPerWeek) * 4.33
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

  // Calculate savings (never negative)
  const calculateSavings = () => {
    const traditional = calculateTraditionalCost()
    const graham = calculateGrahamCost()
    return Math.max(0, traditional - graham)
  }

  // Calculate savings percentage
  const calculateSavingsPercentage = () => {
    const traditional = calculateTraditionalCost()
    const savings = calculateSavings()
    return traditional > 0 ? (savings / traditional) * 100 : 0
  }

  // Calculate receptionist capacity
  const calculateReceptionistCapacity = () => {
    const totalMinutesAvailable = hoursPerDay * MINUTES_PER_HOUR * EFFICIENCY_FACTOR * parseInt(daysPerWeek) * 4.33
    const capacityPercentage = (monthlyMinutes / totalMinutesAvailable) * 100
    return Math.min(100, Math.round(capacityPercentage))
  }

  return (
    <section className="w-full py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block mb-4">
            ROI Calculator
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
            Calculate Your Savings
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            See how much you can save with Graham. 
            <span className="text-sm block mt-2 text-gray-500">
              *Calculations assume a receptionist spends 75% of their time actively answering calls
            </span>
          </p>
        </motion.div>

        <Card className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl border border-gray-100">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Cost Comparison Calculator
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {/* Monthly Minutes Slider */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4 p-6 rounded-xl bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <Label className="text-blue-900 text-lg font-medium">
                      Monthly Call Minutes
                    </Label>
                  </div>
                  <span className="text-blue-600 font-semibold">{monthlyMinutes}</span>
                </div>
                <Slider
                  value={[monthlyMinutes]}
                  onValueChange={(value) => setMonthlyMinutes(value[0])}
                  min={50}
                  max={10000}
                  step={50}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>50 min</span>
                  <span>10000 min</span>
                </div>
              </div>

              {/* State Selection */}
              <div className="space-y-4 p-6 rounded-xl bg-blue-50/50">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <Label className="text-blue-900 text-lg font-medium">
                    State's Minimum Wage
                  </Label>
                </div>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="border-blue-200 text-lg">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATE_MIN_WAGES).sort().map(([state, wage]) => (
                      <SelectItem key={state} value={state} className="text-lg">
                        {state} (${wage.toFixed(2)}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Benefits Slider */}
              <div className="space-y-4 p-6 rounded-xl bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-900 text-lg font-medium">
                    Benefits & Overhead
                  </Label>
                  <span className="text-blue-600 font-semibold">{benefitsPercentage}%</span>
                </div>
                <Slider
                  value={[benefitsPercentage]}
                  onValueChange={(value) => setBenefitsPercentage(value[0])}
                  min={0}
                  max={30}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Calculated Hours Display */}
              <div className="space-y-4 p-6 rounded-xl bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-900 text-lg font-medium">
                    Required Hours/Day
                  </Label>
                  <span className="text-blue-600 font-semibold">{hoursPerDay}h</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${(hoursPerDay / MAX_HOURS_PER_DAY) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{MIN_HOURS_PER_DAY}h</span>
                  <span>{MAX_HOURS_PER_DAY}h</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Receptionist Capacity: {calculateReceptionistCapacity()}%
                </p>
              </div>

              {/* Days per Week Selection */}
              <div className="space-y-4 p-6 rounded-xl bg-gray-50/50">
                <Label className="text-blue-900 text-lg font-medium">Days per Week</Label>
                <ToggleGroup 
                  type="single" 
                  value={daysPerWeek}
                  onValueChange={(value) => value && setDaysPerWeek(value)}
                  className="grid grid-cols-7 gap-1"
                >
                  {["1", "2", "3", "4", "5", "6", "7"].map((days) => (
                    <ToggleGroupItem 
                      key={days} 
                      value={days}
                      className="text-base data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                    >
                      {days}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-end space-x-3">
                <Label className="text-blue-900 text-lg font-medium">
                  Show Yearly Savings
                </Label>
                <Switch
                  checked={showYearly}
                  onCheckedChange={setShowYearly}
                />
              </div>

              {/* Results Section */}
              <motion.div 
                className="grid gap-6 md:grid-cols-3 p-8 rounded-2xl bg-gradient-to-r from-blue-500/5 to-blue-600/5"
                layout
              >
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`traditional-${showYearly}`}
                    className="text-center space-y-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <p className="text-lg font-medium text-blue-900">Traditional Cost</p>
                    <AnimatedValue value={Math.round(calculateTraditionalCost())} />
                    <p className="text-sm text-gray-500">per {showYearly ? 'year' : 'month'}</p>
                  </motion.div>
                  <motion.div 
                    key={`graham-${showYearly}`}
                    className="text-center space-y-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <p className="text-lg font-medium text-blue-900">Graham Cost</p>
                    <AnimatedValue value={Math.round(calculateGrahamCost())} />
                    <p className="text-sm text-gray-500">per {showYearly ? 'year' : 'month'}</p>
                  </motion.div>
                  <motion.div 
                    key={`savings-${showYearly}`}
                    className="text-center space-y-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <p className="text-lg font-medium text-orange-600">Your Savings</p>
                    <AnimatedValue value={Math.round(calculateSavings())} />
                    <p className="text-sm text-gray-500">
                      {Math.round(calculateSavingsPercentage())}% savings
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <motion.div 
                className="relative h-4 bg-blue-100 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateSavingsPercentage()}%` }}
                  transition={{ duration: 0.8, type: "spring" }}
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
