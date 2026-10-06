import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Coins,
  Building,
  Check,
  X,
  Sliders,
  Send,
} from 'lucide-react';
import { acceptOffer, declineOffer, negotiateOffer } from '@api/applications';
import { useAuth } from '@context/AuthContext';

export default function OfferModal({
  isOpen,
  application,
  onClose,
  onOfferUpdated,
}) {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [isNegotiatingMode, setIsNegotiatingMode] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(null); // 'accept' | 'decline' | 'negotiate'
  const [error, setError] = useState(null);
  const [justification, setJustification] = useState('');

  if (!isOpen || !application) return null;

  const role = application.role || {};
  const company = role.company || { name: application.companyName || 'CorpVerse Partner' };
  const roleLevel = role.level || 'mid';

  // Base and Offered salaries with sensible fallbacks
  const defaultBase = roleLevel === 'senior' ? 125000 : roleLevel === 'junior' ? 70000 : 90000;
  const baseSalary = application.offerDetails?.baseSalary || defaultBase;
  const currentOfferedSalary = application.offerDetails?.offeredSalary || baseSalary;
  const bonusCoins = application.offerDetails?.bonusCoins ?? 50;
  const isAlreadyNegotiated = Boolean(
    application.offerDetails?.isNegotiated ||
    (application.offerDetails?.negotiationHistory && application.offerDetails.negotiationHistory.length > 0)
  );

  const maxNegotiableSalary = Math.round(baseSalary * 1.20);
  const [counterSalary, setCounterSalary] = useState(Math.round(baseSalary * 1.08));

  // Acceptance probability preview formula:
  // Base 50% + (20% if score >= 85) + (15% if exp >= 300) - (2% per 1% requested)
  const interviewScore = application.interviewScore || application.screeningScore || 80;
  const userExp = user?.expTotal || 0;
  const requestedIncreasePct = Math.max(0, ((counterSalary - baseSalary) / baseSalary) * 100);
  const calculatedProbability = Math.max(
    10,
    Math.min(
      95,
      Math.round(
        50 +
        (interviewScore >= 85 ? 20 : 0) +
        (userExp >= 300 ? 15 : 0) -
        (requestedIncreasePct * 2)
      )
    )
  );

  const lastNegotiation = application.offerDetails?.negotiationHistory?.[
    application.offerDetails.negotiationHistory.length - 1
  ];

  const handleNegotiateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmittingAction('negotiate');

    try {
      const res = await negotiateOffer(application._id || application.id, {
        counterSalary: Number(counterSalary),
        argument: justification.trim() || undefined,
      });

      const updatedApp = res.data?.application || res.data;
      if (onOfferUpdated) {
        onOfferUpdated(updatedApp);
      }
      setIsNegotiatingMode(false);
    } catch (err) {
      console.error('Failed to negotiate offer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit counter-offer.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleAccept = async () => {
    setError(null);
    setSubmittingAction('accept');

    try {
      await acceptOffer(application._id || application.id);
      if (refreshUser) await refreshUser();
      if (onClose) onClose();
      navigate('/dashboard/employee');
    } catch (err) {
      console.error('Failed to accept offer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to accept offer.');
      setSubmittingAction(null);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this job offer? This action cannot be reversed.')) {
      return;
    }

    setError(null);
    setSubmittingAction('decline');

    try {
      const res = await declineOffer(application._id || application.id);
      const updatedApp = res.data?.application || res.data;
      if (onOfferUpdated) {
        onOfferUpdated(updatedApp);
      }
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to decline offer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to decline offer.');
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F1424] border-2 border-emerald-500/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 arcade-panel relative shadow-[0_0_35px_rgba(0,245,160,0.25)] my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(0,245,160,0.3)]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3" /> OFFICIAL JOB OFFER
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-100">
                {role.title || 'Engineering Specialist'}
              </h2>
              <div className="text-xs text-slate-400 font-sans flex items-center gap-2 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-200">{company.name}</span>
                <span>•</span>
                <span className="uppercase font-mono text-cyan-400">{roleLevel} Level</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Offer Details Card */}
        <div className="bg-[#06080E] border-2 border-slate-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Salary Package */}
            <div className="p-4 rounded-xl bg-[#0F1424] border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Base Compensation</span>
                {currentOfferedSalary > baseSalary && (
                  <span className="text-emerald-400 font-bold">
                    +{Math.round(((currentOfferedSalary - baseSalary) / baseSalary) * 100)}% NEGOTIATED
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-display text-emerald-400 flex items-center gap-1">
                <DollarSign className="w-6 h-6" />
                <span>{currentOfferedSalary.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">/ yr</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Initial baseline: ${baseSalary.toLocaleString()}/yr
              </div>
            </div>

            {/* CorpCoins Bonus */}
            <div className="p-4 rounded-xl bg-[#0F1424] border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Sign-On Bonus</span>
                <span className="text-amber-400 font-bold">ONBOARDING PERK</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-display text-amber-400 flex items-center gap-1.5">
                <Coins className="w-6 h-6" />
                <span>+{bonusCoins}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">CorpCoins</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Credited directly to wallet upon offer acceptance
              </div>
            </div>
          </div>

          {/* Letter excerpt */}
          <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed space-y-2">
            <p>
              Dear <strong className="text-slate-100">{user?.name}</strong>, following your outstanding technical evaluation, <strong className="text-emerald-300">{company.name}</strong> is pleased to extend an official offer of employment as a <strong className="text-slate-100">{role.title}</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              Upon acceptance, your account status will transition to <span className="text-cyan-300 font-bold">Working Professional</span> with full access to daily sprint tasks, manager feedback, and salary disbursements.
            </p>
          </div>
        </div>

        {/* Previous Negotiation Outcome Banner */}
        {lastNegotiation && (
          <div
            className={`p-4 rounded-xl border-2 space-y-1 text-xs font-mono ${
              lastNegotiation.outcome === 'accepted'
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                : lastNegotiation.outcome === 'counter_compromise'
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
              {lastNegotiation.outcome === 'accepted' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>COUNTER-OFFER ACCEPTED BY HIRING MANAGER</span>
                </>
              ) : lastNegotiation.outcome === 'counter_compromise' ? (
                <>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>COUNTER-COMPROMISE EXTENDED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>INITIAL OFFER REMAINS FIRM</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 font-sans italic">
              "{lastNegotiation.managerMessage}"
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Final negotiated compensation: <strong className="text-emerald-400">${lastNegotiation.finalSalary?.toLocaleString()}/yr</strong>
            </div>
          </div>
        )}

        {/* Negotiation Form Drawer */}
        {isNegotiatingMode && !isAlreadyNegotiated && (
          <form onSubmit={handleNegotiateSubmit} className="bg-[#06080E] border-2 border-cyan-500/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase font-mono">
                <Sliders className="w-4 h-4" />
                <span>COUNTER-OFFER PROPOSAL</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                CAP: +20% (${maxNegotiableSalary.toLocaleString()})
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Proposed Salary:</span>
                <span className="text-emerald-400 font-black text-lg font-mono">
                  ${counterSalary.toLocaleString()} / yr
                  <span className="text-xs text-cyan-400 ml-1.5 font-sans font-bold">
                    (+{Math.round(requestedIncreasePct)}%)
                  </span>
                </span>
              </div>

              <input
                type="range"
                min={baseSalary}
                max={maxNegotiableSalary}
                step={1000}
                value={counterSalary}
                onChange={(e) => setCounterSalary(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Baseline: ${baseSalary.toLocaleString()}</span>
                <span>Max: ${maxNegotiableSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Estimated Probability Gauge */}
            <div className="p-3 rounded-lg bg-[#0F1424] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Acceptance Probability:</span>
                <span className={`font-bold ${
                  calculatedProbability >= 70
                    ? 'text-emerald-400'
                    : calculatedProbability >= 45
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  ~{calculatedProbability}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    calculatedProbability >= 70
                      ? 'bg-emerald-500'
                      : calculatedProbability >= 45
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${calculatedProbability}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
                <span>Interview Score: {interviewScore}/100</span>
                <span>User EXP: {userExp}</span>
              </div>
            </div>

            {/* Justification Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-mono uppercase">
                Justification / Cover Argument (Optional):
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Detail prior accomplishments, high evaluation marks, or domain expertise..."
                rows={2}
                className="w-full bg-[#0F1424] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNegotiatingMode(false)}
                className="px-4 py-2 bg-[#0F1424] text-slate-400 hover:text-slate-200 text-xs font-mono rounded-lg border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAction === 'negotiate'}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center gap-1.5"
              >
                {submittingAction === 'negotiate' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Counter-Offer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              disabled={Boolean(submittingAction)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#06080E] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold rounded-xl text-xs transition-colors"
            >
              {submittingAction === 'decline' ? 'Declining...' : 'Decline Offer'}
            </button>

            {!isAlreadyNegotiated && !isNegotiatingMode && (
              <button
                onClick={() => setIsNegotiatingMode(true)}
                disabled={Boolean(submittingAction)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Negotiate Terms</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#06080E] border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors"
            >
              Decide Later
            </button>
            <button
              onClick={handleAccept}
              disabled={Boolean(submittingAction)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs shadow-[0_0_20px_rgba(0,245,160,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {submittingAction === 'accept' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ONBOARDING...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ACCEPT OFFER & ONBOARD</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
