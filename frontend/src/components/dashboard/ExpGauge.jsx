import React from 'react';
import { Zap } from 'lucide-react';

export default function ExpGauge({ expTotal, maxExp = 500, label = 'CAREER EXP PROGRESSION', targetLabel = 'FOUNDER UNLOCK' }) {
  const expProgress = Math.min((expTotal / maxExp) * 100, 100);
  const needed = Math.max(0, maxExp - expTotal);

  return (
    <div className="p-4 bg-[#06080E] border-2 border-slate-800 rounded-xl space-y-2.5 w-full lg:w-80 shrink-0 arcade-card">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
          {label}
        </span>
        <span className="text-emerald-400 font-extrabold text-sm">{expTotal} / {maxExp} EXP</span>
      </div>

      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,245,160,0.5)]"
          style={{ width: `${expProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-400">{targetLabel}:</span>
        <span className="text-amber-400 font-bold">{needed} EXP Needed</span>
      </div>
    </div>
  );
}
