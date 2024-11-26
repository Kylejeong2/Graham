"use client";

import { Phone, Calendar, MessageSquare, ShoppingCart } from "lucide-react";
import Spline from '@splinetool/react-spline';
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

export default function HowItWorks() {
  const features = [
    {
      icon: <Phone className="h-8 w-8 text-blue-600" />,
      title: "Never Miss a Call",
      description: "Graham's AI agents answer your phone 24/7, ensuring you never miss an opportunity",
      gradient: "from-blue-600 to-blue-400"
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Book Appointments",
      description: "Seamlessly schedule meetings and appointments while integrating with your calendar",
      gradient: "from-orange-600 to-orange-400"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: "Answer Questions", 
      description: "Handle customer inquiries about your business hours, services, and policies",
      gradient: "from-green-600 to-green-400"
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-purple-600" />,
      title: "Process Orders",
      description: "Take orders and process transactions without human intervention",
      gradient: "from-purple-600 to-purple-400"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden" id="how-it-works">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            className="hidden md:flex flex-1 justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full h-[600px] bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-[130%] h-[130%] -ml-[15%] -mt-[15%]">
                <Spline scene="https://prod.spline.design/r8Q30WXZJaR6TWsS/scene.splinecode" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Automate Your <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Customer Service</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our AI agents handle your calls with human-like understanding, letting you focus on growing your business.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-2`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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
