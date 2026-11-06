import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { jobService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { JobCard } from '../../components/common/JobCard';
import { ApplyModal } from '../../components/common/ApplyModal';
import { Bookmark, Loader2, ArrowRight } from 'lucide-react';

interface SavedJobsProps {
  onSelectJob: (job: Job) => void;
  onNavigate: (path: string) => void;
}

export const SavedJobs: React.FC<SavedJobsProps> = ({ onSelectJob, onNavigate }) => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplyJob, setSelectedApplyJob] = useState<Job | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobService.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Saved Jobs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Open positions you've bookmarked to review or apply to later.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading bookmarks...</span>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No saved jobs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our open positions and click the bookmark icon to save roles here.
          </p>
          <button
            onClick={() => onNavigate('/jobs')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Browse Openings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onApplyClick={(j) => setSelectedApplyJob(j)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        job={selectedApplyJob}
        isOpen={Boolean(selectedApplyJob)}
        onClose={() => setSelectedApplyJob(null)}
        onSuccess={() => {
          if (selectedApplyJob) {
            setSavedJobs((prev) =>
              prev.map((j) => (j.id === selectedApplyJob.id ? { ...j, has_applied: true } : j))
            );
          }
        }}
      />
    </div>
  );
};
