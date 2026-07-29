import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import {
  Terminal,
  Search,
  Moon,
  ChevronDown,
  Compass,
  Briefcase,
  Rocket,
  Coins,
  Zap,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let isSignedIn = false;
  try {
    const userContext = useUser();
    isSignedIn = !!userContext?.isSignedIn;
  } catch (err) {
    isSignedIn = false;
  }

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0e14]/95 border-b-2 border-black backdrop-blur-md font-pixel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Gold Coin Badge */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#ffc700] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:rotate-12 transition-transform">
            <Coins className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <span className="font-pixel-heading text-xl font-bold tracking-wider text-white flex items-center gap-1.5 drop-shadow-[2px_2px_0px_#000]">
            Corp<span className="text-[#ffc700]">Verse</span>
          </span>
        </Link>

        {/* Dashboard Tabs OR Landing Navigation (Desktop) */}
        {isDashboard ? (
          <nav className="hidden md:flex items-center gap-2 p-1 bg-[#06080e] rounded border-2 border-black shadow-[3px_3px_0px_#000]">
            <Link
              to="/dashboard/job-seeker"
              className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${
                location.pathname.includes('/job-seeker') || location.pathname === '/dashboard'
                  ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>JOB_SEEKER</span>
            </Link>

            <Link
              to="/dashboard/employee"
              className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${
                location.pathname.includes('/employee')
                  ? 'bg-emerald-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>EMPLOYEE</span>
            </Link>

            <Link
              to="/dashboard/founder"
              className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${
                location.pathname.includes('/founder')
                  ? 'bg-purple-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>FOUNDER</span>
            </Link>
          </nav>
        ) : (
          <div className="hidden lg:flex items-center gap-6 sm:gap-8 text-xs xl:text-sm font-pixel text-slate-200 whitespace-nowrap">
            <a href="#quests" className="hover:text-[#ffc700] transition-colors flex items-center gap-1">
              Quests <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a href="#simulator" className="hover:text-[#ffc700] transition-colors flex items-center gap-1">
              Simulator <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a href="#journey" className="hover:text-[#ffc700] transition-colors">
              Career Arc
            </a>
            <a href="#leaderboard" className="hover:text-[#ffc700] transition-colors flex items-center gap-1">
              Leaderboard <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a href="#pricing" className="hover:text-[#ffc700] transition-colors">
              Pricing
            </a>
          </div>
        )}

        {/* Right Actions & Mobile Toggle */}
        <div className="flex items-center gap-3 font-pixel">
          <button
            aria-label="Search"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <button
            aria-label="Toggle Theme"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block"
          >
            <Moon className="w-4 h-4" />
          </button>

          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 bg-[#ffc700] hover:bg-[#ffd633] text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] rounded transition-all flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">COMMAND DECK</span>
                <span className="sm:hidden">DECK</span>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/sign-in"
                className="px-3 py-1 text-slate-300 hover:text-white text-xs font-bold transition-colors hidden sm:block"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="retro-btn-yellow px-3.5 py-1.5 text-xs font-bold rounded"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white bg-[#06080e] border-2 border-black rounded lg:hidden shadow-[2px_2px_0px_#000]"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0e14] border-b-2 border-black p-4 space-y-3 font-pixel">
          <a
            href="#quests"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-200 hover:text-[#ffc700] hover:bg-slate-900 rounded"
          >
            Quests
          </a>
          <a
            href="#simulator"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-200 hover:text-[#ffc700] hover:bg-slate-900 rounded"
          >
            Simulator
          </a>
          <a
            href="#journey"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-200 hover:text-[#ffc700] hover:bg-slate-900 rounded"
          >
            Career Arc
          </a>
          <a
            href="#leaderboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-200 hover:text-[#ffc700] hover:bg-slate-900 rounded"
          >
            Leaderboard
          </a>
          <a
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-200 hover:text-[#ffc700] hover:bg-slate-900 rounded"
          >
            Pricing
          </a>

          {!isSignedIn && (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-bold text-slate-200 bg-[#151b2e] border-2 border-black rounded"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="retro-btn-yellow block text-center py-2 text-sm font-bold rounded"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}


