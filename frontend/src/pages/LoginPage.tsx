import React, { FC } from 'react';
import { LoginPageProps } from '@/util/types';

export default function LoginPage ({ onNavigate }: LoginPageProps){
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 mt-25 mb-15">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl shadow-xl" style={{ padding: 'var(--space-lg)' }}>
          <div className="flex items-center justify-center" style={{ marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--space-xl)' }}>🧠</span>
          </div>

          {/* Header */}
          <h2 className="text-h1 text-center text-primary" style={{ marginBottom: 'var(--space-xxs)' }}>Welcome Back 👋</h2>
          <p className="text-center text-body-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>Sign in to continue your journey</p>

          {/* Login Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div>
              <label htmlFor="login-email" className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                Email
              </label>
              <input
                type="email"
                id="login-email"
                className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-body-sm text-secondary block" style={{ marginBottom: 'var(--space-xs)' }}>
                Password
              </label>
              <input
                type="password"
                id="login-password"
                className="w-full rounded-lg bg-transparent border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full bg-primary text-white rounded-lg hover:opacity-90 transition text-body flex items-center justify-center"
            style={{ height: 'var(--space-xl)', marginTop: 'var(--space-md)' }}
          >
            Log In
          </button>

          <div className="flex items-center" style={{ margin: 'var(--space-md) 0' }}>
            <div className="grow border-t border-color"></div>
            <span className="text-body-sm text-secondary" style={{ padding: '0 var(--space-xs)' }}>or</span>
            <div className="grow border-t border-color"></div>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
            <button className="w-full bg-surface border border-color rounded-lg hover:bg-primary/10 transition text-body flex items-center justify-center" style={{ height: 'var(--space-xl)', gap: 'var(--space-xs)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <button className="w-full bg-surface border border-color rounded-lg hover:bg-primary/10 transition text-body flex items-center justify-center" style={{ height: 'var(--space-xl)', gap: 'var(--space-xs)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M16.191 3.018c.848-.992 1.42-2.373 1.263-3.745-.122-.012-.268-.018-.44-.018-1.22 0-2.64.738-3.505 1.804-.768.93-1.438 2.416-1.26 3.842.134.012.287.018.47.018 1.293 0 2.682-.787 3.472-1.901zM14.736 5.427c-.952 0-1.927.244-2.672.672-.512.293-1.11.537-1.757.537-.696 0-1.293-.244-1.878-.574-.671-.378-1.402-.604-2.22-.604-2.22 0-4.28 1.67-4.28 4.817 0 1.573.598 3.226 1.33 4.537.768 1.367 1.707 2.904 3.11 2.916h.037c.598 0 1.037-.195 1.5-.403.512-.232 1.049-.476 1.878-.476.805 0 1.33.244 1.83.476.476.22.927.427 1.573.427h.037c1.415-.024 2.403-1.622 3.147-2.965.427-.768.744-1.524.989-2.146-2.073-.915-3.122-2.965-3.122-5.122 0-1.036.33-2.06.976-2.904-.549-.33-1.256-.488-2.354-.488z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Footer Links */}
          <p className="text-center text-body-sm text-secondary">
            No account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }} className="text-primary hover:underline" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Sign up
            </a>{' '}
            |{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="text-primary hover:underline" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};