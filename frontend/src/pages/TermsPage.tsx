import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen">
            <section className="text-center bg-surface px-4 sm:px-6 md:px-8" style={{ paddingTop: 'calc(var(--space-xxl) * 2)', paddingBottom: 'var(--space-xxl)' }}>
                <div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
                    <h1 className="text-h1 text-primary">Terms & Conditions</h1>
                    <p className="text-body-lg text-secondary max-w-3xl mx-auto" style={{ marginTop: 'var(--space-sm)' }}>
                        Please read these terms carefully before using Therapy AI – designed for support, safety, and user well-being.
                    </p>
                </div>
            </section>

            <main className="container mx-auto max-w-4xl px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-md)', paddingBottom: 'var(--space-xxl)' }}>
                <div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-lg)' }}>

                    {/* Section 1: Acceptance */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>1. Acceptance of Terms</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            By accessing or using Therapy AI, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application. These terms apply to all users of the service.
                        </p>
                    </section>

                    {/* Section 2: No Medical Advice Disclaimer */}
                    <section style={{ marginBottom: 'var(--space-lg)', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', padding: 'var(--space-md)', borderRadius: 'var(--space-sm)' }}>
                        <h2 className="text-h3 text-red-600" style={{ marginBottom: 'var(--space-sm)' }}>2. NO MEDICAL ADVICE</h2>
                        <p className="text-body text-red-700 font-medium" style={{ lineHeight: '1.7' }}>
                            Therapy AI is an experimental AI-driven empathetic companion. It is NOT a medical device, NOT a licensed therapy service, and does NOT provide medical advice, diagnosis, or treatment. Always seek the advice of a qualified mental health professional or physician for any medical concerns.
                            <strong> IF YOU ARE IN A CRISIS OR EMERGENCY, CONTACT 988 (Suicide & Crisis Lifeline) OR 911 IMMEDIATELY.</strong>
                        </p>
                    </section>

                    {/* Section 3: User Responsibilities */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>3. User Responsibilities</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            You agree to use this service only for its intended purpose of mental health support and empathetic conversation. You must not use the service to transmit any harmful, illegal, or abusive content. You are responsible for maintaining the confidentiality of your account credentials.
                        </p>
                    </section>

                    {/* Section 4: Data Usage & Privacy */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>4. Data Usage</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            Your use of Therapy AI is also governed by our Privacy Policy. We collect and process your conversational data to provide and improve the service. While we prioritize security, you should avoid sharing highly sensitive personally identifiable information within the chat interface.
                        </p>
                    </section>

                    {/* Section 5: Limitation of Liability */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>5. Limitation of Liability</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            Therapy AI and its developers shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service. The service is provided on an "as is" and "as available" basis without warranties of any kind.
                        </p>
                    </section>

                    <div className="border-t border-color" style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)' }}>
                        <section>
                            <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>6. Changes to Terms</h2>
                            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                                We reserve the right to modify these terms at any time. Continued use of the service following such changes constitutes your acceptance of the new terms. Last updated: March 2026.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
