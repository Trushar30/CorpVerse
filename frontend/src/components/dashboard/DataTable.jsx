import React from 'react';

export default function DataTable({ headers, rows, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#06080E] text-slate-400 font-mono border-y border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              {renderRow(row, i)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
