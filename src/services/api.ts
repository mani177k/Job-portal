import axios from 'axios';
import type { Job, Application, User, Resume, Company } from '../types';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hirehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected route, clean token
      if (window.location.pathname.startsWith('/candidate') || 
          window.location.pathname.startsWith('/recruiter') || 
          window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('hirehub_token');
        localStorage.removeItem('hirehub_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const jobService = {
  getJobs: (params?: Record<string, string | number | undefined>) =>
    api.get<Job[]>('/jobs', { params }).then((res) => res.data),
  getJobById: (id: number | string) =>
    api.get<Job>(`/jobs/${id}`).then((res) => res.data),
  saveJob: (id: number | string) =>
    api.post<{ saved: boolean; message: string }>(`/jobs/${id}/save`).then((res) => res.data),
  getSavedJobs: () =>
    api.get<Job[]>('/jobs/saved').then((res) => res.data),
  createJob: (data: Partial<Job>) =>
    api.post<{ id: number; message: string }>('/jobs', data).then((res) => res.data),
  updateJob: (id: number | string, data: Partial<Job>) =>
    api.put<{ message: string }>(`/jobs/${id}`, data).then((res) => res.data),
  deleteJob: (id: number | string) =>
    api.delete<{ message: string }>(`/jobs/${id}`).then((res) => res.data),
};

export const applicationService = {
  apply: (data: { job_id: number; resume_id?: number; cover_letter?: string }) =>
    api.post<{ id: number; message: string; status: string }>('/applications', data).then((res) => res.data),
  getMyApplications: () =>
    api.get<Application[]>('/applications/my-applications').then((res) => res.data),
  getApplicationById: (id: number | string) =>
    api.get<Application>(`/applications/${id}`).then((res) => res.data),
  updateStatus: (id: number | string, data: { status: string; recruiter_notes?: string; interview_date?: string; interview_link?: string }) =>
    api.put<{ message: string; status: string }>(`/applications/${id}/status`, data).then((res) => res.data),
  withdraw: (id: number | string) =>
    api.delete<{ message: string }>(`/applications/${id}/withdraw`).then((res) => res.data),
};

export const candidateService = {
  getProfile: () =>
    api.get<{ user: User; profile: any }>('/candidates/profile').then((res) => res.data),
  updateProfile: (data: any) =>
    api.put<{ message: string }>('/candidates/profile', data).then((res) => res.data),
  getResumes: () =>
    api.get<Resume[]>('/candidates/resumes').then((res) => res.data),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post<Resume>('/candidates/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  deleteResume: (id: number | string) =>
    api.delete<{ message: string }>(`/candidates/resumes/${id}`).then((res) => res.data),
};

export const recruiterService = {
  getDashboard: () =>
    api.get<any>('/recruiter/dashboard').then((res) => res.data),
  getMyJobs: () =>
    api.get<Job[]>('/recruiter/jobs').then((res) => res.data),
  getJobApplications: (jobId: number | string, params?: { status?: string; search?: string }) =>
    api.get<Application[]>(`/recruiter/jobs/${jobId}/applications`, { params }).then((res) => res.data),
  getCompany: () =>
    api.get<Company>('/recruiter/company').then((res) => res.data),
  updateCompany: (data: Partial<Company>) =>
    api.put<Company>('/recruiter/company', data).then((res) => res.data),
};

export const adminService = {
  getDashboard: () =>
    api.get<any>('/admin/dashboard').then((res) => res.data),
  getUsers: (params?: { role?: string; search?: string }) =>
    api.get<User[]>('/admin/users', { params }).then((res) => res.data),
  toggleUserStatus: (id: number, is_active: boolean) =>
    api.put<{ message: string }>(`/admin/users/${id}/status`, { is_active }).then((res) => res.data),
  getJobs: () =>
    api.get<Job[]>('/admin/jobs').then((res) => res.data),
  toggleJobStatus: (id: number, data: { is_active?: boolean; is_featured?: boolean }) =>
    api.put<{ message: string }>(`/admin/jobs/${id}/status`, data).then((res) => res.data),
  getApplications: () =>
    api.get<any[]>('/admin/applications').then((res) => res.data),
};
