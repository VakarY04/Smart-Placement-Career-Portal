import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ResumeUploadPage from './ResumeUploadPage';
import Profile from './Profile';
import Recommendations from './Recommendations';
import Roadmap from './Roadmap';
import Applications from './Applications';
import DashboardHome from './DashboardHome';

export default function Dashboard() {
  return (
    <div className="portal-theme-scope flex min-h-screen cyber-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/resume-upload" element={<ResumeUploadPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/roadmap/:jobId" element={<Roadmap />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
