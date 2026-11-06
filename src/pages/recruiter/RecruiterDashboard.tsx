import React, { useState, useEffect } from 'react';
import { recruiterService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Building,
  Loader2
} from 'lucide-react';

interface RecruiterDashboardProps {
  onNavigate: (path: string) => void;
  onSelectApplication?: (appId: number) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ 
  onNavigate,
  onSelectApplication 
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await recruiterService.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading recruiter metrics & analytics...</span>
      </div>
    );
  }

  const { stats, recent_applications = [], apps_by_job = [] } = data;

  const pieData = [
    { name: 'Shortlisted', value: stats.shortlisted || 0, color: '#6366f1' },
    { name: 'Interviews', value: stats.interviews || 0, color: '#0d9488' },
    { name: 'Offers / Selected', value: stats.selected || 0, color: '#10b981' },
    { name: 'Not Selected', value: stats.rejected || 0, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // Fallback demo chart data if fresh
  const chartJobData = apps_by_job.length > 0 ? apps_by_job : [
    { title: 'Full Stack Dev', applications: 4 },
    { title: 'Lead Architect', applications: 2 },
    { title: 'DevOps Eng', applications: 3 }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Recruiter Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Recruiter
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor applicant pipelines, evaluate resumes, and manage active vacancies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/recruiter/company')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Company Profile
          </button>
          <button
            onClick={() => onNavigate('/recruiter/post-job')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Jobs
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {stats.total_jobs}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.active_jobs} active now</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Applications
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {stats.total_applications}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total candidates</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Shortlisted
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
            {stats.shortlisted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for screening</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Interviews
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-1">
            {stats.interviews}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active rounds</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Offers / Selected
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats.selected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hires finalized</div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Applications per Job */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Applications by Job Opening</h3>
              <p className="text-xs text-slate-500">Applicant volume breakdown across active listings</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartJobData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  interval={0}
                  tickFormatter={(val) => val.length > 18 ? val.substring(0, 16) + '...' : val}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="applications" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Talent Funnel Health</h3>
            <p className="text-xs text-slate-500">Stage progression distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs text-center">
                Review applicants to populate pipeline status distribution.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Candidate Applications</h3>
            <p className="text-xs text-slate-500">Inspect latest applicants and take hiring actions</p>
          </div>
          <button
            onClick={() => onNavigate('/recruiter/applications')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            Open All Applications →
          </button>
        </div>

        {recent_applications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No applications received yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent_applications.map((app: any) => (
              <div
                key={app.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={app.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {app.first_name} {app.last_name}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Applied for: <span className="font-semibold text-slate-700">{app.job_title}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <StatusBadge status={app.status} size="sm" />
                  <button
                    onClick={() => onNavigate('/recruiter/applications')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
