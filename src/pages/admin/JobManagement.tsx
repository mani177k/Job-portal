import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Loader2 
} from 'lucide-react';

export const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    const newStatus = !job.is_active;
    try {
      await adminService.toggleJobStatus(job.id, { is_active: newStatus });
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, is_active: newStatus } : j)));
      toast.success(`Job marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  const handleToggleFeatured = async (job: Job) => {
    const newFeatured = !job.is_featured;
    try {
      await adminService.toggleJobStatus(job.id, { is_featured: newFeatured });
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, is_featured: newFeatured } : j)));
      toast.success(`Job ${newFeatured ? 'marked as Featured' : 'unfeatured'}`);
    } catch (err) {
      toast.error('Failed to update featured flag');
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Job Moderation & Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, promote to featured, or deactivate job postings across the entire portal.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Total listings: {jobs.length}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading listings...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No jobs found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[11px] text-slate-500">{job.company?.name}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {job.location} ({job.work_mode})
                    </td>

                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {job.applications_count || 0} candidates
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(job)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          Boolean(job.is_featured)
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{Boolean(job.is_featured) ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        Boolean(job.is_active)
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {Boolean(job.is_active) ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(job)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          Boolean(job.is_active)
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {Boolean(job.is_active) ? 'Deactivate Post' : 'Reactivate Post'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
