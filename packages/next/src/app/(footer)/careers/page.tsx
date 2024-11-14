export default function CareersPage() {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Careers</h1>
        <div className="prose max-w-none">
          <p className="text-xl mb-8">We're always looking for talented people to join our team.</p>
          <div className="bg-orange-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">How to Apply</h2>
            <p className="mb-4">Send an email to <a href="mailto:kyle@trygraham.co" className="text-orange-600 hover:text-orange-700">kyle@trygraham.co</a> with:</p>
            <ul className="list-disc list-inside mb-4">
              <li>Your resume</li>
              <li>A description of the coolest thing you've ever built</li>
            </ul>
            <p className="text-sm text-gray-600">We look forward to hearing about what you've created!</p>
          </div>
        </div>
      </div>
    )
  }