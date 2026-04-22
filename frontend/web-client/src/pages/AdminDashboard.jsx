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
            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
          >
            {skill} x
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
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="Add a skill and press Enter"
        />
        <button
          type="button"
          onClick={addSkill}
          className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
    <div className="portal-theme-scope min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[28px] bg-slate-950 p-6 text-slate-300 shadow-2xl shadow-slate-900/20 md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Control Room</p>
                <h1 className="text-xl font-black text-white">Admin Portal</h1>
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-400">
              Publish listings, monitor applicant flow, and surface the skills students are still missing.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Active Jobs</p>
              <p className="mt-2 text-3xl font-black text-white">{analytics.totalActiveJobs}</p>
            </div>
            <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-indigo-200/70">Top Gap</p>
              <p className="mt-2 text-lg font-bold text-white">
                {analytics.topSkillGaps[0]?.skill || 'No gaps yet'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-indigo-900/10 md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Placement Operations
                </p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Admin dashboard for hiring visibility</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
                  Create active listings with markdown descriptions, track applicant demand, and spot which skills need stronger student prep.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Listings</p>
                  <p className="mt-2 text-2xl font-black">{jobs.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Applicants</p>
                  <p className="mt-2 text-2xl font-black">
                    {analytics.jobApplicantStats.reduce((sum, job) => sum + job.totalApplicants, 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Skill Gaps</p>
                  <p className="mt-2 text-2xl font-black">{analytics.topSkillGaps.length}</p>
                </div>
              </div>
            </div>
          </section>

          {(error || successMessage) && (
            <section className={`rounded-2xl border px-5 py-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {error || successMessage}
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={handleSubmit} className="glass-panel rounded-[28px] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Job CRUD</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">
                    {editingId ? 'Edit listing' : 'Create a new listing'}
                  </h3>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm font-semibold text-slate-700">Job Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Frontend Developer Intern"
                  />
                </label>

                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm font-semibold text-slate-700">Company</span>
                  <input
                    value={form.company}
                    onChange={(event) => setForm({ ...form, company: event.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Acme Labs"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Description (Markdown supported)</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    required
                    rows={8}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder={'## Responsibilities\n- Build user interfaces\n- Work with APIs'}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Required Skills</span>
                  <SkillsInput
                    skills={form.requiredSkills}
                    onChange={(skills) => setForm({ ...form, requiredSkills: skills })}
                  />
                </label>

                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm font-semibold text-slate-700">CGPA Threshold</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.cgpaThreshold}
                    onChange={(event) => setForm({ ...form, cgpaThreshold: event.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Update listing' : 'Create listing'}
              </button>
            </form>

            <section className="glass-panel rounded-[28px] p-6 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Preview</p>
                  <h3 className="text-xl font-black text-slate-900">Description render</h3>
                </div>
              </div>
              <div className="admin-markdown min-h-[320px] rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {form.description ? <ReactMarkdown>{form.description}</ReactMarkdown> : 'Markdown preview will appear here.'}
              </div>
            </section>
          </section>

          <section className="glass-panel rounded-[28px] p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Manage</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Active job listings</h3>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:w-96">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={handleSearch}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search by title, company, or skill"
                />
              </label>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Skills</th>
                    <th className="px-4 py-3 font-semibold">CGPA</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-slate-500">{job.company}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-md flex-wrap gap-2">
                          {job.requiredSkills?.map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{job.cgpaThreshold}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(job)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(job._id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-50"
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
                      <td colSpan="4" className="px-4 py-10 text-center text-slate-500">
                        No active job listings match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel rounded-[28px] p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <ChartColumn className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Analytics</p>
                  <h3 className="text-2xl font-black text-slate-900">Total applicants per job</h3>
                </div>
              </div>

              <div className="space-y-4">
                {filteredApplicantStats.map((job) => (
                  <div key={job.jobId} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.company}</p>
                      </div>
                      <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-indigo-700">
                        <p className="text-xs uppercase tracking-[0.2em]">Applicants</p>
                        <p className="text-2xl font-black">{job.totalApplicants}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!filteredApplicantStats.length && !isLoading && (
                  <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
                    Applicant analytics will appear here when listings match your search.
                  </p>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Skill Gaps</p>
                  <h3 className="text-2xl font-black text-slate-900">Top student pool gaps</h3>
                </div>
              </div>

              <div className="space-y-3">
                {analytics.topSkillGaps.map((gap, index) => (
                  <div key={gap.skill} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{gap.skill}</p>
                        <p className="text-sm text-slate-500">Missing across eligible student matches</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {gap.affectedStudents} gaps
                    </span>
                  </div>
                ))}
                {!analytics.topSkillGaps.length && !isLoading && (
                  <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
                    Skill gap analytics will appear when active jobs and student profiles are available.
                  </p>
                )}
              </div>
            </div>
          </section>

          {isLoading && (
            <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing admin data
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
