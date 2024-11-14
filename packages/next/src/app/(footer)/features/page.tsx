import BYOPN from "@/components/LandingPage/byopn";
import Features from "@/components/LandingPage/features";
import Why from "@/components/LandingPage/why";

export default function FeaturesPage() {
    return (
      <div className="container mx-auto px-4 py-12">
        <Why />
        <Features />
        <BYOPN />
      </div>
    )
  }