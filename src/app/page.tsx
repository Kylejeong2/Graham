'use client';

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/LandingPage/Hero";
import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { HowItWorksSection } from "@/components/LandingPage/HowItWorksSection";
import { PricingSection } from "@/components/LandingPage/PricingSection";
import { TestimonialsSection } from "@/components/LandingPage/TestimonialsSection";
import { CTASection } from "@/components/LandingPage/CTASection";

export default function Home() {
  // const { isSignedIn, isLoaded } = useUser();
  // const router = useRouter();

  // useEffect(() => {
  //   if (isLoaded && isSignedIn) {
  //     router.push('/dashboard');
  //   }
  // }, [isLoaded, isSignedIn, router]);

  // if (!isLoaded || isSignedIn) {
  //   return null; // or a loading spinner
  // }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5E6D3]">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#8B4513]">
        <p className="text-xs text-[#795548]">
          © {new Date().getFullYear()} Graham AI. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4 text-[#795548]" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4 text-[#795548]" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}