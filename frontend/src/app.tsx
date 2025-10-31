
import { useState, useRef, useEffect } from "react";
import React, { FC } from "react";
import { X, Menu } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

import { faqItems } from "./constants/constants";

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

  const handleChatSubmit = async () => { }


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

      <main>
        {/* HERO SECTION */}
        <section className="text-center gradient-bg-subtle px-4 sm:px-6 md:px-8 relative overflow-hidden" style={{ paddingTop: 'calc(var(--space-xxl) * 2)', paddingBottom: 'var(--space-xxl)' }}>

          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

          <div className="container mx-auto relative z-10 mt-10" style={{ padding: '0 var(--space-md)' }}>
            <motion.h1
              className="text-display leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              The <span className="highlight-word">mental health</span> companion you can <span className="highlight-word">trust</span>
            </motion.h1>
            <motion.p
              className="text-body-lg text-secondary max-w-3xl mx-auto"
              style={{ marginTop: 'var(--space-md)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Chat with an <span className="gradient-text" style={{ fontWeight: 'var(--font-weight-semibold)' }}>empathetic AI</span> about your thoughts and feelings, or keep a private journal to track your mental well-being over time.
            </motion.p>
            <motion.button
              onClick={() => setCurrentScreen('signup')}
              className="gradient-bg-primary text-white rounded-full hover:opacity-90 transition-all hover:shadow-xl text-body-lg relative z-20"
              style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-sm) var(--space-lg)', boxShadow: '0 4px 20px rgba(90, 154, 139, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
            </motion.button>
            <motion.form onSubmit={handleChatSubmit} className="shrink-0 flex items-center mt-25"
              style={{
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                type="text"
                placeholder="Ask anything or seek consultation about your health"
                className="w-full rounded-lg bg-surface border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
                style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
              />
              <button
                type="submit"
                className="shrink-0 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
                style={{ height: 'var(--space-xl)', width: 'var(--space-xl)', fontSize: 'var(--font-h3)' }}
              >
                <span>&rarr;</span>
              </button>
            </motion.form>
            <div style={{ padding: '0 var(--space-md)' }}>
              <motion.p
                className="text-body-sm text-secondary max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >                Not a replacement for a doctor. If this is an emergency, call 911 or go to the emergency room.
              </motion.p>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-xxl) 0' }}>
          <div className="container mx-auto text-center" style={{ padding: '0 var(--space-md)' }}>
            <motion.h2
              className="text-h1"
              style={{ marginBottom: 'var(--space-sm)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Features Designed For <span className="gradient-text">You</span>
            </motion.h2>
            <motion.p
              className="text-body-lg text-secondary max-w-2xl mx-auto"
              style={{ marginBottom: 'var(--space-xl)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Tools to support your <span className="highlight-word">mental health journey</span>.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
              {[
                { icon: '💬', title: 'AI Consultation', desc: 'Engage in supportive conversations with an AI trained to listen and help you explore your feelings.' },
                { icon: '📝', title: 'Private Journaling', desc: 'Keep a secure log of your thoughts and moods to recognize patterns and progress.' },
                { icon: '💡', title: '✨ Personalized Insights', desc: 'Our AI can help identify themes in your conversations and entries to foster self-awareness.' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-surface rounded-2xl shadow-md hover:shadow-xl transition-all relative overflow-hidden group"
                  style={{ padding: 'var(--space-lg)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  {/* Gradient hover effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-bg-primary" style={{ mixBlendMode: 'soft-light' }} />

                  <div className="relative z-10">
                    <div style={{ fontSize: 'var(--space-xl)', marginBottom: 'var(--space-sm)' }}>{feature.icon}</div>
                    <h3 className="text-h3" style={{ marginBottom: 'var(--space-xs)' }}>{feature.title}</h3>
                    <p className="text-body text-secondary">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
         <section id="how-it-works" className="gradient-bg-subtle px-4 sm:px-6 md:px-8 relative" style={{ padding: 'var(--space-xxl) 0' }}>
          <div className="container mx-auto text-center" style={{ padding: '0 var(--space-md)' }}>
            <motion.h2 
              className="text-h1" 
              style={{ marginBottom: 'var(--space-xl)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </motion.h2>
            <div className="flex flex-col md:flex-row justify-center items-start" style={{ gap: 'var(--space-lg)' }}>
              {[
                { num: '1', title: 'Start a Conversation', desc: 'Begin a conversation with the AI anytime you need to talk' },
                { num: '2', title: 'Create an account', desc: 'Sign up securely with us to enjoy the full benefits' },
                { num: '3', title: 'Reflect & Grow', desc: 'Use the journal and ✨ AI insights to support your personal growth.' }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="text-center max-w-xs"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <motion.div 
                    className="gradient-bg-primary text-white rounded-full flex items-center justify-center mx-auto text-h2 shadow-lg"
                    style={{ width: 'var(--space-xxl)', height: 'var(--space-xxl)', marginBottom: 'var(--space-sm)', fontWeight: 'var(--font-weight-bold)', boxShadow: '0 4px 20px rgba(90, 154, 139, 0.3)' }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.num}
                  </motion.div>
                  <h3 className="text-h3" style={{ marginBottom: 'var(--space-xs)' }}>{step.title}</h3>
                  <p className="text-body text-secondary">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* FAQ SECTION */}
        
        <section className="bg-surface px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-xxl) 0' }}>
          <div className="container mx-auto max-w-3xl" style={{ padding: '0 var(--space-md)' }}>
            <motion.h2 
              className="text-h1 text-center" 
              style={{ marginBottom: 'var(--space-xl)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-body hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-body text-secondary">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
