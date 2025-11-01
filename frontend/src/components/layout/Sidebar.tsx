import React, { FC } from 'react';
import { PenSquare, X } from 'lucide-react';
import { SidebarProps } from '@/util/types';

export default function Sidebar ({
  isOpen,
  onClose,
  onShowSettings,
  onNewConversation,
  chatSessions,
  currentChatId,
  onSelectChat,
}: SidebarProps) {
  return (
    <aside
      className={`bg-surface border-r border-color shrink-0 flex flex-col transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed top-0 left-0 bottom-0 z-40 w-4/5 sm:w-3/5 md:w-1/2 lg:translate-x-0 lg:relative lg:w-64`}
    >

      <div className="border-b border-color flex items-center justify-between" style={{ padding: 'var(--space-md)' }}>
        <button
          onClick={onShowSettings}
          className="flex items-center hover:bg-primary/10 rounded-lg transition flex-1 cursor-pointer"
          style={{ gap: 'var(--space-xs)', padding: 'var(--space-xxs)' }}
        >
          <div
            className="bg-primary rounded-full flex items-center justify-center text-white"
            style={{ width: 'var(--space-xl)', height: 'var(--space-xl)', fontSize: 'var(--font-h3)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            J 
          </div>
          <div>
            <p className="text-body" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Jamie R.</p>
            <p className="text-caption text-secondary">Your safe space</p>
          </div>
        </button>

        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-lg hover:bg-primary/10 transition"
          style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
        >
          <X size={20} className="text-secondary" />
        </button>
      </div>

      <div style={{ padding: 'var(--space-sm)' }}>
        <button
          onClick={onNewConversation}
          className="w-full bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
        >
          <PenSquare size={16} />
          <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            New Conversation
          </span>
        </button>
      </div>

      {/* Chat Sessions List */}
      <div className="grow overflow-y-auto" style={{ padding: 'var(--space-sm)' }}>
        <div className="text-caption text-secondary" style={{ padding: '0 var(--space-xs)', marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Previous Chats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          {chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectChat(session.id)}
              className={`text-left rounded-lg transition hover:bg-primary/10 ${
                currentChatId === session.id ? 'bg-primary/10' : ''
              }`}
              style={{ padding: 'var(--space-xs)' }}
            >
              <p className="text-body-sm truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {session.title}
              </p>
              <p className="text-caption text-secondary truncate">{session.preview}</p>
              <p className="text-caption text-secondary" style={{ marginTop: 'var(--space-xxs)' }}>
                {session.timestamp}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-color" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <button
          className="w-full bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
        >
          <span style={{ fontSize: 'var(--font-body-lg)' }}>👨‍⚕️</span>
          <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            Contact Professional
          </span>
        </button>
        <button
          className="w-full bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
        >
          <span style={{ fontSize: 'var(--font-body-lg)' }}>🚪</span>
          <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            Log out
          </span>
        </button>
        
      </div>
    </aside>
  );
};