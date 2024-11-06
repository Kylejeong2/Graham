import Hero from "@/components/LandingPage/hero";
import Savings from "@/components/LandingPage/savings";
import Features from "@/components/LandingPage/features";
import Pricing from "@/components/LandingPage/pricing";
import Footer from "@/components/LandingPage/footer";
import { WaitlistSection } from "@/components/LandingPage/waitlist";
// import { Navbar } from "@/components/Layout/Navbar";

export default function LandingPage() {
  return (
    <>
      {/* <Navbar /> */}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Hero />
            {/* Add a moving "trusted by" with logos */}
            <Features />
            {/* can answer questions about your business ie hours open general questions etc from uploading your documents */}
            {/* can take multiple calls at once all day every day  */}
            {/* bring your own phone number */}
            {/* lottie animation with HOW IT WORKS */}
            <Pricing />
            <Savings /> 
            {/* <Testimonial /> */}
            {/* VS sameday AI or goodcall or other competitors comparison chart*/} 
            <WaitlistSection />
          </main>
        <Footer />
      </div>
    </>
  )
}