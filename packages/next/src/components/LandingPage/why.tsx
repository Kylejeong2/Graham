'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Why() {
  const features = [
    {
      title: "Answer Business Questions",
      description: "Handle common customer inquiries about business hours, services, and policies automatically. Our AI understands context and provides accurate, natural responses.",
      image: "/images/dentist.png",
      accent: "from-blue-500 to-cyan-400"
    },
    {
      title: "Document Intelligence", 
      description: "Upload your business documents and Graham learns to answer questions based on your specific information. No coding or complex setup required.",
      image: "/images/chef.png",
      accent: "from-orange-500 to-yellow-400"
    },
    {
      title: "24/7 Availability",
      description: "Never miss a customer call again. Graham handles inquiries around the clock, ensuring your business is always accessible when customers need you.",
      image: "/images/plumber.png",
      accent: "from-green-500 to-emerald-400"
    },
    {
      title: "Unlimited Concurrent Calls",
      description: "Scale your customer service effortlessly. Handle hundreds of calls simultaneously without compromising on quality or keeping customers waiting.",
      image: "/images/mechanic.png",
      accent: "from-purple-500 to-pink-400"
    }
  ]

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Why Choose Graham?
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the future of customer service with AI-powered communication that feels natural and delivers results.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="flex-1 group">
                <div className="relative">
                  <div className={`absolute -inset-[2px] bg-gradient-to-r ${feature.accent} rounded-xl opacity-0 group-hover:opacity-70 blur-md transition-all duration-300`} />
                  <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 relative">
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${feature.accent} bg-clip-text text-transparent mb-4`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {feature.description}
                    </p>
                    {/* <Link href="/sign-up">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Get Started
                      </button>
                    </Link> */}
                    <Link href="#waitlist"
                        onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Get Started
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${feature.accent} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}