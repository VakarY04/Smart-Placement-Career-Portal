import { createElement, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, GraduationCap, Building2 } from 'lucide-react';
import { apiService } from '../services/api';

function RoleTile({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
        active
          ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.18)]'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/20 hover:text-white'
      }`}
    >
      <span className="flex flex-col items-center justify-center gap-2">
        {createElement(Icon, { className: 'h-6 w-6' })}
        {label}
      </span>
      {active && <span className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-300/50" />}
    </button>
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
      <Motion.span className="absolute inset-0 border border-white/70" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
      <Motion.span className="absolute inset-[3px] border border-cyan-200" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanKey, setScanKey] = useState({ name: 0, email: 0, password: 0 });

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiService.register(name, email, password, role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { name, role }));

      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard/resume-upload');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <h1 className="text-3xl font-black text-white">Create Access</h1>
            <p className="mt-2 text-sm text-slate-400">Generate a secure identity for the placement ecosystem.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <RoleTile active={role === 'STUDENT'} icon={GraduationCap} label="Student" onClick={() => setRole('STUDENT')} />
            <RoleTile active={role === 'ADMIN'} icon={Building2} label="Admin" onClick={() => setRole('ADMIN')} />
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/8 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <AuthInput
              label="Full Name"
              icon={User}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setScanKey((prev) => ({ ...prev, name: prev.name + 1 }));
              }}
              placeholder="John Doe"
              scanKey={scanKey.name}
            />

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
                  `Create ${role === 'ADMIN' ? 'Admin Access' : 'Account'}`
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have access?{' '}
            <Link to={role === 'ADMIN' ? '/login?role=admin' : '/login'} className="font-semibold text-cyan-200 hover:text-white">
              Log in
            </Link>
          </p>
        </Motion.div>
      </div>
    </div>
  );
}
