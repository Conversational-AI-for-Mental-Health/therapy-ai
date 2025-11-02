import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto py-16 px-4">
      <h1 className="text-h1 mb-4">Privacy Policy</h1>
      <div className="bg-surface rounded-2xl shadow p-6 text-body text-secondary space-y-6">
        <section>
          <h2 className="text-h3 text-primary mb-3">Information We Collect</h2>
          <div className="space-y-3">
            <p>
              We collect and process the following types of information to provide you with the best possible experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, encrypted password)</li>
              <li>Chat conversations with our AI system</li>
              <li>Journal entries and personal reflections</li>
              <li>Usage data to improve our services</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-primary mb-3">How We Protect Your Data</h2>
          <div className="space-y-3">
            <p>Your privacy and security are our top priorities. We implement the following measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encryption for all conversations</li>
              <li>Secure data storage using industry-standard protocols</li>
              <li>Regular security audits and updates</li>
              <li>No sharing of personal information with third parties</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-primary mb-3">Your Rights</h2>
          <div className="space-y-3">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request data deletion</li>
              <li>Export your data</li>
              <li>Opt-out of data collection</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-h3 text-primary mb-3">Contact Information</h2>
          <div className="space-y-3">
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="bg-surface-hover p-4 rounded-lg">
              <p className="font-medium">Privacy Team</p>
              <p>Email: therapyAI@gmail.com</p>
              <p>Website: therapyAI/privacy</p>
              <p>Response Time: Within 48 hours</p>
            </div>
          </div>
        </section>

        <section className="bg-warning/10 p-4 rounded-lg border border-warning">
          <h2 className="text-warning font-medium mb-2">Important Notice</h2>
          <p>
            For emergency help, always call local emergency services. Therapy AI is not a replacement for
            professional therapy advice. If you're experiencing a crisis, please contact your local emergency
            services or mental health crisis hotline immediately.
          </p>
        </section>
      </div>
    </main>
  );
}
