import Hero from "@/components/LandingPage/hero";
import Features from "@/components/LandingPage/features";
import Pricing from "@/components/LandingPage/pricing";
import Footer from "@/components/LandingPage/footer";
import { WaitlistSection } from "@/components/LandingPage/waitlist";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />
        {/* Add a moving "trusted by" with logos */}
        <Features />
        {/* lottie animation with HOW IT WORKS */}
        <Pricing />
        {/* <Testimonial /> */}
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  )
}