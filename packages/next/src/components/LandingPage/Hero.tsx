'use client'

import { Button } from "@/components/ui/button"
import { Demo } from "./demo"
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

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

export default function Hero() {
  return (
    <section className="min-h-full pt-8 sm:pt-12 md:pt-16 bg-white pb-16 sm:pb-20 md:pb-24 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <motion.div 
            className="flex flex-col items-start justify-center h-[600px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-3 sm:space-y-4 max-w-[600px]">
              <motion.div variants={itemVariants}>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter py-4 text-black md:text-5xl lg:text-6xl xl:text-7xl px-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                  Never Miss A Phone Call Again.
                </h1>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="max-w-[700px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
                  Tired of missed calls costing you customers and revenue? <br />
                  Put an end to it with Graham.
                </p>
              </motion.div>
            </div>
            <motion.div 
              className="flex flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto px-4"
              variants={containerVariants}
            >
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto hover:shadow-lg transition-all duration-300">
                  <Link href="/#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    How Graham works
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button asChild variant="outline" className="bg-gradient-to-r hover:text-white from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-8 w-full sm:w-auto hover:shadow-lg transition-all duration-300">
                  <Link href="#waitlist"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Start Making More Money
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="flex justify-center items-start"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Demo />
          </motion.div>
        </div>
      </div>
      
      {/* Background Elements */}
      <motion.div 
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-t from-orange-50 to-transparent opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
    </section>
  )
}