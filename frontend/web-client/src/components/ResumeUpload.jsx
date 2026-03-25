import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function ResumeUpload({ onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    setSuccess(false);

    if (rejectedFiles?.length > 0) {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    setSuccess(false);
    onSkillsExtracted(null); // Clear skills if file is removed
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    onSkillsExtracted({ loading: true }); 

    try {
      const response = await apiService.uploadResume(file);
      setSuccess(true);
      
      const newSkills = response?.skills || [];
      const atsData = response?.ats || null;
      
      if (newSkills.length > 0) {
        onSkillsExtracted({ skills: newSkills, ats: atsData, loading: false });
        
        // Background Profile Merge
        try {
          let profile = await apiService.getProfile().catch(() => null);
          if (profile) {
            const mergedSkills = Array.from(new Set([...(profile.skills || []), ...newSkills]));
            await apiService.updateProfile({ ...profile, skills: mergedSkills });
          } else {
            await apiService.createProfile({ skills: newSkills });
          }
        } catch (mergeErr) {
          console.error("Failed to merge skills to profile in background:", mergeErr);
        }
        
      } else {
        onSkillsExtracted({ skills: [], ats: null, loading: false });
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload and extract skills.');
      onSkillsExtracted({ error: true, loading: false });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 
            ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-brand-600' : 'text-slate-400'}`} />
          <p className="text-slate-700 font-medium mb-1">
            {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your resume here'}
          </p>
          <p className="text-slate-500 text-sm">or click to browse from your computer</p>
          <div className="mt-6 flex justify-center">
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
              PDF only (Max 5MB)
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center">
                <File className="w-5 h-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            
            {!isUploading && !success && (
              <button
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {success && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || success}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
              success
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? 'Extracting Skills...' : success ? 'Uploaded & Extracted' : 'Upload and Extract'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
