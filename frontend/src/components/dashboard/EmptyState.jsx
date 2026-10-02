import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionButton }) {
  return (
    <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl text-center p-12 space-y-3 arcade-panel">
      {Icon && <Icon className="w-10 h-10 text-amber-400 mx-auto" />}
      <div className="font-bold text-slate-200 text-base font-display">{title}</div>
      <p className="text-slate-400 text-xs font-sans max-w-md mx-auto">
        {description}
      </p>
      {actionButton && (
        <div className="pt-4">
          {actionButton}
        </div>
      )}
    </div>
  );
}
