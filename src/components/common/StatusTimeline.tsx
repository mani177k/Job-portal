import React from 'react';
import type { ApplicationStatus, ApplicationHistoryItem } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award, 
  XCircle, 
  FileText,
  Video,
  ExternalLink
} from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ApplicationStatus | string;
  history?: ApplicationHistoryItem[];
  interviewDate?: string | null;
  interviewLink?: string | null;
  recruiterNotes?: string | null;
}

const STAGES: { key: ApplicationStatus; label: string; desc: string }[] = [
  { key: 'applied', label: 'Application Submitted', desc: 'Resume and details received' },
  { key: 'under_review', label: 'Resume Under Review', desc: 'Hiring team evaluating credentials' },
  { key: 'shortlisted', label: 'Candidate Shortlisted', desc: 'Selected for forward interview rounds' },
  { key: 'interview_scheduled', label: 'Interview Scheduled', desc: 'Technical or culture conversations' },
  { key: 'selected', label: 'Final Decision / Offer', desc: 'Offer extended or decision finalized' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  history = [],
  interviewDate,
  interviewLink,
  recruiterNotes,
}) => {
  const isRejected = currentStatus === 'rejected';

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'applied': return 0;
      case 'under_review': return 1;
      case 'shortlisted': return 2;
      case 'interview_scheduled': return 3;
      case 'selected': return 4;
      case 'rejected': return 2; // Split off at review
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-200 z-0" />
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = !isRejected && idx < currentIndex;
            const isCurrent = !isRejected && idx === currentIndex;
            const isFuture = !isRejected && idx > currentIndex;

            return (
              <div 
                key={stage.key} 
                className={`flex sm:flex-col items-center gap-3 p-3 sm:p-2 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-blue-50/80 sm:bg-transparent border border-blue-200 sm:border-0' 
                    : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 font-semibold text-xs shadow-xs transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                <div className="sm:text-center">
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-500 hidden sm:block mt-0.5 leading-tight">
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Box for Rejection or Interview */}
      {isRejected && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-rose-950">Application Not Selected</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Thank you for your interest. The hiring team has decided to move forward with other candidates whose experience more closely matches this specific position.
            </p>
          </div>
        </div>
      )}

      {currentStatus === 'interview_scheduled' && (interviewDate || interviewLink) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-teal-950">Interview Session Scheduled</h4>
              <p className="text-xs text-teal-800 mt-0.5">
                {interviewDate ? `Date: ${new Date(interviewDate).toLocaleString()}` : 'Date confirmed with recruiter'}
              </p>
            </div>
          </div>
          {interviewLink && (
            <a
              href={interviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition-colors shadow-xs"
            >
              <Video className="w-3.5 h-3.5" />
              Join Meeting Link
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Notes if available */}
      {recruiterNotes && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-800">Recruiter Feedback / Notes: </span>
          <span className="text-slate-600">{recruiterNotes}</span>
        </div>
      )}

      {/* Audit History Log */}
      {history.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Status Activity Timeline
          </h5>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {item.notes || `Moved to ${item.new_status.replace('_', ' ')}`}
                    </span>
                    <span className="text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {item.first_name && (
                    <span className="text-[11px] text-slate-500">
                      Updated by {item.first_name} ({item.role})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
