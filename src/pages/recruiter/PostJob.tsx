import React, { useState } from 'react';
import { jobService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Code, 
  CheckCircle2, 
  PlusCircle, 
  Save, 
  Loader2 
} from 'lucide-react';

interface PostJobProps {
  onNavigate: (path: string) => void;
}

export const PostJob: React.FC<PostJobProps> = ({ onNavigate }) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (or Remote)');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'part-time' | 'contract' | 'internship'>('full-time');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'lead' | 'executive'>('mid');
  const [minSalary, setMinSalary] = useState<number | ''>(120000);
  const [maxSalary, setMaxSalary] = useState<number | ''>(160000);
  const [isFeatured, setIsFeatured] = useState(false);
  const [deadline, setDeadline] = useState('');

  const [description, setDescription] = useState(
    'We are looking for a talented software engineer to join our fast-paced product engineering team. You will be building resilient cloud features and collaborating with cross-functional stakeholders.'
  );
  const [requirements, setRequirements] = useState(
    '• 3+ years experience with modern JavaScript/TypeScript and frameworks\n• Solid background in relational database design and API architecture\n• Experience with testing suites, CI/CD, and Git workflow'
  );
  const [responsibilities, setResponsibilities] = useState(
    '• Ship clean, tested, and reliable production code\n• Participate in code reviews and architectural planning sessions\n• Collaborate with UX/UI designers and product managers'
  );

  // Skills
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'SQL']);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !department || !location || !description || !requirements) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await jobService.createJob({
        title,
        department,
        location,
        work_mode: workMode,
        employment_type: employmentType,
        experience_level: experienceLevel,
        min_salary: minSalary !== '' ? Number(minSalary) : undefined,
        max_salary: maxSalary !== '' ? Number(maxSalary) : undefined,
        currency: 'USD',
        is_featured: isFeatured ? 1 : 0,
        application_deadline: deadline || undefined,
        description,
        requirements,
        responsibilities,
        skills,
      });

      toast.success('Job listing published successfully!');
      onNavigate('/recruiter/manage-jobs');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Publish a New Job Opening
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create a transparent, verified opening to attract high-caliber candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Job Role Fundamentals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Team <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering, Design, Product"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Workplace Type
              </label>
              <select
                value={workMode}
                onChange={(e: any) => setWorkMode(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e: any) => setEmploymentType(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e: any) => setExperienceLevel(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="entry">Entry Level (0-2 yrs)</option>
                <option value="mid">Mid-Level (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
                <option value="lead">Lead / Principal</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote (US/Canada)"
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Compensation & Deadline */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Compensation & Timeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Minimum Annual Base ($)
              </label>
              <input
                type="number"
                step="5000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value ? Number(e.target.value) : '')}
                placeholder="100000"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Maximum Annual Base ($)
              </label>
              <input
                type="number"
                step="5000"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value ? Number(e.target.value) : '')}
                placeholder="150000"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-slate-800">Highlight as Featured Role</span>
              <span className="block text-[11px] text-slate-400">Featured roles appear with a priority badge on homepage and searches</span>
            </div>
          </label>
        </div>

        {/* Required Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Required Technical Skills</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
              placeholder="Add skill tag (e.g. React, Kubernetes) and press Enter"
              className="flex-1 text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-blue-500 hover:text-blue-800 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Job Text Description & Requirements */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Overview & Team Context <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Requirements & Qualifications <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Key Responsibilities
            </label>
            <textarea
              rows={4}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/recruiter/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <PlusCircle className="w-4 h-4" />
            <span>Publish Job Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
};
