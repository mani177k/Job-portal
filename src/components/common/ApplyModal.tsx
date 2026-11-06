import React, { useState, useEffect } from 'react';
import type { Job, Resume } from '../../types';
import { candidateService, applicationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadResumes();
    }
  }, [isOpen]);

  const loadResumes = async () => {
    try {
      const data = await candidateService.getResumes();
      setResumes(data);
      const def = data.find((r) => r.is_default);
      if (def) {
        setSelectedResumeId(def.id);
      } else if (data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error('Please upload a PDF or DOC/DOCX document');
      return;
    }

    try {
      setIsUploading(true);
      const newResume = await candidateService.uploadResume(file);
      toast.success('Resume uploaded successfully!');
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResumeId(newResume.id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!selectedResumeId && resumes.length === 0) {
      toast.error('Please select or upload a resume to submit your application');
      return;
    }

    try {
      setIsSubmitting(true);
      await applicationService.apply({
        job_id: job.id,
        resume_id: selectedResumeId || undefined,
        cover_letter: coverLetter,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      toast.success('Application submitted successfully! Track your status anytime.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Apply for position
            </span>
            <h3 className="text-lg font-bold mt-0.5">{job.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {job.company.name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              {job.max_salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${(job.min_salary || 0).toLocaleString()} - ${job.max_salary.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Resume Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Resume <span className="text-rose-500">*</span>
            </label>

            {resumes.length > 0 ? (
              <div className="space-y-2 mb-3">
                {resumes.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedResumeId === r.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resume"
                        value={r.id}
                        checked={selectedResumeId === r.id}
                        onChange={() => setSelectedResumeId(r.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{r.file_name}</div>
                        <div className="text-[11px] text-slate-500">
                          Uploaded {new Date(r.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {Boolean(r.is_default) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mb-3">
                No resumes currently on file. Upload one below to proceed.
              </div>
            )}

            {/* Quick Upload Button */}
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">
                {isUploading ? 'Uploading document...' : 'Upload a new resume (PDF, DOC)'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Cover Letter / Note to Recruiter
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight relevant experience, why you're interested in this role, or links to key projects..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
