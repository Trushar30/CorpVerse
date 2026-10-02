import React from 'react';

export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 arcade-panel">
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorClass = tab.colorClass || 'emerald';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? `bg-${colorClass}-500/20 border-2 border-${colorClass}-500/60 text-${colorClass}-300 shadow-[0_0_15px_rgba(0,245,160,0.2)]` // Note: dynamic color classes in tailwind might not work perfectly unless whitelisted, but keeping original structure for now.
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              style={isActive && tab.activeStyle ? tab.activeStyle : {}}
            >
              {Icon && <Icon className="w-4 h-4" style={isActive ? { color: tab.iconColor } : {}} />}
              <span>[{i + 1}] {tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono px-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>SUB-ROUTINE :: {activeTab.toUpperCase()}</span>
      </div>
    </div>
  );
}
