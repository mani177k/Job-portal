export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: number | boolean;
  is_verified?: number | boolean;
  created_at?: string;
  profile?: CandidateProfileData;
  recruiter_profile?: RecruiterProfileData;
}

export interface CandidateProfileData {
  id?: number;
  headline?: string;
  bio?: string;
  experience_years?: number;
  current_location?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  expected_salary?: number;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    period: string;
    description: string;
  }>;
}

export interface RecruiterProfileData {
  id?: number;
  company_id?: number;
  designation?: string;
  department?: string;
  company_name?: string;
  company_logo?: string;
  company_industry?: string;
}

export interface Company {
  id: number;
  name: string;
  slug?: string;
  logo_url?: string;
  website?: string;
  industry: string;
  company_size?: string;
  location: string;
  about_text?: string;
  verified?: number | boolean;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface Job {
  id: number;
  recruiter_id: number;
  company_id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  location: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  is_active: number | boolean;
  is_featured: number | boolean;
  application_deadline?: string;
  created_at: string;
  updated_at?: string;
  company: Company;
  skills: Skill[] | string[];
  applications_count?: number;
  has_applied?: boolean;
  is_saved?: boolean;
  application?: Application;
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'selected'
  | 'rejected';

export interface ApplicationHistoryItem {
  id: number;
  application_id: number;
  changed_by_user_id: number;
  previous_status?: string | null;
  new_status: ApplicationStatus;
  notes?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface Resume {
  id: number;
  candidate_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  is_default: number | boolean;
  uploaded_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  resume_id?: number;
  cover_letter?: string;
  status: ApplicationStatus;
  interview_date?: string | null;
  interview_link?: string | null;
  recruiter_notes?: string | null;
  created_at: string;
  updated_at?: string;
  job?: Job;
  candidate?: User;
  resume?: Resume | { file_name: string; file_path: string };
  history?: ApplicationHistoryItem[];
  // Flattened candidate details from recruiter endpoint
  candidate_first_name?: string;
  candidate_last_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_avatar?: string;
  candidate_headline?: string;
  experience_years?: number;
  resume_file_name?: string;
  resume_file_path?: string;
}
