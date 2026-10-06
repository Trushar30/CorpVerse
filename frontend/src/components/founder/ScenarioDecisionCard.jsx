import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Skull,
} from 'lucide-react';
import api from '@api/client';

export default function ScenarioDecisionCard({ scenarioData, onResolved, onBankrupt }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcomeResult, setOutcomeResult] = useState(null);

  if (!scenarioData?.scenario) {
    return (
      <div className="p-6 bg-[#0F1424] border-2 border-slate-800 rounded-xl text-center text-slate-400 font-mono text-xs shadow-lg">
        <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
        No active corporate dilemmas right now. All operations running smoothly!
      </div>
    );
  }

  const { scenario, company } = scenarioData;

  const handleExecuteDecision = async () => {
    if (selectedIdx === null) return;
    try {
      setIsSubmitting(true);
      const res = await api.post(`/founder/scenarios/${scenario._id}/decide`, {
        optionIndex: selectedIdx,
      });
      const data = res.data?.data || res.data;
      setOutcomeResult(data);

      if (data.isBankrupt && onBankrupt) {
        onBankrupt(data);
      } else if (onResolved) {
        onResolved(data);
      }
    } catch (err) {
      console.error('Decision execution failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0F1424] border-2 border-amber-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] font-mono text-xs space-y-4 arcade-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-extrabold text-slate-100 text-sm tracking-wide">
            CORPORATE CRISIS & STRATEGIC DILEMMA
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30">
            {scenario.urgency} URGENCY
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Treasury:</span>
          <span className="font-bold text-amber-400">{company?.treasury ?? 0} CorpCoins</span>
        </div>
      </div>

      {/* Scenario Narrative */}
      <div>
        <h3 className="text-slate-100 font-bold text-base">{scenario.title}</h3>
        <p className="text-slate-300 text-xs mt-1 font-sans leading-relaxed">
          {scenario.description}
        </p>
      </div>

      {/* Outcome Banner if resolved */}
      {outcomeResult ? (
        <div
          className={`p-4 rounded-xl border-2 space-y-2 ${
            outcomeResult.isBankrupt
              ? 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
              : 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(0,245,160,0.2)]'
          }`}
        >
          <div className="font-bold text-sm flex items-center gap-2">
            {outcomeResult.isBankrupt ? (
              <>
                <Skull className="w-5 h-5 text-rose-400" />
                <span>VENTURE INSOLVENT & SUSPENDED</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>DECISION OUTCOME REPORT</span>
              </>
            )}
          </div>
          <p className="font-sans text-xs">{outcomeResult.outcome}</p>
          <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-800">
            <span className={outcomeResult.treasuryImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              P&L: {outcomeResult.treasuryImpact >= 0 ? `+${outcomeResult.treasuryImpact}` : outcomeResult.treasuryImpact} CC
            </span>
            <span className={outcomeResult.valuationImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              Valuation: {outcomeResult.valuationImpact >= 0 ? `+$${outcomeResult.valuationImpact.toLocaleString()}` : `-$${Math.abs(outcomeResult.valuationImpact).toLocaleString()}`}
            </span>
            <span className="text-slate-300">
              New Treasury: <strong>{outcomeResult.updatedTreasury} CC</strong>
            </span>
          </div>
        </div>
      ) : (
        /* Options Selection */
        <div className="space-y-3 pt-2">
          {scenario.options?.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-violet-950/40 border-violet-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-[#06080E] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">{opt.text}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      opt.riskRating === 'conservative'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : opt.riskRating === 'aggressive'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {opt.riskRating}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] font-sans">{opt.description}</p>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span className={opt.treasuryImpact >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    Treasury: {opt.treasuryImpact >= 0 ? `+${opt.treasuryImpact}` : opt.treasuryImpact} CC
                  </span>
                  <span className={opt.valuationImpact >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    Valuation: {opt.valuationImpact >= 0 ? `+$${opt.valuationImpact.toLocaleString()}` : `-$${Math.abs(opt.valuationImpact).toLocaleString()}`}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecuteDecision}
              disabled={selectedIdx === null || isSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'EXECUTING VOTE...' : '[RATIFY EXECUTIVE DECISION]'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
