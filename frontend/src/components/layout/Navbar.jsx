import { Link, useLocation } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { Sparkles, Briefcase, UserCheck, Rocket, Compass } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const { isSignedIn } = useUser();

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-600/30 group-hover:shadow-violet-600/50 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1">
              Corp<span className="text-gradient">Verse</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest -mt-1 font-medium">
              Career Simulation
            </span>
          </div>
        </Link>

        {/* Center Nav Link / Role Tabs if on Dashboard */}
        {isDashboard && isSignedIn ? (
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-white/10">
            <Link
              to="/dashboard/job-seeker"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname.includes('/job-seeker') || location.pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Job Seeker
            </Link>

            <Link
              to="/dashboard/employee"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname.includes('/employee')
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Employee
            </Link>

            <Link
              to="/dashboard/founder"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname.includes('/founder')
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-amber-400" />
              Founder
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#journey" className="hover:text-purple-400 transition-colors">
              Career Arc
            </a>
            <a href="#companies" className="hover:text-amber-400 transition-colors">
              Seed Market
            </a>
          </div>
        )}

        {/* Right Actions / Clerk User Button */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link to="/sign-in">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            {!isDashboard && (
              <Link to="/dashboard">
                <Button variant="glow" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <div className="p-1 rounded-full border border-violet-500/30 bg-slate-900/80">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-full',
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
