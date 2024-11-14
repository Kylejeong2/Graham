import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What is Graham?",
      answer: "Graham is an AI-powered phone agent that handles your business calls 24/7. It can answer customer questions, schedule appointments, and manage your phone communications without human intervention."
    },
    {
      question: "How much does Graham cost?",
      answer: "Graham offers flexible pricing starting at $0.20/minute with our Growth plan. We also offer unlimited plans starting at $399.99/month, and custom enterprise solutions. You only pay for what you use, and you can set limits to stay within your budget."
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tighter text-black sm:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about Graham
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-orange-500 transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}