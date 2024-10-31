
export default function Testimonial() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Loved by businesses
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See why thousands of businesses trust PayrollPro to manage their payroll and HR needs.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Payroll used to take at least one full day per month. We're able to run payroll bi-weekly now, which takes us less than an hour each month."
            </p>
            <footer className="text-sm">Kevin Michael Gray, Founder of Approveme.com</footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}