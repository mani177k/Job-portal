import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import type { Job } from './types';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/common/Sidebar';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { JobListingsPage } from './pages/public/JobListingsPage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Candidate Dashboard Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateProfile } from './pages/candidate/CandidateProfile';
import { MyApplications } from './pages/candidate/MyApplications';
import { ApplicationTracking } from './pages/candidate/ApplicationTracking';
import { SavedJobs } from './pages/candidate/SavedJobs';
import { ResumeManagement } from './pages/candidate/ResumeManagement';
import { CandidateSettings } from './pages/candidate/CandidateSettings';

// Recruiter Dashboard Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { CompanyProfile } from './pages/recruiter/CompanyProfile';
import { PostJob } from './pages/recruiter/PostJob';
import { ManageJobs } from './pages/recruiter/ManageJobs';
import { ViewApplications } from './pages/recruiter/ViewApplications';
import { RecruiterSettings } from './pages/recruiter/RecruiterSettings';

// Admin Dashboard Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { JobManagement } from './pages/admin/JobManagement';
import { ApplicationManagement } from './pages/admin/ApplicationManagement';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';

function MainApp() {
  const { user, role, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recruiterJobFilterId, setRecruiterJobFilterId] = useState<number | undefined>(undefined);

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    navigate(`/jobs/${job.id}`);
  };

  const isDashboardView =
    currentPath.startsWith('/candidate') ||
    currentPath.startsWith('/recruiter') ||
    currentPath.startsWith('/admin');

  const renderContent = () => {
    // 1. Job details dynamic route: /jobs/:id
    if (currentPath.startsWith('/jobs/') && currentPath !== '/jobs') {
      const parts = currentPath.split('/');
      const jobId = parts[2];
      return (
        <JobDetailsPage
          jobId={jobId}
          onBack={() => navigate('/jobs')}
          onSelectRelatedJob={handleSelectJob}
          onNavigateToCandidateDashboard={() => navigate('/candidate/dashboard')}
        />
      );
    }

    // 2. Public Routes
    switch (currentPath) {
      case '/':
        return <LandingPage onNavigate={navigate} onSelectJob={handleSelectJob} />;
      case '/jobs':
        return (
          <JobListingsPage
            onNavigate={navigate}
            onSelectJob={handleSelectJob}
          />
        );
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/register':
        return <RegisterPage onNavigate={navigate} />;

      // 3. Candidate Routes
      case '/candidate/dashboard':
        return <CandidateDashboard onNavigate={navigate} onSelectJob={handleSelectJob} />;
      case '/candidate/profile':
        return <CandidateProfile />;
      case '/candidate/applications':
        return <MyApplications onNavigateToTracking={() => navigate('/candidate/tracking')} />;
      case '/candidate/tracking':
        return <ApplicationTracking />;
      case '/candidate/saved-jobs':
        return <SavedJobs onSelectJob={handleSelectJob} onNavigate={navigate} />;
      case '/candidate/resumes':
        return <ResumeManagement />;
      case '/candidate/settings':
        return <CandidateSettings />;

      // 4. Recruiter Routes
      case '/recruiter/dashboard':
        return (
          <RecruiterDashboard
            onNavigate={navigate}
            onSelectApplication={() => navigate('/recruiter/applications')}
          />
        );
      case '/recruiter/post-job':
        return <PostJob onNavigate={navigate} />;
      case '/recruiter/manage-jobs':
        return (
          <ManageJobs
            onNavigate={navigate}
            onViewJobApplicants={(jobId) => {
              setRecruiterJobFilterId(jobId);
              navigate('/recruiter/applications');
            }}
          />
        );
      case '/recruiter/applications':
        return <ViewApplications initialJobId={recruiterJobFilterId} />;
      case '/recruiter/company':
        return <CompanyProfile />;
      case '/recruiter/settings':
        return <RecruiterSettings />;

      // 5. Admin Routes
      case '/admin/dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case '/admin/users':
        return <UserManagement />;
      case '/admin/jobs':
        return <JobManagement />;
      case '/admin/applications':
        return <ApplicationManagement />;
      case '/admin/reports':
        return <ReportsAnalytics />;

      default:
        return <LandingPage onNavigate={navigate} onSelectJob={handleSelectJob} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {isDashboardView && user ? (
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar currentPath={currentPath} onNavigate={navigate} />
          <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
            {renderContent()}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {renderContent()}
        </main>
      )}

      {!isDashboardView && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
