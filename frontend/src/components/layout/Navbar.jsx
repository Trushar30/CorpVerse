import { Link, useLocation } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import {
  Terminal,
  Activity,
  Compass,
  Briefcase,
  Rocket,
  Radio,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  let isSignedIn = false;
  try {
    const userContext = useUser();
    isSignedIn = !!userContext?.isSignedIn;
  } catch (err) {
    isSignedIn = false;
  }

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090C15]/90 border-b border-slate-800/80 backdrop-blur-xl font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Kernel Badge */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded bg-[#151B2E] border border-slate-700 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-colors">
            <Terminal className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
              CORP<span className="text-acid font-mono">VERSE</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] rounded font-mono">
                [FSM]
              </span>
            </span>
            <span className="text-[9px] text-slate-500 font-mono -mt-0.5 tracking-wider uppercase">
              Simulator Engine
            </span>
          </div>
        </Link>

        {/* Dashboard Tabs OR Landing Navigation */}
        {isDashboard ? (
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#06080E] rounded-lg border border-slate-800">
            <Link
              to="/dashboard/job-seeker"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
                location.pathname.includes('/job-seeker') || location.pathname === '/dashboard'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>JOB_SEEKER</span>
            </Link>

            <Link
              to="/dashboard/employee"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
                location.pathname.includes('/employee')
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(0,245,160,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>EMPLOYEE</span>
            </Link>

            <Link
              to="/dashboard/founder"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
                location.pathname.includes('/founder')
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-violet-400" />
              <span>FOUNDER</span>
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <a href="#architecture" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span className="text-slate-600">//</span> 01. ARCHITECTURE
            </a>
            <a href="#fsm-states" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span className="text-slate-600">//</span> 02. FSM_STATES
            </a>
            <a href="#cli-terminal" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span className="text-slate-600">//</span> 03. CLI_TERMINAL
            </a>
          </div>
        )}

        {/* Right Actions & Auth Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#06080E] border border-slate-800 rounded text-[11px] text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>NET: <strong className="text-slate-200">ONLINE</strong></span>
          </div>

          <Link
            to="/sign-in"
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/dashboard"
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>COMMAND DECK</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
