"use client";

import { useEffect, useState } from "react";

export default function Trust() {
  const [position, setPosition] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  
  // Add your logos here
  const logos = [
    "/logos/logo1.png",
    "/logos/logo2.png", 
    "/logos/logo3.png",
    "/logos/logo4.png",
    "/logos/logo5.png",
    "/logos/logo6.png"
  ];

  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        if (prev <= -(logos.length * 200)) {
          setNoTransition(true);
          return 0;
        }
        setNoTransition(false);
        return prev - 1;
      });
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [logos.length]);

  return (
    <section className="py-12 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 bg-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Trusted By Industry Leaders
        </h2>
        
        <div className="relative">
          <div 
            className="flex items-center space-x-16" 
            style={{
              transform: `translateX(${position}px)`,
              width: `${logos.length * 200}px`,
              transition: noTransition ? 'none' : 'transform 0.1s linear'
            }}>
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-12 w-32 relative"
              >
                <img
                  src={logo}
                  alt={`Trusted company ${index + 1}`}
                  className="object-contain w-full h-full filter grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
