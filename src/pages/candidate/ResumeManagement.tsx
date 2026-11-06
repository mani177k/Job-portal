import React, { useState, useEffect } from 'react';
import type { Resume } from '../../types';
import { candidateService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const ResumeManagement: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getResumes();
      setResumes(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
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
      setResumes([newResume, ...resumes.map((r) => ({ ...r, is_default: 0 }))]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this resume from your account?')) return;
    try {
      await candidateService.deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
      toast.success('Resume deleted successfully');
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Resume Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and manage formatted CV documents used during 1-click job submissions.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Upload New Resume</h3>
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800">
            {isUploading ? 'Uploading document...' : 'Click to upload or drag & drop'}
          </div>
          <div className="text-[11px] text-slate-400">
            Supported formats: PDF, DOC, DOCX (Max size: 10MB)
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Resumes List */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Your Resumes on File ({resumes.length})</h3>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No resumes on file. Please upload a resume above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {resume.file_name}
                      </span>
                      {Boolean(resume.is_default) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Default
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatFileSize(resume.file_size)} • Uploaded{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={resume.file_path}
                    download={resume.file_name}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
