import React from 'react';
import { 
  Briefcase, 
  Target, 
  Users, 
  ShieldCheck, 
  Globe2, 
  Zap, 
  Award,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Connecting World-Class Talent With Future-Defining Companies
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            HireHub was founded with a straightforward conviction: the tech recruitment experience should be transparent, respectful, and direct. We replace applicant black holes with real-time tracking and verified hiring intelligence.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Total Transparency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every job opening includes verified compensation bands, clear requirements, and active hiring contact ownership.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">End-to-End Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never wonder where your submission stands. Candidates receive timestamped notifications through review, screen, interview, and decision milestones.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Employers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We vet companies before they can post, ensuring real engineering teams, legitimate budgets, and spam-free communication.
            </p>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Platform Leadership</h2>
            <p className="text-xs text-slate-500 mt-1">
              Built by veterans from high-scale developer tools and modern talent platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Elena Rostova',
                role: 'Chief Executive Officer',
                bio: 'Former VP of Product at CloudScale. Passionate about engineering career mobility.',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
              },
              {
                name: 'David Miller',
                role: 'Head of Engineering & Security',
                bio: '15+ years architecting distributed systems and secure identity platforms.',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
              },
              {
                name: 'Marcus Vance',
                role: 'Head of Talent Partnerships',
                bio: 'Advised over 200 tech startups on engineering hiring frameworks.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
              }
            ].map((leader) => (
              <div key={leader.name} className="text-center space-y-3">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-24 h-24 rounded-2xl mx-auto object-cover border-2 border-slate-100 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{leader.name}</h4>
                  <div className="text-xs text-blue-600 font-semibold">{leader.role}</div>
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to take the next step in your career?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Create your profile in 2 minutes and browse verified tech opportunities today.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/jobs')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
            >
              <span>Explore Active Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
