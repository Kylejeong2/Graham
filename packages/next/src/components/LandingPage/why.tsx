import Image from 'next/image'
import Link from 'next/link'

export default function Why() {
  const features = [
    {
      title: "Answer Business Questions",
      description: "Handle common customer inquiries about business hours, services, and policies automatically",
      image: "/images/dentist.png" 
    },
    {
      title: "Document Intelligence", 
      description: "Upload your business documents and Graham learns to answer questions based on your specific information",
      image: "/images/chef.png"
    },
    {
      title: "24/7 Availability",
      description: "Take multiple calls simultaneously, any time of day or night",
      image: "/images/plumber.png"
    },
    {
      title: "Unlimited Concurrent Calls",
      description: "Handle unlimited calls simultaneously without ever keeping customers waiting",
      image: "/images/mechanic.png"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight text-center">
          Why Choose Graham?
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed text-center mb-16">
            There's too many reasons.
        </p>
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="flex-1">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-3xl font-bold tracking-tight text-blue-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <Link href="/signup">
                    <button className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300">
                        Get Started
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-xl transition-all hover:scale-105 hover:shadow-2xl duration-300">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-orange-500/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}