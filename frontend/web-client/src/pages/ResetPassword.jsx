import { createElement, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { apiService } from '../services/api';

function AuthInput({ label, icon: Icon, type, value, onChange, placeholder, scanKey }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition focus-within:border-cyan-300/50 focus-within:shadow-[0_0_22px_rgba(34,211,238,0.18)]">
        {createElement(Icon, { className: 'absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' })}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-transparent py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500"
          placeholder={placeholder}
        />
        {scanKey > 0 && <span key={scanKey} className="auth-scan-line" />}
      </div>
    </div>
  );
}

function DecryptLoader() {
  return (
    <div className="relative h-4 w-4">
      <Motion.span className="absolute inset-0 border border-white/70" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
      <Motion.span className="absolute inset-[3px] border border-cyan-200" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
    </div>
  );
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanKey, setScanKey] = useState({ password: 0, confirmPassword: 0 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiService.resetPassword(token, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { name: 'User' }));
      setMessage('Password reset complete. Redirecting...');

      setTimeout(() => {
        if (data.user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard/resume-upload');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 py-10">
      <div className="auth-grid-overlay" />
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="breathing-cyan w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
        >
          <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">Credential Rebuild</p>
            <h1 className="text-3xl font-black text-white">Create New Password</h1>
            <p className="mt-2 text-sm text-slate-400">Choose a new password to restore your portal access.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/8 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-3 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              label="New Password"
              icon={Lock}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setScanKey((current) => ({ ...current, password: current.password + 1 }));
              }}
              placeholder="••••••••"
              scanKey={scanKey.password}
            />

            <AuthInput
              label="Confirm Password"
              icon={Lock}
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setScanKey((current) => ({ ...current, confirmPassword: current.confirmPassword + 1 }));
              }}
              placeholder="••••••••"
              scanKey={scanKey.confirmPassword}
            />

            <button
              type="submit"
              disabled={isLoading || Boolean(message)}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.24)] transition hover:shadow-[0_0_32px_rgba(34,211,238,0.34)] disabled:opacity-70"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <DecryptLoader /> Updating...
                  </>
                ) : (
                  'Reset Password'
                )}
              </span>
            </button>
          </form>
        </Motion.div>
      </div>
    </div>
  );
}
