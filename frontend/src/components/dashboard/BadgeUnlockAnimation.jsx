import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Award } from 'lucide-react';

const RARITY_GLOWS = {
  common: 'shadow-[0_0_30px_rgba(148,163,184,0.6)] border-slate-400',
  uncommon: 'shadow-[0_0_35px_rgba(16,185,129,0.7)] border-emerald-400',
  rare: 'shadow-[0_0_40px_rgba(6,182,212,0.8)] border-cyan-400',
  epic: 'shadow-[0_0_50px_rgba(168,85,247,0.85)] border-purple-400',
  legendary: 'shadow-[0_0_60px_rgba(251,191,36,0.95)] border-amber-400',
};

const RARITY_COLORS = {
  common: 'text-slate-300',
  uncommon: 'text-emerald-400',
  rare: 'text-cyan-400',
  epic: 'text-purple-400',
  legendary: 'text-[#ffc700]',
};

export default function BadgeUnlockAnimation({
  badge,
  onClose,
  autoDismissMs = 4500,
}) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [badge, onClose, autoDismissMs]);

  if (!badge) return null;

  const glow = RARITY_GLOWS[badge.rarity] || RARITY_GLOWS.rare;
  const textColor = RARITY_COLORS[badge.rarity] || 'text-[#ffc700]';

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-hidden"
      >
        {/* Particle Canvas / CSS Bursts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-sm bg-[#ffc700] shadow-[0_0_8px_#ffc700]"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 80}vw`,
                y: `${50 + (Math.random() - 0.5) * 80}vh`,
                scale: [0, 1.5, 0.5],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 2.2,
                ease: 'easeOut',
                delay: Math.random() * 0.2,
              }}
            />
          ))}
        </div>

        {/* Center Card */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative max-w-md w-full bg-[#0c101d] border-4 border-black rounded-3xl p-6 sm:p-8 text-center font-pixel shadow-[10px_10px_0px_#000] ${glow}`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Subheader */}
          <div className="flex items-center justify-center gap-2 mb-2 text-xs uppercase tracking-widest text-amber-400 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>ACHIEVEMENT UNLOCKED!</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>

          {/* Big Zoomed Icon with Pulse */}
          <motion.div
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.8, 1.15, 1] }}
            transition={{ duration: 0.6, times: [0, 0.7, 1] }}
            className="my-4 inline-block"
          >
            <div className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-black border-3 border-black flex items-center justify-center text-6xl shadow-[4px_4px_0px_#000] relative">
              {badge.icon || '🏆'}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-amber-400/60"
                animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>

          {/* Badge Name */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-pixel-heading text-2xl font-bold text-white drop-shadow-[2px_2px_0px_#000]">
              {badge.name}
            </h3>

            {/* Rarity Pill */}
            <div className="mt-2 inline-block">
              <span
                className={`text-[10px] uppercase font-mono font-black px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_#000] ${textColor} bg-slate-900`}
              >
                ✦ {badge.rarity || 'common'} ✦
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed bg-[#06080E] p-4 rounded-xl border-2 border-slate-800">
              "{badge.description}"
            </p>
          </motion.div>

          {/* Dismiss hint */}
          <div className="mt-6 text-[10px] text-slate-500 font-mono">
            Click anywhere or wait to dismiss
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
