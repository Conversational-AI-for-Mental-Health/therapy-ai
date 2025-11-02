import React, { useState } from 'react';

interface Props {
	onNavigate?: (screen: string) => void;
}

export default function Contact({ onNavigate }: Props) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Placeholder - replace with real submission
		alert('Thanks, we received your message.');
		setName('');
		setEmail('');
		setMessage('');
		if (onNavigate) onNavigate('landing');
	};

	return (
		<main className="container mx-auto py-16 px-4">
			<h1 className="text-h1 mb-4">Contact Us</h1>
			<p className="text-body text-secondary mb-6">Have questions or feedback? Send us a message below or email us at therapyAI@gmail.com.</p>

			<form onSubmit={handleSubmit} className="max-w-xl bg-surface rounded-2xl shadow p-6">
				<label className="block mb-4">
					<span className="text-body mb-1">Name</span>
					<input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border p-2" />
				</label>
				<label className="block mb-4">
					<span className="text-body mb-1">Email</span>
					<input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border p-2" />
				</label>
				<label className="block mb-4">
					<span className="text-body mb-1">Message</span>
					<textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded border p-2" rows={6} />
				</label>
				<div className="flex justify-end">
					<button type="submit" className="bg-primary text-white rounded px-4 py-2">Send</button>
				</div>
			</form>
		</main>
	);
}
