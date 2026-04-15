import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Loader2, GripVertical, Building, Trash2 } from 'lucide-react';

const COLUMNS = ["Applied", "Interviewing", "Offered", "Rejected"];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const data = await apiService.getApplications();
      setApps(data);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('appId', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (!appId) return;

    // Optimistic UI update
    setApps(prevApps => prevApps.map(a => a._id === appId ? { ...a, status: newStatus } : a));

    try {
      await apiService.updateApplication(appId, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
      fetchApps(); // Revert on failure if network drops
    }
  };

  const handleDelete = async (id) => {
    setApps(prevApps => prevApps.filter(a => a._id !== id));
    try {
      await apiService.deleteApplication(id);
    } catch {
      fetchApps();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-300 mb-4" />
        <p className="font-medium animate-pulse">Loading Tracker...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8 pb-10 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">My Applications</h1>
        <p className="text-slate-300 font-medium">Drag and drop job cards to systematically track your interview pipeline.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[650px] custom-scrollbar">
        {COLUMNS.map(col => {
          const columnApps = apps.filter(a => a.status === col);
          
          let colTheme = "bg-white/[0.04] border-white/10";
          let badgeTheme = "bg-white/10 text-slate-200";
          
          if (col === "Interviewing") { colTheme = "bg-cyan-400/6 border-cyan-300/15"; badgeTheme = "bg-cyan-400/12 text-cyan-100"; }
          if (col === "Offered") { colTheme = "bg-emerald-400/6 border-emerald-300/15"; badgeTheme = "bg-emerald-400/12 text-emerald-100"; }
          if (col === "Rejected") { colTheme = "bg-rose-400/6 border-rose-300/15"; badgeTheme = "bg-rose-400/12 text-rose-100"; }

          return (
            <div 
              key={col} 
              className={`glass-panel rounded-3xl p-4 w-80 shrink-0 flex flex-col border ${colTheme} transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-white">{col}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeTheme}`}>{columnApps.length}</span>
              </div>
              
              <div className="flex-1 space-y-3 min-h-[100px]">
                {columnApps.map(app => (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app._id)}
                    className="bg-white/[0.97] border border-white/20 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-cyan-300/50 hover:shadow-[0_0_24px_rgba(86,240,255,0.12)] transition-all group relative"
                  >
                    <button 
                      onClick={() => handleDelete(app._id)} 
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300 mt-1 shrink-0 px-0 -ml-1" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1.5 pr-6">{app.jobTitle}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[150px]">{app.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
