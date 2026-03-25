import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { PieChart, UploadCloud, User, Briefcase, ChevronRight, Activity, Award } from 'lucide-react';

export default function DashboardHome() {
  const [profileStats, setProfileStats] = useState({ completeness: 0, skillsCount: 0 });
  const [matches, setMatches] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Attempt local storage parsing for user identity
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) setUserName(user.name.split(' ')[0]);
      } catch (e) {
        // Fallback
      }
    }

    const loadDashboardData = async () => {
      try {
        // Query Profile Data Quietly to build Metrics UI
        const profile = await apiService.getProfile();
        let score = 20; // Base score for account existing
        if (profile.cgpa) score += 20;
        if (profile.bio) score += 20;
        if (profile.skills?.length > 0) score += 20;
        if (profile.internships?.length > 0 || profile.certifications?.length > 0) score += 20;
        
        setProfileStats({
          completeness: Math.min(score, 100),
          skillsCount: profile.skills?.length || 0
        });

        // Query Matches Quietly
        const recs = await apiService.getRecommendations();
        setMatches(recs.recommendations?.length || 0);
      } catch (err) {
        // If profile doesn't exist, ignore metrics failure gracefully
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="bg-brand-600 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Welcome back{userName ? `, ${userName}` : ''}! 👋</h1>
          <p className="text-brand-100 text-lg max-w-2xl">
            Track your career progress, analyze AI job matches, and continue building your study roadmaps to land your dream role.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Health</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-black text-slate-800">{profileStats.completeness}%</h3>
              <span className="text-sm font-medium text-emerald-500 mb-1">+Active</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Skills Logged</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-black text-slate-800">{profileStats.skillsCount}</h3>
              <span className="text-sm font-medium text-slate-500 mb-1">skills</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Job Matches</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-black text-slate-800">{matches}</h3>
              <span className="text-sm font-medium text-slate-500 mb-1">roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/dashboard/resume-upload" className="glass-panel p-6 group hover:border-brand-300 transition-all flex flex-col items-start bg-white hover:bg-slate-50">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Resume</h3>
            <p className="text-slate-500 text-sm mb-4 flex-1">Parse a new PDF to instruct the AI to extract your cutting-edge abilities automatically.</p>
            <span className="text-brand-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Go to Upload <ChevronRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/dashboard/profile" className="glass-panel p-6 group hover:border-brand-300 transition-all flex flex-col items-start bg-white hover:bg-slate-50">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Update Profile</h3>
            <p className="text-slate-500 text-sm mb-4 flex-1">Manually edit your academic metrics, background summary, and manually configure your skill stack.</p>
            <span className="text-brand-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Edit Details <ChevronRight className="w-4 h-4" /></span>
          </Link>

          <Link to="/dashboard/recommendations" className="glass-panel p-6 group hover:border-brand-300 transition-all flex flex-col items-start bg-white hover:bg-slate-50">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">View Matches</h3>
            <p className="text-slate-500 text-sm mb-4 flex-1">Evaluate the AI's heuristic scoring of your profile versus the top corporate job roles in the database.</p>
            <span className="text-brand-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">See Matches <ChevronRight className="w-4 h-4" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
