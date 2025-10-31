
import { useState, useRef, useEffect } from "react";
import React, { FC } from "react";
import { X, Menu } from 'lucide-react';
import { motion } from "framer-motion";

import { Screens, DashboardTab } from '@/util/types/index';

/**
 * App component serves as the main container and entry point for all application routes and UI.
 * This is where you will add your routing, state providers, and core layout.
 */
const App: FC= () => {

  //Navigation and UI state management
  const [currentScreen, setCurrentScreen] = useState<Screens>('landing');
  const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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
   },[currentScreen]);

   useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}

      <motion.aside
        initial={false}
        animate={{ x: mobileMenuOpen ? 0 : '100%'}}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-70 lg:hidden ${
          isDarkMode ? 'mobile-sidebar-dark' : 'mobile-sidebar-light'
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


    </div>
  );
};

export default App;
