import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, MoreHorizontal, Pencil, PenSquare, Trash2, X } from 'lucide-react';
import { SidebarProps } from '@/util/types';

export default function Sidebar({
  onNavigate,
  isOpen,
  onClose,
  onShowSettings,
  onNewConversation,
  chatSessions,
  currentChatId,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  user,
}: SidebarProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'B';
  const userName = user?.name ? user.name.split(' ')[0] : 'Bhuwan';
  const userEmail = user?.email || 'bhuwan@mindguideai';
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (renamingId !== null && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingId]);

  const startRenaming = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentTitle);
    setActiveMenuId(null); 
  };

  const saveRename = () => {
    if (renamingId !== null && renameValue.trim()) {
      if (onRenameChat) onRenameChat(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };
  return (
    <aside
      className={`bg-surface overflow-hidden border-r border-color flex-shrink-0 flex flex-col transition-all duration-300 fixed top-0 left-0 bottom-0 z-40 ${isOpen ? 'translate-x-0  sm:w-3/5 md:w-[20%] lg:w-[20%]' : '-translate-x-full md:translate-x-0 md:w-[10%] lg:w-[8%]'
        } md:relative lg:relative `}
    >
      <style>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
      <div className="border-b border-color flex items-center justify-between no-scrollbar" style={{ padding: 'var(--space-md)' }}>
        {isOpen ? (
          <>
            <button
              onClick={onShowSettings}
              className="flex items-center hover:bg-primary/10 rounded-lg transition flex-1 cursor-pointer"
              style={{ gap: 'var(--space-xs)', padding: 'var(--space-xxs)' }}
            >
              <div
                className="bg-primary rounded-full flex items-center justify-center text-white"
                style={{ width: 'var(--space-xl)', height: 'var(--space-xl)', fontSize: 'var(--font-h3)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                {userInitial}
              </div>
              <div style={{ overflow: 'hidden' }}>
                 <p className="text-body truncate" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{userName}</p>
                 <p className="text-caption text-secondary truncate">{userEmail}</p>
              </div>
            </button>


            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center rounded-lg hover:bg-primary/10 transition"
              style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
            >
              <X size={20} className="text-secondary" />
            </button>
          </>
        ) : (
          <button
            onClick={onShowSettings}
            className="hidden md:flex items-center justify-center hover:bg-primary/10 rounded-lg transition cursor-pointer w-full"
            style={{ padding: 'var(--space-xxs)' }}
            title="Settings"
          >
            <div
              className="bg-primary rounded-full flex items-center justify-center text-white"
              style={{ width: 'var(--space-lg)', height: 'var(--space-lg)', fontSize: 'var(--font-body)' }}
            >
              {userInitial}
            </div>
          </button>
        )}
      </div>

      <div style={{ padding: 'var(--space-sm)' }}>
        <button
          onClick={onNewConversation}
          className="w-full gradient-bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
          style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
        >
          <PenSquare size={16} />
          {isOpen && (
            <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              New Conversation
            </span>
          )}
        </button>
      </div>

      {/* Chat Sessions List */}
      <div className="grow overflow-y-auto no-scrollbar" style={{ padding: 'var(--space-sm)' }}>
        {isOpen && (
          <>
            <div className="text-caption text-secondary" style={{ padding: '0 var(--space-xs)', marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Previous Chats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center rounded-lg transition hover:bg-primary/5 ${currentChatId === session.id ? 'bg-primary/10' : ''
                    }`}
                  style={{ paddingRight: 'var(--space-xxs)' }}
                >
                  {renamingId === session.id ? (
                    <div className="grow flex items-center" style={{ padding: 'var(--space-xs)' }}>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-surface border border-primary rounded px-1 text-body-sm focus:outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectChat(session.id)}
                      className="grow text-left truncate"
                      style={{ padding: 'var(--space-xs)' }}
                    >
                      <p className="text-body-sm truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {session.title}
                      </p>
                      <p className="text-caption text-secondary truncate">{session.preview}</p>
                    </button>
                  )}

                  <div className="relative">
                    {!renamingId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === session.id ? null : session.id);
                        }}
                        className={`p-1 rounded-md text-secondary hover:text-primary hover:bg-primary/10 transition opacity-0 group-hover:opacity-100 ${activeMenuId === session.id ? 'opacity-100 bg-primary/10 text-primary' : 'md:opacity-0'}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    )}
                    {activeMenuId === session.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-32 bg-surface border border-color rounded-lg shadow-lg z-50 overflow-hidden"
                        style={{zIndex: 9999}}
                      >
                        <button
                          onClick={(e) => startRenaming(e, session.id, session.title)}
                          className="flex items-center w-full px-3 py-3 text-sm text-body hover:bg-primary/10 transition"
                        >
                          <Pencil size={14} className="mr-2" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteChat) onDeleteChat(session.id);
                            setActiveMenuId(null);
                          }}
                          className="flex items-center w-full px-3 py-3 text-sm text-red-500 hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Footer buttons */}
      <div className="border-t border-color" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {isOpen ? (
          <>
            <button
              className="w-full gradient-bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
              style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
            >
              <span style={{ fontSize: 'var(--font-body-lg)' }}>👨‍⚕️</span>
              <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Contact Professional
              </span>
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="w-full gradient-bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
              style={{ padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)' }}
            >
              <span style={{ fontSize: 'var(--font-body-lg)' }}>🚪</span>
              <span className="text-body-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Log out
              </span>
            </button>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center gap-2">
            <button
              className="flex items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 transition w-full"
              style={{ padding: 'var(--space-xs)' }}
              title="Contact Professional"
            >
              <span style={{ fontSize: 'var(--font-h3)' }}>👨‍⚕️</span>
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 transition w-full"
              style={{ padding: 'var(--space-xs)' }}
              title="Contact Professional"
            >
              <span style={{ fontSize: 'var(--font-h3)' }}>🚪</span>
            </button>
          </div>
        )}

      </div>
    </aside>
  );
};
