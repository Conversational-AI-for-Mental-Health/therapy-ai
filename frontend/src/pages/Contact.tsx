import React, { useState } from 'react';
import { ContactPageProps } from '@/util/types';

export default function Contact({ onNavigate }: ContactPageProps) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert('Thanks, we received your message.');
		setName('');
		setEmail('');
		setMessage('');
		if (onNavigate) onNavigate('dashboard');
	};

	return (
		<div className="min-h-screen"> 
			<section className="text-center bg-surface px-4 sm:px-6 md:px-8" style={{ paddingTop: 'calc(var(--space-xxl) * 2)', paddingBottom: 'var(--space-xxl)' }}>
				<div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
					<h1 className="text-h1 text-primary">Contact Us</h1>
					<p className="text-body-lg text-secondary max-w-3xl mx-auto" style={{ marginTop: 'var(--space-sm)' }}>
						We're here to help and answer any questions you may have
					</p>
				</div>
			</section>

			<main className="container mx-auto max-w-2xl px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-md)', paddingBottom: 'var(--space-xxl)' }}>
				<div className="bg-surface rounded-2xl shadow-lg" style={{ padding: 'var(--space-lg)' }}>

					<p className="text-body text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
						If you have questions, feedback, or partnership inquiries, please reach out to our team. We value your input and will respond promptly.
					</p>


					<form style={{ marginBottom: 'var(--space-xl)' }}>
						<div style={{ marginBottom: 'var(--space-md)' }}>
							<label className="text-body text-secondary block" style={{ marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-weight-medium)' }}>
								Name
							</label>
							<input
								type="text"
								className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
								style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
							/>
						</div>

						<div style={{ marginBottom: 'var(--space-md)' }}>
							<label className="text-body text-secondary block" style={{ marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-weight-medium)' }}>
								Email
							</label>
							<input
								type="email"
								className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
								style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
							/>
						</div>

						<div style={{ marginBottom: 'var(--space-md)' }}>
							<label className="text-body text-secondary block" style={{ marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-weight-medium)' }}>
								Message
							</label>
							<textarea
								className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
								style={{ height: '150px', padding: 'var(--space-sm)' }}
							/>
						</div>

						<div className="flex justify-center">
							<button
								type="submit"
								className="bg-primary text-white rounded-lg hover:opacity-90 transition text-center"
								style={{ padding: 'var(--space-sm) var(--space-xl)', fontWeight: 'var(--font-weight-semibold)' }}
							>
								Send Message
							</button>
						</div>
					</form>

					<div className="border-t border-color" style={{ paddingTop: 'var(--space-lg)' }}>
						<h2 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-md)' }}>Other Ways to Connect</h2>

						<div style={{ marginBottom: 'var(--space-md)' }}>
							<p className="text-body text-secondary">
								Email: <a href="mailto:support@mindguide.ai" className="text-primary hover:underline">support@mindguide.ai</a>
							</p>
						</div>

						<div style={{ marginBottom: 'var(--space-md)' }}>
							<p className="text-body text-secondary">
								Address: University of Texas at Arlington, 701 S Nedderman Dr, Arlington, TX 76019
							</p>
						</div>

						<p className="text-body text-secondary">
							Follow us on social platforms for updates and resources.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
