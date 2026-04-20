import { useEffect, useRef, useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { MagneticButton } from './CyberMotion';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('portal-theme') || 'dark');
  const profileMenuRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <MagneticButton className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full border border-black bg-red-500"></span>
        </MagneticButton>
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
