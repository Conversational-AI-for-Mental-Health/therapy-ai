import { X, Edit2 } from 'lucide-react';
import { SettingsDialogProps } from '@/util/types';
import React from 'react';



export default function Settings({
  isOpen,
  onClose,
  onLogout,
  analyticsTracking,
  setAnalyticsTracking,
  personalizedAds,
  setPersonalizedAds,
  pushNotifications,
  setPushNotifications,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  const handleDeleteAllChats = () => {
    if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      alert('All chats deleted successfully');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      alert('Account deletion requested. You will receive a confirmation email.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        padding: 'var(--space-md)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ 
          padding: 'var(--space-lg)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end" style={{ marginBottom: 'var(--space-md)' }}>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-primary/10 transition flex items-center justify-center"
            style={{ width: 'var(--space-lg)', height: 'var(--space-lg)' }}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center" style={{ marginBottom: 'var(--space-xl)' }}>
          <div 
            className="bg-primary rounded-full flex items-center justify-center text-white"
            style={{ 
              width: 'var(--space-xxl)', 
              height: 'var(--space-xxl)', 
              fontSize: 'var(--font-h1)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--space-sm)'
            }}
          >
            J
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
            <h2 className="text-h2">Jamie R.</h2>
            <button 
              className="text-primary hover:bg-primary/10 rounded-full transition flex items-center justify-center" 
              style={{ padding: 'var(--space-xxs)', width: 'var(--space-md)', height: 'var(--space-md)' }}
            >
              <Edit2 size={16} />
            </button>
          </div>
          <p className="text-body-sm text-secondary">jamie.r@example.com</p>
        </div>

        {/* Privacy Controls */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 className="text-h3" style={{ marginBottom: 'var(--space-md)' }}>Privacy Controls</h3>
          
          {/* Analytics Tracking Toggle */}
          <div 
            className="border border-color rounded-lg flex items-center justify-between hover:bg-primary/5 transition"
            style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}
          >
            <span className="text-body" style={{ fontWeight: 'var(--font-weight-medium)' }}>Analytics Tracking</span>
            <button
              onClick={() => setAnalyticsTracking(!analyticsTracking)}
              className={`relative rounded-full transition-colors ${analyticsTracking ? 'bg-primary' : 'bg-gray-300'}`}
              style={{ width: '44px', height: '24px' }}
            >
              <div
                className="absolute bg-white rounded-full shadow-sm transition-transform"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '2px',
                  left: analyticsTracking ? '22px' : '2px',
                }}
              />
            </button>
          </div>

          {/* Personalized Ads Toggle */}
          <div 
            className="border border-color rounded-lg flex items-center justify-between hover:bg-primary/5 transition"
            style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}
          >
            <span className="text-body" style={{ fontWeight: 'var(--font-weight-medium)' }}>Personalized Ads</span>
            <button
              onClick={() => setPersonalizedAds(!personalizedAds)}
              className={`relative rounded-full transition-colors ${personalizedAds ? 'bg-primary' : 'bg-gray-300'}`}
              style={{ width: '44px', height: '24px' }}
            >
              <div
                className="absolute bg-white rounded-full shadow-sm transition-transform"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '2px',
                  left: personalizedAds ? '22px' : '2px',
                }}
              />
            </button>
          </div>

          {/* Push Notifications Toggle */}
          <div 
            className="border border-color rounded-lg flex items-center justify-between hover:bg-primary/5 transition"
            style={{ padding: 'var(--space-sm)' }}
          >
            <span className="text-body" style={{ fontWeight: 'var(--font-weight-medium)' }}>Push Notifications</span>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-gray-300'}`}
              style={{ width: '44px', height: '24px' }}
            >
              <div
                className="absolute bg-white rounded-full shadow-sm transition-transform"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '2px',
                  left: pushNotifications ? '22px' : '2px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="text-h3" style={{ marginBottom: 'var(--space-md)' }}>Data Management</h3>
          
          <button
            onClick={handleDeleteAllChats}
            className="w-full bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-body flex items-center justify-between"
            style={{ padding: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}
          >
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Delete All Chats</span>
            <span className="text-body-sm">🗑️</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-body flex items-center justify-between"
            style={{ padding: 'var(--space-sm)' }}
          >
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Delete Account</span>
            <span className="text-body-sm">⚠️</span>
          </button>
        </div>

        {/* Logout Button - Centered with padding */}
        <div className="flex justify-center">
          <button
            onClick={onLogout}
            className="bg-primary text-white rounded-lg hover:opacity-90 transition text-center"
            style={{ padding: 'var(--space-sm) var(--space-xl)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Log Out
          </button>
        </div>
      </div>

      <style>{`
        .dark .bg-surface {
          background: rgba(45, 55, 72, 0.95) !important;
        }
      `}</style>
    </div>
  );
}