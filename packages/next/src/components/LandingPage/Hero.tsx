import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="pt-24 md:pt-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Never Miss A Phone Call Again.
              <br />
              Ever.
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Make more money and keep customers happy with Graham.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-[400px]:flex-row">
            <Button className="bg-teal-600 hover:bg-teal-700">How Graham works</Button>
            <Button variant="outline">Get Started</Button>
          </div>
          <div className="mx-auto w-full max-w-4xl">
            <Image
              alt="Dashboard Preview"
              className="rounded-lg border bg-white p-4 shadow-xl"
              height={600}
              src="/placeholder.svg"
              style={{
                aspectRatio: "1200/600",
                objectFit: "cover",
              }}
              width={1200}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              {/* <div className="rounded-full bg-green-100 p-2">
                <svg
                  className=" h-4 w-4 text-green-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div> */}
              {/* <p className="text-sm">99 out of 100 in payroll satisfaction</p> */}
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="rounded-full bg-green-100 p-2">
                <svg
                  className=" h-4 w-4 text-green-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div> */}
              {/* <p className="text-sm">#1 in small business benefits administration</p> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}