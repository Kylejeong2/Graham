'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BarChart, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useRef } from "react"

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

export default function Features() {
  const containerRef = useRef(null)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
            Your receptionist who works 24/7.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Automate your customer service with AI that never sleeps, never takes breaks, and always maintains professionalism.
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 lg:grid-cols-3"
        >
          <MotionCard 
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Setup in less than 10 minutes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Click a few buttons and get your receptionist up and running in minutes. No technical expertise required.
            </CardContent>
          </MotionCard>

          <MotionCard 
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-900 to-orange-700 bg-clip-text text-transparent">
                Call Logs and Transcripts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Get detailed insights into customer conversations with full transcripts and analytics to improve your service.
            </CardContent>
          </MotionCard>

          <MotionCard 
            variants={cardVariants}
            className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            whileHover={{ scale: 1.02 }}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent">
                Only pay for what you use
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Save time and money while serving more customers. No fixed costs, just pay for the minutes you actually use.
            </CardContent>
          </MotionCard>
        </motion.div>
      </div>
    </section>
  )
}