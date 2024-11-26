"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"  
import Link from "next/link"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const MotionCard = motion(Card)

export default function Pricing() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const plans = [
    {
      title: "Growth",
      description: "Perfect for fast-growing businesses",
      monthlyPrice: "$0.25/min",
      gradient: "from-blue-600 to-cyan-500",
      features: [
        "Pay only for what you use",
        "Basic Call Routing",
        "Email Support", 
        "Standard Voices"
      ],
      href: "/sign-up"
    },
    {
      title: "Scale",
      description: "Looking to scale to the next level?",
      monthlyPrice: "Custom",
      gradient: "from-orange-500 to-pink-500",
      features: [
        "Everything in Growth",
        "Access to new features first",
        "Custom Integrations", 
        "24/7 Support",
      ],
      href: "/contact"
    }
  ]

  return (
    <section id="pricing" className="w-full py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container px-4 md:px-6 relative">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block text-center mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent text-center mb-6">
            Only Pay for What You Use
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 text-center leading-relaxed">
            Add limits to stay within your budget. We'll notify you when you're close, ensuring complete control over your spending.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => (
            <MotionCard 
              key={plan.title}
              variants={cardVariants}
              className={`relative bg-white/80 backdrop-blur-sm border-2 ${
                hoveredCard === plan.title 
                  ? 'border-transparent shadow-2xl scale-105' 
                  : 'border-gray-100'
              } transition-all duration-500 rounded-2xl overflow-hidden group`}
              onMouseEnter={() => setHoveredCard(plan.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
              <div className="absolute inset-[2px] bg-white rounded-2xl" />
              
              <div className="relative">
                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-3xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.title}
                    </CardTitle>
                    {index === 0 && (
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-gray-600 text-lg mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-8`}>
                    {plan.monthlyPrice}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {plan.features.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center text-gray-700 text-lg"
                      >
                        <div className={`mr-3 p-1 rounded-full bg-gradient-to-r ${plan.gradient}`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Link 
                      href="#waitlist"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full bg-gradient-to-r ${plan.gradient} text-white text-lg py-3 px-6 rounded-xl transition-all duration-300 text-center inline-flex items-center justify-center gap-2 hover:shadow-lg`}
                    >
                      Get Started
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </motion.div>
                </CardFooter>
              </div>
            </MotionCard>
          ))}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          className="text-center mt-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-600 text-lg">
            Need a custom solution? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">Contact our sales team</Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}