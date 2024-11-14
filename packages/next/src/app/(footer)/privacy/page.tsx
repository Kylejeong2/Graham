export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-xl mb-8">Your privacy is important to us.</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Graham is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our AI phone agent services.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We may collect information about you in a variety of ways. The
            information we may collect via the Service includes:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              <strong>Personal Data:</strong> Personally identifiable
              information, such as your name, shipping address, email address,
              and telephone number.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers
              automatically collect when you access the Service, such as your
              IP address, browser type, operating system, access times, and the
              pages you have viewed directly before and after accessing the
              Service.
            </li>
            <li>
              <strong>Financial Data:</strong> Financial information, such as
              data related to your payment method (e.g., valid credit card
              number, card brand, expiration date) that we may collect when you
              purchase, order, return, exchange, or request information about
              our services from the Service.
            </li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Use of Your Information</h2>
          <p className="mb-4">
            Having accurate information about you permits us to provide you
            with a smooth, efficient, and customized experience. Specifically,
            we may use information collected about you via the Service to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Create and manage your account.</li>
            <li>
              Process your transactions and send you related information,
              including purchase confirmations and invoices.
            </li>
            <li>
              Improve our services and develop new products, services, and
              features.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}