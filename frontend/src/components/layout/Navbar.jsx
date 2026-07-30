import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { redeemCode as apiRedeemCode } from '../../api/profile';
import {
  Search,
  Moon,
  ChevronDown,
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
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redeem modal state
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  let isSignedIn = false;
  let user = null;
  let refreshUser = () => { };
  try {
    const auth = useAuth();
    isSignedIn = auth.isAuthenticated;
    user = auth.user;
    refreshUser = auth.refreshUser;
  } catch {
    isSignedIn = false;
  }

  const { logout } = useAuth ? useAuth() : { logout: () => { } };

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemMessage('');
    if (!redeemInput.trim()) {
      setRedeemError('Please enter a code');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await apiRedeemCode(redeemInput.trim());
      setRedeemMessage(res.message || `+${res.data.expAdded} EXP added!`);
      setRedeemInput('');
      await refreshUser();
    } catch (err) {
      setRedeemError(err.response?.data?.message || 'Invalid or expired redeem code');
    } fontinally: {
      setIsRedeeming(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const roleColor = {
    admin: 'bg-rose-500',
    job_seeker: 'bg-emerald-500',
    working: 'bg-cyan-500',
    founder: 'bg-violet-500',
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

          {/* Dashboard Tabs (Desktop) */}
          {isDashboard && user?.role !== 'admin' ? (
            <nav className="hidden md:flex items-center gap-2 p-1 bg-[#06080e] rounded border-2 border-black shadow-[3px_3px_0px_#000]">
              <Link
                to="/dashboard/job-seeker"
                className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${location.pathname.includes('/job-seeker') || location.pathname === '/dashboard'
                  ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>JOB_SEEKER</span>
              </Link>

              <Link
                to="/dashboard/working"
                className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${location.pathname.includes('/working')
                  ? 'bg-emerald-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>WORKING</span>
              </Link>

              <Link
                to="/dashboard/founder"
                className={`flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold transition-all ${location.pathname.includes('/founder')
                  ? 'bg-purple-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>FOUNDER</span>
              </Link>
            </nav>
          ) : isDashboard && user?.role === 'admin' ? (
            <nav className="hidden md:flex items-center gap-2 p-1 bg-[#06080e] rounded border-2 border-black shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2 px-3 py-1 rounded font-pixel text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Shield className="w-3.5 h-3.5" />
                <span>ADMIN PANEL</span>
              </div>
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

          {/* Right Actions */}
          <div className="flex items-center gap-3 font-pixel">



            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-3 py-1.5 bg-[#ffc700] hover:bg-[#ffd633] text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_#000] rounded transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{user?.role === 'admin' ? 'ADMIN PANEL' : 'COMMAND DECK'}</span>
                  <span className="sm:hidden">DECK</span>
                </Link>

                {/* Custom User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`w-8 h-8 rounded-full ${roleColor[user?.role] || 'bg-slate-600'} border-2 border-black flex items-center justify-center text-[10px] font-bold text-white shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform`}
                  >
                    {initials}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0F1424] border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-800">
                        <div className="text-xs font-bold text-slate-100 truncate">{user?.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${user?.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : user?.role === 'founder' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : user?.role === 'working' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                            {user?.role?.replace('_', ' ')}
                          </span>
                          <span className="text-emerald-400 font-bold text-[10px]">
                            ⚡ {user?.expTotal || 0} EXP
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => { setShowUserMenu(false); setShowRedeemModal(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-bold border-b border-slate-800/60"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>REDEEM EXP CODE</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>LOGOUT</span>
                      </button>
                    </div>
                  )}
                </div>
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white bg-[#06080e] border-2 border-black rounded lg:hidden shadow-[2px_2px_0px_#000]"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Redeem Code Modal — Rendered at root level so fixed positioning centers perfectly on screen */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#0F1424] border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000] space-y-4 font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                REDEEM EXP BOOST CODE
              </span>
              <button onClick={() => { setShowRedeemModal(false); setRedeemError(''); setRedeemMessage(''); }} className="text-slate-500 hover:text-slate-200">
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
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Enter Redeem Code
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
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-1.5 font-mono disabled:opacity-50"
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
