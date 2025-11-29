import React from 'react';
import { ChatProps } from '@/util/types';
import { ChevronDown, ChevronUp, ThumbsDown, ThumbsUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
export default function Chat({
  chatHistory,
  chatHistoryRef,
  quickPrompts,
  chatInput,
  onChatInputChange,
  handleQuickPrompt,
  handleSubmitForm,
  handleMessageFeedback,
}: ChatProps) {

  const [showPrompts, setShowPrompts] = useState(false);
  return (
    <div className="grow flex flex-col overflow-hidden h-full">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      {/* Chat History */}

      <div
        ref={chatHistoryRef}
        className="chat-history grow overflow-y-auto no-scrollbar"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-sm)' }}
      >
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.thinking ? (
              <div className="rounded-2xl bg-surface text-secondary" style={{ padding: 'var(--space-xs)' }}>
                <div className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col" style={{ gap: 'var(--space-xxs)', maxWidth: '85%' }}>
                <div
                  className={`sm:max-w-xs md:max-w-md rounded-2xl whitespace-pre-wrap text-body ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-surface'
                    }`}
                  style={{ padding: 'var(--space-xs)' }}
                >
                  {msg.text}
                </div>
                {/* Feedback for ai messages */}
                {msg.sender === 'ai' && !msg.thinking && (
                  <div className="flex items-center" style={{ gap: 'var(--space-xxs)', paddingLeft: 'var(--space-xs)' }}>
                    <button
                      onClick={() => handleMessageFeedback(index, 'positive')}
                      className={`flex items-center justify-center rounded-full transition hover:bg-primary/20 ${msg.feedback === 'positive' ? 'bg-primary/20' : 'bg-surface'
                        }`}
                      style={{ width: 'var(--space-md)', height: 'var(--space-md)' }}
                      title="Helpful response"
                    >
                      <ThumbsUp
                        size={14}
                        className={msg.feedback === 'positive' ? 'text-primary' : 'text-secondary'}
                        fill={msg.feedback === 'positive' ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      onClick={() => handleMessageFeedback(index, 'negative')}
                      className={`flex items-center justify-center rounded-full transition hover:bg-primary/20 ${msg.feedback === 'negative' ? 'bg-primary/20' : 'bg-surface'
                        }`}
                      style={{ width: 'var(--space-md)', height: 'var(--space-md)' }}
                      title="Not helpful"
                    >
                      <ThumbsDown
                        size={14}
                        className={msg.feedback === 'negative' ? 'text-primary' : 'text-secondary'}
                        fill={msg.feedback === 'negative' ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
      <div className="shrink-0 flex flex-col border-t border-color bg-surface-base" style={{ padding: 'var(--space-xs)' }}>
        {/* Toggle Button for Quick Prompts */}
        <div className="flex justify-center -mt-6 mb-2 relative z-10">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="bg-surface border border-color shadow-sm rounded-full text-secondary hover:text-primary transition flex items-center justify-center"
            style={{ width: '24px', height: '24px' }}
            title={showPrompts ? "Hide Suggestions" : "Show Suggestions"}
          >
            {showPrompts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Quick Prompts (Now above input) */}
        <AnimatePresence>
          {showPrompts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginBottom: 'var(--space-xs)', justifyContent: 'center' }}>
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleQuickPrompt(prompt);
                      setShowPrompts(false); // Optional: close after clicking
                    }}
                    className="bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-body-sm whitespace-nowrap"
                    style={{ padding: 'var(--space-xxs) var(--space-sm)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Chat Input */}
        <motion.form onSubmit={handleSubmitForm} className="w-full flex items-center" style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs)' }}>
          <input
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            type="text"
            placeholder="Type your message..."
            className="w-full rounded-lg bg-surface border border-color ring-primary focus:ring-2 focus:outline-none transition text-body"
            style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
          />
          <button
            type="submit"
            className="shrink-0 gradient-bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
            style={{ height: 'var(--space-xl)', width: 'var(--space-xl)', fontSize: 'var(--font-h3)' }}
          >
            <span>&rarr;</span>
          </button>
        </motion.form>
      </div>
    </div>
        
  );
};