import React from 'react';

export default function StatusBadge({ status, label, color = 'cyan' }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] bg-${color}-500/10 text-${color}-300 border border-${color}-500/30 font-bold`}>
      {label || status}
    </span>
  );
}
