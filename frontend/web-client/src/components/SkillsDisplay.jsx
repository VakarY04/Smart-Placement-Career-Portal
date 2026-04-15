import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((pill) => (
                <div key={pill} className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-5 text-brand-700">
        <p className="font-semibold">Scanning with AI...</p>
        <p className="mt-1 text-sm text-slate-500">Building categorized skills, ATS insights, and optimization suggestions.</p>
      </div>
    </div>
  );
}

export default function SkillsDisplay({ analysis }) {
  const [expandedExamples, setExpandedExamples] = useState({});

  if (!analysis) {
    return (
      <div className="flex min-h-[250px] h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
        <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-center font-medium">No resume analysis yet.</p>
        <p className="mt-1 text-center text-sm">Upload a resume to see AI-powered insights.</p>
      </div>
    );
  }

  if (analysis.loading) {
    return <AnalysisSkeleton />;
  }

  if (analysis.error) {
    return (
      <div className="flex min-h-[250px] h-full flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="mb-3 h-10 w-10" />
        <p className="font-medium text-red-700">Failed to analyze your resume.</p>
        <p className="mt-1 text-sm text-red-600/80">Please try uploading again or use a different file.</p>
      </div>
    );
  }

  const categories = Object.entries(analysis.skillsByCategory || analysis.skills_by_category || {});
  const suggestions = analysis.improvement_suggestions || [];

  if (!categories.length && !(analysis.skills || []).length) {
    return (
      <div className="flex min-h-[250px] h-full flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-500">
        <AlertCircle className="mb-3 h-10 w-10" />
        <p className="font-medium text-amber-700">No skills found.</p>
        <p className="mt-1 text-sm text-amber-600/80">The analyzer could not confidently extract skill signals from this resume.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis.warning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Advanced AI analysis is temporarily limited, so this result uses the built-in analyzer for now.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                <Sparkles className="h-4 w-4 text-brand-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-brand-700">AI Analysis</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Extracted Skills by Category</h3>
            <p className="mt-1 text-sm text-slate-500">
              AI grouped your resume into cleaner skill clusters for matching and ATS review.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">ATS Score</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{analysis.ats_score ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categories.map(([category, skillList]) => (
          <div key={category} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{category}</p>
            <div className="flex flex-wrap gap-2">
              {(skillList || []).map((skill) => (
                <span key={`${category}-${skill}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Resume Optimization</h3>
            <p className="text-sm text-slate-500">AI suggestions to improve clarity, impact, and recruiter readability.</p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => {
              const isOpen = Boolean(expandedExamples[index]);

              return (
                <div key={`${item.area}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{item.area || `Suggestion ${index + 1}`}</p>
                      <p className="mt-2 text-sm font-medium text-slate-700">{item.suggestion}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedExamples((prev) => ({ ...prev, [index]: !prev[index] }))}
                      className="inline-flex items-center gap-1 self-start rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-slate-900"
                    >
                      View Example {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-slate-700">
                      {item.example || 'No example provided for this suggestion.'}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              The analyzer did not return optimization suggestions for this resume yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
