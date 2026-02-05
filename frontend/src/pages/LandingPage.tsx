import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems, reviews } from "../constants/constants";
import { LandingPageProps } from '@/util/types/index';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LandingPage({
    onNavigate,
    handleChatSubmit,
    chatInput,
    setChatInput
}: LandingPageProps) {
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const nextReview = () => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };


    return (
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
                        <span className="highlight-word">Mental health</span> companion you can <span className="highlight-word">trust</span>
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
                        onClick={() => onNavigate('signup')}
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
                            onClick={() => onNavigate('dashboard')}
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
            {/* REVIEWS SECTION */}

            <section className="px-4 sm:px-6 md:px-8" style={{ padding: 'var(--space-xxl) 0' }}>
                <div className="container mx-auto" style={{ padding: '0 var(--space-md)' }}>
                    <motion.h2
                        className="text-h1 text-center"
                        style={{ marginBottom: 'var(--space-xl)' }}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        What Our Users Say
                    </motion.h2>
                    <div className="relative max-w-4xl mx-auto">
                        <div className="bg-surface rounded-2xl shadow-lg text-center overflow-hidden" style={{ padding: 'var(--space-xl)' }}>
                            <motion.div
                                key={currentReviewIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col md:flex-row items-center gap-8"
                            >
                                <div className="shrink-0">
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
                                        <img
                                            src={reviews[currentReviewIndex].imageUrl}
                                            alt={reviews[currentReviewIndex].author}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <svg className="w-8 h-8 text-primary/30 mb-4 mx-auto md:mx-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                    <p className="text-h3 text-primary italic mb-4">
                                        "{reviews[currentReviewIndex].text}"
                                    </p>
                                    <div>
                                        <p className="text-body text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                            {reviews[currentReviewIndex].author}
                                        </p>
                                        <p className="text-body-sm text-secondary">
                                            {reviews[currentReviewIndex].role}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>


                        <div className="flex justify-center items-center" style={{ marginTop: 'var(--space-md)', gap: 'var(--space-md)' }}>
                            <button
                                onClick={prevReview}
                                className="bg-surface hover:bg-primary/10 rounded-full p-2 transition"
                                aria-label="Previous review"
                            >
                                <ChevronLeft className="text-primary" size={24} />
                            </button>


                            <div className="flex gap-2">
                                {reviews.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentReviewIndex(index)}
                                        className={`rounded-full transition-all ${index === currentReviewIndex
                                            ? 'bg-primary w-8 h-3'
                                            : 'bg-gray-300 w-3 h-3'
                                            }`}
                                        aria-label={`Go to review ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextReview}
                                className="bg-surface hover:bg-primary/10 rounded-full p-2 transition"
                                aria-label="Next review"
                            >
                                <ChevronRight className="text-primary" size={24} />
                            </button>
                        </div>
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
    )
}

