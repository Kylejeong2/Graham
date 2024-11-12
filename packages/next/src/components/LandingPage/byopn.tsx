"use client";

import { Phone, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function BYOPN() {
  return (
    <section className="py-12 sm:py-24 bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <div className="flex-1 space-y-6 sm:space-y-8 w-full">
            <div className="space-y-3 sm:space-y-4 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Keep the <span className="text-orange-600">Same Number</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                No need to change your phone number.<br></br> Graham works seamlessly with your existing business line, preserving your brand identity while upgrading your communication capabilities.
              </p>
            </div>
            <ul className="space-y-4 sm:space-y-6">
              {[
                "Port your existing number",
                "Zero downtime during transition",
                "Keep your business identity",
                "Maintain customer relationships"
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center w-full mt-8 md:mt-0">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] blur-3xl opacity-20" />
              <div className="relative bg-white p-6 sm:p-10 rounded-[1.5rem] shadow-2xl border border-gray-100">
                <div className="bg-orange-50 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mb-6 sm:mb-8">
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Simple Setup Process</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  Get started in minutes. We handle all the technical details of integrating your existing phone number with Graham's AI system.
                </p>
                {/* <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-orange-600 font-semibold border-2 border-orange-300 rounded-xl hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-100/50 hover:scale-105 hover:gap-4 transition-all duration-300">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link> */}
                <Link href="#waitlist"
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-orange-600 font-semibold border-2 border-orange-300 rounded-xl hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-100/50 hover:scale-105 hover:gap-4 transition-all duration-300"
                 onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                >Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
