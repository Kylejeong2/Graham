import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/components/LandingPage/footer"

export default function FooterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-6">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}