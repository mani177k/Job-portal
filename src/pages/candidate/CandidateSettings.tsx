import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Bell, Shield, Save } from 'lucide-react';

export const CandidateSettings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = () => {
    toast.success('Notification preferences updated');
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account security, notification alerts, and login credentials.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Registered Email:</span>
            <div className="font-semibold text-slate-800 mt-0.5">{user?.email}</div>
          </div>
          <div>
            <span className="text-slate-400">Account Role:</span>
            <div className="font-semibold text-blue-600 capitalize mt-0.5">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          Notification Preferences
        </h3>

        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Application Status Notifications</div>
              <div className="text-slate-500 text-[11px]">Receive updates when a recruiter moves your application</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Interview Scheduling Reminders</div>
              <div className="text-slate-500 text-[11px]">Get meeting links and reminders 24 hours prior</div>
            </div>
            <input
              type="checkbox"
              checked={interviewAlerts}
              onChange={(e) => setInterviewAlerts(e.target.checked)}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Matched Job Recommendations</div>
              <div className="text-slate-500 text-[11px]">Weekly digest of new positions matching your technical skills</div>
            </div>
            <input
              type="checkbox"
              checked={jobRecommendations}
              onChange={(e) => setJobRecommendations(e.target.checked)}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSavePreferences}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Save Notification Preferences
        </button>
      </div>

      {/* Security & Password */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          Update Password
        </h3>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
