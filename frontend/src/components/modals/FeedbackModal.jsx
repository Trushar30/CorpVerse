import React from 'react';
import { X, AlertCircle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeedbackModal({ feedback, roleTitle, cooldownUntil, onClose, onTakeTraining }) {
  const navigate = useNavigate();
  
  if (!feedback) return null;
  
  const isRejected = feedback.score < 60; // Assuming 60 is the threshold

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-6 arcade-panel relative shadow-[8px_8px_0px_#000]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-[2px_2px_0px_#000] ${isRejected ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-100 text-lg uppercase tracking-wider">
                📊 SCREENING FEEDBACK
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                ROLE: {roleTitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#06080E] border-2 border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest mb-1">ATS MATCH SCORE</span>
            <div className={`text-4xl font-black font-display ${isRejected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {feedback.score}/100
            </div>
          </div>
          <div className="bg-[#06080E] border-2 border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest mb-1">VERDICT</span>
            <div className={`text-lg font-bold font-mono ${isRejected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isRejected ? 'NEEDS IMPROVEMENT' : 'PROCEEDING TO INTERVIEW'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
              <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-2 mb-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} className="text-sm text-slate-300 font-sans flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
              <h4 className="text-[11px] font-bold text-rose-400 flex items-center gap-2 mb-2 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {feedback.improvements.map((imp, idx) => (
                  <li key={idx} className="text-sm text-slate-300 font-sans flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-[#06080E] border border-slate-800 rounded-lg p-4">
            <h4 className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Overall Assessment</h4>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {feedback.feedbackText}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="text-xs font-mono text-amber-400 flex items-center gap-2">
            {cooldownUntil && new Date() < new Date(cooldownUntil) && (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>You can re-apply in {Math.ceil((new Date(cooldownUntil) - new Date()) / (1000 * 60 * 60 * 24))} days ({new Date(cooldownUntil).toLocaleDateString()})</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#06080E] border-2 border-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-xs transition-colors"
            >
              CLOSE
            </button>
            {isRejected && onTakeTraining && (
              <button
                onClick={() => {
                  onClose();
                  onTakeTraining();
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                <span>BYPASS COOLDOWN VIA TRAINING 🎓</span>
              </button>
            )}
            {isRejected && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard'); // Changed from /profile to /dashboard to be safer
                }}
                className="px-4 py-2 bg-[#ffc700] hover:bg-[#ffd633] text-black font-extrabold rounded-lg text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 transition-transform active:translate-y-0.5 active:shadow-none"
              >
                <RefreshCw className="w-4 h-4" />
                <span>UPDATE RESUME</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
