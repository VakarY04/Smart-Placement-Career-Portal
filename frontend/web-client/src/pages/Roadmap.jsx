import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { ArrowLeft, Briefcase, CheckCircle2, ExternalLink, Flame, GraduationCap, Bookmark } from 'lucide-react';

function RoadmapSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((month) => (
        <div key={month} className="glass-panel p-6">
          <div className="mb-4 h-6 w-24 rounded-full bg-slate-200" />
          <div className="mb-3 h-6 w-2/3 rounded bg-slate-200" />
          <div className="mb-2 h-4 w-full rounded bg-slate-200" />
          <div className="mb-6 h-4 w-5/6 rounded bg-slate-200" />
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-10 w-36 rounded-lg bg-slate-200" />
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
        const selectedRecommendation = recommendations.find((item) => {
          const recommendationJobId = item?.job?.id || item?.job?._id;
          return recommendationJobId === jobId;
        });

        if (!selectedRecommendation) {
          throw new Error('Could not find the selected role in your current recommendations.');
        }

        const job = selectedRecommendation.job;
        const missingSkills = selectedRecommendation.missingSkills || location.state?.missingSkills || [];
        const targetRole = location.state?.targetRole || job.title;

        const generated = await apiService.generateRoadmap({
          missingSkills,
          targetRole,
        });

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
      <div className="animate-fade-in-up space-y-8 pb-10">
        <div className="flex min-h-[20vh] flex-col items-center justify-center text-slate-500">
          <p className="font-medium animate-pulse">AI is thinking through your 3-month roadmap...</p>
        </div>
        <RoadmapSkeleton />
      </div>
    );
  }

  if (error || !roadmapData) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 flex items-center justify-between">
        <p className="font-medium">{error || 'Something went wrong.'}</p>
        <Link to="/dashboard/recommendations" className="rounded border border-red-200 bg-white px-3 py-1 text-sm hover:bg-red-50">Back</Link>
      </div>
    );
  }

  const { job, is_ready, missingSkills } = roadmapData;

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <Link to="/dashboard/recommendations" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to My Matches
      </Link>

      <div className="glass-panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-gradient-to-bl from-brand-100 to-transparent opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
              <Briefcase className="h-3.5 w-3.5" /> Target Role
            </div>
            <h1 className="mb-2 text-3xl font-extrabold text-slate-800 md:text-4xl">{job.title}</h1>
            <p className="text-lg font-medium text-slate-500">{job.company}</p>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
            <span className="mb-1 text-sm font-semibold text-slate-400">Status</span>
            {is_ready ? (
              <span className="flex items-center gap-2 font-bold text-emerald-500">
                <CheckCircle2 className="h-5 w-5" /> Ready for Interview
              </span>
            ) : (
              <span className="flex items-center gap-2 font-bold text-amber-500">
                <Flame className="h-5 w-5" /> {missingSkills.length} Skills to Master
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
            <GraduationCap className="h-6 w-6 text-brand-500" /> Your Study Timeline
          </h2>

          <div className="relative ml-4 space-y-10 border-l-2 border-slate-200 pb-4 pl-8">
            {Object.entries(groupedRoadmap).map(([month, steps]) => (
              <div key={month} className="relative">
                <div className="absolute -left-[42px] top-1 h-5 w-5 rounded-full border-4 border-slate-100 bg-white">
                  <div className="h-full w-full rounded-full bg-brand-500" />
                </div>

                <div className="space-y-4">
                  <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
                    Month {month}
                  </span>

                  {steps.map((step, idx) => (
                    <div key={`${month}-${idx}`} className="glass-panel p-6 transition-transform duration-300 hover:-translate-y-1">
                      <h3 className="mb-2 text-xl font-bold text-slate-800">{step.milestone}</h3>
                      <p className="mb-6 text-sm leading-relaxed text-slate-600">{step.description}</p>

                      <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Bookmark className="mt-0.5 h-5 w-5 text-indigo-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-700">Learning Resource</p>
                            <p className="text-xs font-medium text-slate-500">{step.resourceUrl}</p>
                          </div>
                        </div>

                        <a
                          href={step.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-600"
                        >
                          Access Course <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel sticky top-8 p-6">
            <h3 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-800">Skill Gap Analysis</h3>

            {missingSkills.length > 0 ? (
              <div className="space-y-4">
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  The AI detected these core competencies missing from your current profile compared to {job.company}&apos;s requirements.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-700">No Hard Skill Gaps!</h4>
                <p className="mt-2 text-sm text-slate-500">You are academically ready. Focus on soft skills and system design.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
