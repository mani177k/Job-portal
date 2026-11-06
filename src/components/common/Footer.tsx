import React from 'react';
import { Briefcase, Heart, Shield, Sparkles, Send } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Hire<span className="text-blue-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              HireHub is a modern full-stack recruitment platform connecting ambitious candidates with forward-thinking technology companies through real-time applicant tracking and transparent career workflows.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                Verified Employers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Zero Spam
              </span>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/jobs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Browse All Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/jobs?work_mode=remote')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Remote Tech Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/candidate/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Application Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/candidate/profile')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Resume Profile
                </button>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/recruiter/post-job')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Post a Job Opening
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/recruiter/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Recruitment Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/recruiter/manage-jobs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Applicant Pipeline
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/recruiter/company')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Company Branding
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About HireHub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} HireHub System. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for high-performing engineering teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
