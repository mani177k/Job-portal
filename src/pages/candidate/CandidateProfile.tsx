import React, { useState, useEffect } from 'react';
import { candidateService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Save, 
  MapPin, 
  DollarSign, 
  CheckCircle,
  Loader2
} from 'lucide-react';

export const CandidateProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>(0);
  const [currentLocation, setCurrentLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [expectedSalary, setExpectedSalary] = useState<number | ''>('');

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Education list
  const [education, setEducation] = useState<Array<{
    degree: string;
    institution: string;
    year: string;
  }>>([]);

  // Work experience list
  const [experience, setExperience] = useState<Array<{
    title: string;
    company: string;
    location?: string;
    period: string;
    description: string;
  }>>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getProfile();
      const u = data.user;
      const p = data.profile;

      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setPhone(u.phone || '');

      if (p) {
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setExperienceYears(p.experience_years ?? 0);
        setCurrentLocation(p.current_location || '');
        setPortfolioUrl(p.portfolio_url || '');
        setLinkedinUrl(p.linkedin_url || '');
        setGithubUrl(p.github_url || '');
        setExpectedSalary(p.expected_salary ?? '');
        setSkills(p.skills || []);
        setEducation(p.education || []);
        setExperience(p.experience || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: 'B.S. in Computer Science', institution: 'University Name', year: '2020 - 2024' }
    ]);
  };

  const handleUpdateEducation = (idx: number, field: string, val: string) => {
    const updated = [...education];
    updated[idx] = { ...updated[idx], [field]: val };
    setEducation(updated);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        title: 'Software Engineer',
        company: 'Company Name',
        location: 'San Francisco, CA',
        period: '2023 - Present',
        description: 'Developed scalable features and maintained high performance web applications.'
      }
    ]);
  };

  const handleUpdateExperience = (idx: number, field: string, val: string) => {
    const updated = [...experience];
    updated[idx] = { ...updated[idx], [field]: val };
    setExperience(updated);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await candidateService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        headline,
        bio,
        experience_years: experienceYears !== '' ? Number(experienceYears) : null,
        current_location: currentLocation,
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        expected_salary: expectedSalary !== '' ? Number(expectedSalary) : null,
        skills,
        education,
        experience
      });
      await refreshUser();
      toast.success('Profile details saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading candidate profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your professional details, career milestones, and skills visible to hiring teams.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Personal Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer | React, TypeScript & Node.js"
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Professional Summary / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your expertise, passions, and career focus..."
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Location
              </label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Annual Salary ($)
              </label>
              <input
                type="number"
                step="5000"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 150000"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Core Technical Skills</span>
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
              placeholder="Type a skill (e.g. React, Python, Docker) and press Enter"
              className="flex-1 text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
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

        {/* Work Experience */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Work Experience</span>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Position
            </button>
          </div>

          {experience.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No work experience listed yet.</div>
          ) : (
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Period (e.g. 2022 - Present)</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description & Achievements</label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Education</span>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          </div>

          {education.length === 0 ? (
            <div className="text-xs text-slate-400 italic">No education entries added yet.</div>
          ) : (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree / Diploma</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links & Portfolio */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>Web & Social Profiles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portfolio URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">GitHub Profile</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Complete Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
