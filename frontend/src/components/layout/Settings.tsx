import { X, Edit2 } from "lucide-react";
import React, { useState } from "react";
import { SettingsDialogProps } from "@/util/types";

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
  user,
  setUser
}: SettingsDialogProps) {


  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'B';
  const userName = user?.name ? user.name.split(' ')[0] : 'Bhuwan';
  const userEmail = user?.email || 'bhuwan@mindguideai';

  // State for managing the display name input and error message and password modal visibility
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || userName);
  const [nameError, setNameError] = useState('');

  // Effect to update the display name state when the user prop changes, ensuring that the input field reflects the current user's name when the settings dialog is opened or when the user information is updated
  React.useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

  if (!isOpen) return null;

  // Handle account deletion, showing a confirmation prompt to the user and alerting that the account has been deleted (UI only, no actual deletion logic implemented)
  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This cannot be undone.")) {
      alert("Account deleted (UI only).");
    }
  };

  // Settings dialog component that displays user information, allows editing the display name, toggling notification and privacy settings, and provides options to change password, delete account, or log out. The component uses local state to manage form inputs and error messages, and makes API calls to update user information when necessary. It also includes animations for opening and closing the dialog, and handles click events to close the dialog when clicking outside of it.
  return (
    <div
      data-cy="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn no-scrollbar"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl shadow-xl overflow-y-auto max-h-[92vh] bg-surface animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          transition: "all 0.3s ease",
        }}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-primary/10 transition"
            onClick={onClose}
          >
            <X className="text-secondary" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="px-8 pb-6 flex flex-col items-center">
          <label htmlFor="profile-photo">
            <div className="relative cursor-pointer">
              <img
                src={

                  `https://ui-avatars.com/api/?name=${userName ? userName.charAt(0).toUpperCase() : 'B'}&background=6366F1&color=fff`
                }
                alt="profile"
                className="w-24 h-24 rounded-full object-cover shadow"
              />
              <div className="absolute bottom-0 right-0 bg-primary text-white px-2 py-1 text-xs rounded-full shadow">
                Edit
              </div>
            </div>
          </label>

          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            className="hidden"
          />

          <h2 className="text-xl font-semibold mt-4">{userName}</h2>
          <p className="text-secondary text-sm -mt-1">{userEmail}</p>
        </div>

        {/* Settings Sections */}
        <div className="px-8 pb-10 space-y-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>

            {/* Display Name */}
            <div className="mb-4">
              <label className="text-secondary text-sm mb-1 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={async () => {
                  if (!displayName.trim() || displayName.trim() === (user?.name || userName)) return;
                  setNameError('');
                  try {
                    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
                    const res = await fetch(`${API_URL}/users/name`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      },
                      body: JSON.stringify({ name: displayName.trim() }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      setNameError(data.error || 'Failed to update name.');
                    } else {
                      const cached = localStorage.getItem('user');
                      if (cached) {
                        const parsed = JSON.parse(cached);
                        parsed.name = displayName.trim();
                        localStorage.setItem('user', JSON.stringify(parsed));
                      }
                      if (setUser) {
                        setUser({
                          ...user!,
                          name: displayName.trim()
                        });
                      }
                    }
                  } catch {
                    setNameError('Network error. Please try again.');
                  }
                }}
                className="border border-color rounded-xl px-4 py-2 bg-background text-foreground w-full focus:ring-2 focus:ring-primary outline-none transition"
                placeholder="Your name"
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 bg-surface-base rounded-xl text-secondary font-medium hover:bg-primary/10 transition"
            >
              Change Password
            </button>
          </div>

          {/* NOTIFICATIONS */}
          <div >
            <h3 className="text-lg font-semibold mb-4 ">Notifications</h3>

            <ToggleRow
              label="Push Notifications"
              value={pushNotifications}
              setter={setPushNotifications}
            />
          </div>

          {/* PRIVACY */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">Privacy</h3>

            <ToggleRow
              label="Analytics Tracking"
              value={analyticsTracking}
              setter={setAnalyticsTracking}
            />

            <ToggleRow
              label="Personalized Ads"
              value={personalizedAds}
              setter={setPersonalizedAds}
            />
          </div>

          {/* DELETE ACCOUNT */}
          <button
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>

          {/* LOGOUT */}
          <button
            data-cy="logout-btn"
            onClick={onLogout}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {/* Animations */}
      <style>{`
        .animate-fadeIn { 
          animation: fadeIn 0.25s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* Helper components for editable rows and toggle switches used in the settings dialog. The EditableRow component renders a label and an input field for editing text values, while the ToggleRow component renders a label and a toggle switch for boolean settings. Both components receive props for the label, current value, and a setter function to update the value in the parent component. */

function EditableRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-secondary text-sm mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-color rounded-xl px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition"
      />
    </div>
  );
}

function ToggleRow({
  label,
  value,
  setter,
}: {
  label: string;
  value: boolean;
  setter: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-secondary">{label}</span>
      <button
        onClick={() => setter(!value)}
        className={`relative w-12 h-6 rounded-full transition ${value ? "bg-primary" : "bg-muted"
          }`}
      >
        <div
          className="absolute top-1 left-1 bg-background w-4 h-4 rounded-full shadow transition"
          style={{
            transform: value ? "translateX(24px)" : "translateX(0px)",
          }}
        />
      </button>
    </div>
  );
}

// Password change modal component that allows the user to enter their current password and a new password, and handles the logic for submitting the password change request to the backend API. The component manages local state for the input fields, error messages, and loading state, and provides feedback to the user based on the success or failure of the password update operation. The modal can be closed by clicking outside of it or by clicking the close button, and it includes basic validation to ensure both fields are filled before allowing submission.
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!oldPw || !newPw) {
      setError("Both fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onClose();
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-cy="password-modal"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full max-w-sm rounded-2xl p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            className="w-full border border-color bg-background text-foreground rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full border border-color bg-background text-foreground rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
