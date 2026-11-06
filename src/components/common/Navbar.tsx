import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown, 
  Menu, 
  X, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Building,
  FileCheck2,
  Bookmark
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, role, logout, quickLogin } = useAuth();
  const toast = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out');
    onNavigate('/');
    setIsUserMenuOpen(false);
  };

  const handleQuickSwitch = async (targetRole: 'candidate' | 'recruiter' | 'admin') => {
    try {
      await quickLogin(targetRole);
      toast.success(`Switched to demo ${targetRole} account!`);
      setIsDemoMenuOpen(false);
      setIsMobileMenuOpen(false);

      if (targetRole === 'candidate') onNavigate('/candidate/dashboard');
      else if (targetRole === 'recruiter') onNavigate('/recruiter/dashboard');
      else if (targetRole === 'admin') onNavigate('/admin/dashboard');
    } catch (err) {
      toast.error('Quick switch failed');
    }
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'recruiter') return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                  Hire<span className="text-blue-600">Hub</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                  Job Portal
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => onNavigate('/jobs')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentPath.startsWith('/jobs')
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                Find Jobs
              </button>
              <button
                onClick={() => onNavigate('/about')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/about'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/contact'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                Contact
              </button>
            </div>
          </div>

          {/* Right Section: Actions & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Quickly test any role without manual credentials"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {isDemoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('candidate')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold">Candidate: Alex Chen</div>
                      <div className="text-[10px] text-slate-400">Software Engineer Profile</div>
                    </div>
                    <User className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('recruiter')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold">Recruiter: Sarah (TechNova)</div>
                      <div className="text-[10px] text-slate-400">Post Jobs & Review CVs</div>
                    </div>
                    <Building className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 text-slate-700 hover:text-blue-700 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold">Admin: David Miller</div>
                      <div className="text-[10px] text-slate-400">Full System Oversight</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard Shortcut */}
                <button
                  onClick={() => onNavigate(getDashboardPath())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {role === 'admin' ? 'Admin Panel' : role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
                  </span>
                </button>

                {/* Recruiter Quick Post Job button */}
                {role === 'recruiter' && (
                  <button
                    onClick={() => onNavigate('/recruiter/post-job')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Job</span>
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.first_name}
                      className="w-7 h-7 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 capitalize">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate(getDashboardPath());
                        }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </button>

                      {role === 'candidate' && (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('/candidate/profile');
                            }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('/candidate/applications');
                            }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <FileCheck2 className="w-4 h-4 text-slate-400" />
                            My Applications
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('/candidate/saved-jobs');
                            }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <Bookmark className="w-4 h-4 text-slate-400" />
                            Saved Jobs
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
              className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onNavigate('/jobs');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-slate-100"
            >
              Find Jobs
            </button>
            <button
              onClick={() => {
                onNavigate('/about');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-slate-100"
            >
              About Us
            </button>
            <button
              onClick={() => {
                onNavigate('/contact');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-slate-100"
            >
              Contact
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.first_name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.first_name} {user.last_name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onNavigate(getDashboardPath());
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold rounded-lg border border-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold rounded-lg bg-blue-600 text-white"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
