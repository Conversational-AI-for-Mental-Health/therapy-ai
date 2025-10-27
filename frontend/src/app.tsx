
import { useState, useRef, useEffect } from "react";
import React, { FC } from "react";
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
   },[currentScreen]);

  return (
    <div>
      <header className="bg-surface/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm">
        <nav className="container mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
          <a href="#" className="flex items-center text-primary" style={{ gap: 'var(--space-xs)', fontSize: 'var(--font-h3)', fontWeight: 'var(--font-weight-bold)' }}>
            <span>🧠</span>
            <span>Therapy AI</span>
          </a>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center" style={{ gap: 'var(--space-lg)' }}>
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
              className="text-secondary hover:text-primary transition text-body hidden sm:block"
            >
              Log In
            </button>
            <button
              onClick={() => setCurrentScreen('signup')}
              className="bg-primary text-white rounded-full hover:opacity-90 transition text-body"
              style={{ padding: 'var(--space-xs) var(--space-md)' }}
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default App;
