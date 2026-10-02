import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, ArrowRight, Trophy, Sparkles, X } from 'lucide-react';

export default function PromotionModal({
  isOpen,
  onClose,
  previousLevel = 'junior',
  newLevel = 'mid',
  roleTitle = 'Software Engineer',
  companyName = 'Acme Corp',
  bonusExp = 50,
  bonusCoins = 50,
}) {
  if (!isOpen) return null;

  const levelName = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case 'junior':
        return 'JUNIOR LEVEL';
      case 'mid':
        return 'MID LEVEL';
      case 'senior':
        return 'SENIOR LEVEL';
      default:
        return (lvl || '').toUpperCase();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-pixel overflow-hidden">
        {/* Floating confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => {
            const colors = ['#ffc700', '#00f5a0', '#00d2ff', '#ff3366', '#a855f7'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: '-10vh',
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  y: '110vh',
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 3.5 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </div>

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="relative max-w-lg w-full bg-[#0E1322] border-4 border-black rounded-3xl p-6 sm:p-8 text-center shadow-[12px_12px_0px_#000] z-10 shadow-[0_0_50px_rgba(251,191,36,0.5)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner */}
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-400 text-sm font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            <span>⚡ PROMOTION! ⚡</span>
            <Sparkles className="w-4 h-4 fill-current animate-pulse" />
          </div>

          {/* Level Transition Box */}
          <div className="my-5 p-5 bg-[#06080E] border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-center gap-3 text-base sm:text-lg font-pixel-heading font-black text-white">
              <span className="text-slate-400">{levelName(previousLevel)}</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
              <span className="text-[#ffc700] drop-shadow-[2px_2px_0px_#000]">{levelName(newLevel)}</span>
            </div>

            <div className="text-xs text-slate-300 font-mono">
              <span className="font-bold text-emerald-400">{roleTitle}</span>
              <span className="text-slate-500"> @ </span>
              <span className="font-bold text-slate-200">{companyName}</span>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 bg-[#080B14] border-2 border-emerald-500/40 rounded-xl flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-current" />
              <div className="text-left">
                <div className="text-sm font-extrabold text-white">+{bonusExp} EXP</div>
                <div className="text-[9px] text-slate-400 uppercase font-mono">Promotion Bonus</div>
              </div>
            </div>

            <div className="p-3 bg-[#080B14] border-2 border-amber-500/40 rounded-xl flex items-center justify-center gap-2">
              <Coins className="w-5 h-5 text-amber-400 fill-current" />
              <div className="text-left">
                <div className="text-sm font-extrabold text-white">+{bonusCoins} Coins</div>
                <div className="text-[9px] text-slate-400 uppercase font-mono">Treasury Grant</div>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-slate-300 text-xs sm:text-sm font-mono leading-relaxed my-4 px-2">
            New corporate challenges await. Your daily tasks will now demand greater expertise but grant higher rewards. Keep pushing your career arc!
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full mt-2 py-3.5 bg-[#ffc700] hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-2"
          >
            <span>ACCEPT PROMOTION</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
