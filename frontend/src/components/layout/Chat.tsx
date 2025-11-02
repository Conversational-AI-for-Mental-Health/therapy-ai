import React from 'react';
import { ChatProps } from '@/util/types';

export default function Chat ({
  chatHistory,
  chatHistoryRef,
  quickPrompts,
  chatInput,
  onChatInputChange,
  handleQuickPrompt,
  handleSubmitForm,
}: ChatProps) {
  return (
    <div className="grow flex flex-col overflow-hidden">
      {/* Quick Prompts */}
      <div className="shrink-0 border-b border-color" style={{ padding: 'var(--space-sm)' }}>
        <h3 className="text-h3" style={{ marginBottom: 'var(--space-xs)' }}>Quick Prompts</h3>
        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-body-sm"
              style={{ padding: 'var(--space-xxs) var(--space-sm)' }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}

      <div
        ref={chatHistoryRef}
        className="chat-history grow overflow-y-auto"
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
              <div
                className={`max-w-[85%] sm:max-w-xs md:max-w-md rounded-2xl whitespace-pre-wrap text-body ${
                  msg.sender === 'user' ? 'bg-primary text-white' : 'bg-surface'
                }`}
                style={{ padding: 'var(--space-xs)' }}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmitForm} className="shrink-0 flex items-center" style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs)' }}>
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
          className="shrink-0 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ height: 'var(--space-xl)', width: 'var(--space-xl)', fontSize: 'var(--font-h3)' }}
        >
          <span>&rarr;</span>
        </button>
      </form>
    </div>
  );
};