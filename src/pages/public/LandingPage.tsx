import React, { useState, useEffect } from 'react';
import type { Job } from '../../types';
import { jobService } from '../../services/api';
import { JobCard } from '../../components/common/JobCard';
import { ApplyModal } from '../../components/common/ApplyModal';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Code2,
  Palette,
  Megaphone,
  BarChart,
  ShieldCheck,
  Server,
  Zap,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSelectJob: (job: Job) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectJob }) => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [howItWorksTab, setHowItWorksTab] = useState<'seekers' | 'employers'>('seekers');
  const [selectedApplyJob, setSelectedApplyJob] = useState<Job | null>(null);

  useEffect(() => {
    jobService.getJobs({ sort_by: 'featured' })
      .then((jobs) => setFeaturedJobs(jobs.slice(0, 6)))
      .catch((err) => console.error(err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set('search', searchKeyword);
    if (searchLocation) params.set('location', searchLocation);
    onNavigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    { name: 'Software Engineering', count: '1,420+ Jobs', icon: Code2, color: 'text-blue-600 bg-blue-50' },
    { name: 'Product & Design', count: '680+ Jobs', icon: Palette, color: 'text-purple-600 bg-purple-50' },
    { name: 'Cloud & DevOps', count: '540+ Jobs', icon: Server, color: 'text-teal-600 bg-teal-50' },
    { name: 'Data Science & AI', count: '490+ Jobs', icon: BarChart, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Growth & Marketing', count: '310+ Jobs', icon: Megaphone, color: 'text-rose-600 bg-rose-50' },
    { name: 'Product Management', count: '275+ Jobs', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  ];

  const topCompanies = [
    {
      name: 'TechNova Solutions',
      industry: 'Enterprise Cloud & AI',
      jobsCount: '8 open roles',
      rating: '4.9 ★',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'CloudScale Systems',
      industry: 'Infrastructure & Edge',
      jobsCount: '12 open roles',
      rating: '4.8 ★',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'NexaHealth AI',
      industry: 'Biotech & HealthTech',
      jobsCount: '5 open roles',
      rating: '4.9 ★',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Finova Capital',
      industry: 'Global FinTech',
      jobsCount: '6 open roles',
      rating: '4.7 ★',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Career Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Next Opportunity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Build Your Future.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified roles at high-growth tech companies. Apply directly with real-time status tracking from submission to offer.
          </p>

          {/* Job Search Component */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-200/20 flex flex-col sm:flex-row items-center gap-2 text-slate-800"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Job title, skill (e.g. React, Python), or company"
                className="w-full text-sm outline-none placeholder:text-slate-400 bg-transparent"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="City, State, or 'Remote'"
                className="w-full text-sm outline-none placeholder:text-slate-400 bg-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Trending Searches */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Popular:</span>
            {['React Engineer', 'Remote Backend', 'FastAPI', 'UI/UX Design', 'DevOps', 'San Francisco'].map((term) => (
              <button
                key={term}
                onClick={() => onNavigate(`/jobs?search=${encodeURIComponent(term)}`)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Platform Stats */}
      <section className="-mt-12 relative z-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">25,000+</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Active Candidates
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">1,850+</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Hiring Companies
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">4,200+</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Verified Openings
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">94.8%</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Response Rate
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Handpicked Roles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Job Openings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified tech positions with transparent salaries and active hiring teams.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onApplyClick={(j) => setSelectedApplyJob(j)}
            />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Specialized Fields
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore Opportunities by Category
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Find openings aligned with your domain expertise and career aspirations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  onClick={() => onNavigate(`/jobs?search=${encodeURIComponent(cat.name)}`)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">{cat.count}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Streamlined Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How HireHub Works
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            A transparent platform engineered to eliminate recruitment black holes.
          </p>

          {/* Switcher Tab */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 mt-6">
            <button
              onClick={() => setHowItWorksTab('seekers')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                howItWorksTab === 'seekers'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Job Seekers
            </button>
            <button
              onClick={() => setHowItWorksTab('employers')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                howItWorksTab === 'employers'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Employers & Recruiters
            </button>
          </div>
        </div>

        {howItWorksTab === 'seekers' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Build Your Verified Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add skills, experience, education, portfolio links, and upload resumes ready for 1-click submission.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Apply to Curated Roles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by salary band, remote flexibility, tech stack, and experience level without misleading postings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Track In Real-Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch your application move through Under Review, Shortlisted, Interview Scheduled, and Offer stages.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Publish Targeted Openings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set required skills, salary benchmarks, application deadlines, and specify on-site or remote arrangements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Evaluate Candidates Fast</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter applications by experience and skills, review complete profiles, and download formatted resumes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Schedule & Hire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly transition applicants to interviews with date & meeting link integrations and recruiter notes.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Top Hiring Companies */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Industry Leaders
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Top Hiring Companies on HireHub
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/jobs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Browse all partner companies →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCompanies.map((c) => (
              <div
                key={c.name}
                onClick={() => onNavigate(`/jobs?search=${encodeURIComponent(c.name)}`)}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group bg-slate-50/50"
              >
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-14 h-14 rounded-xl object-cover mb-4 border border-slate-200/80 bg-white"
                />
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h4>
                <div className="text-xs text-slate-500 mt-0.5">{c.industry}</div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600">{c.jobsCount}</span>
                  <span className="text-amber-600 font-medium">{c.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate CTA */}
            <div className="bg-gradient-to-br from-blue-900/60 to-slate-800/80 p-8 rounded-3xl border border-blue-500/20 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Looking to Accelerate Your Career?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Join thousands of developers, designers, and tech professionals finding high-impact roles with real-time feedback.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/register?role=candidate')}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>Create Candidate Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recruiter CTA */}
            <div className="bg-gradient-to-br from-indigo-900/60 to-slate-800/80 p-8 rounded-3xl border border-indigo-500/20 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Hiring High-Caliber Talent?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Publish openings in minutes, manage applicant pipelines with stages, and schedule interviews seamlessly.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/register?role=recruiter')}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>Register as Recruiter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      <ApplyModal
        job={selectedApplyJob}
        isOpen={Boolean(selectedApplyJob)}
        onClose={() => setSelectedApplyJob(null)}
        onSuccess={() => {
          if (selectedApplyJob) {
            setFeaturedJobs((prev) =>
              prev.map((j) => (j.id === selectedApplyJob.id ? { ...j, has_applied: true } : j))
            );
          }
        }}
      />
    </div>
  );
};
