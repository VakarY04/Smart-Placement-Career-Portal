import { useEffect, useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import SkillsDisplay from '../components/SkillsDisplay';
import { apiService } from '../services/api';

export default function ResumeUploadPage() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const latestAnalysis = await apiService.getLatestResumeAnalysis();
        setAnalysis(latestAnalysis);
      } catch (error) {
        if (!(error?.status === 404 || String(error).includes('404'))) {
          console.error('Failed to load latest resume analysis', error);
        }
      }
    };

    fetchLatestAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Upload Resume</h1>
        <p className="mt-1 text-slate-300">
          Upload your latest PDF resume to extract AI skills, ATS insights, and optimization suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Resume File</h2>
            <ResumeUpload onAnalysisChange={setAnalysis} />
          </div>

          <div className="glass-panel p-6">
            <h2 className="mb-2 text-xl font-bold text-white">What AI Extracts</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Your resume is analyzed for categorized skills, an ATS score, and line-by-line optimization ideas that persist across sessions.
            </p>
          </div>
        </div>

        <div className="glass-panel min-h-[400px] p-6">
          <SkillsDisplay analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
