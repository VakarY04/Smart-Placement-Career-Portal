import { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import SkillsDisplay from '../components/SkillsDisplay';

export default function ResumeUploadPage() {
  const [extractedSkills, setExtractedSkills] = useState(null);

  // Callback to receive skills from the child upload component
  const handleSkillsExtracted = (skills) => {
    setExtractedSkills(skills);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Upload Resume</h1>
        <p className="text-slate-500 mt-1">
          Upload your latest PDF resume to extract skills and match with career paths automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Resume File</h2>
            <ResumeUpload onSkillsExtracted={handleSkillsExtracted} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Extracted Skills</h2>
            <SkillsDisplay skills={extractedSkills} />
          </div>
        </div>
      </div>
    </div>
  );
}
