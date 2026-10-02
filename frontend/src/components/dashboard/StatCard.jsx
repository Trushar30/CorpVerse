import React from 'react';

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'emerald' }) {
  return (
    <div className="bg-[#06080E] border border-slate-800 p-4 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-200 text-xs">{label}</span>
        {Icon && <Icon className={`w-4 h-4 text-${color}-400`} />}
      </div>
      <div className={`text-${color}-400 font-extrabold text-2xl`}>{value}</div>
      {(trend || trendLabel) && (
        <div className="text-[10px] text-slate-500 flex justify-between mt-2">
          <span>{trendLabel}</span>
          <span className={`text-${color}-400 font-bold`}>{trend}</span>
        </div>
      )}
    </div>
  );
}
