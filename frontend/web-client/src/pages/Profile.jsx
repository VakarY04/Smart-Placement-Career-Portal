import { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  UserCircle2,
  X,
} from 'lucide-react';

const emptyExperience = { company: '', role: '', dates: '' };

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
};

const formatExperienceSummary = (experience) => {
  const role = experience.role?.trim();
  const company = experience.company?.trim();
  const dates = experience.dates?.trim();

  if (!role && !company && !dates) return '';
  if (role && company && dates) return `${role} at ${company} | ${dates}`;
  if (role && company) return `${role} at ${company}`;
  return [role, company, dates].filter(Boolean).join(' | ');
};

const parseLegacyExperience = (internship) => {
  const [headline, dates = ''] = String(internship || '').split('|').map(part => part.trim());
  const [role = '', company = ''] = headline.split(' at ').map(part => part.trim());

  return {
    role,
    company,
    dates,
  };
};

export default function Profile() {
  const [formData, setFormData] = useState({
    bio: '',
    cgpa: '',
    collegeName: '',
    profileImage: '',
    skills: [],
    interests: '',
    certifications: '',
    experiences: [emptyExperience],
  });
  const [skillInput, setSkillInput] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [userName, setUserName] = useState('');
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || '');
      } catch {
        setUserName('');
      }
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProfile();
      const experiences = Array.isArray(data.experiences) && data.experiences.length
        ? data.experiences
        : normalizeArray(data.internships).map(parseLegacyExperience);

      setFormData({
        bio: Array.isArray(data.bio) ? data.bio.join('\n') : data.bio || '',
        cgpa: data.cgpa || '',
        collegeName: data.collegeName || '',
        profileImage: data.profileImage || '',
        skills: normalizeArray(data.skills),
        interests: normalizeArray(data.interests).join(', '),
        certifications: normalizeArray(data.certifications).join(', '),
        experiences: experiences.length ? experiences : [emptyExperience],
      });
      setProfilePreview(data.profileImage || '');
      setIsExistingProfile(true);
    } catch (error) {
      if (error?.message === 'Profile not found' || error?.status === 404 || String(error).includes('404')) {
        setIsExistingProfile(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile parameters.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const profileStrength = useMemo(() => {
    let score = 10;
    if (userName.trim()) score += 10;
    if (formData.bio.trim()) score += 15;
    if (formData.cgpa) score += 15;
    if (formData.collegeName.trim()) score += 10;
    if (formData.skills.length) score += 20;
    if (formData.experiences.some(exp => exp.company || exp.role || exp.dates)) score += 15;
    if (formData.certifications.trim()) score += 5;
    if (formData.interests.trim()) score += 5;
    return Math.min(score, 100);
  }, [formData, userName]);

  const handleFieldChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const skill = skillInput.trim();
    if (!skill) return;

    setFormData(prev => {
      const alreadyExists = prev.skills.some(existing => existing.toLowerCase() === skill.toLowerCase());
      if (alreadyExists) return prev;
      return { ...prev, skills: [...prev.skills, skill] };
    });
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((experience, experienceIndex) =>
        experienceIndex === index ? { ...experience, [field]: value } : experience
      ),
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { ...emptyExperience }],
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => {
      const nextExperiences = prev.experiences.filter((_, experienceIndex) => experienceIndex !== index);
      return {
        ...prev,
        experiences: nextExperiences.length ? nextExperiences : [{ ...emptyExperience }],
      };
    });
  };

  const handleProfilePreview = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      setProfilePreview(imageData);
      setFormData(prev => ({ ...prev, profileImage: imageData }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const cleanExperiences = formData.experiences
      .map(experience => ({
        company: experience.company.trim(),
        role: experience.role.trim(),
        dates: experience.dates.trim(),
      }))
      .filter(experience => experience.company || experience.role || experience.dates);

    const payload = {
      bio: formData.bio.trim(),
      cgpa: Number(formData.cgpa) || 0,
      collegeName: formData.collegeName.trim(),
      profileImage: formData.profileImage,
      skills: formData.skills,
      interests: normalizeArray(formData.interests),
      internships: cleanExperiences.map(formatExperienceSummary).filter(Boolean),
      experiences: cleanExperiences,
      certifications: normalizeArray(formData.certifications),
    };

    try {
      if (isExistingProfile) {
        await apiService.updateProfile(payload);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        await apiService.createProfile(payload);
        setIsExistingProfile(true);
        setMessage({ type: 'success', text: 'Profile created successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save profile.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up pb-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="relative">
                <label className="group flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-16 w-16 text-slate-300" />
                  )}
                  <input id="profile-image-input" type="file" accept="image/*" className="hidden" onChange={handleProfilePreview} />
                  {!profilePreview && (
                    <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-semibold text-white">
                      <ImagePlus className="h-3.5 w-3.5" /> Upload Photo
                    </span>
                  )}
                </label>
                {profilePreview && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                    className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-slate-950/90 px-3 py-1 text-[11px] font-semibold text-slate-200 shadow-lg transition hover:border-cyan-300/30 hover:text-white"
                  >
                    <ImagePlus className="h-3.5 w-3.5" /> Change
                  </button>
                )}
              </div>

              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
                  <Sparkles className="h-3.5 w-3.5" /> Professional Portfolio
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  {userName || 'Build your standout student profile'}
                </h1>
                <p className="mt-3 text-sm text-slate-300 md:text-base">
                  Organize your academics, skills, and experience into a cleaner portfolio that strengthens your AI job matches.
                </p>
              </div>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Profile Strength</p>
                <span className="text-2xl font-black">{profileStrength}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 transition-all"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-300">
                Stronger profiles improve recommendation quality and roadmap relevance.
              </p>
            </div>
          </div>
        </section>

        {message.text && (
          <div className={`rounded-2xl border p-4 ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            <div className="flex items-start gap-3">
              {message.type === 'error' ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="glass-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Personal Snapshot</h2>
                  <p className="text-sm text-slate-300">Add a crisp summary recruiters and matching logic can quickly understand.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleFieldChange}
                  placeholder="Summarize your focus, strengths, and the kind of roles you are aiming for."
                  rows="5"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-sm font-semibold text-slate-200">Interests</label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleFieldChange}
                  placeholder="e.g. Artificial Intelligence, Cloud Engineering, Product Design"
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </section>

            <section className="glass-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Academic Card</h2>
                  <p className="text-sm text-slate-300">Keep your academic credentials easy to scan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-400">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleFieldChange}
                    placeholder="8.5"
                    className="w-full border-0 bg-transparent p-0 text-2xl font-black text-slate-900 outline-none placeholder:text-slate-300"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Out of 10.0</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-400">University / College</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleFieldChange}
                    placeholder="Your university or college"
                    className="w-full border-0 bg-transparent p-0 text-base font-bold text-slate-900 outline-none placeholder:text-slate-300"
                  />
                  <p className="mt-3 text-xs text-slate-500">Shown as part of your academic identity.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Interactive Skill Tags</h2>
                  <p className="text-sm text-slate-300">Type a skill and press Enter to add it to your stack.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="rounded-full text-slate-300 transition hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Add a skill and press Enter"
                    className="min-w-[220px] flex-1 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-sm font-semibold text-slate-200">Certifications</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleFieldChange}
                  placeholder="e.g. AWS Cloud Practitioner, Meta Frontend Developer"
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </section>

            <section className="glass-panel p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Structured Experience List</h2>
                    <p className="text-sm text-slate-300">Add internships, projects, and role-based experience as clean cards.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {formData.experiences.map((experience, index) => (
                  <div key={`experience-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Building2 className="h-4 w-4" /> Experience {index + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-rose-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Company</label>
                        <input
                          type="text"
                          value={experience.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          placeholder="Company or organization"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Role</label>
                        <input
                          type="text"
                          value={experience.role}
                          onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                          placeholder="Role title"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Dates</label>
                        <input
                          type="text"
                          value={experience.dates}
                          onChange={(e) => handleExperienceChange(index, 'dates', e.target.value)}
                          placeholder="e.g. Jan 2025 - Mar 2025"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/30"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isExistingProfile ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
