"use client";

import { Phone, Calendar, MessageSquare, ShoppingCart } from "lucide-react";

export default function HowItWorks() {
  const features = [
    {
      icon: <Phone className="h-8 w-8 text-blue-600" />,
      title: "Never Miss a Call",
      description: "Graham's AI agents answer your phone 24/7, ensuring you never miss an opportunity"
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Book Appointments",
      description: "Seamlessly schedule meetings and appointments while integrating with your calendar"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: "Answer Questions",
      description: "Handle customer inquiries about your business hours, services, and policies"
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
      title: "Process Orders",
      description: "Take orders and process transactions without human intervention"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex justify-center">
            <div className="w-full h-[600px] bg-gray-100 rounded-2xl">
              {/* Add your Lottie animation here */}
            </div>
          </div>

          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900">
                How Graham <span className="text-blue-600">Works</span>
              </h2>
              <p className="text-xl text-gray-600">
                Our AI agents handle your calls with human-like understanding, letting you focus on growing your business.
              </p>
            </div>
            
            <div className="grid gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
