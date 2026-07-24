import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Sparkles, Briefcase, Rocket, Compass } from 'lucide-react';
import Button from '../ui/Button';

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
    <header className="sticky top-0 z-50 w-full bg-cozy-base border-b-[1.5px] border-cozy-border-accent shadow-sm">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-cozy-surface border-[1.5px] border-cozy-border-accent shadow-[0_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center group-hover:-translate-y-[1px] transition-transform">
            <Sparkles className="w-4 h-4 text-cozy-accent-primary" />
          </div>
          <span className="font-sans font-bold text-[19px] text-cozy-text-primary tracking-tight">
            CorpVerse
          </span>
        </Link>

        {isDashboard ? (
          <nav className="hidden md:flex items-center gap-2 p-1.5 bg-cozy-elevated rounded-full border-[1.5px] border-cozy-border-accent shadow-inner">
            <Link
              to="/dashboard/job-seeker"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-sans text-[13px] font-bold transition-colors ${
                location.pathname.includes('/job-seeker') || location.pathname === '/dashboard'
                  ? 'bg-cozy-surface text-cozy-text-primary shadow-[0_1px_0_rgba(0,0,0,0.2)] border border-cozy-border-accent/50'
                  : 'text-cozy-text-secondary hover:text-cozy-text-primary hover:bg-cozy-surface/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Job Seeker
            </Link>

            <Link
              to="/dashboard/employee"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-sans text-[13px] font-bold transition-colors ${
                location.pathname.includes('/employee')
                  ? 'bg-cozy-surface text-cozy-text-primary shadow-[0_1px_0_rgba(0,0,0,0.2)] border border-cozy-border-accent/50'
                  : 'text-cozy-text-secondary hover:text-cozy-text-primary hover:bg-cozy-surface/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Employee
            </Link>

            <Link
              to="/dashboard/founder"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-sans text-[13px] font-bold transition-colors ${
                location.pathname.includes('/founder')
                  ? 'bg-cozy-surface text-cozy-text-primary shadow-[0_1px_0_rgba(0,0,0,0.2)] border border-cozy-border-accent/50'
                  : 'text-cozy-text-secondary hover:text-cozy-text-primary hover:bg-cozy-surface/50'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Founder
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-8 font-sans text-[14px] font-bold text-cozy-text-secondary">
            <a href="#features" className="hover:text-cozy-text-primary transition-colors">
              Features
            </a>
            <a href="#journey" className="hover:text-cozy-text-primary transition-colors">
              The Journey
            </a>
            <a href="#companies" className="hover:text-cozy-text-primary transition-colors">
              First Stop
            </a>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link to="/sign-in">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex border-[1.5px] border-transparent hover:border-cozy-border-accent font-sans">
              Sign In
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" size="sm" className="font-sans">
              Play →
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
