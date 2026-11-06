import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Bookmark, 
  Settings, 
  Briefcase, 
  Building, 
  PlusCircle, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Activity,
  Layers,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user, role, logout } = useAuth();

  let navItems: Array<{ path: string; label: string; icon: React.FC<{ className?: string }> }> = [];

  if (role === 'candidate') {
    navItems = [
      { path: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/candidate/profile', label: 'My Profile', icon: User },
      { path: '/candidate/applications', label: 'My Applications', icon: FileText },
      { path: '/candidate/tracking', label: 'Application Tracking', icon: Activity },
      { path: '/candidate/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
      { path: '/candidate/resumes', label: 'Resume Management', icon: Layers },
      { path: '/candidate/settings', label: 'Account Settings', icon: Settings },
    ];
  } else if (role === 'recruiter') {
    navItems = [
      { path: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/recruiter/post-job', label: 'Post a Job', icon: PlusCircle },
      { path: '/recruiter/manage-jobs', label: 'Manage Jobs', icon: Briefcase },
      { path: '/recruiter/applications', label: 'View Applications', icon: Users },
      { path: '/recruiter/company', label: 'Company Profile', icon: Building },
      { path: '/recruiter/settings', label: 'Recruiter Settings', icon: Settings },
    ];
  } else if (role === 'admin') {
    navItems = [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'User Management', icon: Users },
      { path: '/admin/jobs', label: 'Job Moderation', icon: Briefcase },
      { path: '/admin/applications', label: 'Applications Ledger', icon: FileText },
      { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ];
  }

  const roleTitle = {
    candidate: 'Candidate Portal',
    recruiter: 'Recruiter Studio',
    admin: 'Platform Admin',
  }[role || 'candidate'];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Top Sidebar Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
          {roleTitle}
        </div>
        <div className="text-sm font-semibold text-white truncate mt-0.5">
          {user?.first_name} {user?.last_name}
        </div>
        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          );
        })}
      </nav>

      {/* Public Browse Link & Sign out */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onNavigate('/jobs')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Briefcase className="w-4 h-4" />
          <span>Public Job Board</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
