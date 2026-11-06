import React, { useState, useEffect } from 'react';
import type { Application } from '../../types';
import { applicationService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { 
  Activity, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  Loader2, 
  Briefcase,
  FileText
} from 'lucide-react';

export const ApplicationTracking: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await applicationService.getMyApplications();
      setApplications(data);
      if (data.length > 0) {
        setSelectedApp(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading tracking details...</span>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full text-center bg-white rounded-2xl border border-slate-200 py-16 space-y-3">
        <Activity className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No applications to track</h3>
        <p className="text-xs text-slate-500">Apply to jobs to monitor application progression in real time.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Visual Application Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your recruitment stages, interview links, and recruiter notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Applications */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Applications ({applications.length})
          </div>

          <div className="space-y-2.5">
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {app.job?.title}
                    </h4>
                    <StatusBadge status={app.status} size="sm" showIcon={false} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {app.job?.company?.name} • {app.job?.location}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    Applied: {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-dive Tracker details */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              {/* Job summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedApp.job?.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.job?.title}</h3>
                    <div className="text-xs text-slate-600 mt-0.5 font-medium">
                      {selectedApp.job?.company?.name} • {selectedApp.job?.location}
                    </div>
                  </div>
                </div>

                <StatusBadge status={selectedApp.status} size="lg" />
              </div>

              {/* Status Timeline */}
              <StatusTimeline
                currentStatus={selectedApp.status}
                history={selectedApp.history}
                interviewDate={selectedApp.interview_date}
                interviewLink={selectedApp.interview_link}
                recruiterNotes={selectedApp.recruiter_notes}
              />

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-800">Attached Cover Letter:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an application on the left to inspect its live stage tracker.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
