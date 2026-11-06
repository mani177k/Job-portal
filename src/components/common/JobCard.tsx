import React, { useState } from 'react';
import type { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/api';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onApplyClick?: (job: Job) => void;
  featuredBorder?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  onApplyClick,
  featuredBorder = false,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isSaved, setIsSaved] = useState(Boolean(job.is_saved));
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please log in as a candidate to save jobs');
      return;
    }
    if (user.role !== 'candidate') {
      toast.info('Job saving is available for candidates');
      return;
    }

    try {
      setIsSaving(true);
      const res = await jobService.saveJob(job.id);
      setIsSaved(res.saved);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedSalary = job.max_salary
    ? `$${(job.min_salary || 0).toLocaleString()} - $${job.max_salary.toLocaleString()}`
    : 'Competitive Salary';

  return (
    <div
      onClick={() => onSelect(job)}
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between ${
        featuredBorder || job.is_featured
          ? 'border-blue-200/90 ring-1 ring-blue-500/10 hover:border-blue-400'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <img
              src={job.company.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80'}
              alt={job.company.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0 bg-slate-50"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 hover:text-blue-600">
                  {job.company.name}
                </span>
                {job.is_featured ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wide">
                    Featured
                  </span>
                ) : null}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5">
                {job.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
          </button>
        </div>

        {/* Location & Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 font-medium capitalize bg-slate-100/80 px-2.5 py-1 rounded-lg text-slate-700">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            {job.work_mode}
          </span>
          <span className="inline-flex items-center gap-1 font-medium capitalize bg-slate-100/80 px-2.5 py-1 rounded-lg text-slate-700">
            {job.employment_type}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
            {job.skills.slice(0, 4).map((skill: any, idx: number) => {
              const name = typeof skill === 'string' ? skill : skill.name;
              return (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/70"
                >
                  {name}
                </span>
              );
            })}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Salary & Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
          <DollarSign className="w-4 h-4 text-emerald-600 -mr-0.5" />
          <span>{formattedSalary}</span>
        </div>

        <div className="flex items-center gap-2">
          {job.has_applied ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onApplyClick) onApplyClick(job);
                else onSelect(job);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              Apply Now
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
