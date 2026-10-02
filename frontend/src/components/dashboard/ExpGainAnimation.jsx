import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Flame } from 'lucide-react';

export default function ExpGainAnimation({
  show,
  expGained = 25,
  streakBonus = 0,
  earlyBonus = 0,
  onComplete,
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  // Particle positions for explosion effect
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const distance = 80 + (i % 3) * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: (i % 2 === 0 ? 6 : 4),
    };
  });

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Backdrop Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-cyan-950/20 to-transparent"
          />

          {/* Floating Particles Burst */}
          {particles.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: p.x,
                y: p.y - 20,
                opacity: 0,
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: idx * 0.02 }}
              className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#ffc700]"
              style={{ width: p.size, height: p.size }}
            />
          ))}

          {/* Central Animated Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 0.9, y: -90 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative flex flex-col items-center bg-[#070b14]/95 border-2 border-[#ffc700] rounded-2xl px-8 py-6 shadow-[0_0_40px_rgba(255,199,0,0.4),0_0_80px_rgba(0,245,160,0.2)] text-center backdrop-blur-md"
          >
            {/* Crown Icon */}
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 p-0.5 shadow-[0_0_20px_#ffc700] mb-3 flex items-center justify-center text-black"
            >
              <Zap className="w-8 h-8 fill-current" />
            </motion.div>

            {/* Main EXP Callout */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.15, 1] }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-4xl sm:text-5xl font-black font-display tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,199,0,0.5)]"
            >
              +{expGained} EXP
            </motion.div>

            <div className="text-xs font-mono uppercase font-bold text-slate-300 mt-1 tracking-widest">
              MISSION_COMPLETE :: REWARD UNLOCKED
            </div>

            {/* Bonuses row */}
            {(streakBonus > 0 || earlyBonus > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-2 mt-3"
              >
                {streakBonus > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold font-mono shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    +{streakBonus} Streak Bonus!
                  </span>
                )}
                {earlyBonus > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold font-mono shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    +{earlyBonus} Speed Bonus!
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
