"use client";

import { Phone, ArrowRight, Check, Link } from "lucide-react";

export default function BYOPN() {
  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                Keep the <span className="text-orange-600">Same Number</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                No need to change your phone number.<br></br> Graham works seamlessly with your existing business line, preserving your brand identity while upgrading your communication capabilities.
              </p>
            </div>
            <ul className="space-y-6">
              {[
                "Port your existing number",
                "Zero downtime during transition",
                "Keep your business identity",
                "Maintain customer relationships"
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] blur-3xl opacity-20" />
              <div className="relative bg-white p-10 rounded-[1.5rem] shadow-2xl border border-gray-100">
                <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mb-8">
                  <Phone className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Simple Setup Process</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Get started in minutes. We handle all the technical details of integrating your existing phone number with Graham's AI system.
                </p>
                <Link href="/sign-up">
                  <button className="flex items-center gap-2 text-orange-600 font-semibold hover:gap-4 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
