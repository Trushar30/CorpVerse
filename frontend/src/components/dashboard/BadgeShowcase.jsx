import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Sparkles, X, Calendar, ShieldCheck, Star } from 'lucide-react';
import { getMyBadges } from '../../api/leaderboard';

// Rarity color and style matrix
const RARITY_STYLES = {
  common: {
    bg: 'bg-slate-800/60',
    border: 'border-slate-600',
    badge: 'bg-slate-700 text-slate-300',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
  },
  uncommon: {
    bg: 'bg-emerald-950/50',
    border: 'border-emerald-500/60',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
  },
  rare: {
    bg: 'bg-cyan-950/50',
    border: 'border-cyan-500/60',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    text: 'text-cyan-400',
    glow: 'shadow-[0_0_14px_rgba(6,182,212,0.4)]',
  },
  epic: {
    bg: 'bg-purple-950/50',
    border: 'border-purple-500/60',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_16px_rgba(168,85,247,0.45)]',
  },
  legendary: {
    bg: 'bg-amber-950/60',
    border: 'border-amber-400',
    badge: 'bg-amber-500/25 text-amber-300 border border-amber-400/60',
    text: 'text-[#ffc700]',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
  },
};

export default function BadgeShowcase({ className = '', onBadgeClick = null }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await getMyBadges();
      const badgeList = res.data?.badges || res.data?.data?.badges || [];
      setBadges(badgeList);
    } catch (err) {
      console.error('Failed to fetch user badges:', err);
    } finally {
      setLoading(false);
    }
  };

  const isRecentUnlock = (unlockedAt) => {
    if (!unlockedAt) return false;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return new Date(unlockedAt).getTime() >= dayAgo;
  };

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className={`p-4 sm:p-6 bg-[#06080E] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] font-pixel ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ffc700] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Award className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-pixel-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
              ACHIEVEMENT BADGES
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {unlockedCount} / {badges.length}
              </span>
            </h3>
            <p className="text-slate-400 text-xs">Unlock corporate honors and exclusive milestones</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0a0e1a] border border-slate-800 rounded-lg text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded transition-all ${
              filter === 'all'
                ? 'bg-[#ffc700] text-black border border-black shadow-[1px_1px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded transition-all ${
              filter === 'unlocked'
                ? 'bg-emerald-400 text-black border border-black shadow-[1px_1px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EARNED ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded transition-all ${
              filter === 'locked'
                ? 'bg-slate-700 text-white border border-black shadow-[1px_1px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LOCKED ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-900/60 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-mono text-xs">
          No badges found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {filteredBadges.map((badge) => {
            const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
            const recent = isRecentUnlock(badge.unlockedAt);

            return (
              <motion.button
                key={badge.badgeType}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedBadge(badge);
                  if (onBadgeClick) onBadgeClick(badge);
                }}
                className={`relative group p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-between text-center min-h-[105px] ${
                  badge.unlocked
                    ? `${style.bg} ${style.border} ${style.glow} cursor-pointer`
                    : 'bg-[#080b14] border-slate-800/80 grayscale opacity-45 hover:opacity-65 cursor-pointer'
                }`}
              >
                {/* Pulsing NEW Tag */}
                {badge.unlocked && recent && (
                  <span className="absolute -top-2 -right-1.5 px-1.5 py-0.5 bg-rose-500 text-[8px] font-black text-white rounded-full border border-black animate-bounce shadow-[1px_1px_0px_#000]">
                    NEW!
                  </span>
                )}

                {/* Badge Icon */}
                <div className="relative my-auto">
                  <div className="text-3xl sm:text-4xl filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                    {badge.icon || '🏅'}
                  </div>
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Badge Name */}
                <div className="w-full mt-1">
                  <div className={`text-[10px] sm:text-[11px] font-bold truncate ${badge.unlocked ? style.text : 'text-slate-500'}`}>
                    {badge.name}
                  </div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                    {badge.rarity}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-sm w-full bg-[#0E1322] border-3 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_#000] font-pixel text-xs ${
                selectedBadge.unlocked ? RARITY_STYLES[selectedBadge.rarity]?.glow : ''
              }`}
            >
              {/* Header */}
              <div className="p-4 bg-[#080B14] border-b-2 border-black flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Badge Dossier
                </span>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-center space-y-4">
                {/* Big Icon */}
                <div className="relative inline-block mx-auto">
                  <div
                    className={`w-24 h-24 rounded-2xl border-3 border-black flex items-center justify-center text-5xl shadow-[4px_4px_0px_#000] ${
                      selectedBadge.unlocked
                        ? RARITY_STYLES[selectedBadge.rarity]?.bg
                        : 'bg-slate-900/80 grayscale opacity-60'
                    }`}
                  >
                    {selectedBadge.icon || '🏅'}
                  </div>
                  {!selectedBadge.unlocked && (
                    <div className="absolute -top-2 -right-2 p-1.5 bg-black border-2 border-slate-700 rounded-full">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Name & Rarity */}
                <div>
                  <h4 className="font-pixel-heading text-lg font-bold text-white drop-shadow-[2px_2px_0px_#000]">
                    {selectedBadge.name}
                  </h4>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span
                      className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        RARITY_STYLES[selectedBadge.rarity]?.badge
                      }`}
                    >
                      {selectedBadge.rarity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedBadge.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 font-mono text-xs leading-relaxed px-2 bg-[#080B14] p-3 rounded-lg border border-slate-800">
                  "{selectedBadge.description}"
                </p>

                {/* Unlock Timestamp */}
                {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#080B14] border-t-2 border-black flex justify-end">
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 bg-[#ffc700] hover:bg-yellow-400 text-black font-bold text-xs rounded border-2 border-black shadow-[2px_2px_0px_#000]"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
