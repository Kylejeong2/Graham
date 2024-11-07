import Image from 'next/image'

export default function Why() {
  const features = [
    {
      title: "Answer Business Questions",
      description: "Handle common customer inquiries about business hours, services, and policies automatically",
      image: "/placeholder1.jpg" 
    },
    {
      title: "Document Intelligence", 
      description: "Upload your business documents and Graham learns to answer questions based on your specific information",
      image: "/placeholder2.jpg"
    },
    {
      title: "24/7 Availability",
      description: "Take multiple calls simultaneously, any time of day or night",
      image: "/placeholder3.jpg"
    },
    {
      title: "Unlimited Concurrent Calls",
      description: "Handle unlimited calls simultaneously without ever keeping customers waiting",
      image: "/placeholder4.jpg"
    }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`flex items-center gap-8 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl mb-2">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="relative h-48 w-full rounded-xl overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
