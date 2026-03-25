import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileText, Settings, LogOut, User, Briefcase, PieChart } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: PieChart, path: '/dashboard', exact: true },
    { name: 'Upload Resume', icon: UploadCloud, path: '/dashboard/resume-upload' },
    { name: 'My Profile', icon: User, path: '/dashboard/profile' },
    { name: 'My Matches', icon: Briefcase, path: '/dashboard/recommendations' },
    { name: 'My Applications', icon: FileText, path: '/dashboard/applications' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
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
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
