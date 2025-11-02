import React from 'react';


export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">

      <section className="text-center bg-surface px-4 sm:px-6 md:px-8" style={{ paddingTop: 'calc(var(--space-xxl) * 2)', paddingBottom: 'var(--space-xxl)' }}>
        <div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
          <h1 className="text-h1 text-primary">Privacy Policy</h1>
          <p className="text-body-lg text-secondary max-w-3xl mx-auto" style={{ marginTop: 'var(--space-sm)' }}>
            How we collect, protect, and use your data – designed for trust, transparency, and security.
          </p>
        </div>
      </section>
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-md)', paddingBottom: 'var(--space-xxl)' }}>
        <div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-lg)' }}>
          
          {/* Section 1 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>1. Introduction</h2>
            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
              Welcome to Therapy AI. This Privacy Policy explains how we handle your personal data when you use our services, in alignment with HIPAA-like privacy and data protection standards.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>2. Information We Collect</h2>
            <div style={{ marginLeft: 'var(--space-md)' }}>
              <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                <strong>Personal Information:</strong> Name, email address, and communication logs.
              </p>
              <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                <strong>Usage Data:</strong> How you interact with the app, session timestamps, preferences.
              </p>
              <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                <strong>Device Data:</strong> Browser type, device ID, IP address (for security monitoring).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>3. How We Use Information</h2>
            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
              We use the data to personalize sessions, improve conversational accuracy, ensure account security, and maintain compliance. We never sell your data.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>4. Data Sharing</h2>
            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
              We may share information only with trusted infrastructure partners such as Google Cloud for storage and model hosting, under strict data agreements. No advertising partners receive identifiable user data.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>5. Security & Storage</h2>
            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
              Your data is encrypted in transit (HTTPS) and at rest (AES-256). Access is restricted to authorized personnel only, monitored under multi-factor authentication and audit logging.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>6. Your Rights & Choices</h2>
            <div style={{ marginLeft: 'var(--space-md)' }}>
              <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                • Access or request a copy of your data
              </p>
              <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                • Request correction or deletion
              </p>
              <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                • Opt out of analytics tracking
              </p>
            </div>
          </section>

          <div className="border-t border-color" style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)' }}>
            <section>
              <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>7. Updates to This Policy</h2>
              <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                We may update this Privacy Policy from time to time. Major updates will be communicated via email or in-app notice. Last updated: October 2025.
              </p>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
