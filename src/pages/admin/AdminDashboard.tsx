import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Building, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getDashboard();
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
        <span>Loading admin platform analytics...</span>
      </div>
    );
  }

  const { stats, recent_users = [], recent_jobs = [] } = data;

  const activityData = [
    { month: 'Jun', applications: 28, jobs: 12 },
    { month: 'Jul', applications: 45, jobs: 18 },
    { month: 'Aug', applications: 72, jobs: 24 },
    { month: 'Sep', applications: 98, jobs: 31 },
    { month: 'Oct', applications: 140, jobs: 42 },
    { month: 'Nov', applications: 184, jobs: 56 },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Platform Administration
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global governance over users, verified employers, job listings, and application compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/users')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Manage Users
          </button>
          <button
            onClick={() => onNavigate('/admin/jobs')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Moderate Jobs
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Candidates
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {stats.total_candidates}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Registered seekers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Recruiters
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
            {stats.total_recruiters}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.total_companies} companies</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Published Jobs
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {stats.total_jobs}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.active_jobs} active</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Applications
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-1">
            {stats.total_applications}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all pipelines</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Placement Rate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats.success_rate || '84.2%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Application response</div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Platform Activity & Volume Growth</h3>
          <p className="text-xs text-slate-500">Monthly job listings and candidate application trends</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Applications" />
              <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Jobs Posted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users & Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recently Registered Users</h3>
            <button
              onClick={() => onNavigate('/admin/users')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Manage all →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recent_users.map((u: any) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{u.first_name} {u.last_name}</div>
                  <div className="text-slate-400 text-[11px]">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                    u.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : u.role === 'recruiter' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recently Added Jobs</h3>
            <button
              onClick={() => onNavigate('/admin/jobs')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Moderate all →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recent_jobs.map((j: any) => (
              <div key={j.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{j.title}</div>
                  <div className="text-slate-400 text-[11px]">{j.company_name} • {j.location}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  j.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {j.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
