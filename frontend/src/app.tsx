
import { useState, useRef, useEffect } from "react";
import React, { FC } from "react";
import { X, Menu } from 'lucide-react';

import { motion } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Screens, DashboardTab, ChatMessage } from '@/util/types/index';

/**
 * App component serves as the main container and entry point for all application routes and UI.
 * This is where you will add your routing, state providers, and core layout.
 */
const App: FC = () => {

  //Navigation and UI state management
  const [currentScreen, setCurrentScreen] = useState<Screens>('landing');
  const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am here to listen. How are you feeling today?' },
  ]);
  const [chatInput, setChatInput] = useState('');

  //Dark Mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [currentScreen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => { }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'signup':
        return <SignupPage onNavigate={(s) => setCurrentScreen(s as Screens)} />;
      case 'login':
        return <LoginPage onNavigate={(s) => setCurrentScreen(s as Screens)} />;
      case 'dashboard':
        return <Dashboard onNavigate={(s) => setCurrentScreen(s as Screens)} />;
      case 'contact':
        return <Contact onNavigate={(s) => setCurrentScreen(s as Screens)} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'story':
        return <LandingPage onNavigate={(s) => setCurrentScreen(s as Screens)} handleChatSubmit={handleChatSubmit} chatInput={chatInput} setChatInput={setChatInput} />;
      case 'landing':
      default:
        return (
          <LandingPage
            onNavigate={(s) => setCurrentScreen(s as Screens)}
            handleChatSubmit={handleChatSubmit}
            chatInput={chatInput}
            setChatInput={setChatInput}
          />
        );
    }
  };
  return (
    <div>
      <header className="bg-surface/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm">
        <nav className="container mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
          <a href="#" className="flex items-center text-primary" style={{ gap: 'var(--space-xs)', fontSize: 'var(--font-h3)', fontWeight: 'var(--font-weight-bold)' }}>
            <span>🧠</span>
            <span>Therapy AI</span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center" style={{ gap: 'var(--space-lg)' }}>
            <a href="#features" className="text-secondary hover:text-primary transition text-body">
              Features
            </a>
            <a href="#how-it-works" className="text-secondary hover:text-primary transition text-body">
              How It Works
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center rounded-full bg-surface shadow-sm"
              style={{ width: 'var(--space-lg)', height: 'var(--space-lg)', fontSize: 'var(--font-body-lg)' }}
            >
              <span>{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={() => setCurrentScreen('login')}
              className="text-secondary hover:text-primary transition text-body hidden lg:block"
            >
              Log In
            </button>
            <button
              onClick={() => setCurrentScreen('signup')}
              className="bg-primary text-white rounded-full hover:opacity-90 transition text-body hidden lg:block"
              style={{ padding: 'var(--space-xs) var(--space-md)' }}
            >
              Sign Up
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center rounded-lg bg-surface shadow-sm lg:hidden"
              style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
            >
              <Menu className="w-5 h-5 text-primary" />
            </button>

          </div>
        </nav>
      </header>

      {/* MOBILE SIDEBAR MENU */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}

      <motion.aside
        initial={false}
        animate={{ x: mobileMenuOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-70 lg:hidden ${isDarkMode ? 'mobile-sidebar-dark' : 'mobile-sidebar-light'
          }`}
      >
        <div className="h-full flex flex-col" style={{ padding: 'var(--space-lg)' }}>
          {/* Close button */}
          <div className="flex justify-end" style={{ marginBottom: 'var(--space-lg)' }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-full bg-surface/50 hover:bg-surface transition"
              style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center" style={{ marginBottom: 'var(--space-xl)', gap: 'var(--space-xs)' }}>
            <span style={{ fontSize: 'var(--space-xl)' }}>🧠</span>
            <span className="text-h2 text-primary">Therapy AI</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary hover:text-primary transition text-body-lg text-center"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary hover:text-primary transition text-body-lg text-center"
            >
              How It Works
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col mt-auto" style={{ gap: 'var(--space-md)' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentScreen('login');
              }}
              className="w-full text-primary rounded-full hover:opacity-90 transition text-body-lg border-2 border-primary bg-primary/10"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
              }}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentScreen('signup');
              }}
              className="w-full gradient-bg-primary text-white rounded-full hover:opacity-90 transition-all hover:shadow-xl text-body-lg"
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                boxShadow: '0 4px 20px rgba(90, 154, 139, 0.3)'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </motion.aside>

      {renderCurrentScreen()}

      <footer className="bg-surface border-t border-color px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-xxl) 0' }}>
        <div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center mb-4" style={{ gap: 'var(--space-xs)' }}>
                <span style={{ fontSize: 'var(--space-lg)' }}>🧠</span>
                <span className="text-primary" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-h3)' }}>
                  Therapy AI
                </span>
              </div>
              <p className="text-body-sm text-secondary" style={{ lineHeight: '1.6' }}>
                Your private space for mental wellness and personal growth, available 24/7.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-body text-primary mb-3" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Company
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setCurrentScreen('story')} className="text-body-sm text-secondary hover:text-primary transition text-left">
                  Our Story
                </button>
                <button onClick={() => setCurrentScreen('contact')} className="text-body-sm text-secondary hover:text-primary transition text-left">
                  Contact Us
                </button>
                <a href="#" className="text-body-sm text-secondary hover:text-primary transition">
                  Careers
                </a>
              </div>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-body text-primary mb-3" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Resources
              </h3>
              <div className="flex flex-col gap-2">
                <a href="https://www.nimh.nih.gov/health" target="_blank" rel="noopener noreferrer" className="text-body-sm text-secondary hover:text-primary transition">
                  Mental Health Articles
                </a>
                <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="text-body-sm text-secondary hover:text-primary transition">
                  Crisis Resources
                </a>
                <a href="https://www.mentalhealth.gov" target="_blank" rel="noopener noreferrer" className="text-body-sm text-secondary hover:text-primary transition">
                  Critical Resources
                </a>
                <a href="#faq" className="text-body-sm text-secondary hover:text-primary transition">
                  FAQ
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-body text-primary mb-3" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Legal
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setCurrentScreen('privacy')} className="text-body-sm text-secondary hover:text-primary transition text-left">
                  Privacy Policy
                </button>
                <button onClick={() => setCurrentScreen('terms')} className="text-body-sm text-secondary hover:text-primary transition text-left">
                  Terms & Conditions
                </button>
                <a href="#" className="text-body-sm text-secondary hover:text-primary transition">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>

          {/* Crisis Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-body-sm text-center" style={{ color: '#dc2626' }}>
              <strong>In Crisis?</strong> Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line)
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-color pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-body-sm text-secondary">
              &copy; 2025 Therapy AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-secondary hover:text-primary transition" aria-label="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition" aria-label="LinkedIn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition" aria-label="Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
