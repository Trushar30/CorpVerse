import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Zap, Trophy, Rocket, Star, ShieldCheck } from 'lucide-react';

const MILESTONES = [
  { exp: 150, label: 'Mid-Level', icon: ShieldCheck, color: 'text-emerald-400', border: 'border-emerald-500/50' },
  { exp: 350, label: 'Senior', icon: Star, color: 'text-cyan-400', border: 'border-cyan-500/50' },
  { exp: 500, label: 'Founder Mode', icon: Rocket, color: 'text-amber-400', border: 'border-amber-500/50' },
];

export default function AnimatedExpBar({
  expTotal = 0,
  maxExp = 500,
  showMilestones = true,
  className = '',
}) {
  const [displayExp, setDisplayExp] = useState(expTotal);

  // Smooth number counting animation
  const springExp = useSpring(expTotal, { stiffness: 80, damping: 20 });
  const animatedExp = useTransform(springExp, (current) => Math.round(current));

  useEffect(() => {
    springExp.set(expTotal);
    const unsubscribe = animatedExp.on('change', (latest) => {
      setDisplayExp(latest);
    });
    return () => unsubscribe();
  }, [expTotal, springExp, animatedExp]);

  const percentage = Math.min(Math.max((expTotal / maxExp) * 100, 0), 100);

  // Determine current tier
  const getCurrentTier = () => {
    if (expTotal >= 500) return { title: 'Founder Ready', color: 'text-amber-400' };
    if (expTotal >= 350) return { title: 'Senior Tier', color: 'text-cyan-400' };
    if (expTotal >= 150) return { title: 'Mid-Level Tier', color: 'text-emerald-400' };
    return { title: 'Junior Tier', color: 'text-slate-300' };
  };

  const tier = getCurrentTier();

  return (
    <div className={`p-4 sm:p-5 bg-[#06080E] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] font-pixel ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
              Experience Progression
            </div>
            <div className={`text-xs sm:text-sm font-bold ${tier.color}`}>
              {tier.title}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm sm:text-base font-extrabold text-[#ffc700] drop-shadow-[1px_1px_0px_#000]">
            {displayExp.toLocaleString()} / {maxExp.toLocaleString()} EXP
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {percentage.toFixed(1)}% Completed
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-5 sm:h-6 bg-[#0B0E18] rounded-lg overflow-hidden border-2 border-black shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]">
        {/* Animated Fill Bar */}
        <motion.div
          className="h-full relative overflow-hidden rounded-md bg-gradient-to-r from-emerald-500 via-cyan-400 via-yellow-400 to-[#ffc700]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Subtle diagonal stripe overlay */}
          <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.4)_8px,rgba(0,0,0,0.4)_16px)]" />
          
          {/* Shimmer light sweep */}
          <motion.div
            className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          />
        </motion.div>

        {/* Milestone Marker Lines inside bar */}
        {showMilestones &&
          MILESTONES.map((m) => {
            const pos = (m.exp / maxExp) * 100;
            const reached = expTotal >= m.exp;
            return (
              <div
                key={m.exp}
                className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
                style={{ left: `${pos}%` }}
              >
                <div
                  className={`w-0.5 h-full ${
                    reached ? 'bg-black/80' : 'bg-slate-600/60 border-l border-dashed border-slate-400'
                  }`}
                />
              </div>
            );
          })}
      </div>

      {/* Milestone Badges along Bottom */}
      {showMilestones && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MILESTONES.map((m) => {
            const reached = expTotal >= m.exp;
            const Icon = m.icon;
            return (
              <div
                key={m.exp}
                className={`p-2 rounded-lg border text-center transition-all ${
                  reached
                    ? 'bg-[#0f1828] border-amber-500/40 shadow-[2px_2px_0px_#000]'
                    : 'bg-[#070a12]/50 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Icon className={`w-3 h-3 ${reached ? m.color : 'text-slate-600'}`} />
                  <span className="text-[10px] font-bold truncate">{m.label}</span>
                </div>
                <div className={`text-[9px] font-mono font-bold ${reached ? 'text-amber-400' : 'text-slate-600'}`}>
                  {m.exp} EXP {reached ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
