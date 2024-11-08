import Hero from "@/components/LandingPage/Hero";
import Savings from "@/components/LandingPage/savings";
import Features from "@/components/LandingPage/features";
import Pricing from "@/components/LandingPage/pricing";
import Footer from "@/components/LandingPage/footer";
import { WaitlistSection } from "@/components/LandingPage/waitlist";
import Why from "@/components/LandingPage/why";
import BYOPN from "@/components/LandingPage/byopn";
import Comparison from "@/components/LandingPage/comparison";
import Trust from "@/components/LandingPage/trust";
import HowItWorks from "@/components/LandingPage/how-it-works";
// import { Navbar } from "@/components/Layout/Navbar";

export default function LandingPage() {
  return (
    <>
      {/* <Navbar /> */}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Hero />
            <Trust />
            <Features />
            {/* can take multiple calls at once all day every day  */}
            <Why />
            <BYOPN />
            <HowItWorks />
            <Pricing />
            <Savings /> 
            {/* <Testimonial /> */}
            <Comparison />
            {/* TODO: FAQs */}
            <WaitlistSection />
          </main>
        <Footer />
      </div>
    </>
  )
}