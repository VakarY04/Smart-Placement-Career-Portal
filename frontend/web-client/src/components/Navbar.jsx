import { useEffect, useRef, useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { MagneticButton } from './CyberMotion';

export default function Navbar() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [latestJobs, setLatestJobs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('portal-theme') || 'dark');
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  let user = { name: 'User' };

  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch {
    localStorage.removeItem('user');
  }

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const newestJobTime = latestJobs[0]?.createdAt ? new Date(latestJobs[0].createdAt).getTime() : 0;
  const lastSeenJobTime = Number(localStorage.getItem('latest-job-notification-seen-at') || 0);
  const hasUnreadJobs = newestJobTime > lastSeenJobTime;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('portal-theme-change', { detail: { theme: nextTheme } }));
  };

  const loadLatestJobs = async () => {
    try {
      const jobs = await apiService.getLatestJobs();
      setLatestJobs(Array.isArray(jobs) ? jobs : []);
    } catch {
      setLatestJobs([]);
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((isOpen) => {
      const nextOpen = !isOpen;
      if (nextOpen) {
        void loadLatestJobs();
      }
      if (nextOpen && newestJobTime) {
        localStorage.setItem('latest-job-notification-seen-at', String(newestJobTime));
      }
      return nextOpen;
    });
  };

  const handleNotificationClick = () => {
    setIsNotificationsOpen(false);
    navigate('/dashboard/recommendations');
  };

  const formatJobDate = (dateValue) => {
    if (!dateValue) return 'Recently posted';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Recently posted';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    void loadLatestJobs();
  }, []);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(event.detail?.theme === 'light' ? 'light' : 'dark');
    };

    window.addEventListener('portal-theme-change', handleThemeChange);
    return () => window.removeEventListener('portal-theme-change', handleThemeChange);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/35 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="hidden text-lg font-semibold text-slate-100 sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        <div ref={notificationMenuRef} className="relative">
          <MagneticButton
            type="button"
            onClick={toggleNotifications}
            aria-label="Open job notifications"
            aria-expanded={isNotificationsOpen}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/8"
          >
            <Bell className="w-5 h-5" />
            {hasUnreadJobs && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-black bg-red-500" />
            )}
          </MagneticButton>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Job Alerts</p>
                  <p className="mt-1 text-xs text-slate-400">Latest roles posted by the placement team</p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-100">
                  {latestJobs.length}
                </span>
              </div>

              <div className="space-y-2">
                {latestJobs.length ? latestJobs.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={handleNotificationClick}
                    className="light-surface flex w-full items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(86,240,255,0.6)]" />
                    <span className="min-w-0 flex-1">
                      <span className="light-heading block truncate text-sm font-bold text-white">{job.title}</span>
                      <span className="light-body mt-0.5 block truncate text-xs text-slate-400">
                        {job.company} posted a new opportunity.
                      </span>
                      <span className="light-muted mt-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Posted {formatJobDate(job.createdAt)}
                        {job.cgpaThreshold ? ` | Min CGPA ${job.cgpaThreshold}` : ''}
                      </span>
                      {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <span key={`${job._id}-${skill}`} className="light-pill rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="light-muted px-1 py-0.5 text-[11px] font-semibold text-slate-500">
                              +{job.requiredSkills.length - 3} more
                            </span>
                          )}
                        </span>
                      )}
                      <span className="mt-2 block text-xs font-semibold text-cyan-200">
                        View matching score
                      </span>
                    </span>
                  </button>
                )) : (
                  <div className="rounded-xl border border-dashed border-white/12 p-4 text-sm text-slate-400">
                    No new job posts yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div ref={profileMenuRef} className="relative rounded-xl border-l border-white/10 pl-4">
          <button
            type="button"
            onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 font-bold text-sm tracking-widest">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-slate-200 sm:block">{user.name}</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-white/10 bg-black/85 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
