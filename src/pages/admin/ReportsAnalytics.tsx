import React from 'react';
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
import { BarChart3, TrendingUp, Users, CheckCircle2, Award, Globe2 } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const skillDemandData = [
    { skill: 'React / Next.js', demand: 88 },
    { skill: 'TypeScript', demand: 84 },
    { skill: 'Python / FastAPI', demand: 76 },
    { skill: 'Docker & Kubernetes', demand: 68 },
    { skill: 'SQL & PostgreSQL', demand: 62 },
    { skill: 'AWS Cloud', demand: 59 },
    { skill: 'UI/UX & Figma', demand: 48 },
  ];

  const roleDistribution = [
    { name: 'Engineering', value: 45, color: '#2563eb' },
    { name: 'Product & Design', value: 20, color: '#6366f1' },
    { name: 'Data & AI', value: 18, color: '#0d9488' },
    { name: 'DevOps & Cloud', value: 12, color: '#10b981' },
    { name: 'Sales & Growth', value: 5, color: '#f59e0b' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reports & Platform Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hiring velocity, skill demand metrics, and sector distribution.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Time-to-Offer
          </div>
          <div className="text-3xl font-extrabold text-slate-900">14.2 Days</div>
          <div className="text-xs text-emerald-600 font-medium">38% faster than industry average</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Candidate Response Rate
          </div>
          <div className="text-3xl font-extrabold text-blue-600">92.6%</div>
          <div className="text-xs text-slate-400">Recruiters providing stage feedback</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Remote Role Ratio
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">68.4%</div>
          <div className="text-xs text-slate-400">Flexible workplace availability</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top In-Demand Skills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Highest In-Demand Tech Skills</h3>
            <p className="text-xs text-slate-500">Frequency of technical tags requested in active postings</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={skillDemandData}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="demand" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Job Listings by Sector</h3>
            <p className="text-xs text-slate-500">Distribution across tech disciplines</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
