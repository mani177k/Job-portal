import React, { useState, useEffect } from 'react';
import type { Application } from '../../types';
import { applicationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  Loader2,
  X
} from 'lucide-react';

interface MyApplicationsProps {
  onNavigateToTracking?: (applicationId: number) => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ onNavigateToTracking }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      await applicationService.withdraw(applicationId);
      setApplications(applications.filter((a) => a.id !== applicationId));
      if (selectedAppForModal?.id === applicationId) {
        setSelectedAppForModal(null);
      }
      toast.success('Application withdrawn successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !search || 
      app.job?.title.toLowerCase().includes(search.toLowerCase()) || 
      app.job?.company?.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your progress across active candidate pipelines with real-time feedback.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or company..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'applied', label: 'Applied' },
            { id: 'under_review', label: 'Reviewing' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview_scheduled', label: 'Interviews' },
            { id: 'selected', label: 'Selected' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading application records...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter !== 'all' || search
              ? 'Try adjusting your filters or search query.'
              : 'You have not submitted applications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={app.job?.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{app.job?.title}</h3>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {app.job?.company?.name} • <span className="text-slate-500 font-normal">{app.job?.location}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                    {app.resume && (
                      <span>• Resume: {(app.resume as any).file_name}</span>
                    )}
                    {app.job?.max_salary && (
                      <span>
                        • ${(app.job.min_salary || 0).toLocaleString()} - ${app.job.max_salary.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => setSelectedAppForModal(app)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Track Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {app.status === 'applied' && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Withdraw application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracker Modal */}
      {selectedAppForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Application Tracking Details
                </span>
                <h3 className="text-base font-bold mt-0.5">{selectedAppForModal.job?.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedAppForModal.job?.company?.name} • Submitted on{' '}
                  {new Date(selectedAppForModal.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <StatusTimeline
                currentStatus={selectedAppForModal.status}
                history={selectedAppForModal.history}
                interviewDate={selectedAppForModal.interview_date}
                interviewLink={selectedAppForModal.interview_link}
                recruiterNotes={selectedAppForModal.recruiter_notes}
              />

              {/* Cover Letter Accordion */}
              {selectedAppForModal.cover_letter && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">Your Submitted Note / Cover Letter:</div>
                  <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {selectedAppForModal.cover_letter}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAppForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
