import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function SkillsDisplay({ skills }) {
  if (!skills) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[250px] border-2 border-dashed border-slate-200 rounded-xl">
        <Sparkles className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-center font-medium">No skills extracted yet.</p>
        <p className="text-sm text-center mt-1">Upload a resume to see the magic.</p>
      </div>
    );
  }

  if (skills.loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-brand-500 min-h-[250px]">
        <Loader2 className="w-10 h-10 mb-4 animate-spin" />
        <p className="font-medium animate-pulse text-slate-700">Analyzing your resume</p>
        <p className="text-sm text-slate-500 mt-1">Our AI is extracting your top skills...</p>
      </div>
    );
  }

  if (skills.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 min-h-[250px] bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="font-medium text-red-700">Failed to extract skills.</p>
        <p className="text-sm text-red-600/80 mt-1">Please try uploading again or use a different file.</p>
      </div>
    );
  }

  const skillList = skills.skills || [];
  const atsData = skills.ats || null;

  if (skillList.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-amber-500 min-h-[250px] bg-amber-50 rounded-xl border border-amber-100">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="font-medium text-amber-700">No skills found.</p>
        <p className="text-sm text-amber-600/80 mt-1">We couldn't detect any skills in this document.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-600" />
        </div>
        <span className="text-sm font-medium text-brand-700">
          Supercharged Extractor Found {skillList.length} Skills
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2.5 mb-8">
        {skillList.map((skill, index) => (
          <div
            key={index}
            className="flex items-center bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 hover:border-brand-400 hover:text-brand-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-default group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full mr-2 group-hover:bg-brand-500 transition-colors"
              style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5] }}
            ></span>
            {skill}
          </div>
        ))}
      </div>

      {atsData && (
        <div className="mt-auto pt-6 border-t border-slate-100 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">ATS Score Analysis</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            
            {/* Score Ring */}
            <div className={`shrink-0 relative w-24 h-24 flex items-center justify-center rounded-full bg-white border-4 shadow-sm ${atsData.score >= 80 ? 'border-emerald-500' : atsData.score >= 50 ? 'border-amber-500' : 'border-rose-500'}`}>
              <div className="text-center">
                <span className="text-2xl font-black text-slate-800">{atsData.score}</span>
                <span className="text-xs text-slate-500 block -mt-1">/100</span>
              </div>
            </div>

            {/* Feedback List */}
            <div className="flex-1 space-y-3">
              <h4 className="font-bold text-slate-700 text-sm">Actionable Feedback</h4>
              <ul className="space-y-2">
                {atsData.feedback.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
