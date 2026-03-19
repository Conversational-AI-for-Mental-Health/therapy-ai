import React, { useState } from 'react';
import { ResetPasswordPageProps } from '@/util/types';
import logo from '../images/logo.png';
import authAPI from '@/util/authAPI';

const RESET_EMAIL_KEY = 'therapy-ai-reset-email';

export default function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const [email, setEmail] = useState(() => localStorage.getItem(RESET_EMAIL_KEY) || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setInfo('');

    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(email.trim(), newPassword);
      if (response.success) {
        localStorage.removeItem(RESET_EMAIL_KEY);
        setInfo(response.message || 'Password reset successful. You can now login.');
      } else {
        setError(response.error || 'Unable to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 my-6">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl shadow-xl" style={{ padding: 'var(--space-lg)' }}>
          <div className="flex items-center justify-center" style={{ marginBottom: 'var(--space-sm)' }}>
            <img
              src={logo}
              alt="Therapy AI"
              style={{ height: '20vh', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <h2 className="text-h1 text-center" style={{ marginBottom: 'var(--space-xxs)' }}>
            Reset Password
          </h2>
          <p className="text-center text-body-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
            Enter your email and new password
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
              {info}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div>
              <label htmlFor="reset-email" className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                Email
              </label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="reset-password" className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                New Password
              </label>
              <input
                type="password"
                id="reset-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="reset-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full gradient-bg-primary text-white rounded-lg hover:opacity-90 transition text-body flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: 'var(--space-xl)', marginTop: 'var(--space-md)' }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-body-sm text-secondary" style={{ marginTop: 'var(--space-md)' }}>
            Back to{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
              className="text-primary hover:underline"
              style={{ fontWeight: 'var(--font-weight-semibold)' }}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

