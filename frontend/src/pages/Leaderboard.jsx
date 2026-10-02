import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Filter,
  Calendar,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Crown,
  Medal,
  Award,
  Sparkles,
  Search,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BadgeShowcase from '../components/dashboard/BadgeShowcase';
import { getLeaderboard, getMyRank } from '../api/leaderboard';
import { useAuth } from '../context/AuthContext';

const DOMAINS = [
  'All Domains',
  'Technology',
  'Finance',
  'Healthcare',
  'Design',
  'Marketing',
  'Sales',
  'Engineering',
];

const PERIODS = [
  { id: 'all-time', label: 'All-Time' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
];

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [domain, setDomain] = useState('All Domains');
  const [period, setPeriod] = useState('all-time');
  const [myRankData, setMyRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('rankings'); // 'rankings' | 'badges'

  useEffect(() => {
    fetchLeaderboardData();
  }, [page, domain, period]);

  useEffect(() => {
    fetchMyRank();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        period,
      };
      if (domain !== 'All Domains') {
        params.domain = domain;
      }

      const res = await getLeaderboard(params);
      const data = res.data?.data || res.data || {};
      setUsers(data.users || []);
      setPagination(data.pagination || { page, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRank = async () => {
    try {
      const res = await getMyRank();
      setMyRankData(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to load my rank:', err);
    }
  };

  const jumpToMyRank = () => {
    if (!myRankData?.rank) return;
    const targetPage = Math.ceil(myRankData.rank / pagination.limit) || 1;
    setPage(targetPage);
  };

  const topThree = page === 1 ? users.slice(0, 3) : [];

  const getRolePill = (role, currentStatus) => {
    const status = currentStatus || role;
    switch (status) {
      case 'founder':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
      case 'working':
      case 'employee':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      case 'admin':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#090C15] flex flex-col font-pixel selection:bg-[#ffc700] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Banner Header */}
        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#0F1424] to-[#0A0D18] border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#ffc700] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Trophy className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <h1 className="font-pixel-heading text-2xl sm:text-3xl font-extrabold text-white tracking-wide drop-shadow-[2px_2px_0px_#000]">
                  GLOBAL <span className="text-[#ffc700]">RANKINGS</span>
                </h1>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm font-mono max-w-xl">
                Compete against professionals worldwide. Gain EXP through daily objectives, maintain consecutive task streaks, and climb to the top of the corporate metaverse.
              </p>
            </div>

            {/* Navigation Tabs (Leaderboard vs Badges) */}
            <div className="flex items-center gap-2 p-1.5 bg-[#06080E] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] self-start md:self-auto">
              <button
                onClick={() => setActiveTab('rankings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'rankings'
                    ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>LEADERBOARD</span>
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'badges'
                    ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>TROPHY ROOM</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'badges' ? (
          <BadgeShowcase />
        ) : (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#0E1322] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
              {/* Domain Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Domain:
                </span>
                <select
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-[#06080E] border-2 border-slate-700 rounded-lg text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#06080E] border border-slate-800 rounded-lg text-xs">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPeriod(p.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded transition-all font-bold ${
                      period === p.id
                        ? 'bg-amber-400 text-black border border-black shadow-[1px_1px_0px_#000]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 3 Podium (Only on Page 1) */}
            {page === 1 && topThree.length >= 3 && (
              <div className="p-6 sm:p-8 bg-[#0E1322] border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000] relative overflow-hidden">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] uppercase font-mono font-bold">
                    ★ ELITE CORPVILLIANS ★
                  </span>
                  <h2 className="text-lg font-pixel-heading font-bold text-white mt-1">
                    TOP PERFORMERS PODIUM
                  </h2>
                </div>

                <div className="flex items-end justify-center gap-2 sm:gap-6 max-w-2xl mx-auto pt-8 pb-4">
                  {/* #2 Rank - Silver */}
                  {topThree[1] && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2 flex flex-col items-center">
                        <span className="text-3xl mb-1 filter drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]">
                          🥈
                        </span>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-300 border-3 border-black flex items-center justify-center text-sm font-black text-black shadow-[3px_3px_0px_#000] truncate">
                          {topThree[1].name?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white mt-1 max-w-[90px] sm:max-w-[120px] truncate text-center">
                          {topThree[1].name}
                        </div>
                        <div className="text-[10px] sm:text-xs font-mono font-extrabold text-slate-300">
                          {(topThree[1].periodExp || topThree[1].expTotal)?.toLocaleString()} EXP
                        </div>
                      </div>
                      {/* 2nd Place Pedestal */}
                      <div className="w-full h-28 sm:h-36 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-3 border-black rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-[4px_4px_0px_#000]">
                        <span className="text-2xl sm:text-3xl font-pixel-heading font-black text-black">
                          2
                        </span>
                        <span className="text-[9px] font-mono text-slate-200 font-bold mt-1">
                          SILVER
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #1 Rank - Gold (Center, Tallest) */}
                  {topThree[0] && (
                    <div className="flex-1 flex flex-col items-center -mt-8">
                      <div className="relative mb-2 flex flex-col items-center">
                        <span className="text-4xl mb-1 filter drop-shadow-[0_0_12px_rgba(251,191,36,1)] animate-bounce">
                          🥇
                        </span>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ffc700] border-3 border-black flex items-center justify-center text-xl font-black text-black shadow-[4px_4px_0px_#000] ring-4 ring-amber-400/40 truncate">
                          {topThree[0].name?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[#ffc700] mt-1.5 max-w-[110px] sm:max-w-[140px] truncate text-center drop-shadow-[1px_1px_0px_#000]">
                          {topThree[0].name}
                        </div>
                        <div className="text-xs sm:text-sm font-mono font-extrabold text-amber-300">
                          {(topThree[0].periodExp || topThree[0].expTotal)?.toLocaleString()} EXP
                        </div>
                      </div>
                      {/* 1st Place Pedestal */}
                      <div className="w-full h-36 sm:h-48 bg-gradient-to-b from-[#ffc700] via-amber-500 to-yellow-600 border-3 border-black rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-[6px_6px_0px_#000]">
                        <span className="text-3xl sm:text-4xl font-pixel-heading font-black text-black">
                          1
                        </span>
                        <span className="text-[10px] font-mono text-black font-extrabold mt-1">
                          CHAMPION
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #3 Rank - Bronze */}
                  {topThree[2] && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2 flex flex-col items-center">
                        <span className="text-3xl mb-1 filter drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]">
                          🥉
                        </span>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-700 border-3 border-black flex items-center justify-center text-sm font-black text-white shadow-[3px_3px_0px_#000] truncate">
                          {topThree[2].name?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white mt-1 max-w-[90px] sm:max-w-[120px] truncate text-center">
                          {topThree[2].name}
                        </div>
                        <div className="text-[10px] sm:text-xs font-mono font-extrabold text-amber-500">
                          {(topThree[2].periodExp || topThree[2].expTotal)?.toLocaleString()} EXP
                        </div>
                      </div>
                      {/* 3rd Place Pedestal */}
                      <div className="w-full h-24 sm:h-30 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950 border-3 border-black rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-[4px_4px_0px_#000]">
                        <span className="text-2xl sm:text-3xl font-pixel-heading font-black text-white">
                          3
                        </span>
                        <span className="text-[9px] font-mono text-amber-200 font-bold mt-1">
                          BRONZE
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current User Rank Sticky Card */}
            {myRankData && (
              <div className="p-4 sm:p-5 bg-[#10172A] border-3 border-amber-400 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-black border-2 border-black flex items-center justify-center font-pixel-heading font-black text-lg shadow-[2px_2px_0px_#000]">
                    #{myRankData.rank}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      YOUR CURRENT STANDING
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white">
                      Ranked <span className="text-amber-300">#{myRankData.rank}</span> of{' '}
                      <span className="text-slate-300">{myRankData.total.toLocaleString()}</span> active players
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <div className="text-center sm:text-right">
                    <div className="text-slate-400 text-[10px]">TIER STATUS</div>
                    <div className="text-emerald-400">Top {myRankData.percentile}%</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-slate-400 text-[10px]">TOTAL EXP</div>
                    <div className="text-yellow-400 font-bold">⚡ {myRankData.expTotal}</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-slate-400 text-[10px]">CURRENT STREAK</div>
                    <div className="text-orange-400 font-bold">🔥 {myRankData.currentStreak}d</div>
                  </div>

                  {pagination.page !== Math.ceil(myRankData.rank / pagination.limit) && (
                    <button
                      onClick={jumpToMyRank}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded border border-black shadow-[2px_2px_0px_#000] transition-all"
                    >
                      Jump To My Rank
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rankings Table */}
            <div className="bg-[#0E1322] border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#080B14] border-b-2 border-black text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                      <th className="py-3.5 px-4 text-center w-16">#</th>
                      <th className="py-3.5 px-4">Player</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4 hidden sm:table-cell">Domain</th>
                      <th className="py-3.5 px-4 text-right">EXP Gained</th>
                      <th className="py-3.5 px-4 text-center w-24">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="6" className="py-4 px-4 bg-slate-900/30">
                            <div className="h-4 bg-slate-800/60 rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          No players found for this filter criteria.
                        </td>
                      </tr>
                    ) : (
                      users.map((player) => {
                        const isMe =
                          currentUser?._id &&
                          player._id &&
                          player._id.toString() === currentUser._id.toString();

                        return (
                          <tr
                            key={player._id}
                            className={`transition-colors ${
                              isMe
                                ? 'bg-amber-500/10 border-l-4 border-l-amber-400 hover:bg-amber-500/15'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-4 text-center font-bold">
                              {player.rank === 1 ? (
                                <span className="text-xl">🥇</span>
                              ) : player.rank === 2 ? (
                                <span className="text-xl">🥈</span>
                              ) : player.rank === 3 ? (
                                <span className="text-xl">🥉</span>
                              ) : (
                                <span className="text-slate-400 font-pixel font-bold">
                                  #{player.rank}
                                </span>
                              )}
                            </td>

                            {/* Player info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center font-bold text-xs text-white shadow-[1px_1px_0px_#000]">
                                  {player.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="font-pixel font-bold text-slate-100 flex items-center gap-1.5">
                                    <span>{player.name}</span>
                                    {isMe && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase shadow-[1px_1px_0px_#000]">
                                        ▶ YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 sm:hidden">
                                    {player.domainInterest || 'General'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role pill */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getRolePill(
                                  player.role,
                                  player.currentStatus
                                )}`}
                              >
                                {player.currentStatus || player.role || 'Player'}
                              </span>
                            </td>

                            {/* Domain */}
                            <td className="py-3.5 px-4 text-slate-400 hidden sm:table-cell">
                              {player.domainInterest || 'General'}
                            </td>

                            {/* EXP */}
                            <td className="py-3.5 px-4 text-right font-bold text-yellow-400">
                              ⚡ {(player.periodExp || player.expTotal || 0).toLocaleString()}
                            </td>

                            {/* Streak */}
                            <td className="py-3.5 px-4 text-center">
                              {player.currentStreak > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold">
                                  🔥 {player.currentStreak}d
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-4 bg-[#080B14] border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="text-slate-400">
                  Showing page <span className="text-white font-bold">{pagination.page}</span> of{' '}
                  <span className="text-white font-bold">{pagination.pages || 1}</span> ({pagination.total} total players)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="px-3 py-1.5 bg-[#0F1424] hover:bg-slate-800 disabled:opacity-40 text-slate-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>PREV</span>
                  </button>

                  <span className="px-3 py-1.5 bg-[#06080E] border border-slate-800 text-amber-400 font-bold rounded">
                    {page}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages || 1, p + 1))}
                    disabled={page >= pagination.pages || loading}
                    className="px-3 py-1.5 bg-[#0F1424] hover:bg-slate-800 disabled:opacity-40 text-slate-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] font-bold flex items-center gap-1 transition-all"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
