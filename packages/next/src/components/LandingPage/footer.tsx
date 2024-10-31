import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-12 md:py-24 lg:py-32 border-t bg-blue-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="#">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
              <span className="font-bold text-blue-900">Graham</span>
            </Link>
            <p className="text-sm text-blue-700">AI phone agents for growing small businesses.</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-blue-900">Product</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li><Link href="#">Features</Link></li>
              <li><Link href="#">Pricing</Link></li>
              <li><Link href="#">Integrations</Link></li>
              <li><Link href="#">FAQ</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-blue-900">Company</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Press</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-blue-900">Legal</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-blue-200 pt-8 text-center text-sm text-blue-600">
          © 2024 Graham. All rights reserved.
        </div>
      </div>
    </footer>
  )
}