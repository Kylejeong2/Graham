"use client";

import { Check, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const MotionCheck = motion(Check)
const MotionX = motion(X)

export default function Comparison() {
  const features = [
    {
      name: "AI Phone Answering",
      graham: true,
      sameday: true,
      goodcall: true
    },
    {
      name: "24/7 Availability", 
      graham: true,
      sameday: false,
      goodcall: true
    },
    {
      name: "Unlimited Concurrent Calls",
      graham: true,
      sameday: false,
      goodcall: false
    },
    {
      name: "Keep Existing Phone Number",
      graham: true,
      sameday: true,
      goodcall: true
    },
    {
      name: "Unlimited Caller Phone Numbers",
      graham: true,
      sameday: true,
      goodcall: false
    },
    {
      name: "Customizable Voice",
      graham: true,
      sameday: true,
      goodcall: false
    },
    {
      name: "Unlimited Users",
      graham: true,
      sameday: true,
      goodcall: false
    },
    {
      name: "Unlimited Locations",
      graham: true,
      sameday: false,
      goodcall: false
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="mx-auto mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block mb-4">
            Comparison
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
            Why Choose Graham?
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            See how we stack up against the competition with our comprehensive feature comparison.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <motion.div 
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-800 max-w-5xl mx-auto overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="col-span-1"></div>
                <motion.div 
                  className="text-center font-semibold text-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    Graham <Sparkles className="w-4 h-4 text-blue-400" />
                  </span>
                </motion.div>
                <div className="text-center font-semibold text-xl text-white/40">Sameday AI</div>
                <div className="text-center font-semibold text-xl text-white/40">GoodCall</div>
              </div>

              {/* Pricing Comparison */}
              <motion.div 
                className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-800"
                variants={rowVariants}
              >
                <div className="font-semibold text-white">Starting Price</div>
                <div className="text-center text-blue-400 font-semibold">Only Pay for What You Use</div>
                <div className="text-center text-gray-400 font-semibold">$349/mo</div>
                <div className="text-center text-gray-400 font-semibold">$59/mo</div>
              </motion.div>

              {/* Feature Comparison */}
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className={`grid grid-cols-4 gap-4 py-4 rounded-lg transition-colors ${
                    index !== features.length - 1 ? "border-b border-gray-800" : ""
                  }`}
                >
                  <div className="font-medium text-gray-300">{feature.name}</div>
                  <div className="flex justify-center">
                    {feature.graham ? (
                      <MotionCheck 
                        className="text-blue-400 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    ) : (
                      <MotionX 
                        className="text-red-500 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.sameday ? (
                      <MotionCheck 
                        className="text-green-500 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    ) : (
                      <MotionX 
                        className="text-red-500 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.goodcall ? (
                      <MotionCheck 
                        className="text-green-500 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    ) : (
                      <MotionX 
                        className="text-red-500 h-6 w-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
