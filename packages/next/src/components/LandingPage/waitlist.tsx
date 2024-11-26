'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Coffee, Send, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { joinWaitlist } from '@/components/actions/joinWaitlist'
import { motion, AnimatePresence } from 'framer-motion'

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    joinWaitlist(email)
      .then(() => {
        toast.success('Thank you for joining our waitlist!')
        setEmail('')
        setShowAlert(true)
      })
      .catch((error: any) => {
        console.error('Error submitting to waitlist:', error)
        toast.error('An error occurred. Please try again later.')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const benefits = [
    {
      title: 'Early Access',
      description: 'Be among the first to experience Graham',
      icon: <ArrowRight className="h-5 w-5" />,
      gradient: 'from-blue-600 to-blue-400'
    },
    {
      title: 'Exclusive Updates',
      description: 'Get insider news and features on Graham',
      icon: <Sparkles className="h-5 w-5" />,
      gradient: 'from-orange-600 to-orange-400'
    },
    {
      title: 'Priority Support',
      description: 'Direct access to our support team',
      icon: <CheckCircle className="h-5 w-5" />,
      gradient: 'from-green-600 to-green-400'
    }
  ]

  return (
    <section id="waitlist" className="relative overflow-hidden py-32 bg-gradient-to-b from-white to-gray-50">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block mb-4">
              Join the Waitlist
            </span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
              Transform Your <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Business</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Say goodbye to missed calls and hello to <span className="text-blue-600 font-semibold">Graham</span>!
            </p>
          </motion.div>

          <AnimatePresence>
            {showAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <Alert className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none shadow-xl max-w-2xl mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    className="absolute -left-3 -top-3 bg-white rounded-full p-1"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <AlertTitle className="text-lg font-semibold mb-2">Welcome aboard! 🎉</AlertTitle>
                  <AlertDescription className="text-blue-50">
                    You're now on our exclusive waitlist. We'll keep you in the loop with exciting updates!
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-16"
            variants={itemVariants}
          >
            <motion.div 
              className="flex-grow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-200 bg-white/80 backdrop-blur px-6 py-7 text-lg shadow-lg transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                required
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-7 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-blue-200 hover:shadow-2xl disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <Coffee className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Join Waitlist
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl`} />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${benefit.gradient} text-white mb-4`}>
                    {benefit.icon}
                  </div>
                  <h3 className={`text-lg font-semibold bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent mb-2`}>
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}