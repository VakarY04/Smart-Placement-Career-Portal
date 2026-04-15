import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isAdminLogin = useMemo(() => new URLSearchParams(location.search).get('role') === 'admin', [location.search]);

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

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || { name: 'User' }));
      // Navigate to respective dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md glass-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {isAdminLogin ? 'Admin Sign In' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdminLogin ? 'JWT access must resolve to the ADMIN role.' : 'Sign in to your account'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link
            to="/login"
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${!isAdminLogin ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </span>
          </Link>
          <Link
            to="/login?role=admin"
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${isAdminLogin ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 ${isAdminLogin ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/50' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30 hover:shadow-brand-500/50'}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className={`${isAdminLogin ? 'text-indigo-600' : 'text-brand-600'} font-semibold hover:underline`}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
