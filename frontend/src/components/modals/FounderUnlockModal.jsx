import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, AlertTriangle, CheckCircle2, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function FounderUnlockModal({
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBecomeFounder = async () => {
    setLoading(true);
    setError('');
    try {
      await client.post('/founder/transition');
      await refreshUser();
      if (onClose) onClose();
      navigate('/dashboard/founder');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transition to founder mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-pixel overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="relative max-w-lg w-full bg-[#0E1322] border-4 border-black rounded-3xl p-6 sm:p-8 text-center shadow-[12px_12px_0px_#000] z-10 shadow-[0_0_60px_rgba(168,85,247,0.4)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-purple-500/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-400 shadow-[4px_4px_0px_#000]">
            <Rocket className="w-8 h-8 animate-bounce" />
          </div>

          <h3 className="font-pixel-heading text-xl sm:text-2xl font-black text-white drop-shadow-[2px_2px_0px_#000]">
            🚀 FOUNDER MODE UNLOCKED! 🚀
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
            You've proven your mettle in the corporate hierarchy. Now it's time to build your own startup empire.
          </p>

          {/* Benefits list */}
          <div className="my-4 p-4 bg-[#06080E] border-2 border-black rounded-xl text-left space-y-2 font-mono text-xs text-slate-300">
            <div className="font-bold text-amber-400 uppercase text-[11px] mb-1 font-pixel">
              As a Founder, you can:
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Create and manage your own autonomous venture</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Hire specialized AI agents to automate your pipeline</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Publish open job requisitions and hire other human players</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Direct treasury strategy, manage cash burn, and chase profitability</span>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left flex items-start gap-2.5 text-[11px] text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Warning:</strong> Founding carries market volatility! Poor resource allocation can lead to treasury depletion and venture bankruptcy.
            </span>
          </div>

          {error && (
            <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all"
            >
              STAY AS EMPLOYEE
            </button>
            <button
              onClick={handleBecomeFounder}
              disabled={loading}
              className="py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'TRANSITIONING...' : 'BECOME A FOUNDER →'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
