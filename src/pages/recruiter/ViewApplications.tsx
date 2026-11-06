import React, { useState, useEffect } from 'react';
import type { Application, Job } from '../../types';
import { recruiterService, applicationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Video, 
  FileText, 
  ExternalLink, 
  Loader2, 
  X,
  Clock,
  Sparkles,
  MapPin,
  Briefcase
} from 'lucide-react';

interface ViewApplicationsProps {
  initialJobId?: number;
}

export const ViewApplications: React.FC<ViewApplicationsProps> = ({ initialJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | 'all'>(initialJobId || 'all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [inspectApp, setInspectApp] = useState<Application | null>(null);
  const [statusModalApp, setStatusModalApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<string>('shortlisted');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/hhr-zqwk-ptx');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const myJobs = await recruiterService.getMyJobs();
      setJobs(myJobs);
      if (initialJobId) {
        setSelectedJobId(initialJobId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      if (selectedJobId !== 'all') {
        const apps = await recruiterService.getJobApplications(selectedJobId);
        setApplications(apps);
      } else {
        // Fetch all jobs' applications
        const myJobs = await recruiterService.getMyJobs();
        const allPromises = myJobs.map((j) => recruiterService.getJobApplications(j.id));
        const results = await Promise.all(allPromises);
        setApplications(results.flat());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStatusModal = (app: Application) => {
    setStatusModalApp(app);
    setNewStatus(app.status || 'under_review');
    setRecruiterNotes(app.recruiter_notes || '');
    setInterviewDate(app.interview_date ? app.interview_date.substring(0, 16) : '');
    setInterviewLink(app.interview_link || 'https://meet.google.com/hhr-zqwk-ptx');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      setIsUpdatingStatus(true);
      await applicationService.updateStatus(statusModalApp.id, {
        status: newStatus,
        recruiter_notes: recruiterNotes,
        interview_date: newStatus === 'interview_scheduled' && interviewDate ? interviewDate : undefined,
        interview_link: newStatus === 'interview_scheduled' && interviewLink ? interviewLink : undefined,
      });

      setApplications(
        applications.map((a) =>
          a.id === statusModalApp.id
            ? {
                ...a,
                status: newStatus as any,
                recruiter_notes: recruiterNotes,
                interview_date: interviewDate,
                interview_link: interviewLink,
              }
            : a
        )
      );

      if (inspectApp?.id === statusModalApp.id) {
        setInspectApp({
          ...inspectApp,
          status: newStatus as any,
          recruiter_notes: recruiterNotes,
          interview_date: interviewDate,
          interview_link: interviewLink,
        });
      }

      toast.success(`Application updated to ${newStatus.replace('_', ' ')}!`);
      setStatusModalApp(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const candidateName = `${app.candidate_first_name || ''} ${app.candidate_last_name || ''}`.toLowerCase();
    const candidateHeadline = (app.candidate_headline || '').toLowerCase();
    const matchesSearch =
      !search ||
      candidateName.includes(search.toLowerCase()) ||
      candidateHeadline.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Applicant Pipeline & Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review candidates, inspect formatted resumes, schedule interview sessions, and progress applications.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full sm:w-64 text-xs font-semibold p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Published Vacancies ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.applications_count || 0})
              </option>
            ))}
          </select>

          {/* Search Candidate */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Candidate name or skills..."
              className="w-full text-xs outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-semibold pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'applied', label: 'Applied' },
            { id: 'under_review', label: 'Reviewing' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview_scheduled', label: 'Interviews' },
            { id: 'selected', label: 'Selected' },
            { id: 'rejected', label: 'Rejected' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading applicants...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No submissions match your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={app.candidate_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {app.candidate_first_name} {app.candidate_last_name}
                    </h3>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <p className="text-xs font-semibold text-blue-600">
                    {app.candidate_headline || 'Candidate looking for roles'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Email: {app.candidate_email}</span>
                    {app.experience_years !== undefined && (
                      <span>• Experience: {app.experience_years} years</span>
                    )}
                    <span>• Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>

                  {app.cover_letter && (
                    <p className="text-xs text-slate-600 italic line-clamp-1 pt-1">
                      "{app.cover_letter}"
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {app.resume_file_path && (
                  <a
                    href={app.resume_file_path}
                    download={app.resume_file_name || 'Resume'}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                    title="Download candidate resume"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </a>
                )}

                <button
                  onClick={async () => {
                    const full = await applicationService.getApplicationById(app.id);
                    setInspectApp(full);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Profile</span>
                </button>

                <button
                  onClick={() => handleOpenStatusModal(app)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Update Stage</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Candidate Profile Modal */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={inspectApp.candidate?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                />
                <div>
                  <h3 className="text-base font-bold">
                    {inspectApp.candidate?.first_name} {inspectApp.candidate?.last_name}
                  </h3>
                  <div className="text-xs text-blue-300">
                    {inspectApp.candidate?.profile?.headline || 'Candidate Profile'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {inspectApp.candidate?.email} • {inspectApp.candidate?.phone || 'No phone'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
              {/* Bio */}
              {inspectApp.candidate?.profile?.bio && (
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Candidate Bio
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {inspectApp.candidate.profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {inspectApp.candidate?.profile?.skills && inspectApp.candidate.profile.skills.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Technical Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectApp.candidate.profile.skills.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {inspectApp.candidate?.profile?.experience && inspectApp.candidate.profile.experience.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Work Experience
                  </div>
                  <div className="space-y-2">
                    {inspectApp.candidate.profile.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="font-bold text-slate-900">{exp.title} • {exp.company}</div>
                        <div className="text-[11px] text-slate-400">{exp.period} | {exp.location}</div>
                        <p className="text-slate-600 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {inspectApp.cover_letter && (
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Cover Letter Attached
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-slate-700 whitespace-pre-line leading-relaxed">
                    {inspectApp.cover_letter}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setInspectApp(null);
                  handleOpenStatusModal(inspectApp);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Change Stage / Schedule Interview
              </button>
              <button
                onClick={() => setInspectApp(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Candidate Application Stage
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes will immediately reflect in candidate's live tracking timeline.
                </p>
              </div>
              <button
                onClick={() => setStatusModalApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Select New Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'shortlisted', label: 'Shortlisted' },
                    { id: 'interview_scheduled', label: 'Interview Scheduled' },
                    { id: 'selected', label: 'Selected / Offer' },
                    { id: 'rejected', label: 'Not Selected / Rejected' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewStatus(s.id)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                        newStatus === s.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If interview scheduled */}
              {newStatus === 'interview_scheduled' && (
                <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 space-y-3">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>Interview Logistics</span>
                  </div>

                  <div>
                    <label className="block text-teal-800 font-semibold mb-1">Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full p-2.5 border border-teal-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-teal-800 font-semibold mb-1">Meeting Link (Google Meet / Zoom)</label>
                    <input
                      type="url"
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full p-2.5 border border-teal-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>
              )}

              {/* Recruiter feedback notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Recruiter Feedback / Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  placeholder="Notes explaining why candidate was moved, interview prep advice, or rejection feedback..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Commit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
