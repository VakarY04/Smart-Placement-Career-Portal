import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { apiService } from '../services/api';
import { ArrowRight, Briefcase, Compass, FileSearch, Layers3, Sparkles, Target } from 'lucide-react';
import { CyberSkeleton, MagneticButton } from '../components/CyberMotion';

const skillTrendSeed = [48, 52, 50, 56, 59, 58, 63, 67, 69, 72];
const pipelineStages = ['Applied', 'Assessment', 'Interview', 'Offer'];
const applicationStatusStageMap = { Applied: 0, Interviewing: 2, Offered: 3, Rejected: 1 };

const clampPercentage = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));
const normalizeSkill = (skill) => String(skill || '').trim().toLowerCase();
const titleCaseSkill = (skill) => String(skill || '').split(' ').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

function AnimatedMatchPath({ points }) {
  const width = 340;
  const height = 140;
  const padding = 14;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);

  const path = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
    const y = height - padding - ((point - min) / range) * (height - padding * 2);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
      <defs>
        <linearGradient id="market-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#56f0ff" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#90fff3" />
        </linearGradient>
      </defs>
      <Motion.path
        d={path}
        fill="none"
        stroke="rgba(86,240,255,0.16)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      <Motion.path
        d={path}
        fill="none"
        stroke="url(#market-glow)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 12px rgba(86,240,255,0.66))' }}
      />
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-8">
        <CyberSkeleton className="mb-4 h-6 w-36" />
        <CyberSkeleton className="mb-3 h-12 w-2/3" />
        <CyberSkeleton className="h-5 w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="glass-panel p-6">
            <CyberSkeleton className="mb-4 h-4 w-28" />
            <CyberSkeleton className="mb-3 h-8 w-2/3" />
            <CyberSkeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CircularMetric({ label, value, color }) {
  const size = 110;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = clampPercentage(value);
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="light-surface rounded-3xl border border-white/8 bg-white/[0.03] p-4 text-center">
      <div className="mx-auto mb-3 h-28 w-28">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 12px ${color})` }}
          />
        </svg>
        <div className="pointer-events-none -mt-[75px] text-center">
          <div className="light-heading text-2xl font-black text-white">{safeValue}%</div>
        </div>
      </div>
      <p className="light-body text-sm font-semibold text-slate-300">{label}</p>
    </div>
  );
}

function PipelinePreview({ applications }) {
  if (!applications.length) {
    return <div className="light-surface rounded-3xl border border-dashed border-white/12 bg-white/[0.02] p-6 text-sm text-slate-400">Start tracking jobs to unlock your live node pipeline.</div>;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const stageIndex = applicationStatusStageMap[application.status] ?? 0;
        return (
          <div key={application._id || `${application.jobTitle}-${application.company}`} className="light-surface rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="light-heading text-base font-bold text-white">{application.jobTitle}</h4>
                <p className="light-body text-sm text-slate-400">{application.company}</p>
              </div>
              <span className="light-pill rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">{application.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {pipelineStages.map((stage, index) => {
                const active = index <= stageIndex;
                return (
                  <div key={`${application.jobTitle}-${stage}`} className="text-center">
                    <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${active ? 'border-cyan-300/50 bg-cyan-400/20 text-cyan-100 shadow-[0_0_16px_rgba(86,240,255,0.25)]' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
                      {index + 1}
                    </div>
                    <div className="relative h-1 rounded-full bg-white/6">
                      {active && <div className="cyber-flow-line absolute inset-0 rounded-full bg-cyan-300/50" />}
                    </div>
                    <p className="light-muted mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stage}</p>
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
  const [dashboardData, setDashboardData] = useState({ userName: '', profile: null, recommendations: [], applications: [] });

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
          recommendations: recommendationsResult.status === 'fulfilled' ? recommendationsResult.value?.recommendations || [] : [],
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
    const avgMatch = sortedRecommendations.length ? sortedRecommendations.reduce((sum, item) => sum + (item.matchPercentage || 0), 0) / sortedRecommendations.length : 0;
    const topMatch = sortedRecommendations[0]?.matchPercentage || 0;
    const marketMatchIndex = clampPercentage(avgMatch * 0.65 + topMatch * 0.35);
    const skillMomentum = Math.min((profile?.skills?.length || 0) * 1.8, 16);
    const sparklinePoints = skillTrendSeed.map((value, index) => clampPercentage(value + skillMomentum + index * 1.2 + marketMatchIndex * 0.18 - 10));

    const gapFrequencyMap = new Map();
    const roadmapTargets = new Map();

    sortedRecommendations.forEach((item) => {
      const job = item.job || {};
      const missingSkills = item.missingSkills || [];
      missingSkills.forEach((skill) => {
        const normalized = normalizeSkill(skill);
        if (!normalized || studentSkills.has(normalized)) return;
        const currentEntry = gapFrequencyMap.get(normalized) || { skill: titleCaseSkill(skill), count: 0, matchPercentage: 0, job, missingSkills };
        currentEntry.count += 1;
        if ((item.matchPercentage || 0) >= currentEntry.matchPercentage) {
          currentEntry.matchPercentage = item.matchPercentage || 0;
          currentEntry.job = job;
          currentEntry.missingSkills = missingSkills;
        }
        gapFrequencyMap.set(normalized, currentEntry);
        roadmapTargets.set(normalized, { jobId: job.id || job._id, jobTitle: job.title, company: job.company, missingSkills });
      });
    });

    const topGaps = [...gapFrequencyMap.entries()].sort(([, a], [, b]) => b.count - a.count || b.matchPercentage - a.matchPercentage).slice(0, 3).map(([key, value]) => ({
      key, ...value, roadmapTarget: roadmapTargets.get(key),
    }));

    const featuredApplications = [...applications].sort((a, b) => (applicationStatusStageMap[b.status] ?? 0) - (applicationStatusStageMap[a.status] ?? 0)).slice(0, 3);

    return {
      profileCompletenessScore,
      marketMatchIndex,
      sparklinePoints,
      topGaps,
      featuredApplications,
      recommendationCount: recommendations.length,
      atsMetrics: [
        { label: 'Technical Keywords', value: clampPercentage(((profile?.skills?.length || 0) * 9) + ((sortedRecommendations[0]?.breakdown?.skills || 0) / 60) * 45), color: '#56f0ff' },
        { label: 'Experience Impact', value: clampPercentage(((profile?.internships?.length || 0) * 28) + ((profile?.certifications?.length || 0) * 15) + (profile?.bio ? 18 : 0)), color: '#7cffd9' },
        { label: 'Formatting', value: clampPercentage(profileCompletenessScore * 0.72 + (profile?.bio ? 10 : 0)), color: '#f5feff' },
      ],
    };
  }, [dashboardData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-10">
      <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(86,240,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(125,255,231,0.08),_transparent_24%)]" />
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> Holographic Dashboard
            </span>
            <h1 className="holographic-text text-4xl font-black tracking-tight md:text-6xl">
              Welcome back{dashboardData.userName ? `, ${dashboardData.userName}` : ''}.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              Your career cockpit is tracking fit, readiness, and opportunities through a live cyber-minimalist surface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:w-[420px]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="light-muted text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Match Index</p>
              <p className="light-heading mt-2 text-4xl font-black text-white">{derived.marketMatchIndex}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="light-muted text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Active Roles</p>
              <p className="light-heading mt-2 text-4xl font-black text-white">{derived.recommendationCount}</p>
            </div>
          </div>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Market Readiness Widget</p>
              <h2 className="light-heading mt-2 text-2xl font-black text-white">Market Match Index</h2>
              <p className="light-body mt-2 text-sm text-slate-400">A glowing readiness line rendered from your strongest role alignment over time.</p>
            </div>
            <div className="light-pill rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-right text-cyan-200 shadow-[0_0_24px_rgba(86,240,255,0.14)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Current</p>
              <p className="mt-2 text-3xl font-black">{derived.marketMatchIndex}%</p>
            </div>
          </div>
          <div className="light-surface rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="light-muted mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Signal Trend</span>
              <span className="light-pill rounded-full px-3 py-1 text-cyan-200">Auto-drawing path</span>
            </div>
            <AnimatedMatchPath points={derived.sparklinePoints} />
            <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Top Gaps & Roadmap</p>
              <h2 className="light-heading mt-2 text-2xl font-black text-white">Highest Demand Skills Missing</h2>
              <p className="light-body mt-2 text-sm text-slate-400">The strongest role gaps surfaced through your current recommendation graph.</p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-3 text-cyan-200"><Layers3 className="h-6 w-6" /></div>
          </div>
          <div className="space-y-4">
            {derived.topGaps.length ? derived.topGaps.map((gap, index) => (
              <div key={gap.key} className="light-surface rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="light-pill flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">0{index + 1}</div>
                    <div>
                      <h3 className="light-heading text-lg font-bold text-white">{gap.skill}</h3>
                      <p className="light-body mt-1 text-sm text-slate-400">Missing in {gap.count} high-fit role{gap.count > 1 ? 's' : ''}{gap.job?.title ? ` including ${gap.job.title}` : ''}.</p>
                    </div>
                  </div>
                  <MagneticButton
                    type="button"
                    onClick={() => {
                      const target = gap.roadmapTarget;
                      if (!target?.jobId) {
                        navigate('/dashboard/recommendations');
                        return;
                      }
                      navigate(`/dashboard/roadmap/${target.jobId}`, { state: { missingSkills: target.missingSkills, focusSkill: gap.skill } });
                    }}
                    className="light-cta inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100"
                  >
                    Start Learning <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                </div>
              </div>
            )) : (
              <div className="light-surface rounded-3xl border border-dashed border-emerald-300/20 bg-emerald-400/6 p-6 text-sm text-emerald-200">
                Your profile is covering the visible hard-skill requirements well. Explore recommendations to deepen role-specific prep.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">ATS Scoring Insight</p>
              <h2 className="light-heading mt-2 text-2xl font-black text-white">Profile Health Breakdown</h2>
              <p className="light-body mt-2 text-sm text-slate-400">Signal distribution across keywords, experience, and formatting precision.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-3 text-cyan-200"><FileSearch className="h-6 w-6" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {derived.atsMetrics.map((metric) => <CircularMetric key={metric.label} {...metric} />)}
          </div>
          <div className="light-surface mt-5 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="light-heading text-sm font-semibold text-white">Overall profile completeness</p>
                <p className="light-body text-xs text-slate-400">Profile data density across academics, skills, and experience.</p>
              </div>
              <span className="light-pill text-3xl font-black text-cyan-100">{derived.profileCompletenessScore}%</span>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Active Pipeline Preview</p>
              <h2 className="light-heading mt-2 text-2xl font-black text-white">Top Applications In Motion</h2>
              <p className="light-body mt-2 text-sm text-slate-400">A compact node pipeline for your three most advanced opportunities.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-3 text-cyan-200"><Compass className="h-6 w-6" /></div>
          </div>
          <PipelinePreview applications={derived.featuredApplications} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MagneticButton as={Link} to="/dashboard/recommendations" className="glass-panel flex items-center justify-between p-5">
          <div>
            <p className="light-heading text-sm font-bold text-white">Explore Matches</p>
            <p className="light-body text-sm text-slate-400">Review recommended roles and fit scores.</p>
          </div>
          <Target className="h-5 w-5 text-cyan-200" />
        </MagneticButton>
        <MagneticButton as={Link} to="/dashboard/applications" className="glass-panel flex items-center justify-between p-5">
          <div>
            <p className="light-heading text-sm font-bold text-white">Open Tracker</p>
            <p className="light-body text-sm text-slate-400">Manage your full application board.</p>
          </div>
          <Briefcase className="h-5 w-5 text-cyan-200" />
        </MagneticButton>
        <MagneticButton as={Link} to="/dashboard/profile" className="glass-panel flex items-center justify-between p-5">
          <div>
            <p className="light-heading text-sm font-bold text-white">Refine Profile</p>
            <p className="light-body text-sm text-slate-400">Improve ATS and market readiness signals.</p>
          </div>
          <Sparkles className="h-5 w-5 text-cyan-200" />
        </MagneticButton>
      </div>
    </div>
  );
}
