import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { apiService } from '../services/api';
import { ArrowLeft, Briefcase, CheckCircle2, ExternalLink, Flame } from 'lucide-react';
import { CyberSkeleton, MagneticButton } from '../components/CyberMotion';

function RoadmapSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((month) => (
        <div key={month} className="glass-panel p-6">
          <CyberSkeleton className="mb-4 h-5 w-28" />
          <div className="space-y-4">
            {[1, 2].map((milestone) => (
              <div key={milestone} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <CyberSkeleton className="mb-3 h-5 w-2/3" />
                <CyberSkeleton className="mb-2 h-4 w-full" />
                <CyberSkeleton className="mb-4 h-4 w-5/6" />
                <CyberSkeleton className="h-10 w-40" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Roadmap() {
  const { jobId } = useParams();
  const location = useLocation();
  const [roadmapData, setRoadmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recommendationData = await apiService.getRecommendations();
        const recommendations = recommendationData?.recommendations || [];
        const selectedRecommendation = recommendations.find((item) => (item?.job?.id || item?.job?._id) === jobId);
        if (!selectedRecommendation) throw new Error('Could not find the selected role in your current recommendations.');

        const job = selectedRecommendation.job;
        const missingSkills = selectedRecommendation.missingSkills || location.state?.missingSkills || [];
        const targetRole = location.state?.targetRole || job.title;
        const generated = await apiService.generateRoadmap({ missingSkills, targetRole });

        setRoadmapData({
          job,
          is_ready: missingSkills.length === 0,
          missingSkills,
          roadmap: generated.roadmap || [],
        });
      } catch (err) {
        setError(err.message || 'Failed to generate roadmap');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [jobId, location.state]);

  const groupedRoadmap = useMemo(() => {
    const steps = roadmapData?.roadmap || [];
    return steps.reduce((acc, step, index) => {
      const month = Number(step.month) || Math.min(3, Math.floor(index / 2) + 1);
      if (!acc[month]) acc[month] = [];
      acc[month].push(step);
      return acc;
    }, {});
  }, [roadmapData]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="text-center text-slate-400">
          <p className="animate-pulse font-medium">AI is building your glowing node network...</p>
        </div>
        <RoadmapSkeleton />
      </div>
    );
  }

  if (error || !roadmapData) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/8 p-4 text-red-300 flex items-center justify-between">
        <p className="font-medium">{error || 'Something went wrong.'}</p>
        <Link to="/dashboard/recommendations" className="rounded border border-red-200/20 bg-white/5 px-3 py-1 text-sm">Back</Link>
      </div>
    );
  }

  const { job, is_ready, missingSkills } = roadmapData;

  return (
    <div className="space-y-8 pb-10">
      <Link to="/dashboard/recommendations" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-200">
        <ArrowLeft className="h-4 w-4" /> Back to My Matches
      </Link>

      <div className="glass-panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(86,240,255,0.1),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(125,255,231,0.08),_transparent_20%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
              <Briefcase className="h-3.5 w-3.5" /> Target Role
            </div>
            <h1 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">{job.title}</h1>
            <p className="text-lg font-medium text-slate-400">{job.company}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-6 py-4 shadow-sm">
            <span className="mb-1 block text-sm font-semibold text-slate-500">Status</span>
            {is_ready ? (
              <span className="flex items-center gap-2 font-bold text-emerald-300"><CheckCircle2 className="h-5 w-5" /> Ready for Interview</span>
            ) : (
              <span className="flex items-center gap-2 font-bold text-cyan-200"><Flame className="h-5 w-5" /> {missingSkills.length} Skills to Master</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {Object.entries(groupedRoadmap).map(([month, steps]) => (
            <section key={month} className="glass-panel p-6">
              <div className="mb-6">
                <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Month {month}</span>
              </div>
              <div className="relative space-y-6 pl-8">
                <div className="absolute bottom-0 left-[11px] top-0 w-[2px] bg-white/8">
                  <div className="cyber-flow-line absolute inset-0 bg-cyan-300/55" />
                </div>
                {steps.map((step, index) => (
                  <div key={`${month}-${index}`} className="relative">
                    <Motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.12 }}
                      className="absolute -left-8 top-5 h-6 w-6 rounded-full border border-cyan-300/30 bg-cyan-400/20 shadow-[0_0_22px_rgba(86,240,255,0.55)]"
                    />
                    <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6">
                      <h3 className="mb-2 text-xl font-bold text-white">{step.milestone}</h3>
                      <p className="mb-5 text-sm leading-relaxed text-slate-400">{step.description}</p>
                      <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-cyan-100">Resource Link</p>
                          <p className="text-xs text-slate-500">{step.resourceUrl}</p>
                        </div>
                        <MagneticButton
                          as="a"
                          href={step.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                        >
                          Access Course <ExternalLink className="h-3.5 w-3.5" />
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-panel sticky top-8 p-6">
            <h3 className="mb-4 border-b border-white/8 pb-3 text-lg font-bold text-white">Skill Gap Analysis</h3>
            {missingSkills.length > 0 ? (
              <div className="space-y-4">
                <p className="mb-4 text-sm leading-relaxed text-slate-400">The AI detected these missing competencies from your current profile compared to {job.company}&apos;s requirements.</p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-sm font-semibold text-cyan-100">{skill}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white">No Hard Skill Gaps</h4>
                <p className="mt-2 text-sm text-slate-400">You are academically ready. Focus on soft skills and system design.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
