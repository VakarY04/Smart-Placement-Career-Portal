import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Briefcase, Building2, MapPin, DollarSign, CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle, BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackedJobs, setTrackedJobs] = useState(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getRecommendations();
        setRecommendations(data.recommendations || []);
        
        try {
          const appsData = await apiService.getApplications();
          const trackedIds = appsData.map(app => app.jobId);
          setTrackedJobs(new Set(trackedIds));
        } catch(e) {}

      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleTrackJob = async (job) => {
    try {
      await apiService.createApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: "Applied"
      });
      setTrackedJobs(prev => {
        const next = new Set(prev);
        next.add(job.id);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
        <p className="font-medium animate-pulse">Running AI matching engine...</p>
      </div>
    );
  }

  if (error) {
    if (error.includes('Profile not complete yet')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Profile Incomplete</h2>
          <p className="text-slate-500 mb-8">
            Our AI needs a few more details about you to find the perfect job matches. Please complete your profile to unlock recommendations.
          </p>
          <Link to="/dashboard/profile" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-500/25">
            Complete Profile
          </Link>
        </div>
      );
    }
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-200">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          AI Career Recommendations
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Based on your skills, CGPA, and experiences, these roles are the highest numerical matches for your profile.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="glass-panel p-10 text-center flex flex-col items-center">
          <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No strong matches found</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            Try expanding your skills or adding more context to your profile to discover new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {recommendations.map((item, index) => {
            const { job, match_percentage, match_details } = item;
            
            // Determine ring color based on match
            const ringColor = match_percentage >= 80 
              ? 'text-emerald-500 border-emerald-500' 
              : match_percentage >= 60 
              ? 'text-amber-500 border-amber-500' 
              : 'text-slate-500 border-slate-300';
              
            const bgColor = match_percentage >= 80 ? 'bg-emerald-50' : match_percentage >= 60 ? 'bg-amber-50' : 'bg-slate-50';

            return (
              <div key={job.id} className="glass-panel hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {job.company}
                      </div>
                    </div>
                    
                    <div className={`shrink-0 w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-lg ${ringColor} ${bgColor}`}>
                      {match_percentage}%
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary_range}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {job.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Why you matched</h4>
                    <ul className="space-y-2">
                      {match_details.slice(0, 3).map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {job.required_skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md whitespace-nowrap">
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="text-xs font-medium text-slate-400 px-1">+{job.required_skills.length - 3}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleTrackJob(job)}
                      disabled={trackedJobs.has(job.id)}
                      className={`flex items-center gap-1 text-sm font-semibold transition-all ${trackedJobs.has(job.id) ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                    >
                      {trackedJobs.has(job.id) ? (
                        <><CheckCircle2 className="w-4 h-4" /> Tracked</>
                      ) : (
                        <><BookmarkPlus className="w-4 h-4" /> Save to Tracker</>
                      )}
                    </button>

                    <Link to={`/dashboard/roadmap/${job.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:gap-2 transition-all">
                      View Roadmap <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
