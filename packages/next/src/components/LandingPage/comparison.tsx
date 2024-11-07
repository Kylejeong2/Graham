"use client";

import { Check, X } from "lucide-react";

export default function Comparison() {
  const features = [
    {
      name: "AI Phone Answering",
      graham: true,
      sameday: true,
      goodcall: true
    },
    {
      name: "24/7 Availability", 
      graham: true,
      sameday: true,
      goodcall: true
    },
    {
      name: "Unlimited Concurrent Calls",
      graham: true,
      sameday: false,
      goodcall: false
    },
    {
      name: "Keep Existing Phone Number",
      graham: true,
      sameday: false,
      goodcall: false
    },
    {
      name: "Custom Knowledge Base",
      graham: true,
      sameday: false,
      goodcall: false
    },
    {
      name: "Call Transcripts",
      graham: true,
      sameday: true,
      goodcall: false
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tighter text-black sm:text-5xl">
            Graham vs. Sameday AI vs GoodCall
          </h2>
          <p className="text-gray-600 mt-4">See how we stack up against the competition</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="col-span-1"></div>
            <div className="text-center font-semibold text-xl text-white">Graham</div>
            <div className="text-center font-semibold text-xl text-white/40">Sameday AI</div>
            <div className="text-center font-semibold text-xl text-white/40">GoodCall</div>
          </div>

          {/* Pricing Comparison */}
          <div className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-700">
            <div className="font-semibold text-white">Starting Price</div>
            <div className="text-center text-orange-500 font-semibold">Only pay for what you use</div>
            <div className="text-center text-gray-400 font-semibold">$299/mo</div>
            <div className="text-center text-gray-400 font-semibold">$199/mo</div>
          </div>

          {/* Feature Comparison */}
          {features.map((feature, index) => (
            <div 
              key={feature.name}
              className={`grid grid-cols-4 gap-4 py-4 ${
                index !== features.length - 1 ? "border-b border-gray-700" : ""
              }`}
            >
              <div className="font-medium text-gray-300">{feature.name}</div>
              <div className="flex justify-center">
                {feature.graham ? (
                  <Check className="text-green-500 h-6 w-6" />
                ) : (
                  <X className="text-red-500 h-6 w-6" />
                )}
              </div>
              <div className="flex justify-center">
                {feature.sameday ? (
                  <Check className="text-green-500 h-6 w-6" />
                ) : (
                  <X className="text-red-500 h-6 w-6" />
                )}
              </div>
              <div className="flex justify-center">
                {feature.goodcall ? (
                  <Check className="text-green-500 h-6 w-6" />
                ) : (
                  <X className="text-red-500 h-6 w-6" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
