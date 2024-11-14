export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-xl mb-8">
          Please read our terms of service carefully before using Graham, our AI phone agent service.
        </p>
        <Section title="Introduction">
          <p>
            These Terms of Service ("Terms") govern your use of Graham, the AI phone agent service provided by Graham ("Graham", "we", "us", or "our"). By accessing or using Graham, you agree to be bound by these Terms. If you do not agree to these Terms, do not use Graham.
          </p>
        </Section>
        <Section title="User Accounts">
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
          </p>
        </Section>
        <Section title="Content">
          <p>
            You are responsible for the content you post on or through Graham. You must ensure that your content does not violate any applicable laws or regulations. We reserve the right to remove any content that we deem inappropriate or in violation of these Terms.
          </p>
        </Section>
        <Section title="Intellectual Property">
          <p>
            All content and materials available on Graham, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of the Company and are protected by applicable copyright and trademark law. Unauthorized use of any content is prohibited.
          </p>
        </Section>
        <Section title="Termination">
          <p>
            We may terminate or suspend your account and bar access to Graham immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </Section>
        <Section title="Limitation of Liability">
          <p>
            In no event shall the Company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your use or inability to use Graham; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.
          </p>
        </Section>
        <Section title="Governing Law">
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
        </Section>
        <Section title="Changes to Terms">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </Section>
        <Section title="Contact Us">
          <p>
            If you have any questions about these Terms, please contact us at kyle@trygraham.co.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </>
  );
}