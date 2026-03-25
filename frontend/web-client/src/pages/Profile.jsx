import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const [formData, setFormData] = useState({
    bio: '',
    cgpa: '',
    skills: '',
    interests: '',
    internships: '',
    certifications: ''
  });
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProfile();
      // Populate state
      setFormData({
        bio: data.bio || '',
        cgpa: data.cgpa || '',
        skills: data.skills ? data.skills.join(', ') : '',
        interests: data.interests ? data.interests.join(', ') : '',
        internships: data.internships ? data.internships.join(', ') : '',
        certifications: data.certifications ? data.certifications.join(', ') : ''
      });
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    // Format strings to arrays for backend
    const payload = {
      bio: formData.bio,
      cgpa: Number(formData.cgpa) || 0,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      internships: formData.internships.split(',').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean)
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
      // Auto-hide success message
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="glass-panel p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
          <p className="text-slate-500 text-sm mt-1">
            Complete your profile to get the most accurate AI career recommendations.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">CGPA (Out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little bit about yourself and your aspirations..."
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Skills (Comma-separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. JavaScript, React, Python, Data Analysis"
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Interests (Comma-separated)</label>
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g. Artificial Intelligence, Web Development, Cybersecurity"
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Internships / Experience (Comma-separated)</label>
            <textarea
              name="internships"
              value={formData.internships}
              onChange={handleChange}
              placeholder="e.g. Frontend Intern at XYZ Corp, Research Assistant"
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Certifications (Comma-separated)</label>
            <textarea
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="e.g. AWS Cloud Practitioner, Meta Frontend Developer"
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-8 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> {isExistingProfile ? 'Update Profile' : 'Save Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
