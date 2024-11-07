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
            {/* Add a moving "trusted by" with logos */}
            <Trust />
            <Features />
            {/* can answer questions about your business ie hours open general questions etc from uploading your documents */}
            {/* can take multiple calls at once all day every day  */}
            <Why />
            <BYOPN />
            {/* bring your own phone number */}
            {/* lottie animation with HOW IT WORKS */}
            <HowItWorks />
            <Pricing />
            <Savings /> 
            {/* <Testimonial /> */}
            {/* VS sameday AI or goodcall or other competitors comparison chart*/} 
            <Comparison />
            <WaitlistSection />
          </main>
        <Footer />
      </div>
    </>
  )
}