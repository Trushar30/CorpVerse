import React from 'react';
import Navbar from '../layout/Navbar';

export default function DashboardLayout({ children, toastMessage, rankBadge }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`bg-[#151B2E] border-2 ${
            (typeof toastMessage === 'object' && toastMessage?.type === 'error')
              ? 'border-rose-400 text-rose-300'
              : 'border-emerald-400 text-emerald-300'
          } px-5 py-3 rounded-lg shadow-[0_0_20px_rgba(0,245,160,0.4)] flex items-center gap-3 font-sans font-bold text-xs`}>
            <span>{typeof toastMessage === 'string' ? toastMessage : toastMessage?.msg}</span>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {children}
      </main>
    </div>
  );
}
