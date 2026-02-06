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
  user
}: SettingsDialogProps) {
  if (!isOpen) return null;

  /* dynamic UI state */
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  const [name, setName] = useState(user?.name ? user.name.split(' ')[0] : 'Bhuwan');
  const [email, setEmail] = useState(user?.email || 'bhuwan@mindguideai');
  const [username, setUsername] = useState('userName mock');

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  //photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* handle delete account */
  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This cannot be undone.")) {
      alert("Account deleted (UI only).");
    }
  };

  /* toggle helper */
  const toggle = (value: boolean, setter: (v: boolean) => void) => {
    setter(!value);
  };

  return (
    <div
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
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
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
                  profilePhoto ||
                  `https://ui-avatars.com/api/?name=${user?.name ? user.name.charAt(0).toUpperCase() : 'B'}&background=6366F1&color=fff`
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
            onChange={handlePhotoChange}
          />

          <h2 className="text-xl font-semibold mt-4">{name}</h2>
          <p className="text-secondary text-sm -mt-1">{email}</p>
        </div>

        {/* Settings Sections */}
        <div className="px-8 pb-10 space-y-10">

          {/* ACCOUNT */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>

            <div className="space-y-4">

              {/* Name */}
              <EditableRow label="Name" value={name} onChange={setName} />

              {/* Email */}
              <EditableRow label="Email" value={email} onChange={setEmail} />

              {/* Username */}
              <EditableRow
                label="Username"
                value={username}
                onChange={setUsername}
              />

              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 bg-gray-100 rounded-xl text-secondary font-medium hover:bg-gray-200 transition"
              >
                Change Password
              </button>
            </div>
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

/* Components */

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
      <span className="text-gray-700 text-sm mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-2 text-gray-800 focus:ring-2 focus:ring-primary outline-none transition"
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
      <span className="text-gray-700">{label}</span>
      <button
        onClick={() => setter(!value)}
        className={`relative w-12 h-6 rounded-full transition ${
          value ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <div
          className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition"
          style={{
            transform: value ? "translateX(24px)" : "translateX(0px)",
          }}
        />
      </button>
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
          />

          <button
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
            onClick={() => {
              alert("Password updated (UI only).");
              onClose();
            }}
          >
            Save Password
          </button>
        </div>
      </div>
    </div>
  );
}
