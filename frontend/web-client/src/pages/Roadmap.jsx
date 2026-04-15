import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { Loader2, ArrowLeft, Briefcase, GraduationCap, CheckCircle2, Bookmark, ExternalLink, Flame } from 'lucide-react';

export default function Roadmap() {
  const { jobId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getRoadmap(jobId);
        setData(response);
      } catch (err) {
        setError(err.message || 'Failed to generate roadmap');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
        <p className="font-medium animate-pulse">AI is generating your personalized study roadmap...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-between border border-red-200">
        <p className="font-medium">{error || 'Something went wrong.'}</p>
        <Link to="/dashboard/recommendations" className="text-sm border border-red-200 px-3 py-1 rounded bg-white hover:bg-red-50">Back</Link>
      </div>
    );
  }

  const { job, is_ready, roadmap } = data;
  const missingSkills = data.missingSkills || data.missing_skills || location.state?.missingSkills || [];

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <Link to="/dashboard/recommendations" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Matches
      </Link>

      <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100 to-transparent opacity-50 rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wide mb-4">
              <Briefcase className="w-3.5 h-3.5" /> Target Role
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">{job.title}</h1>
            <p className="text-lg text-slate-500 font-medium">{job.company}</p>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <span className="text-sm font-semibold text-slate-400 mb-1">Status</span>
            {is_ready ? (
              <span className="text-emerald-500 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Ready for Interview
              </span>
            ) : (
              <span className="text-amber-500 font-bold flex items-center gap-2">
                <Flame className="w-5 h-5" /> {missingSkills.length} Skills to Master
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <GraduationCap className="w-6 h-6 text-brand-500" /> Your Study Timeline
          </h2>
          
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-10 pl-8 pb-4">
            {roadmap.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[42px] bg-white border-4 border-slate-100 rounded-full w-5 h-5 top-1">
                  <div className="bg-brand-500 w-full h-full rounded-full" />
                </div>
                
                <div className="glass-panel p-6 hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                    Month {step.month}
                  </span>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Bookmark className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{step.resource.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{step.resource.type}</p>
                      </div>
                    </div>
                    <a 
                      href={step.resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-brand-300 hover:text-brand-600 transition-colors shadow-sm"
                    >
                      Access Course <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Skill Gap Analysis</h3>
            
            {missingSkills.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  The AI detected these core competencies missing from your current profile compared to {job.company}'s requirements.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map(skill => (
                    <span key={skill} className="bg-red-50 text-red-600 font-semibold px-3 py-1.5 rounded-lg text-sm border border-red-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700">No Hard Skill Gaps!</h4>
                <p className="text-sm text-slate-500 mt-2">You are academically ready. Focus on soft skills and system design.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
