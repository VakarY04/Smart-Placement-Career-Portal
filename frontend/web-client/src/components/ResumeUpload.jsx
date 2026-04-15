import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function ResumeUpload({ onAnalysisChange }) {
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
    onAnalysisChange(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    onAnalysisChange({ loading: true });

    try {
      const response = await apiService.uploadResume(file);
      setSuccess(true);
      onAnalysisChange({ ...response.analysis, loading: false });
    } catch (err) {
      setError(err?.message || 'Failed to upload and analyze resume.');
      onAnalysisChange({ error: true, loading: false });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {!file ? (
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragActive ? 'border-cyan-300/60 bg-cyan-400/8' : 'border-white/30 bg-white/[0.02] hover:border-cyan-300/45 hover:bg-white/[0.04]'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`mx-auto mb-4 h-12 w-12 ${isDragActive ? 'text-cyan-200' : 'text-slate-300'}`} />
          <p className="mb-1 font-medium text-white">
            {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your resume here'}
          </p>
          <p className="text-sm text-slate-300">or click to browse from your computer</p>
          <div className="mt-6 flex justify-center">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
              PDF only (Max 5MB)
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                <File className="h-5 w-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-white" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            {!isUploading && !success && (
              <button
                onClick={handleRemoveFile}
                className="p-1 text-slate-400 transition-colors hover:text-red-300"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {success && <CheckCircle2 className="h-6 w-6 text-emerald-300" />}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || success}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all ${
              success
                ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
                : 'border border-cyan-300/20 bg-cyan-400/10 text-white shadow-lg shadow-cyan-500/10 hover:bg-cyan-400/16'
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isUploading ? 'Scanning with AI...' : success ? 'Analyzed with AI' : 'Upload and Analyze'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/8 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
