import React from 'react';
import { ChatProps } from '@/util/types';
import { ChevronDown, ChevronUp, Copy, Pencil, ThumbsDown, ThumbsUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';


export default function Chat({
  chatHistory,
  chatHistoryRef,
  quickPrompts,
  chatInput,
  onChatInputChange,
  handleQuickPrompt,
  handleSubmitForm,
  handleMessageFeedback,
  handleEditUserMessage,
  handleSelectUserMessageVersion,
  handleCopyMessage,
  isGenerating,
  onStopGeneration,
  suggestedPrompts,
  onClearSuggestedPrompts,
}: ChatProps) {

  const [showPrompts, setShowPrompts] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Find the index of the last user message — only that one gets the edit button
  const lastUserMessageIndex = [...chatHistory]
    .map((msg, index) => ({ msg, index }))
    .reverse()
    .find(({ msg }) => msg.sender === 'user')?.index ?? -1;

  return (
    <div className="grow flex flex-col overflow-hidden h-full">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
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
        {chatHistory.map((msg, index) => {
          // Generate a stable key for animations to avoid mixing up elements
          const uniqueKey = `${index}-${msg.sender}-${msg.text.substring(0, 10)}-${msg.thinking ? 'thinking' : 'done'}`;
          return (
            <div key={uniqueKey} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.thinking ? (
                <div data-cy="thinking-bubble" className="rounded-2xl bg-surface text-secondary" style={{ padding: 'var(--space-xs)' }}>
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
                    className={`sm:max-w-xs md:max-w-md rounded-2xl text-body ${msg.sender === 'user'
                      ? 'bg-primary text-white whitespace-pre-wrap'
                      : 'bg-surface markdown-content'
                      }`}
                    style={{ padding: 'var(--space-xs)' }}
                  >
                    {msg.sender === 'user' && editingIndex === index ? (
                      // Inline edit mode — only shown for the last user message
                      <div className="flex flex-col" style={{ gap: 'var(--space-xxs)' }}>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-transparent text-white resize-y border-none outline-none focus:outline-none focus:ring-0"
                          style={{ minHeight: '80px', padding: 'var(--space-xxs)' }}
                        />
                        <div className="flex justify-end" style={{ gap: 'var(--space-xxs)' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingIndex(null); setEditingText(''); }}
                            className="rounded-md bg-white/20 hover:bg-white/30 text-white text-body-sm"
                            style={{ padding: '2px 8px' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingText.trim()) {
                                handleEditUserMessage(index, editingText.trim());
                              }
                              setEditingIndex(null);
                              setEditingText('');
                            }}
                            className="rounded-md bg-white/20 hover:bg-white/30 text-white text-body-sm"
                            style={{ padding: '2px 8px' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : msg.sender === 'ai' ? (
                      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {/* Copy / Edit / Version controls — user messages only */}
                  {msg.sender === 'user' && !msg.thinking && editingIndex !== index && (
                    <div className="flex items-center justify-end text-secondary" style={{ gap: 'var(--space-xxs)' }}>
                      {/* Copy button — all user messages */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(index)}
                        className="flex items-center justify-center rounded-full transition hover:bg-primary/20 bg-surface"
                        style={{ width: 'var(--space-md)', height: 'var(--space-md)' }}
                        title="Copy message"
                      >
                        <Copy size={13} />
                      </button>

                      {/* Edit button — last user message only */}
                      {index === lastUserMessageIndex && (
                        <button
                          type="button"
                          onClick={() => { setEditingIndex(index); setEditingText(msg.text); }}
                          className="flex items-center justify-center rounded-full transition hover:bg-primary/20 bg-surface"
                          style={{ width: 'var(--space-md)', height: 'var(--space-md)' }}
                          title="Edit message"
                        >
                          <Pencil size={13} />
                        </button>
                      )}

                      {/* Version navigator — shown when message has been edited */}
                      {(msg.versions?.length || 0) > 1 && (
                        <div className="flex items-center rounded-md bg-surface border border-color" style={{ gap: '4px', padding: '2px 6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectUserMessageVersion(index, Math.max(0, (msg.versionIndex ?? 0) - 1))}
                            disabled={(msg.versionIndex ?? 0) <= 0}
                            className="disabled:opacity-40 text-secondary"
                          >
                            {'<'}
                          </button>
                          <span className="text-caption text-secondary">
                            {(msg.versionIndex ?? 0) + 1}/{msg.versions?.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectUserMessageVersion(index, Math.min((msg.versions?.length || 1) - 1, (msg.versionIndex ?? 0) + 1))}
                            disabled={(msg.versionIndex ?? 0) >= (msg.versions?.length || 1) - 1}
                            className="disabled:opacity-40 text-secondary"
                          >
                            {'>'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback — AI messages only */}
                  {msg.sender === 'ai' && !msg.thinking && (
                    <div className="flex items-center" style={{ gap: 'var(--space-xxs)', paddingLeft: 'var(--space-xs)' }}>
                      <button
                        onClick={() => handleMessageFeedback(index, 'positive')}
                        className={`flex items-center justify-center rounded-full transition hover:bg-primary/20 ${msg.feedback === 'positive' ? 'bg-primary/20' : 'bg-surface'}`}
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
                        className={`flex items-center justify-center rounded-full transition hover:bg-primary/20 ${msg.feedback === 'negative' ? 'bg-primary/20' : 'bg-surface'}`}
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
          );
        })}

        {/* Suggested prompts after AI response */}
        {suggestedPrompts.length > 0 && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'ai' && !chatHistory[chatHistory.length - 1].thinking && (
          <div data-cy="suggested-prompts" className="flex flex-wrap gap-2 pl-2 mt-1">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { handleQuickPrompt(prompt); onClearSuggestedPrompts(); }}
                className="bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-body-sm whitespace-nowrap"
                style={{ padding: 'var(--space-xxs) var(--space-sm)' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="shrink-0 flex flex-col border-t border-color bg-surface-base" style={{ padding: 'var(--space-xs)' }}>
        {chatHistory.length <= 1 && (
          <div className="flex justify-center -mt-6 mb-2 relative z-10">
            <button
              data-cy="quick-prompts-toggle"
              onClick={() => setShowPrompts(!showPrompts)}
              className="bg-surface border border-color shadow-sm rounded-full text-secondary hover:text-primary transition flex items-center justify-center"
              style={{ width: '24px', height: '24px' }}
              title={showPrompts ? "Hide Suggestions" : "Show Suggestions"}
            >
              {showPrompts ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        )}

        {/* Quick Prompts (above input) */}
        <AnimatePresence>
          {showPrompts && chatHistory.length <= 1 && (
            <motion.div
              data-cy="quick-prompts-panel"
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
                      setShowPrompts(false);
                    }}
                    disabled={isGenerating}
                    className="bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-body-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
            data-cy="chat-input"
            value={chatInput}
            onChange={(e) => {
              onChatInputChange(e.target.value);
              if (e.target.value.trim().length > 0) {
                onClearSuggestedPrompts();
              }
            }}
            type="text"
            placeholder={isGenerating ? "AI is responding..." : "Type your message..."}
            disabled={isGenerating}
            className="w-full rounded-lg bg-surface border border-color ring-primary focus:ring-2 focus:outline-none transition text-body disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: 'var(--space-xl)', padding: '0 var(--space-sm)' }}
          />
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="shrink-0 rounded-lg hover:opacity-90 transition flex items-center justify-center"
              style={{
                height: 'var(--space-xl)',
                width: 'var(--space-xl)',
                fontSize: 'var(--font-body)',
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)'
              }}
              title="Stop generating"
            >
              <span>■</span>
            </button>
          ) : (
            <button
              data-cy="chat-send-btn"
              type="submit"
              disabled={!chatInput.trim()}
              className="shrink-0 gradient-bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: 'var(--space-xl)', width: 'var(--space-xl)', fontSize: 'var(--font-h3)' }}
            >
              <span>&rarr;</span>
            </button>
          )}
        </motion.form>
      </div>
    </div>
  );
};