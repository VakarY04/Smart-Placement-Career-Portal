import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileText, LogOut, User, Briefcase, PieChart } from 'lucide-react';
import { MagneticButton } from './CyberMotion';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: PieChart, path: '/dashboard', exact: true },
    { name: 'Upload Resume', icon: UploadCloud, path: '/dashboard/resume-upload' },
    { name: 'My Profile', icon: User, path: '/dashboard/profile' },
    { name: 'My Matches', icon: Briefcase, path: '/dashboard/recommendations' },
    { name: 'My Applications', icon: FileText, path: '/dashboard/applications' },
  ];

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-white/8 bg-black/40 md:flex">
      <div className="flex h-16 items-center border-b border-white/8 px-6">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xl tracking-tight">
          <LayoutDashboard className="w-6 h-6" />
          SmartPortal
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-cyan-400/12 text-cyan-200 border border-cyan-300/20'
                  : 'text-slate-400 hover:bg-white/6 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/8 p-4">
        <MagneticButton
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </MagneticButton>
      </div>
    </aside>
  );
}
