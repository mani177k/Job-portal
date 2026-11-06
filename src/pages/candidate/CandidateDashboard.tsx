import React, { useState, useEffect } from 'react';
import type { Application, Job } from '../../types';
import { applicationService, jobService, candidateService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { JobCard } from '../../components/common/JobCard';
import { 
  FileText, 
  Clock, 
  Award, 
  Calendar, 
  ArrowRight, 
  Bookmark, 
  CheckCircle2, 
  Sparkles,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CandidateDashboardProps {
  onNavigate: (path: string) => void;
  onSelectJob: (job: Job) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ 
  onNavigate, 
  onSelectJob 
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [appsData, allJobs, saved] = await Promise.all([
        applicationService.getMyApplications(),
        jobService.getJobs({}),
        jobService.getSavedJobs()
      ]);

      setApplications(appsData);
      setSavedJobs(saved);

      // Recommend jobs candidate hasn't applied to yet
      const appliedJobIds = new Set(appsData.map((a) => a.job_id));
      const unapplied = allJobs.filter((j) => !appliedJobIds.has(j.id));
      setRecommendedJobs(unapplied.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const appliedCount = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewsCount = applications.filter((a) => a.status === 'interview_scheduled').length;

  const latestActiveApp = applications.find(
    (a) => a.status === 'interview_scheduled' || a.status === 'shortlisted' || a.status === 'under_review'
  ) || applications[0];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome back, {user?.first_name || 'Candidate'}!
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Candidate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track your job applications, interviews, and discover new openings matched to your profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/candidate/profile')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
          <button
            onClick={() => onNavigate('/jobs')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Explore Jobs
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applied
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {appliedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Submitted resumes</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Under Review
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {underReviewCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Being evaluated</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
              {shortlistedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Advanced to next step</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interviews
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-1">
              {interviewsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Sessions scheduled</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Featured Active Application Spotlight */}
      {latestActiveApp && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Active Application Focus
              </span>
              <StatusBadge status={latestActiveApp.status} size="sm" />
            </div>
            <h3 className="text-lg font-bold">{latestActiveApp.job?.title}</h3>
            <p className="text-xs text-slate-300">
              {latestActiveApp.job?.company?.name} • Applied on {new Date(latestActiveApp.created_at).toLocaleDateString()}
            </p>
            {latestActiveApp.recruiter_notes && (
              <p className="text-xs text-blue-200/90 italic bg-white/10 p-2.5 rounded-lg max-w-xl">
                Recruiter note: "{latestActiveApp.recruiter_notes}"
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigate('/candidate/tracking')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <span>View Full Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Recent Applications & Saved Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
            <button
              onClick={() => onNavigate('/candidate/applications')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              View all ({applications.length}) →
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              You haven't submitted any applications yet.{' '}
              <button
                onClick={() => onNavigate('/jobs')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Browse jobs now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.job?.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {app.job?.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {app.job?.company?.name} • {app.job?.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={app.status} size="sm" />
                    <button
                      onClick={() => onNavigate('/candidate/tracking')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="View tracker"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-blue-600" />
              Saved Jobs ({savedJobs.length})
            </h3>
            <button
              onClick={() => onNavigate('/candidate/saved-jobs')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              See all →
            </button>
          </div>

          {savedJobs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No bookmarked jobs yet. Tap the bookmark icon on any job to save it for later.
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobs.slice(0, 3).map((sJob) => (
                <div
                  key={sJob.id}
                  onClick={() => onSelectJob(sJob)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {sJob.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sJob.company.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{sJob.location}</span>
                    <span className="text-blue-600 font-semibold">View</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended For You</h3>
              <p className="text-xs text-slate-500">Based on your candidate profile experience</p>
            </div>
            <button
              onClick={() => onNavigate('/jobs')}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Browse all open positions →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={onSelectJob}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
