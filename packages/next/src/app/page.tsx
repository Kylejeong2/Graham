import Hero from "@/components/LandingPage/Hero";
import Savings from "@/components/LandingPage/savings";
import Features from "@/components/LandingPage/features";
import Pricing from "@/components/LandingPage/pricing";
import Footer from "@/components/LandingPage/footer";
import { WaitlistSection } from "@/components/LandingPage/waitlist";
import Why from "@/components/LandingPage/why";
import BYOPN from "@/components/LandingPage/byopn";
import Comparison from "@/components/LandingPage/comparison";
// import Trust from "@/components/LandingPage/trust";
import HowItWorks from "@/components/LandingPage/how-it-works";
import FAQ from "@/components/LandingPage/faq";
// import { Navbar } from "@/components/Layout/Navbar";

export default function LandingPage() {
  return (
    <>
      {/* <Navbar /> */}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Hero />
            {/* <Trust /> */}
            <section id="features" className="scroll-mt-20">
              <Features />
            </section>
              <Why />
            <BYOPN />
            <section id="how-it-works" className="scroll-mt-20">
              <HowItWorks />
            </section>
            {/* <Integrations /> */}
            <section id="pricing" className="scroll-mt-20">
              <Pricing />
            </section>
            <Savings />
            <Comparison />
            <FAQ />
            <section id="waitlist" className="scroll-mt-20">
              <WaitlistSection />
            </section>
          </main>
        <Footer />
      </div>
    </>
  )
}