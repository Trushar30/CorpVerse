import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import {
  Terminal,
  ShieldCheck,
  Radio,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  Compass,
  Zap,
} from 'lucide-react';

export default function AuthPage({ mode = 'sign-in' }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === 'sign-in';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        user = await register({ name, email, password });
      }

      // Redirect based on profile completion and role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (!user.isVerified) {
        navigate('/verify-email');
      } else if (!user.profileComplete) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (isLogin ? 'Invalid credentials. Please try again.' : 'Registration failed. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-md w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">

          {/* Terminal Header */}
          <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                [AUTH_GATEWAY_V2] :: {isLogin ? 'AUTHENTICATE' : 'INITIALIZE_IDENTITY'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>ENCRYPTED</span>
            </div>
          </div>

          {/* Auth Form */}
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold font-sans text-slate-100">
                {isLogin ? 'Welcome Back, Operator' : 'Create Your Identity'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                {isLogin
                  ? 'Enter credentials to access the CorpVerse command deck.'
                  : 'Start your career simulation as a Job Seeker and evolve through gameplay.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (register only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none text-slate-100 font-mono"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@corpverse.com"
                  className="w-full px-3 py-2.5 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none text-slate-100 font-mono"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                    className="w-full px-3 py-2.5 pr-10 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Starting Tier Indicator (register only) */}
              {!isLogin && (
                <div className="p-3 bg-[#06080E] border border-emerald-500/30 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-300">STARTING TIER: JOB SEEKER</div>
                      <div className="text-[10px] text-slate-400">Earn EXP through interviews & tasks to unlock Working & Founder modes.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                id="auth-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'AUTHENTICATING...' : '[AUTHENTICATE & ENTER]'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'INITIALIZING PERSONA...' : '[INITIALIZE PERSONA]'}</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle link */}
            <div className="text-center text-xs text-slate-500 pt-2">
              {isLogin ? (
                <span>
                  No identity yet?{' '}
                  <Link to="/sign-up" className="text-cyan-400 hover:text-cyan-300 font-bold">
                    Initialize one
                  </Link>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <Link to="/sign-in" className="text-cyan-400 hover:text-cyan-300 font-bold">
                    Authenticate
                  </Link>
                </span>
              )}
            </div>
          </div>

          {/* Security Footer */}
          <div className="p-3 bg-[#06080E] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DETERMINISTIC_SECURITY_OK</span>
            </span>
            <span>HASH: 0x88f21e</span>
          </div>

        </div>
      </div>
    </div>
  );
}
