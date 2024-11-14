import FAQ from "@/components/LandingPage/faq";

export default function FAQPage() {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        <div className="max-w-3xl mx-auto space-y-6">
            <FAQ />
        </div>
      </div>
    )
  }