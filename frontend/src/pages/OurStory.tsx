import React from "react";

export default function Story() {

    return (
        <div className="min-h-screen">
            <section className="text-center bg-surface px-4 sm:px-6 md:px-8" style={{ paddingTop: 'calc(var(--space-xxl) * 2)', paddingBottom: 'var(--space-xxl)' }}>
                <div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
                    <h1 className="text-h1 text-primary">Our Story</h1>
                    <p className="text-body-lg text-secondary max-w-3xl mx-auto" style={{ marginTop: 'var(--space-sm)' }}>
                        Empowering minds through accessible mental health support
                    </p>
                </div>
            </section>


            <main className="container mx-auto max-w-4xl px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-md)', paddingBottom: 'var(--space-xxl)' }}>
                <div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-lg)' }}>

                    {/* Mission */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>Our Mission</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            Therapy AI is designed by the <strong>Mind Guide</strong> team to provide accessible mental health first-aid through empathetic AI conversations. We empower users with coping strategies and guidance, promoting self-care and early intervention before crises arise.
                        </p>
                    </section>

                    {/* Vision */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>Our Vision</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            We envision a world where emotional support is available 24/7 to everyone, anywhere — reducing stigma, improving awareness, and connecting people to professional care when needed.
                        </p>
                    </section>

                    {/*  Values */}
                    <section style={{ marginBottom: 'var(--space-lg)' }}>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>Our Values</h2>
                        <div style={{ marginLeft: 'var(--space-md)' }}>
                            <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                                • Empathy and Respect
                            </p>
                            <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-xs)', lineHeight: '1.7' }}>
                                • Data Privacy and Security
                            </p>
                            <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                                • Accessibility and Inclusion
                            </p>
                        </div>
                    </section>

                    {/* Meet the Team */}
                    <section>
                        <h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-sm)' }}>Meet the Team</h2>
                        <p className="text-body text-secondary" style={{ lineHeight: '1.7' }}>
                            The project is developed by students from the <strong>University of Texas at Arlington (UTA)</strong> under the Mind Guide initiative. Each member contributes to design, backend safety, and AI integration to ensure a safe and supportive user experience.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}