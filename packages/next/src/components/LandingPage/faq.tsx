'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export default function FAQ() {
  const faqs = [
    {
      question: "What is Graham?",
      answer: "Graham is an AI-powered phone agent that handles your business calls 24/7. It can answer customer questions, schedule appointments, and manage your phone communications without human intervention."
    },
    {
      question: "How much does Graham cost?",
      answer: "Graham offers flexible pricing starting at $0.25/minute with our Growth plan. You only pay for what you use, and you can set limits to stay within your budget."
    },
    {
      question: "Can I keep my existing phone number?",
      answer: "Yes! Graham works seamlessly with your existing business phone number. There's zero downtime during transition, and you maintain your business identity and customer relationships."
    },
    {
      question: "How long does it take to set up?",
      answer: "Setup takes less than 10 minutes. Simply connect your phone number, customize your preferences, and Graham will start handling your calls immediately."
    },
    {
      question: "What happens if Graham can't answer a question?",
      answer: "Graham is trained to handle common business inquiries professionally. For situations outside its capabilities, it can gracefully escalate to a human representative or take a message based on your preferences."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, security is our top priority. All conversations are encrypted, and we adhere to strict data protection standards to ensure your business and customer information remains confidential."
    },
    {
      question: "Can Graham handle multiple concurrent calls?",
      answer: "Yes! Unlike human receptionists, Graham can handle hundreds of concurrent calls without compromising quality or keeping customers waiting."
    },
    {
      question: "What types of businesses use Graham?",
      answer: "Graham is ideal for any growing business that receives phone calls, including medical practices, law firms, restaurants, retail stores, service providers, and more."
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase block mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about Graham and how it can transform your business communications.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <AccordionTrigger className="text-lg font-semibold hover:text-blue-600 transition-colors py-6">
                    <span className="text-left">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full hover:shadow-lg transition-all duration-300"
          >
            Contact Support
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}