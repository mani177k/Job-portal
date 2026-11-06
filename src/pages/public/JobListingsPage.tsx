import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { jobService } from '../../services/api';
import { JobCard } from '../../components/common/JobCard';
import { ApplyModal } from '../../components/common/ApplyModal';
import { 
  Search, 
  MapPin, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  Loader2 
} from 'lucide-react';

interface JobListingsPageProps {
  initialSearch?: string;
  initialLocation?: string;
  onNavigate: (path: string) => void;
  onSelectJob: (job: Job) => void;
}

export const JobListingsPage: React.FC<JobListingsPageProps> = ({
  initialSearch = '',
  initialLocation = '',
  onNavigate,
  onSelectJob,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplyJob, setSelectedApplyJob] = useState<Job | null>(null);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [employmentType, setEmploymentType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [workMode, setWorkMode] = useState('all');
  const [minSalary, setMinSalary] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('latest');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobService.getJobs({
        search: search || undefined,
        location: location || undefined,
        employment_type: employmentType !== 'all' ? employmentType : undefined,
        experience_level: experienceLevel !== 'all' ? experienceLevel : undefined,
        work_mode: workMode !== 'all' ? workMode : undefined,
        min_salary: minSalary !== '' ? minSalary : undefined,
        sort_by: sortBy,
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employmentType, experienceLevel, workMode, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setEmploymentType('all');
    setExperienceLevel('all');
    setWorkMode('all');
    setMinSalary('');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Open Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse through hundreds of actively recruiting tech roles with transparent salary bands.
          </p>
        </div>

        {/* Top Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-3 mb-8"
        >
          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, keywords, or company..."
              className="w-full text-xs sm:text-sm outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 w-full">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. San Francisco, Remote)"
              className="w-full text-xs sm:text-sm outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Layout: Sidebar Filters + Main Job Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Filter Roles</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Work Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Workplace Type
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All Modes' },
                    { id: 'remote', label: 'Remote Only' },
                    { id: 'hybrid', label: 'Hybrid' },
                    { id: 'onsite', label: 'On-site' },
                  ].map((mode) => (
                    <label key={mode.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="work_mode"
                        checked={workMode === mode.id}
                        onChange={() => setWorkMode(mode.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={workMode === mode.id ? 'font-semibold text-blue-900' : 'text-slate-600'}>
                        {mode.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Employment Type
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'full-time', label: 'Full-time' },
                    { id: 'part-time', label: 'Part-time' },
                    { id: 'contract', label: 'Contract' },
                    { id: 'internship', label: 'Internship' },
                  ].map((type) => (
                    <label key={type.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="emp_type"
                        checked={employmentType === type.id}
                        onChange={() => setEmploymentType(type.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={employmentType === type.id ? 'font-semibold text-blue-900' : 'text-slate-600'}>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Experience Level
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'Any Experience' },
                    { id: 'entry', label: 'Entry Level (0-2 yrs)' },
                    { id: 'mid', label: 'Mid-Level (2-5 yrs)' },
                    { id: 'senior', label: 'Senior (5+ yrs)' },
                    { id: 'lead', label: 'Lead / Principal' },
                  ].map((lvl) => (
                    <label key={lvl.id} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="exp_lvl"
                        checked={experienceLevel === lvl.id}
                        onChange={() => setExperienceLevel(lvl.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={experienceLevel === lvl.id ? 'font-semibold text-blue-900' : 'text-slate-600'}>
                        {lvl.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Salary Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Minimum Base Salary (USD)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10000"
                    placeholder="e.g. 100000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={fetchJobs}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Job Results Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results count & sorting */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{jobs.length}</span> positions available
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
                >
                  <option value="latest">Latest Published</option>
                  <option value="featured">Featured First</option>
                  <option value="salary_high">Highest Salary</option>
                </select>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs">Fetching job openings...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No positions match your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting keywords, clearing salary minimums, or setting work mode to "All Modes".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={onSelectJob}
                    onApplyClick={(j) => setSelectedApplyJob(j)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={selectedApplyJob}
        isOpen={Boolean(selectedApplyJob)}
        onClose={() => setSelectedApplyJob(null)}
        onSuccess={() => {
          if (selectedApplyJob) {
            setJobs((prev) =>
              prev.map((j) => (j.id === selectedApplyJob.id ? { ...j, has_applied: true } : j))
            );
          }
        }}
      />
    </div>
  );
};
