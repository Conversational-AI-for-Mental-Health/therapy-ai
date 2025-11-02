import React from 'react';
import { DashboardTab } from '@/util/types/index';

interface Props {
  tab?: DashboardTab;
  onNavigate?: (screen: any) => void;
}

export default function Dashboard({ tab = 'chat', onNavigate }: Props) {
  const [activeTab, setActiveTab] = React.useState<DashboardTab>(tab);

  return (
    <main className="container mx-auto py-16 px-4">
      <h1 className="text-h1 mb-4">Dashboard</h1>
      <p className="text-body text-secondary mb-6">Welcome to your personal dashboard. Select a new tab or existing tab to continue.</p>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'chat' 
              ? 'bg-primary text-white' 
              : 'bg-surface hover:bg-surface-hover text-primary'
          }`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'journal' 
              ? 'bg-primary text-white' 
              : 'bg-surface hover:bg-surface-hover text-primary'
          }`}
        >
          Journal
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow p-6">
        {activeTab === 'chat' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3">Chat</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
                  New Chat
                </button>
                <button className="px-4 py-2 text-sm rounded-lg bg-surface hover:bg-surface-hover text-primary border border-primary transition-colors">
                  Existing Chats
                </button>
              </div>
            </div>
            <p className="text-body-sm text-secondary">Start a new conversation or continue an existing one with the AI.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3">Journal</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
                  New Entry
                </button>
                <button className="px-4 py-2 text-sm rounded-lg bg-surface hover:bg-surface-hover text-primary border border-primary transition-colors">
                  View All Entries
                </button>
              </div>
            </div>
            <p className="text-body-sm text-secondary">Create a new journal entry or browse your previous entries.</p>
          </div>
        )}
      </div>
    </main>
  );
}
