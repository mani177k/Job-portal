import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { recruiterService, jobService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  Users, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  MapPin,
  DollarSign
} from 'lucide-react';

interface ManageJobsProps {
  onNavigate: (path: string) => void;
  onViewJobApplicants: (jobId: number) => void;
}

export const ManageJobs: React.FC<ManageJobsProps> = ({ 
  onNavigate, 
  onViewJobApplicants 
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await recruiterService.getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    const newStatus = !job.is_active;
    try {
      await jobService.updateJob(job.id, { is_active: newStatus });
      setJobs(jobs.map((j) => (j.id === job.id ? { ...j, is_active: newStatus } : j)));
      toast.success(`Job marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All attached applications will be removed.')) {
      return;
    }
    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
      toast.success('Job listing removed successfully');
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleUpdateJobSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      setIsUpdating(true);
      await jobService.updateJob(editingJob.id, {
        title: editingJob.title,
        department: editingJob.department,
        location: editingJob.location,
        min_salary: editingJob.min_salary,
        max_salary: editingJob.max_salary,
      });
      setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...editingJob } : j)));
      toast.success('Job details updated');
      setEditingJob(null);
    } catch (err) {
      toast.error('Failed to update job');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Openings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toggle status, inspect applicants, and update compensation for your published positions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/recruiter/post-job')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opening</span>
        </button>
      </div>

      {/* Jobs Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading published listings...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first vacancy to start receiving verified applicants.
          </p>
          <button
            onClick={() => onNavigate('/recruiter/post-job')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Job Post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Position & Department</th>
                  <th className="px-6 py-4">Workplace</th>
                  <th className="px-6 py-4">Compensation</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{job.department}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <div className="capitalize font-medium">{job.work_mode}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{job.location}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {job.max_salary
                        ? `$${(job.min_salary || 0).toLocaleString()} - $${job.max_salary.toLocaleString()}`
                        : 'Competitive'}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewJobApplicants(job.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applications_count || 0} applicants</span>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(job)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          Boolean(job.is_active)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {Boolean(job.is_active) ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingJob(job)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit position"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete position"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Job Details</h3>

            <form onSubmit={handleUpdateJobSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={editingJob.min_salary || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, min_salary: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={editingJob.max_salary || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, max_salary: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
