"use client";

import { Phone, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function BYOPN() {
  return (
    <section className="py-12 sm:py-24 bg-gradient-to-b from-blue-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <motion.div 
            className="flex-1 space-y-6 sm:space-y-8 w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="space-y-3 sm:space-y-4 text-center md:text-left"
              variants={itemVariants}
            >
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block">
                Seamless Integration
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent leading-tight">
                Keep the <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Same Number</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                No need to change your phone number.<br></br> Graham works seamlessly with your existing business line, preserving your brand identity while upgrading your communication capabilities.
              </p>
            </motion.div>
            <motion.ul 
              className="space-y-4 sm:space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "Port your existing number",
                "Zero downtime during transition",
                "Keep your business identity",
                "Maintain customer relationships"
              ].map((benefit) => (
                <motion.li 
                  key={benefit}
                  variants={itemVariants}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 font-medium">{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div 
            className="flex-1 flex justify-center w-full mt-8 md:mt-0"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-lg">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] blur-3xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.2 }}
                transition={{ duration: 1 }}
              />
              <motion.div 
                className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-10 rounded-[1.5rem] shadow-2xl border border-gray-100"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mb-6 sm:mb-8"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Simple Setup Process
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  Get started in minutes. We handle all the technical details of integrating your existing phone number with Graham's AI system.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="#waitlist"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:shadow-lg hover:shadow-orange-100/50 hover:scale-105 hover:gap-4 transition-all duration-300"
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
