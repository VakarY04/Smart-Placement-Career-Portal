import { createElement, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ShieldCheck, GraduationCap } from 'lucide-react';
import { apiService } from '../services/api';

function RoleToggle({ active, href, icon: Icon, label }) {
  const isActive = active;

  return (
    <Link
      to={href}
      className={`relative rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        isActive
          ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.18)]'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/20 hover:text-white'
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {createElement(Icon, { className: 'h-4 w-4' })}
        {label}
      </span>
      {isActive && <span className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-300/50" />}
    </Link>
  );
}

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
      <Motion.span
        className="absolute inset-0 border border-white/70"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
      />
      <Motion.span
        className="absolute inset-[3px] border border-cyan-200"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
    </div>
  );
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLogin = useMemo(() => new URLSearchParams(location.search).get('role') === 'admin', [location.search]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanKey, setScanKey] = useState({ email: 0, password: 0 });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiService.login(email, password);
      const normalizedRole = data.user?.role;

      if (isAdminLogin && normalizedRole !== 'ADMIN') {
        throw new Error('This login is reserved for admins with the ADMIN role.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { name: 'User' }));

      if (normalizedRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard/resume-upload');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">Cyber-Entry Portal</p>
            <h1 className="text-3xl font-black text-white">{isAdminLogin ? 'Admin Access' : 'Welcome Back'}</h1>
            <p className="mt-2 text-sm text-slate-400">{isAdminLogin ? 'Authenticate with elevated placement-cell privileges.' : 'Authenticate to enter the student command surface.'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <RoleToggle active={!isAdminLogin} href="/login" icon={GraduationCap} label="Student" />
            <RoleToggle active={isAdminLogin} href="/login?role=admin" icon={ShieldCheck} label="Admin" />
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/8 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <AuthInput
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setScanKey((prev) => ({ ...prev, email: prev.email + 1 }));
              }}
              placeholder="you@example.com"
              scanKey={scanKey.email}
            />

            <AuthInput
              label="Password"
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setScanKey((prev) => ({ ...prev, password: prev.password + 1 }));
              }}
              placeholder="••••••••"
              scanKey={scanKey.password}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.24)] transition hover:shadow-[0_0_32px_rgba(34,211,238,0.34)] disabled:opacity-70 animate-pulse"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <DecryptLoader /> Decrypting...
                  </>
                ) : (
                  'Enter Portal'
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-cyan-200 hover:text-white">
              Sign up
            </Link>
          </p>
        </Motion.div>
      </div>
    </div>
  );
}
