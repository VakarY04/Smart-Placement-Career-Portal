import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ChartColumn,
  FileText,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { MagneticButton } from '../components/CyberMotion';

const emptyForm = {
  title: '',
  company: '',
  description: '',
  requiredSkills: [],
  cgpaThreshold: '6.0',
};

function SkillsInput({ skills, onChange }) {
  const [draft, setDraft] = useState('');

  const addSkill = () => {
    const nextSkill = draft.trim();
    if (!nextSkill || skills.includes(nextSkill)) {
      setDraft('');
      return;
    }

    onChange([...skills, nextSkill]);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => onChange(skills.filter((item) => item !== skill))}
            className="light-pill inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
          >
            {skill} <span className="text-cyan-200/70">x</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addSkill();
            }
          }}
          className="light-surface flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
          placeholder="Add a skill and press Enter"
        />
        <button
          type="button"
          onClick={addSkill}
          className="light-cta rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/16"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalActiveJobs: 0,
    jobApplicantStats: [],
    topSkillGaps: [],
  });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAdminData = async (searchTerm = '') => {
    setError('');
    setIsLoading(true);

    try {
      const [jobRows, analyticsData] = await Promise.all([
        apiService.getAdminJobs(searchTerm),
        apiService.getAdminAnalytics(),
      ]);
      setJobs(jobRows);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData('');
    // The initial admin bootstrap only needs to run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredApplicantStats = useMemo(
    () =>
      analytics.jobApplicantStats.filter((job) =>
        `${job.title} ${job.company}`.toLowerCase().includes(search.toLowerCase())
      ),
    [analytics.jobApplicantStats, search]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      ...form,
      cgpaThreshold: Number(form.cgpaThreshold),
    };

    try {
      if (editingId) {
        await apiService.updateAdminJob(editingId, payload);
        setSuccessMessage('Job listing updated.');
      } else {
        await apiService.createAdminJob(payload);
        setSuccessMessage('Job listing created.');
      }

      resetForm();
      await loadAdminData(search);
    } catch (err) {
      setError(err.message || 'Failed to save the job listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async (event) => {
    const nextSearch = event.target.value;
    setSearch(nextSearch);
    await loadAdminData(nextSearch);
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      description: job.description,
      requiredSkills: job.requiredSkills || [],
      cgpaThreshold: String(job.cgpaThreshold ?? '6.0'),
    });
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (jobId) => {
    setError('');
    setSuccessMessage('');

    try {
      await apiService.deleteAdminJob(jobId);
      setSuccessMessage('Job listing deleted.');
      if (editingId === jobId) {
        resetForm();
      }
      await loadAdminData(search);
    } catch (err) {
      setError(err.message || 'Failed to delete the job listing.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login?role=admin');
  };

  return (
    <div className="portal-theme-scope flex min-h-screen cyber-shell">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/8 bg-black/40 text-slate-300 md:flex">
          <div className="flex h-16 items-center border-b border-white/8 px-6">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-cyan-300">
              <ShieldCheck className="h-6 w-6" />
              AdminPortal
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="light-muted text-xs uppercase tracking-[0.28em] text-slate-500">Control Room</p>
                <h1 className="light-heading text-xl font-black text-white">Hiring Ops</h1>
              </div>
            </div>
            <p className="light-body mt-6 text-sm leading-6 text-slate-400">
              Publish listings, monitor applicant flow, and surface the skills students are still missing.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="light-surface rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="light-muted text-xs uppercase tracking-[0.24em] text-slate-500">Active Jobs</p>
              <p className="light-heading mt-2 text-3xl font-black text-white">{analytics.totalActiveJobs}</p>
            </div>
            <div className="light-pill rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Top Gap</p>
              <p className="mt-2 text-lg font-bold text-cyan-50">
                {analytics.topSkillGaps[0]?.skill || 'No gaps yet'}
              </p>
            </div>
          </div>
          </div>

          <MagneticButton
            type="button"
            onClick={handleLogout}
            className="m-4 mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </MagneticButton>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6 pb-10">
          <section className="glass-panel relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(86,240,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(125,255,231,0.08),_transparent_24%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Placement Operations
                </p>
                <h2 className="holographic-text text-4xl font-black tracking-tight md:text-6xl">Admin dashboard for hiring visibility</h2>
                <p className="light-body mt-4 text-base leading-7 text-slate-300 md:text-lg">
                  Create active listings with markdown descriptions, track applicant demand, and spot which skills need stronger student prep.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:w-[480px]">
                <div className="light-surface flex min-h-32 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="light-muted whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Listings</p>
                  <p className="light-heading mt-5 text-4xl font-black leading-none text-white">{jobs.length}</p>
                </div>
                <div className="light-surface flex min-h-32 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="light-muted whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Applicants</p>
                  <p className="light-heading mt-5 text-4xl font-black leading-none text-white">
                    {analytics.jobApplicantStats.reduce((sum, job) => sum + job.totalApplicants, 0)}
                  </p>
                </div>
                <div className="light-surface flex min-h-32 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="light-muted whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Skill Gaps</p>
                  <p className="light-heading mt-5 text-4xl font-black leading-none text-white">{analytics.topSkillGaps.length}</p>
                </div>
              </div>
            </div>
          </section>

          {(error || successMessage) && (
            <section className={`rounded-2xl border px-5 py-4 text-sm ${error ? 'border-red-400/20 bg-red-500/8 text-red-300' : 'border-emerald-400/20 bg-emerald-500/8 text-emerald-300'}`}>
              {error || successMessage}
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Job CRUD</p>
                  <h3 className="light-heading mt-2 text-2xl font-black text-white">
                    {editingId ? 'Edit listing' : 'Create a new listing'}
                  </h3>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="light-cta-secondary rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-1">
                  <span className="light-body text-sm font-semibold text-slate-300">Job Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    required
                    className="light-surface w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                    placeholder="Frontend Developer Intern"
                  />
                </label>

                <label className="space-y-2 md:col-span-1">
                  <span className="light-body text-sm font-semibold text-slate-300">Company</span>
                  <input
                    value={form.company}
                    onChange={(event) => setForm({ ...form, company: event.target.value })}
                    required
                    className="light-surface w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                    placeholder="Acme Labs"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="light-body text-sm font-semibold text-slate-300">Description (Markdown supported)</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    required
                    rows={8}
                    className="light-surface w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                    placeholder={'## Responsibilities\n- Build user interfaces\n- Work with APIs'}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="light-body text-sm font-semibold text-slate-300">Required Skills</span>
                  <SkillsInput
                    skills={form.requiredSkills}
                    onChange={(skills) => setForm({ ...form, requiredSkills: skills })}
                  />
                </label>

                <label className="space-y-2 md:col-span-1">
                  <span className="light-body text-sm font-semibold text-slate-300">CGPA Threshold</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.cgpaThreshold}
                    onChange={(event) => setForm({ ...form, cgpaThreshold: event.target.value })}
                    required
                    className="light-surface w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </label>
              </div>

              <MagneticButton
                type="submit"
                disabled={isSaving}
                className="light-cta mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/16 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update listing' : 'Create listing'}
              </MagneticButton>
            </form>

            <section className="glass-panel p-6 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Preview</p>
                  <h3 className="light-heading text-xl font-black text-white">Description render</h3>
                </div>
              </div>
              <div className="admin-markdown light-surface min-h-[320px] rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                {form.description ? <ReactMarkdown>{form.description}</ReactMarkdown> : 'Markdown preview will appear here.'}
              </div>
            </section>
          </section>

          <section className="glass-panel p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Manage</p>
                <h3 className="light-heading mt-2 text-2xl font-black text-white">Active job listings</h3>
              </div>

              <label className="light-surface flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 lg:w-96">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={handleSearch}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Search by title, company, or skill"
                />
              </label>
            </div>

            <div className="light-surface overflow-x-auto rounded-3xl border border-white/8 bg-white/[0.03]">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/8 bg-white/[0.04] text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Skills</th>
                    <th className="px-4 py-3 font-semibold">CGPA</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id} className="border-t border-white/8 align-top">
                      <td className="px-4 py-4">
                        <p className="light-heading font-semibold text-white">{job.title}</p>
                        <p className="light-body text-slate-400">{job.company}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-md flex-wrap gap-2">
                          {job.requiredSkills?.map((skill) => (
                            <span key={skill} className="light-pill rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="light-body px-4 py-4 font-semibold text-slate-300">{job.cgpaThreshold}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(job)}
                            className="light-cta-secondary inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(job._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 font-semibold text-red-300 transition hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!jobs.length && !isLoading && (
                    <tr>
                      <td colSpan="4" className="px-4 py-10 text-center text-slate-400">
                        No active job listings match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <ChartColumn className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Analytics</p>
                  <h3 className="light-heading text-2xl font-black text-white">Total applicants per job</h3>
                </div>
              </div>

              <div className="space-y-4">
                {filteredApplicantStats.map((job) => (
                  <div key={job.jobId} className="light-surface rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="light-heading font-semibold text-white">{job.title}</p>
                        <p className="light-body text-sm text-slate-400">{job.company}</p>
                      </div>
                      <div className="light-pill rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-center text-cyan-100">
                        <p className="text-xs uppercase tracking-[0.2em]">Applicants</p>
                        <p className="text-2xl font-black">{job.totalApplicants}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!filteredApplicantStats.length && !isLoading && (
                  <p className="light-surface rounded-3xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-slate-400">
                    Applicant analytics will appear here when listings match your search.
                  </p>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Skill Gaps</p>
                  <h3 className="light-heading text-2xl font-black text-white">Top student pool gaps</h3>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.topSkillGaps.map((gap, index) => (
                  <div key={gap.skill} className="light-surface flex items-center justify-between rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="light-pill flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-bold text-cyan-100">
                        {index + 1}
                      </div>
                      <div>
                        <p className="light-heading font-semibold text-white">{gap.skill}</p>
                        <p className="light-body text-sm text-slate-400">Missing across eligible student matches</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                      {gap.affectedStudents} gaps
                    </span>
                  </div>
                ))}
                {!analytics.topSkillGaps.length && !isLoading && (
                  <p className="light-surface rounded-3xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-slate-400">
                    Skill gap analytics will appear when active jobs and student profiles are available.
                  </p>
                )}
              </div>
            </div>
          </section>

          {isLoading && (
            <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing admin data
            </div>
          )}
          </div>
        </main>
    </div>
  );
}
