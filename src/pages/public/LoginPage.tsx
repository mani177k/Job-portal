import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  User, 
  Building2, 
  ShieldCheck,
  Loader2 
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLogin } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast.success('Signed in successfully!');
      onNavigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'candidate' | 'recruiter' | 'admin') => {
    try {
      setIsLoading(true);
      await quickLogin(role);
      toast.success(`Logged in as Demo ${role.toUpperCase()}!`);
      if (role === 'candidate') onNavigate('/candidate/dashboard');
      else if (role === 'recruiter') onNavigate('/recruiter/dashboard');
      else if (role === 'admin') onNavigate('/admin/dashboard');
    } catch (err) {
      toast.error('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md mb-2">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back to HireHub
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your jobs, applications, and applicant pipeline.
          </p>
        </div>

        {/* Demo Fast Login Cards */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Demo Logins (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('candidate')}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white border border-amber-200/90 hover:border-amber-400 hover:bg-amber-50 transition-all text-center cursor-pointer shadow-2xs"
            >
              <User className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Candidate</div>
              <div className="text-[10px] text-slate-400">Alex Chen</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('recruiter')}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white border border-amber-200/90 hover:border-amber-400 hover:bg-amber-50 transition-all text-center cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Recruiter</div>
              <div className="text-[10px] text-slate-400">Sarah (TechNova)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white border border-amber-200/90 hover:border-amber-400 hover:bg-amber-50 transition-all text-center cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Admin</div>
              <div className="text-[10px] text-slate-400">David Miller</div>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
