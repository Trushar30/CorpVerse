import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from 'lucide-react';
import { getManagerProfile, requestManagerFeedback } from '@api/employee';

export default function ManagerCard({ onFeedbackReceived }) {
  const [managerData, setManagerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchManager = async () => {
    try {
      setLoading(true);
      const res = await getManagerProfile();
      setManagerData(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to load manager profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManager();
  }, []);

  const handleRequestFeedback = async () => {
    try {
      setRequesting(true);
      setError(null);
      const res = await requestManagerFeedback();
      const data = res.data?.data || res.data;
      if (data?.manager) {
        setManagerData((prev) => ({
          ...prev,
          manager: data.manager,
        }));
      }
      setActionSuccess('New feedback received from your manager!');
      setTimeout(() => setActionSuccess(null), 5000);
      if (onFeedbackReceived) onFeedbackReceived(data);
    } catch (err) {
      console.error('Failed to request 1-on-1 feedback:', err);
      setError(err.response?.data?.message || 'Failed to request feedback. Please try again later.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 arcade-panel animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-800 rounded w-1/4" />
          </div>
        </div>
        <div className="h-16 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  const manager = managerData?.manager || {
    name: 'Sarah Chen',
    title: 'Engineering Director',
    style: 'supportive',
    avatarUrl: '/avatars/manager-1.png',
    feedbackHistory: [],
  };

  const history = manager.feedbackHistory || [];
  const latestFeedback = history.length > 0 ? history[history.length - 1] : null;

  const styleLabels = {
    supportive: { label: 'Supportive Coach', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    demanding: { label: 'High Standards', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    analytical: { label: 'Data-Driven', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  };

  const sentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'praise':
        return <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-[#0F1424] border-2 border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 arcade-panel space-y-5 transition-all shadow-xl">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar with live pulse */}
          <div className="relative">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-0.5 border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center justify-center font-display font-extrabold text-white text-lg">
              {manager.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            {/* Live Indicator */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0F1424]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-slate-100 text-lg">
                {manager.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                  styleLabels[manager.style]?.color || styleLabels.supportive.color
                }`}
              >
                {styleLabels[manager.style]?.label || 'Direct Manager'}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">
              {manager.title} • <span className="text-emerald-400 font-mono font-bold">ACTIVE SPRINT SUPERVISOR</span>
            </div>
          </div>
        </div>

        {/* 1-on-1 Action Button */}
        <button
          onClick={handleRequestFeedback}
          disabled={requesting}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold rounded-xl text-xs shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 self-start sm:self-auto font-mono"
        >
          {requesting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Progress...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>REQUEST 1-ON-1 FEEDBACK</span>
            </>
          )}
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Manager Speech Bubble / Advice */}
      <div className="relative">
        <div className="bg-[#06080E] border-2 border-slate-800 rounded-2xl p-4 sm:p-5 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)]">
          {/* Subtle triangle speech bubble tail pointing to avatar */}
          <div className="absolute -top-2.5 left-7 w-4 h-4 bg-[#06080E] border-t-2 border-l-2 border-slate-800 transform rotate-45" />

          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              LATEST 1-ON-1 GUIDANCE & FEEDBACK
            </span>
            {latestFeedback && (
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(latestFeedback.date).toLocaleDateString()}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed italic">
            "{latestFeedback ? latestFeedback.note : "Welcome to the team! Keep your focus on consistent daily task delivery and clean code architecture. I'm here to review your performance and sponsor your promotions."}"
          </p>

          {latestFeedback && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Sentiment Evaluation:</span>
                <span className="capitalize font-bold text-slate-200 flex items-center gap-1">
                  {sentimentIcon(latestFeedback.sentiment)}
                  {latestFeedback.sentiment}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Sprint Review Cycle 1.0
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer Toggle */}
      {history.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1.5 transition-colors"
          >
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Feedback History ({history.length} records)</span>
          </button>

          {showHistory && (
            <div className="space-y-2 pt-2 max-h-56 overflow-y-auto pr-1">
              {[...history].reverse().map((item, index) => (
                <div
                  key={index}
                  className="bg-[#06080E] border border-slate-800 rounded-lg p-3 text-xs space-y-1 font-sans"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      {sentimentIcon(item.sentiment)}
                      <span className="capitalize">{item.sentiment}</span>
                    </span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{item.note}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
