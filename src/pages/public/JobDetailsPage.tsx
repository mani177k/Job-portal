import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ApplyModal } from '../../components/common/ApplyModal';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Calendar, 
  Bookmark, 
  CheckCircle2, 
  Share2, 
  ExternalLink, 
  ArrowLeft,
  ShieldCheck,
  Check,
  Sparkles,
  Users
} from 'lucide-react';

interface JobDetailsPageProps {
  jobId: number | string;
  onBack: () => void;
  onSelectRelatedJob: (job: Job) => void;
  onNavigateToCandidateDashboard?: () => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
  jobId,
  onBack,
  onSelectRelatedJob,
  onNavigateToCandidateDashboard,
}) => {
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const data = await jobService.getJobById(jobId);
      setJob(data);
      setIsSaved(Boolean(data.is_saved));

      // Fetch related jobs
      const all = await jobService.getJobs({ employment_type: data.employment_type });
      setRelatedJobs(all.filter((j) => j.id !== data.id).slice(0, 3));
    } catch (err) {
      console.error(err);
      toast.error('Could not load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.info('Please log in to bookmark jobs');
      return;
    }
    if (user.role !== 'candidate') {
      toast.info('Only candidates can save jobs');
      return;
    }

    try {
      const res = await jobService.saveJob(jobId);
      setIsSaved(res.saved);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Job link copied to clipboard!');
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-xs flex items-center gap-2">
          <span>Loading job information...</span>
        </div>
      </div>
    );
  }

  const formattedSalary = job.max_salary
    ? `$${(job.min_salary || 0).toLocaleString()} - $${job.max_salary.toLocaleString()} / year`
    : 'Competitive Salary';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Open Positions</span>
        </button>

        {/* Hero Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={job.company.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'}
                alt={job.company.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0 bg-slate-50"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">{job.company.name}</span>
                  {Boolean(job.company.verified) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 capitalize">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {job.work_mode} ({job.employment_type})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Share job"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isSaved
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Remove bookmark' : 'Save position'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
              </button>

              {job.has_applied ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Apply for this Role
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Estimated Compensation</div>
              <div className="font-bold text-slate-900 mt-0.5">{formattedSalary}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Experience Level</div>
              <div className="font-bold text-slate-900 capitalize mt-0.5">{job.experience_level}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Department</div>
              <div className="font-bold text-slate-900 mt-0.5">{job.department}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Total Applicants</div>
              <div className="font-bold text-slate-900 mt-0.5">{job.applications_count || 1} candidates</div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">About the Role</h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">Key Responsibilities</h2>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Requirements & Qualifications</h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">Technical Skills & Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s: any, idx: number) => {
                    const name = typeof s === 'string' ? s : s.name;
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Company Info & Related Jobs */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                About the Company
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={job.company.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                  alt={job.company.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{job.company.name}</h4>
                  <div className="text-xs text-slate-500">{job.company.industry}</div>
                </div>
              </div>

              {job.company.about_text && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.company.about_text}
                </p>
              )}

              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-semibold text-slate-800">{job.company.location}</span>
                </div>
                {job.company.company_size && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Company Size</span>
                    <span className="font-semibold text-slate-800">{job.company.company_size}</span>
                  </div>
                )}
                {job.company.website && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Website</span>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Visit site <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Similar Positions
                </h3>
                <div className="space-y-3">
                  {relatedJobs.map((rJob) => (
                    <div
                      key={rJob.id}
                      onClick={() => onSelectRelatedJob(rJob)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group"
                    >
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {rJob.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">{rJob.company.name}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>{rJob.location}</span>
                        {rJob.max_salary && (
                          <span className="font-semibold text-emerald-600">
                            ${(rJob.min_salary || 0).toLocaleString()} - ${rJob.max_salary.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setJob((prev) => (prev ? { ...prev, has_applied: true } : prev));
        }}
      />
    </div>
  );
};
