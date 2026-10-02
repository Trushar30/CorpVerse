import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { redeemCode as apiRedeemCode } from '../../api/profile';
import { getMyApplications } from '../../api/applications';
import {
  Compass,
  Briefcase,
  Rocket,
  Coins,
  Zap,
  Menu,
  X,
  LogOut,
  Shield,
  Gift,
  Cpu,
  Flame,
  Trophy,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, refreshUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Redeem modal state
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeAppCount, setActiveAppCount] = useState(0);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Fetch active job application count for job seekers & admins
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'job_seeker' || user?.role === 'admin' || user?.currentStatus === 'job_seeker')) {
      getMyApplications()
        .then((res) => {
          const apps = res.data?.applications || res.data || [];
          const active = apps.filter(
            (a) => !a.status?.includes('rejected') && !a.status?.includes('declined')
          );
          setActiveAppCount(active.length);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.role, user?.currentStatus]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemMessage('');
    if (!redeemInput.trim()) {
      setRedeemError('Please enter a valid code');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await apiRedeemCode(redeemInput.trim());
      setRedeemMessage(res.message || `+${res.data?.expAdded || 50} EXP applied to your profile!`);
      setRedeemInput('');
      await refreshUser();
    } catch (err) {
      setRedeemError(err.response?.data?.message || 'Invalid or expired redeem code');
    } finally {
      setIsRedeeming(false);
    }
  };

  const navigateToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${sectionId}`);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const getDashboardPath = () => {
    if (!user) return '/sign-in';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'ai_manager':
        return '/dashboard/ai-manager';
      case 'working':
        return '/dashboard/working';
      case 'founder':
        return '/dashboard/founder';
      default:
        return '/dashboard/job-seeker';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'SIGN IN';
    switch (user.role) {
      case 'admin':
        return 'ADMIN PANEL';
      case 'ai_manager':
        return 'AI OPS';
      case 'working':
        return 'WORK DESK';
      case 'founder':
        return 'FOUNDER HQ';
      default:
        return 'CAREER DECK';
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CV';

  const roleColors = {
    admin: 'bg-rose-500 text-white',
    ai_manager: 'bg-amber-500 text-black',
    job_seeker: 'bg-emerald-500 text-black',
    working: 'bg-cyan-500 text-black',
    founder: 'bg-purple-500 text-white',
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/95 border-b-2 border-black backdrop-blur-md font-pixel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#ffc700] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:rotate-12 transition-transform">
              <Coins className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-pixel-heading text-xl font-bold tracking-wider text-white flex items-center gap-1.5 drop-shadow-[2px_2px_0px_#000]">
              Corp<span className="text-[#ffc700]">Verse</span>
            </span>
          </Link>

          {/* Desktop Center Navigation */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-2 p-1 bg-[#06080e] rounded border-2 border-black shadow-[3px_3px_0px_#000]">
              {/* ADMIN ROLE */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-rose-500 text-white border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-rose-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMIN PANEL</span>
                  </Link>

                  <Link
                    to="/dashboard/ai-manager"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                      location.pathname.includes('/ai-manager')
                        ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-amber-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI OPS</span>
                  </Link>

                  <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                  {/* Superuser Dashboard Switchers for Admin */}
                  <Link
                    to="/dashboard/job-seeker"
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      location.pathname.includes('/job-seeker')
                        ? 'bg-[#ffc700] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="View Job Seeker Dashboard"
                  >
                    CANDIDATE
                  </Link>

                  <Link
                    to="/dashboard/working"
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      location.pathname.includes('/working')
                        ? 'bg-emerald-400 text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="View Employee Dashboard"
                  >
                    EMPLOYEE
                  </Link>

                  <Link
                    to="/dashboard/founder"
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      location.pathname.includes('/founder')
                        ? 'bg-purple-400 text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="View Founder Dashboard"
                  >
                    FOUNDER
                  </Link>

                  <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                </>
              )}

              {/* AI MANAGER ROLE */}
              {user?.role === 'ai_manager' && (
                <Link
                  to="/dashboard/ai-manager"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                    location.pathname.includes('/ai-manager')
                      ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>NEURAL OPS CONSOLE</span>
                </Link>
              )}

              {/* FOUNDER ROLE */}
              {user?.role === 'founder' && (
                <Link
                  to="/dashboard/founder"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                    location.pathname.includes('/founder')
                      ? 'bg-purple-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-purple-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>FOUNDER HQ</span>
                </Link>
              )}

              {/* WORKING (EMPLOYEE) ROLE */}
              {user?.role === 'working' && (
                <Link
                  to="/dashboard/working"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                    location.pathname.includes('/working')
                      ? 'bg-emerald-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>WORKPLACE DESK</span>
                </Link>
              )}

              {/* JOB SEEKER ROLE */}
              {user?.role === 'job_seeker' && (
                <Link
                  to="/dashboard/job-seeker"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                    location.pathname.includes('/job-seeker')
                      ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>CAREER MARKET</span>
                  {activeAppCount > 0 && (
                    <span className="text-[10px] bg-black text-[#ffc700] px-1.5 py-0.5 rounded-full font-extrabold ml-1">
                      {activeAppCount} Active
                    </span>
                  )}
                </Link>
              )}

              {/* GLOBAL LEADERBOARD TAB (UNIVERSAL) */}
              <Link
                to="/leaderboard"
                className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel text-xs font-bold transition-all ${
                  location.pathname === '/leaderboard'
                    ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>RANKINGS</span>
              </Link>
            </nav>
          ) : (
            /* Logged Out / Public Navigation */
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs font-pixel text-slate-200">
              <button
                onClick={() => navigateToSection('quests')}
                className="hover:text-[#ffc700] transition-colors font-bold cursor-pointer"
              >
                Quests
              </button>
              <button
                onClick={() => navigateToSection('journey')}
                className="hover:text-[#ffc700] transition-colors font-bold cursor-pointer"
              >
                Career Arc
              </button>
              <button
                onClick={() => navigateToSection('simulator')}
                className="hover:text-[#ffc700] transition-colors font-bold cursor-pointer"
              >
                Arcade Sim
              </button>
              <Link
                to="/leaderboard"
                className={`flex items-center gap-1.5 hover:text-[#ffc700] transition-colors font-bold ${
                  location.pathname === '/leaderboard' ? 'text-[#ffc700]' : ''
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          )}

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3 font-pixel">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* CorpCoin Balance Chip */}
                <div
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06080E] border-2 border-slate-800 rounded text-xs font-pixel text-[#ffc700] shadow-[2px_2px_0px_#000]"
                  title="CorpCoins Treasury"
                >
                  <Coins className="w-3.5 h-3.5 text-[#ffc700]" />
                  <span className="font-bold tracking-tight">{(user?.corpCoins || 0).toLocaleString()} CC</span>
                </div>

                {/* Day Streak Chip */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06080E] border-2 border-slate-800 rounded text-xs font-pixel text-orange-400 shadow-[2px_2px_0px_#000]"
                  title={`${user?.currentStreak || 0} Day Streak`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
                  <span className="font-bold tracking-tight">{user?.currentStreak || 0}d</span>
                </div>

                {/* EXP Chip */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06080E] border-2 border-slate-800 rounded text-xs font-pixel text-emerald-400 shadow-[2px_2px_0px_#000]"
                  title="Total Career Experience"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current animate-pulse" />
                  <span className="font-bold tracking-tight">{(user?.expTotal || 0).toLocaleString()} EXP</span>
                </div>

                {/* Quick Command Deck CTA button */}
                <Link
                  to={getDashboardPath()}
                  className="px-3 py-1.5 bg-[#ffc700] hover:bg-[#ffd633] text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] rounded transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{getDashboardLabel()}</span>
                  <span className="sm:hidden">DECK</span>
                </Link>

                {/* User Avatar & Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`w-8 h-8 rounded-full ${
                      roleColors[user?.role] || 'bg-slate-600 text-white'
                    } border-2 border-black flex items-center justify-center text-[10px] font-bold shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform cursor-pointer`}
                    title="Open User Menu"
                  >
                    {initials}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-[#0F1424] border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Header */}
                      <div className="p-3 border-b border-slate-800 bg-[#06080E]">
                        <div className="text-xs font-bold text-slate-100 truncate">{user?.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              user?.role === 'admin'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : user?.role === 'founder'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : user?.role === 'working'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : user?.role === 'ai_manager'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {user?.role?.replace('_', ' ')}
                          </span>

                          <span className="text-[#ffc700] font-bold text-[10px] flex items-center gap-1">
                            🪙 {(user?.corpCoins || 0).toLocaleString()} CC
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold border-b border-slate-800/60"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#ffc700]" />
                        <span>MY COMMAND DECK</span>
                      </Link>

                      <Link
                        to="/leaderboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-bold border-b border-slate-800/60"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>GLOBAL RANKINGS</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/dashboard/ai-manager"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-bold border-b border-slate-800/60"
                        >
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>AI MANAGER OPS</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowRedeemModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-emerald-300 hover:bg-emerald-500/10 transition-colors font-bold border-b border-slate-800/60 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5 text-emerald-400" />
                        <span>REDEEM EXP CODE</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-bold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>LOGOUT</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Public Auth Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/sign-in"
                  className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-bold transition-colors hidden sm:block"
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

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white bg-[#06080e] border-2 border-black rounded lg:hidden shadow-[2px_2px_0px_#000] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0F1424] border-b-2 border-black px-4 py-4 space-y-3 font-pixel z-40 relative animate-in slide-in-from-top-2 duration-150">
          {isAuthenticated ? (
            <>
              {/* User Stat Counters Row */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 flex items-center gap-1 font-bold">
                    <Flame className="w-3 h-3 fill-current" /> {user?.currentStreak || 0}d
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3 fill-current" /> {(user?.expTotal || 0).toLocaleString()} EXP
                  </span>
                  <span className="text-[#ffc700] flex items-center gap-1 font-bold">
                    <Coins className="w-3 h-3" /> {(user?.corpCoins || 0).toLocaleString()} CC
                  </span>
                </div>
              </div>

              {/* Navigation Items based on user role */}
              <div className="flex flex-col gap-2 text-xs">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded font-bold bg-[#ffc700] text-black flex items-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <Compass className="w-4 h-4" />
                  <span>{getDashboardLabel()}</span>
                  {activeAppCount > 0 && user?.role === 'job_seeker' && (
                    <span className="bg-black text-[#ffc700] text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-auto">
                      {activeAppCount} Active Apps
                    </span>
                  )}
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/dashboard/ai-manager"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded font-bold bg-[#06080E] text-amber-300 hover:text-white flex items-center gap-2 border border-slate-800"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>AI MANAGER OPS</span>
                  </Link>
                )}

                <Link
                  to="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded font-bold bg-[#06080E] text-slate-200 hover:text-white flex items-center gap-2 border border-slate-800"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>GLOBAL RANKINGS</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowRedeemModal(true);
                  }}
                  className="px-3 py-2 rounded font-bold bg-[#06080E] text-emerald-300 hover:text-white flex items-center gap-2 border border-slate-800 text-left cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>REDEEM EXP CODE</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded font-bold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 flex items-center gap-2 border border-rose-500/30 text-left cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </>
          ) : (
            /* Logged Out Mobile Menu */
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => navigateToSection('quests')}
                className="px-3 py-2 rounded font-bold bg-[#06080E] text-slate-200 text-left cursor-pointer"
              >
                CAREER QUESTS
              </button>
              <button
                onClick={() => navigateToSection('journey')}
                className="px-3 py-2 rounded font-bold bg-[#06080E] text-slate-200 text-left cursor-pointer"
              >
                CAREER ARC LIFECYCLE
              </button>
              <button
                onClick={() => navigateToSection('simulator')}
                className="px-3 py-2 rounded font-bold bg-[#06080E] text-slate-200 text-left cursor-pointer"
              >
                ARCADE SIMULATOR
              </button>
              <Link
                to="/leaderboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded font-bold bg-[#06080E] text-amber-300 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>GLOBAL RANKINGS</span>
              </Link>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-center rounded font-bold bg-slate-800 text-slate-200 hover:text-white"
                >
                  LOG IN
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-center rounded font-bold bg-[#ffc700] text-black shadow-[2px_2px_0px_#000]"
                >
                  SIGN UP
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redeem Code Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#0F1424] border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000] space-y-4 font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2 font-pixel">
                <Gift className="w-4 h-4 text-amber-400" />
                REDEEM EXP BOOST CODE
              </span>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemError('');
                  setRedeemMessage('');
                }}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRedeem} className="p-5 space-y-4">
              {redeemError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded">
                  ⚠️ {redeemError}
                </div>
              )}

              {redeemMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded">
                  ✅ {redeemMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider font-pixel">
                  ENTER REDEEM CODE
                </label>
                <input
                  type="text"
                  value={redeemInput}
                  onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
                  placeholder="e.g. BOOST50, EXP100"
                  required
                  className="w-full px-3 py-2.5 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-amber-500 focus:outline-none text-amber-300 font-mono font-bold tracking-wider uppercase text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-1.5 font-pixel disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isRedeeming ? 'REDEEMING...' : '[REDEEM CODE]'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
