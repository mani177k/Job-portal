import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, Bell, Lock, Save } from 'lucide-react';

export const RecruiterSettings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [applicantAlerts, setApplicantAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [interviewSync, setInterviewSync] = useState(true);

  const handleSave = () => {
    toast.success('Recruiter preferences updated successfully');
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recruiter Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hiring team notifications, pipeline automation alerts, and authentication.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Recruiter Account Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Recruiter Email:</span>
            <div className="font-semibold text-slate-800 mt-0.5">{user?.email}</div>
          </div>
          <div>
            <span className="text-slate-400">Company Access:</span>
            <div className="font-semibold text-indigo-600 mt-0.5">Verified Recruiter Access</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          Hiring Workflow Alerts
        </h3>

        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Instant New Applicant Alerts</div>
              <div className="text-slate-500 text-[11px]">Notify immediately when a candidate submits an application</div>
            </div>
            <input
              type="checkbox"
              checked={applicantAlerts}
              onChange={(e) => setApplicantAlerts(e.target.checked)}
              className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Google Meet / Zoom Calendar Sync</div>
              <div className="text-slate-500 text-[11px]">Automatically generate video interview rooms for scheduled sessions</div>
            </div>
            <input
              type="checkbox"
              checked={interviewSync}
              onChange={(e) => setInterviewSync(e.target.checked)}
              className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Daily Talent Summary</div>
              <div className="text-slate-500 text-[11px]">Daily digest of shortlisted applicants and upcoming interviews</div>
            </div>
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Save Recruiter Settings
        </button>
      </div>
    </div>
  );
};
