'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const features = [
  {
    title: "Answer Business Questions",
    description: "Handle common customer inquiries about business hours, services, and policies automatically. Our AI understands context and provides accurate, natural responses.",
    image: "/images/dentist.png",
    accent: "from-blue-500 to-cyan-400",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  },
  {
    title: "Document Intelligence",
    description: "Upload your business documents and Graham learns to answer questions based on your specific information. No coding or complex setup required.",
    image: "/images/chef.png",
    accent: "from-orange-500 to-yellow-400",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: "24/7 Availability",
    description: "Never miss a customer call again. Graham handles inquiries around the clock, ensuring your business is always accessible when customers need you.",
    image: "/images/plumber.png",
    accent: "from-green-500 to-emerald-400",
    stats: { uptime: "99.99%", coverage: "24/7" },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Unlimited Concurrent Calls",
    description: "Scale your customer service effortlessly. Handle hundreds of calls simultaneously without compromising on quality or keeping customers waiting.",
    image: "/images/mechanic.png",
    accent: "from-purple-500 to-pink-400",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
]

export default function Why() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  return (
    <section ref={containerRef} className="py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-pink-50 opacity-40"
          style={{
            scaleY: useTransform(scrollYProgress, [0, 0.5], [1.2, 1]),
            opacity: useTransform(scrollYProgress, [0, 0.5], [0, 1])
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>
      
      <div className="container relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4 block">
            Why Graham?
          </span>
          <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Transform Your Customer Service
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Experience the future of customer service with AI-powered communication that feels natural and delivers results.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 max-w-4xl mx-auto"
        >
          {[
            { label: "Response Time", value: "< 1s" },
            { label: "Availability", value: "24/7" },
            { label: "Unlimited Calls", value: "∞" },
            { label: "Take multiple calls at once", value: "10+" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-2"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
    >
      <div className="flex-1 w-full">
        <div className="relative">
          <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-500 relative">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.accent} text-white mb-6`}>
              {feature.icon}
            </div>
            <h3 className={`text-3xl font-bold bg-gradient-to-r ${feature.accent} bg-clip-text text-transparent mb-4`}>
              {feature.title}
            </h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {feature.description}
            </p>

            <Link href="#waitlist">
              <button className={`
                inline-flex items-center justify-center rounded-lg text-sm font-medium
                transition-all duration-300 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
                disabled:opacity-50 bg-gradient-to-r ${feature.accent} text-white
                hover:shadow-lg hover:scale-105 px-6 py-3
              `}>
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg group"
        >
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-tr ${feature.accent} mix-blend-multiply opacity-10`} />
        </motion.div>
      </div>
    </motion.div>
  )
}