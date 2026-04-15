import { Menu, Bell } from 'lucide-react';
import { MagneticButton } from './CyberMotion';

export default function Navbar() {
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-black/35 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="hidden text-lg font-semibold text-slate-100 sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <MagneticButton className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full border border-black bg-red-500"></span>
        </MagneticButton>
        <div className="cursor-pointer rounded-xl border-l border-white/10 pl-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 transition-colors hover:bg-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 font-bold text-sm tracking-widest">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-slate-200 sm:block">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
