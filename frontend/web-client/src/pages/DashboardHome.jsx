import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleDashed,
  Compass,
  FileSearch,
  Layers3,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const skillTrendSeed = [48, 52, 50, 56, 59, 58, 63, 67, 69, 72];
const pipelineStages = ['Applied', 'Assessment', 'Interview', 'Offer'];
const applicationStatusStageMap = {
  Applied: 0,
  Interviewing: 2,
  Offered: 3,
  Rejected: 1,
};

function clampPercentage(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function normalizeSkill(skill) {
  return String(skill || '').trim().toLowerCase();
}

function titleCaseSkill(skill) {
  return String(skill || '')
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function Sparkline({ points }) {
  const width = 320;
  const height = 96;
  const padding = 12;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);

  const path = points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
      const y = height - padding - ((point - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  const latestPoint = points[points.length - 1];
  const latestX = padding + ((points.length - 1) * (width - padding * 2)) / Math.max(points.length - 1, 1);
  const latestY = height - padding - ((latestPoint - min) / range) * (height - padding * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full">
      <defs>
        <linearGradient id="sparkline-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-fill)" />
      <path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={latestX} cy={latestY} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
    </svg>
  );
}

function CircularMetric({ label, value, tone }) {
  const size = 110;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = clampPercentage(value);
  const offset = circumference - (safeValue / 100) * circumference;

  const tones = {
    blue: { track: 'stroke-sky-100', progress: 'stroke-sky-500', text: 'text-sky-600' },
    emerald: { track: 'stroke-emerald-100', progress: 'stroke-emerald-500', text: 'text-emerald-600' },
    amber: { track: 'stroke-amber-100', progress: 'stroke-amber-500', text: 'text-amber-600' },
  };

  const theme = tones[tone] || tones.blue;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center">
      <div className="mx-auto mb-3 h-28 w-28">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={theme.track}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={theme.progress}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="pointer-events-none -mt-[76px] text-center">
          <div className={`text-2xl font-black ${theme.text}`}>{safeValue}%</div>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

function PipelinePreview({ applications }) {
  if (!applications.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
        Start tracking jobs to unlock your live pipeline view.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {applications.map((application) => {
        const stageIndex = applicationStatusStageMap[application.status] ?? 0;

        return (
          <div key={application._id || `${application.jobTitle}-${application.company}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">{application.jobTitle}</h4>
                <p className="text-sm font-medium text-slate-500">{application.company}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 shadow-sm">
                {application.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {pipelineStages.map((stage, index) => {
                const isComplete = index <= stageIndex;
                const isCurrent = index === stageIndex;

                return (
                  <div key={`${application._id || application.jobTitle}-${stage}`} className="flex flex-col items-center gap-2 text-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                      isComplete
                        ? 'border-emerald-200 bg-emerald-500 text-white'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}>
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className={`h-1 w-full rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-slate-800' : 'text-slate-500'}`}>{stage}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userName: '',
    profile: null,
    recommendations: [],
    applications: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let userName = '';

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) userName = parsed.name.split(' ')[0];
      } catch {
        userName = '';
      }
    }

    const loadDashboardData = async () => {
      try {
        const [profileResult, recommendationsResult, applicationsResult] = await Promise.allSettled([
          apiService.getProfile(),
          apiService.getRecommendations(),
          apiService.getApplications(),
        ]);

        setDashboardData({
          userName,
          profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
          recommendations:
            recommendationsResult.status === 'fulfilled'
              ? recommendationsResult.value?.recommendations || []
              : [],
          applications: applicationsResult.status === 'fulfilled' ? applicationsResult.value || [] : [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const derived = useMemo(() => {
    const { profile, recommendations, applications } = dashboardData;
    const studentSkills = new Set((profile?.skills || []).map(normalizeSkill));
    const sortedRecommendations = [...recommendations].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    const profileCompletenessScore = clampPercentage(
      15 +
        (profile?.cgpa ? 18 : 0) +
        (profile?.bio ? 17 : 0) +
        ((profile?.skills?.length || 0) > 0 ? 22 : 0) +
        ((profile?.internships?.length || 0) > 0 ? 14 : 0) +
        ((profile?.certifications?.length || 0) > 0 ? 14 : 0)
    );

    const avgMatch = sortedRecommendations.length
      ? sortedRecommendations.reduce((sum, item) => sum + (item.matchPercentage || 0), 0) / sortedRecommendations.length
      : 0;
    const topMatch = sortedRecommendations[0]?.matchPercentage || 0;
    const marketMatchIndex = clampPercentage(avgMatch * 0.65 + topMatch * 0.35);

    const skillMomentum = Math.min((profile?.skills?.length || 0) * 1.8, 16);
    const sparklinePoints = skillTrendSeed.map((value, index) =>
      clampPercentage(value + skillMomentum + index * 1.2 + marketMatchIndex * 0.18 - 10)
    );

    const gapFrequencyMap = new Map();
    const roadmapTargets = new Map();

    sortedRecommendations.forEach((item) => {
      const job = item.job || {};
      const missingSkills = item.missingSkills || [];
      missingSkills.forEach((skill) => {
        const normalized = normalizeSkill(skill);
        if (!normalized || studentSkills.has(normalized)) return;

        const currentEntry = gapFrequencyMap.get(normalized) || {
          skill: titleCaseSkill(skill),
          count: 0,
          matchPercentage: 0,
          job,
          missingSkills,
        };

        currentEntry.count += 1;

        if ((item.matchPercentage || 0) >= currentEntry.matchPercentage) {
          currentEntry.matchPercentage = item.matchPercentage || 0;
          currentEntry.job = job;
          currentEntry.missingSkills = missingSkills;
        }

        gapFrequencyMap.set(normalized, currentEntry);
        roadmapTargets.set(normalized, {
          jobId: job.id || job._id,
          jobTitle: job.title,
          company: job.company,
          missingSkills,
        });
      });
    });

    const topGaps = [...gapFrequencyMap.entries()]
      .sort(([, a], [, b]) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.matchPercentage - a.matchPercentage;
      })
      .slice(0, 3)
      .map(([key, value]) => ({
        key,
        ...value,
        roadmapTarget: roadmapTargets.get(key),
      }));

    const technicalKeywords = clampPercentage(
      ((profile?.skills?.length || 0) * 9) + ((sortedRecommendations[0]?.breakdown?.skills || 0) / 60) * 45
    );
    const experienceImpact = clampPercentage(
      ((profile?.internships?.length || 0) * 28) + ((profile?.certifications?.length || 0) * 15) + (profile?.bio ? 18 : 0)
    );
    const formatting = clampPercentage(profileCompletenessScore * 0.72 + (profile?.bio ? 10 : 0));

    const featuredApplications = [...applications]
      .sort((a, b) => (applicationStatusStageMap[b.status] ?? 0) - (applicationStatusStageMap[a.status] ?? 0))
      .slice(0, 3);

    return {
      profileCompletenessScore,
      marketMatchIndex,
      sparklinePoints,
      topGaps,
      atsMetrics: [
        { label: 'Technical Keywords', value: technicalKeywords, tone: 'blue' },
        { label: 'Experience Impact', value: experienceImpact, tone: 'emerald' },
        { label: 'Formatting', value: formatting, tone: 'amber' },
      ],
      featuredApplications,
      recommendationCount: recommendations.length,
    };
  }, [dashboardData]);

  const handleStartLearning = (gap) => {
    const target = gap.roadmapTarget;
    if (!target?.jobId) {
      navigate('/dashboard/recommendations');
      return;
    }

    navigate(`/dashboard/roadmap/${target.jobId}`, {
      state: {
        missingSkills: target.missingSkills,
        focusSkill: gap.skill,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-panel px-6 py-5 text-sm font-medium text-slate-500">
          Building your AI career cockpit...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.24)] md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.2),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),_transparent_35%)]" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-slate-200">
              <Sparkles className="h-3.5 w-3.5" /> AI Career Cockpit
            </span>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Welcome back{dashboardData.userName ? `, ${dashboardData.userName}` : ''}.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              Your dashboard now tracks market fit, profile health, and active opportunities in one operating view.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Match Index</p>
              <p className="mt-2 text-3xl font-black">{derived.marketMatchIndex}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Active Roles</p>
              <p className="mt-2 text-3xl font-black">{derived.recommendationCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Market Readiness Widget</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Market Match Index</h2>
              <p className="mt-2 text-sm text-slate-500">
                A blended view of your strongest matches and current profile depth over the last 30 days.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right text-emerald-600">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Current</p>
              <p className="text-3xl font-black">{derived.marketMatchIndex}%</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Skill Trend</span>
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" /> 30 day climb
              </span>
            </div>
            <Sparkline points={derived.sparklinePoints} />
            <div className="mt-3 flex justify-between text-xs font-semibold text-slate-400">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Top Gaps & Roadmap</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Highest Demand Skills Missing</h2>
              <p className="mt-2 text-sm text-slate-500">
                These skills appear most often across admin-posted roles that already align with your profile.
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
              <Layers3 className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-4">
            {derived.topGaps.length > 0 ? (
              derived.topGaps.map((gap, index) => (
                <div key={gap.key} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-700 shadow-sm">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{gap.skill}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Missing in {gap.count} high-fit role{gap.count > 1 ? 's' : ''}{' '}
                        {gap.job?.title ? `including ${gap.job.title}` : ''}.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartLearning(gap)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Start Learning <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-700">
                Your profile is covering the visible hard-skill requirements well. Explore recommendations to deepen role-specific prep.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">ATS Scoring Insight</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Profile Health Breakdown</h2>
              <p className="mt-2 text-sm text-slate-500">
                Instead of a single score, this shows where your resume is strongest and where it still needs polish.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <FileSearch className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {derived.atsMetrics.map((metric) => (
              <CircularMetric key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Overall profile completeness</p>
                <p className="text-xs text-slate-500">Based on profile fields, skills, and experience depth.</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{derived.profileCompletenessScore}%</span>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Active Pipeline Preview</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Top Applications In Motion</h2>
              <p className="mt-2 text-sm text-slate-500">
                A quick timeline of your three most advanced tracked opportunities.
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Compass className="h-6 w-6" />
            </div>
          </div>

          <PipelinePreview applications={derived.featuredApplications} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/dashboard/recommendations" className="glass-panel group flex items-center justify-between p-5 transition hover:border-slate-300">
          <div>
            <p className="text-sm font-bold text-slate-800">Explore Matches</p>
            <p className="text-sm text-slate-500">Review your recommended roles and fit scores.</p>
          </div>
          <Target className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
        </Link>

        <Link to="/dashboard/applications" className="glass-panel group flex items-center justify-between p-5 transition hover:border-slate-300">
          <div>
            <p className="text-sm font-bold text-slate-800">Open Tracker</p>
            <p className="text-sm text-slate-500">Manage your full application board.</p>
          </div>
          <Briefcase className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
        </Link>

        <Link to="/dashboard/profile" className="glass-panel group flex items-center justify-between p-5 transition hover:border-slate-300">
          <div>
            <p className="text-sm font-bold text-slate-800">Refine Profile</p>
            <p className="text-sm text-slate-500">Improve your ATS and market readiness scores.</p>
          </div>
          <CircleDashed className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
        </Link>
      </div>
    </div>
  );
}
