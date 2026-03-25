import { Menu, Bell } from 'lucide-react';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User"}');
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <button className="hover:text-brand-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm tracking-widest">
            {initials}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
