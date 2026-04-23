'use client';
import React from 'react';
import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { FeedbackProps } from '@/util/types';


export default function FeedbackDialog({ isOpen, onClose }: FeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // backend connecition neeeded
    console.log('Feedback submitted:', {
      type: feedbackType,
      text: feedbackText,
      email: email || 'anonymous',
      timestamp: new Date().toISOString(),
    });
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setEmail('');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" style={{ padding: 'var(--space-sm)' }}>
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-surface border-b border-color" style={{ padding: 'var(--space-md)' }}>
          <div>
            <h2 className="text-h2 text-primary">Send Feedback</h2>
            <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-xxs)' }}>
              Help us improve your experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full hover:bg-primary/10 transition"
            style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-md)' }}>
          {submitted ? (
            <div className="text-center" style={{ padding: 'var(--space-xl) 0' }}>
              <div className="text-primary" style={{ fontSize: 'var(--space-xl)', marginBottom: 'var(--space-sm)' }}>
                ✓
              </div>
              <h3 className="text-h3 text-primary" style={{ marginBottom: 'var(--space-xs)' }}>
                Thank You!
              </h3>
              <p className="text-body text-secondary">
                Your feedback has been received and helps us improve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Feedback Type */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="text-body text-primary" style={{ marginBottom: 'var(--space-xs)', display: 'block' }}>
                  Feedback Type
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {[
                    { value: 'general', label: '💬 General' },
                    { value: 'bug', label: '🐛 Bug Report' },
                    { value: 'feature', label: '✨ Feature Request' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value as any)}
                      className={`flex-1 rounded-lg border transition text-body-sm ${
                        feedbackType === type.value
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface border-color text-secondary hover:border-primary/50'
                      }`}
                      style={{ padding: 'var(--space-xs)' }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="text-body text-primary" style={{ marginBottom: 'var(--space-xs)', display: 'block' }}>
                  Your Feedback *
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  required
                  className="w-full rounded-lg bg-surface border border-color ring-primary focus:ring-2 focus:outline-none transition text-body resize-none"
                  style={{ padding: 'var(--space-sm)', minHeight: '120px' }}
                />
              </div>

              {/* Email (Optional) */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="text-body text-primary" style={{ marginBottom: 'var(--space-xs)', display: 'block' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg bg-surface border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                  style={{ padding: 'var(--space-xs) var(--space-sm)', height: 'var(--space-xl)' }}
                />
                <p className="text-body-sm text-secondary" style={{ marginTop: 'var(--space-xxs)' }}>
                  We'll only use this to follow up if needed
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!feedbackText.trim()}
                className="w-full bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ padding: 'var(--space-sm)', gap: 'var(--space-xs)' }}
              >
                <Send size={18} />
                <span>Send Feedback</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
