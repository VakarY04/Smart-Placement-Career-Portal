import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Briefcase, Building2, CheckCircle2, ChevronRight, Sparkles, AlertCircle, BookmarkPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CyberSkeleton, MagneticButton, TiltCard } from '../components/CyberMotion';

function RecommendationsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <CyberSkeleton className="mb-3 h-8 w-72" />
        <CyberSkeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="glass-panel p-6">
            <div className="mb-4 flex justify-between">
              <div className="space-y-2 w-full">
                <CyberSkeleton className="h-6 w-2/3" />
                <CyberSkeleton className="h-4 w-1/3" />
              </div>
              <CyberSkeleton className="h-14 w-14 rounded-full" />
            </div>
            <CyberSkeleton className="mb-3 h-20 w-full" />
            <CyberSkeleton className="h-10 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Recommendations() {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackedJobs, setTrackedJobs] = useState(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getRecommendations();
        setRecommendations(data.recommendations || []);
        try {
          const appsData = await apiService.getApplications();
          setTrackedJobs(new Set(appsData.map((app) => app.jobId)));
        } catch (appsError) {
          console.error('Failed to load tracked applications', appsError);
        }
      } catch (err) {
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [location.key]);

  const handleTrackJob = async (jobRecord) => {
    try {
      const jobId = jobRecord.id || jobRecord._id;
      await apiService.createApplication({ jobId, jobTitle: jobRecord.title, company: jobRecord.company, status: 'Applied' });
      setTrackedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <RecommendationsSkeleton />;

  if (error) {
    if (error.includes('Profile not complete yet')) {
      return (
        <div className="glass-panel mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-10 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="light-heading mb-3 text-2xl font-bold text-white">Profile Incomplete</h2>
          <p className="light-body mb-8 text-slate-400">Our AI needs a few more details to build the match graph. Complete your profile to unlock recommendations.</p>
          <MagneticButton as={Link} to="/dashboard/profile" className="light-cta rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-6 py-3 font-medium text-cyan-100">Complete Profile</MagneticButton>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/8 p-4 text-red-300 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="light-heading flex items-center gap-2 text-3xl font-black text-white">
          <Sparkles className="h-6 w-6 text-cyan-200" />
          AI Career Recommendations
        </h2>
        <p className="light-body mt-2 text-sm text-slate-400">A cyber-minimalist map of the roles with the strongest fit against your current profile.</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="glass-panel flex flex-col items-center p-10 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-slate-500" />
          <h3 className="light-heading text-lg font-semibold text-white">No strong matches found</h3>
          <p className="light-body mt-2 max-w-sm text-slate-400">Try expanding your skills or adding more context to your profile to surface new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {recommendations.map((item, index) => {
            const { job, matchPercentage, breakdown, missingSkills = [] } = item;
            const jobId = job.id || job._id;
            const glowColor = matchPercentage >= 80 ? 'rgba(125,255,231,0.24)' : matchPercentage >= 60 ? 'rgba(86,240,255,0.24)' : 'rgba(255,255,255,0.12)';

            return (
              <TiltCard
                key={jobId}
                className="glass-panel group flex flex-col overflow-hidden"
                glow
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="light-heading mb-1 text-xl font-bold text-white transition-colors group-hover:text-cyan-200">{job.title}</h3>
                      <div className="light-body flex items-center gap-2 font-medium text-slate-400">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        {job.company}
                      </div>
                    </div>
                    <Motion.div
                      whileHover={{ scale: 1.08 }}
                      className="match-ring-pulse flex h-16 w-16 items-center justify-center rounded-full border text-lg font-black text-white"
                      style={{ borderColor: glowColor, boxShadow: `0 0 24px ${glowColor}` }}
                    >
                      {Math.round(matchPercentage)}%
                    </Motion.div>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-3 text-sm">
                    <span className="light-pill rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-cyan-100">Skills {breakdown?.skills ?? 0}/60</span>
                    <span className="light-pill-neutral rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">Academic {breakdown?.academic ?? 0}/20</span>
                    <span className="light-pill-neutral rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">Semantic {breakdown?.semantic ?? 0}/20</span>
                  </div>

                  <p className="light-body mb-6 text-sm leading-relaxed text-slate-400">{job.description}</p>

                  <div className="space-y-3">
                    <h4 className="light-muted text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Why you matched</h4>
                    <ul className="space-y-2">
                      {[
                        `${Math.round(matchPercentage)}% overall readiness for ${job.title}`,
                        breakdown?.academic === 20 ? 'Meets the CGPA threshold for this role.' : 'Below the listed CGPA threshold for this role.',
                        missingSkills.length ? `Missing skills: ${missingSkills.join(', ')}` : 'No hard-skill gaps detected for this listing.',
                      ].map((detail, i) => (
                        <li key={`${jobId}-${i}`} className="light-body flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="light-divider light-surface border-t border-white/8 bg-white/[0.02] px-6 py-4">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(job.required_skills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="light-pill-neutral rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-medium text-slate-300">{skill}</span>
                    ))}
                    {(job.required_skills || []).length > 3 && <span className="light-muted px-1 text-xs font-medium text-slate-500">+{job.required_skills.length - 3}</span>}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <MagneticButton
                      type="button"
                      onClick={() => handleTrackJob(job)}
                      disabled={trackedJobs.has(jobId)}
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${trackedJobs.has(jobId) ? 'light-pill' : 'light-body'} ${trackedJobs.has(jobId) ? 'text-cyan-200' : 'text-slate-300'}`}
                    >
                      {trackedJobs.has(jobId) ? <><CheckCircle2 className="h-4 w-4" /> Tracked</> : <><BookmarkPlus className="h-4 w-4" /> Save to Tracker</>}
                    </MagneticButton>

                    <MagneticButton
                      as={Link}
                      to={`/dashboard/roadmap/${jobId}`}
                      state={{ missingSkills, matchPercentage, targetRole: job.title, company: job.company }}
                      className="light-cta inline-flex items-center gap-1 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                    >
                      View Roadmap <ChevronRight className="h-4 w-4" />
                    </MagneticButton>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
