import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import DashboardLayout from '@components/dashboard/DashboardLayout';
import ExpGainAnimation from '@components/dashboard/ExpGainAnimation';
import AnimatedExpBar from '@components/dashboard/AnimatedExpBar';
import BadgeShowcase from '@components/dashboard/BadgeShowcase';
import PromotionModal from '@components/modals/PromotionModal';
import FounderUnlockModal from '@components/modals/FounderUnlockModal';
import {
  getTodayTask,
  getMyTasks,
  completeTask,
  getPerformance,
  getMyRecord,
  resign,
} from '@api/employee';
import {
  Briefcase,
  Radio,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Activity,
  Zap,
  ListChecks,
  Sparkles,
  Flame,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Send,
  Building,
  Star,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Target,
  ShieldAlert,
  Rocket,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'today' | 'history' | 'profile'
  const [activeTab, setActiveTab] = useState('today');

  // Loading States
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPerf, setIsLoadingPerf] = useState(true);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);

  // Data States
  const [todayTask, setTodayTask] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);

  // Submission State
  const [submissionText, setSubmissionText] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EXP Animation State
  const [expGainData, setExpGainData] = useState({
    show: false,
    expGained: 0,
    streakBonus: 0,
    earlyBonus: 0,
  });

  // History Filter & Pagination
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historyDifficulty, setHistoryDifficulty] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Warning & Resignation Modals
  const [dismissWarning, setDismissWarning] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [isResigning, setIsResigning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Gamification Modals
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionData, setPromotionData] = useState(null);
  const [showFounderModal, setShowFounderModal] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─── Data Fetching ───────────────────────────────────────
  const fetchToday = useCallback(async () => {
    setIsLoadingToday(true);
    try {
      const res = await getTodayTask();
      setTodayTask(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch today task:', err);
    } finally {
      setIsLoadingToday(false);
    }
  }, []);

  const fetchPerf = useCallback(async () => {
    setIsLoadingPerf(true);
    try {
      const res = await getPerformance();
      setPerformance(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
    } finally {
      setIsLoadingPerf(false);
    }
  }, []);

  const fetchRecord = useCallback(async () => {
    setIsLoadingRecord(true);
    try {
      const res = await getMyRecord();
      setEmployeeRecord(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Failed to fetch employee record:', err);
    } finally {
      setIsLoadingRecord(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1, status = historyFilter, difficulty = historyDifficulty) => {
    setIsLoadingHistory(true);
    try {
      const params = { page, limit: 8 };
      if (status !== 'all') params.status = status;
      if (difficulty !== 'all') params.difficulty = difficulty;

      const res = await getMyTasks(params);
      const data = res.data?.data || res.data;
      setTaskHistory(data?.tasks || []);
      if (data?.pagination) {
        setHistoryPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch task history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [historyFilter, historyDifficulty]);

  useEffect(() => {
    fetchToday();
    fetchPerf();
    fetchRecord();
    fetchHistory(1);
    if (refreshUser) refreshUser();
  }, [fetchToday, fetchPerf, fetchRecord, fetchHistory, refreshUser]);

  // ─── Task Completion ─────────────────────────────────────
  const handleConfirmSubmit = async () => {
    if (!todayTask?._id) return;
    setIsSubmitting(true);
    try {
      const res = await completeTask(todayTask._id, {
        submissionData: { solution: submissionText },
      });
      const data = res.data?.data || res.data;

      // Trigger EXP animation
      setExpGainData({
        show: true,
        expGained: data?.expGained || todayTask.expReward || 25,
        streakBonus: data?.bonuses?.streakBonus || 0,
        earlyBonus: data?.bonuses?.earlyBonus || 0,
      });

      // Update local task state
      setTodayTask((prev) => ({
        ...prev,
        status: 'completed',
        completedAt: new Date().toISOString(),
      }));

      setShowSubmitModal(false);
      setSubmissionText('');
      showToast(`✅ Task completed! +${data?.expGained || 25} EXP earned.`);

      // Check for promotion
      if (data?.promotion?.promoted) {
        setPromotionData(data.promotion);
        setShowPromotionModal(true);
      }

      // Refresh data
      if (refreshUser) refreshUser();
      fetchPerf();
      fetchHistory(1);
    } catch (err) {
      console.error('Task submission error:', err);
      showToast(err.response?.data?.message || 'Failed to submit task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Resignation Flow ────────────────────────────────────
  const handleConfirmResign = async () => {
    setIsResigning(true);
    try {
      await resign({ reason: 'Player resigned from employee position' });
      setShowResignModal(false);
      showToast('Resignation accepted. You have returned to Job Seeker status.');
      if (refreshUser) await refreshUser();
      navigate('/dashboard/job-seeker');
    } catch (err) {
      console.error('Resignation error:', err);
      showToast(err.response?.data?.message || 'Failed to process resignation.', 'error');
    } finally {
      setIsResigning(false);
    }
  };

  // ─── Progress Calculations ───────────────────────────────
  const expTotal = user?.expTotal || 0;
  const founderProgress = Math.min(100, Math.round((expTotal / 500) * 100));

  const currentLevel = employeeRecord?.currentLevel || 'junior';
  let nextLevelName = 'Mid';
  let levelThreshold = 200;
  let levelProgress = 0;

  if (currentLevel === 'junior') {
    nextLevelName = 'Mid';
    levelThreshold = 200;
    levelProgress = Math.min(100, Math.round((expTotal / 200) * 100));
  } else if (currentLevel === 'mid') {
    nextLevelName = 'Senior';
    levelThreshold = 500;
    levelProgress = Math.min(100, Math.round((expTotal / 500) * 100));
  } else {
    nextLevelName = 'Max Level';
    levelThreshold = 500;
    levelProgress = 100;
  }

  const completedThisWeek = performance?.completedThisWeek || 0;
  const weeklyRate = Math.min(100, Math.round((completedThisWeek / 7) * 100));

  const isCompletedToday = todayTask?.status === 'completed';

  const difficultyColors = {
    easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    hard: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  };

  return (
    <>
      <DashboardLayout toastMessage={toastMessage}>
        {/* EXP Gain Overlay Animation */}
        <ExpGainAnimation
          show={expGainData.show}
          expGained={expGainData.expGained}
          streakBonus={expGainData.streakBonus}
          earlyBonus={expGainData.earlyBonus}
          onComplete={() => setExpGainData((prev) => ({ ...prev, show: false }))}
        />

        {/* ─── Performance Warning Banners ───────────────────── */}
        {performance?.status === 'critical' && (
          <div className="bg-rose-950/40 border-2 border-rose-500 rounded-xl p-4 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black font-pixel text-rose-300 uppercase tracking-wide">
                    🔴 CRITICAL: PERFORMANCE REVIEW
                  </h3>
                  <p className="text-xs text-rose-200/90 mt-1 font-sans">
                    You have 0 completed tasks in the last 7 days. Continued critical performance triggers automatic demotion or employment termination. A -20 EXP penalty applies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('today')}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-black font-black text-xs font-pixel rounded border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 transition-all"
              >
                VIEW TODAY'S TASK →
              </button>
            </div>
          </div>
        )}

        {performance?.status === 'warning' && !dismissWarning && (
          <div className="bg-amber-950/40 border-2 border-amber-500 rounded-xl p-4 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold font-pixel text-amber-300 uppercase">
                    ⚠️ PERFORMANCE WARNING
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-0.5 font-sans">
                    You've completed only {completedThisWeek}/7 tasks this week. Complete at least 3 tasks per week to maintain your rank and avoid EXP deductions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDismissWarning(true)}
                  className="px-3 py-1.5 bg-[#06080E] text-slate-400 hover:text-slate-200 text-xs font-mono rounded border border-slate-700"
                >
                  DISMISS
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-pixel rounded border-2 border-black shadow-[2px_2px_0px_#000]"
                >
                  VIEW TODAY'S TASK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Hero Overview Card ─────────────────────────────── */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 shadow-2xl arcade-panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-[11px]">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-bold tracking-wider font-mono">
                  NODE_STATE :: WORKING_PROFESSIONAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 tracking-tight">
                {employeeRecord?.company?.name ? `${employeeRecord.company.name} Workspace` : 'Employee Workspace'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Logged in as <span className="text-emerald-400 font-bold">{user?.name}</span> ({employeeRecord?.role?.title || 'Engineer'} · <span className="capitalize">{currentLevel}</span> tier)
              </p>
            </div>

            {/* EXP Quick Bar */}
            <div className="p-4 bg-[#06080E] border-2 border-slate-800 rounded-xl space-y-2 w-full md:w-auto shrink-0 arcade-card">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[11px] font-bold font-mono">FOUNDER UNLOCK:</span>
                <span className="text-cyan-400 font-extrabold text-xs font-mono">{expTotal} / 500 EXP</span>
              </div>
              <div className="w-full md:w-56 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                  style={{ width: `${founderProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-amber-400 font-bold font-mono flex items-center justify-between">
                <span>★ {founderProgress}% to Founder Console</span>
                <span className="text-slate-500">{Math.max(0, 500 - expTotal)} EXP left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Mode Unlock Banner */}
        {expTotal >= 500 && user?.role !== 'founder' && user?.currentStatus !== 'founder' && (
          <div className="bg-gradient-to-r from-purple-950/60 to-amber-950/60 border-2 border-purple-500/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
                <Rocket className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-amber-300">
                  ★ FOUNDER CONSOLE UNLOCKED!
                </div>
                <div className="text-[11px] text-slate-300 font-sans">
                  You have reached {expTotal} EXP. You are eligible to launch your own venture and manage AI agent workforces!
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFounderModal(true)}
              className="px-4 py-2.5 bg-[#ffc700] hover:bg-[#ffd633] text-black font-bold text-xs rounded border-2 border-black shadow-[3px_3px_0px_#000] shrink-0 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Rocket className="w-4 h-4" />
              <span>CLAIM FOUNDER ACCESS 🚀</span>
            </button>
          </div>
        )}

        {/* Animated EXP Progression Bar */}
        <AnimatedExpBar
          expTotal={expTotal}
          maxExp={500}
          showMilestones={true}
          className="border-slate-800"
        />

        {/* ─── Arcade Navigation Tabs ─────────────────────────── */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 arcade-panel">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto font-pixel">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'today'
                  ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>[1] TODAY'S MISSION</span>
              {isCompletedToday && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListChecks className="w-4 h-4 text-amber-400" />
              <span>[2] TASK HISTORY</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>[3] PROFILE & PERFORMANCE</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-pixel text-amber-300 px-3 py-1 bg-[#06080E] border border-slate-800 rounded-lg">
            <Flame className="w-4 h-4 text-amber-400 fill-current animate-bounce" />
            <span>STREAK: {performance?.streak || 0} DAYS</span>
          </div>
        </div>

        {/* ─── TAB 1: TODAY'S MISSION ─────────────────────────── */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {isLoadingToday ? (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-12 text-center arcade-panel">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <div className="text-sm font-pixel text-slate-300">GENERATING ROLE-SPECIFIC DAILY MISSION...</div>
                <div className="text-xs font-mono text-slate-500 mt-1">Consulting AI Engineering Director</div>
              </div>
            ) : todayTask ? (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl overflow-hidden arcade-panel shadow-2xl">
                {/* Header Strip */}
                <div className="p-4 border-b border-slate-800 bg-[#06080E] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-pixel font-bold text-cyan-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> DAILY TASK ASSIGNMENT
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-pixel uppercase font-bold border ${difficultyColors[todayTask.difficulty] || difficultyColors.medium}`}>
                      ⚡ {todayTask.difficulty}
                    </span>
                    {todayTask.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {todayTask.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-pixel text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>REWARD: +{todayTask.expReward || 25} EXP</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Task Title & Description */}
                  <div className="space-y-3">
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-100 flex items-center gap-2">
                      <span>{todayTask.title}</span>
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed bg-[#06080E] p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                      {todayTask.description}
                    </div>
                  </div>

                  {/* Skills Tested */}
                  {todayTask.skillsTested && todayTask.skillsTested.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">Skills Tested:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {todayTask.skillsTested.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 rounded text-xs font-mono">
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Today Banner */}
                  {isCompletedToday ? (
                    <div className="bg-emerald-950/30 border-2 border-emerald-500/50 rounded-xl p-6 text-center space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h3 className="text-base font-pixel text-emerald-300 font-bold">
                        COMPLETED TODAY — +{todayTask.expReward || 25} EXP EARNED
                      </h3>
                      <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                        Your solution has been submitted and verified. Your streak is now active at{' '}
                        <strong className="text-amber-400">{performance?.streak || 1} consecutive days</strong>. Next mission arrives at midnight!
                      </p>
                    </div>
                  ) : (
                    /* Submission Box */
                    <div className="space-y-4 pt-2 border-t border-slate-800/80">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center justify-between">
                          <span>Your Submission Log & Solution:</span>
                          <span className="text-[10px] text-slate-400 font-normal">Min 10 characters required</span>
                        </label>
                        <textarea
                          rows={4}
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Describe your technical approach, root cause diagnosis, and implementation fix..."
                          className="w-full bg-[#06080E] border-2 border-slate-800 focus:border-cyan-400 focus:outline-none rounded-xl p-3 text-xs text-slate-100 font-mono transition-all resize-none shadow-inner"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-400 font-mono">
                          ★ Completing within 2 hours grants <span className="text-cyan-300 font-bold">+10 Speed Bonus</span>
                        </div>
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          disabled={submissionText.trim().length < 5 || isSubmitting}
                          className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-black font-pixel font-bold text-xs rounded border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <Send className="w-4 h-4" />
                          <span>SUBMIT TASK ✓</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-8 text-center arcade-panel space-y-3">
                <Target className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-pixel text-slate-300">NO TASK ACTIVE FOR TODAY</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                  You do not have a mission assigned for today yet.
                </p>
                <button
                  onClick={fetchToday}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-pixel font-bold text-xs rounded border-2 border-black shadow-[2px_2px_0px_#000] inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>REQUEST TODAY'S TASK</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: TASK HISTORY ────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Header & Filters */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 arcade-panel">
              <div>
                <h2 className="text-sm font-pixel font-bold text-slate-100 uppercase flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-amber-400" />
                  <span>Task Execution Log</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  This Week: <span className="text-emerald-400 font-bold">{completedThisWeek}/7 completed</span> · Total Recorded: {historyPagination.total}
                </div>
              </div>

              {/* Filter Selects */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <select
                  value={historyFilter}
                  onChange={(e) => {
                    setHistoryFilter(e.target.value);
                    setHistoryPage(1);
                    fetchHistory(1, e.target.value, historyDifficulty);
                  }}
                  className="bg-[#06080E] border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                </select>

                <select
                  value={historyDifficulty}
                  onChange={(e) => {
                    setHistoryDifficulty(e.target.value);
                    setHistoryPage(1);
                    fetchHistory(1, historyFilter, e.target.value);
                  }}
                  className="bg-[#06080E] border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* List */}
            {isLoadingHistory ? (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-12 text-center arcade-panel">
                <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                <div className="text-xs font-mono text-slate-400">Loading task archives...</div>
              </div>
            ) : taskHistory.length > 0 ? (
              <div className="space-y-2">
                {taskHistory.map((task) => {
                  const isDone = task.status === 'completed';
                  const dateStr = task.completedAt || task.createdAt;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Recent';

                  return (
                    <div
                      key={task._id}
                      className="bg-[#0F1424] border-2 border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all arcade-card"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-slate-500">{formattedDate}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-pixel uppercase border ${difficultyColors[task.difficulty] || difficultyColors.medium}`}>
                              {task.difficulty}
                            </span>
                            {task.category && (
                              <span className="text-[10px] font-mono text-slate-400">
                                · {task.category}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-xs sm:text-sm font-bold font-display ${isDone ? 'text-slate-200' : 'text-slate-300'}`}>
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                        <span className={`text-xs font-pixel font-bold ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isDone ? `+${task.expReward || 25} EXP` : '+0 EXP'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {historyPagination.pages > 1 && (
                  <div className="flex items-center justify-between p-3 bg-[#0F1424] border-2 border-slate-800 rounded-xl font-mono text-xs text-slate-400">
                    <button
                      disabled={historyPage <= 1}
                      onClick={() => {
                        const prev = historyPage - 1;
                        setHistoryPage(prev);
                        fetchHistory(prev);
                      }}
                      className="px-3 py-1 bg-[#06080E] border border-slate-800 rounded hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span>
                      Page {historyPage} of {historyPagination.pages}
                    </span>
                    <button
                      disabled={historyPage >= historyPagination.pages}
                      onClick={() => {
                        const next = historyPage + 1;
                        setHistoryPage(next);
                        fetchHistory(next);
                      }}
                      className="px-3 py-1 bg-[#06080E] border border-slate-800 rounded hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-8 text-center arcade-panel">
                <ListChecks className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-mono text-slate-400">No matching tasks found in history.</div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: MY PROFILE & PERFORMANCE ────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Employment Information */}
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-4 arcade-panel shadow-xl">
                <h3 className="text-xs font-pixel font-bold text-cyan-300 uppercase flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Employment Credentials</span>
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 bg-[#06080E] rounded-lg border border-slate-800">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-slate-100 font-bold">{employeeRecord?.company?.name || 'CorpVerse Partner'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#06080E] rounded-lg border border-slate-800">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="text-slate-100 font-bold">{employeeRecord?.role?.title || 'Software Engineer'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#06080E] rounded-lg border border-slate-800">
                    <span className="text-slate-400">Career Level:</span>
                    <span className="text-cyan-300 font-bold uppercase">{currentLevel}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#06080E] rounded-lg border border-slate-800">
                    <span className="text-slate-400">Hired Date:</span>
                    <span className="text-slate-200">
                      {employeeRecord?.hiredAt
                        ? new Date(employeeRecord.hiredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Active Member'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#06080E] rounded-lg border border-slate-800">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                      ACTIVE ✅
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Performance Metrics */}
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-4 arcade-panel shadow-xl">
                <h3 className="text-xs font-pixel font-bold text-amber-300 uppercase flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Performance Metrics</span>
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Weekly Completion Rate:</span>
                      <span className="text-emerald-400 font-bold">{weeklyRate}% ({completedThisWeek}/7 tasks)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${weeklyRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#06080E] rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase">Active Streak</div>
                      <div className="text-lg font-black text-amber-400 font-pixel">
                        {performance?.streak || 0} DAYS 🔥
                      </div>
                    </div>

                    <div className="p-3 bg-[#06080E] rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-500 uppercase">Status Grade</div>
                      <div className={`text-xs font-pixel font-bold uppercase ${
                        performance?.status === 'critical'
                          ? 'text-rose-400'
                          : performance?.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {performance?.status === 'critical' ? 'CRITICAL 🔴' : performance?.status === 'warning' ? 'WARNING ⚠️' : 'GOOD ✅'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#06080E] rounded-lg border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
                    {performance?.message || 'Keep completing daily tasks to earn bonuses and advance your level.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. EXP Progression Matrix */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-4 arcade-panel shadow-xl">
              <h3 className="text-xs font-pixel font-bold text-violet-300 uppercase flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>EXP Progression & Milestones</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Founder Progress */}
                <div className="space-y-2 p-4 bg-[#06080E] rounded-xl border border-slate-800 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Founder Console Unlock:</span>
                    <span className="text-cyan-400 font-bold">{expTotal} / 500 EXP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${founderProgress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{founderProgress}% Achieved</span>
                    <span className="text-amber-400">{Math.max(0, 500 - expTotal)} EXP remaining</span>
                  </div>
                </div>

                {/* Level Promotion Progress */}
                <div className="space-y-2 p-4 bg-[#06080E] rounded-xl border border-slate-800 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Next Rank ({nextLevelName}):</span>
                    <span className="text-emerald-400 font-bold">{expTotal} / {levelThreshold} EXP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{levelProgress}% Towards {nextLevelName}</span>
                    <span className="text-cyan-400">{Math.max(0, levelThreshold - expTotal)} EXP needed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Achievement Badges & Trophies */}
            <div className="space-y-4">
              <BadgeShowcase />
            </div>

            {/* 5. Resignation Danger Zone */}
            <div className="bg-[#0F1424] border-2 border-rose-900/50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 arcade-panel">
              <div className="space-y-1">
                <h4 className="text-xs font-pixel font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" />
                  <span>Voluntary Resignation</span>
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Resigning closes your employee record and returns your account to Job Seeker status. All earned EXP is permanently retained.
                </p>
              </div>

              <button
                onClick={() => setShowResignModal(true)}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-pixel font-bold text-xs rounded border-2 border-rose-500/50 hover:border-rose-400 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] shrink-0"
              >
                RESIGN FROM POSITION
              </button>
            </div>
          </div>
        )}

        {/* ─── MODAL: TASK SUBMISSION CONFIRMATION ────────────── */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 arcade-panel shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-pixel font-bold text-slate-100 uppercase">SUBMIT DAILY MISSION?</h3>
                  <p className="text-xs text-slate-400 font-sans">Action cannot be reversed</p>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-sans leading-relaxed bg-[#06080E] p-3 rounded-lg border border-slate-800 space-y-2">
                <p>
                  You are submitting your work for: <strong className="text-slate-100">{todayTask?.title}</strong>
                </p>
                <div className="text-[11px] text-emerald-400 font-mono">
                  Base Reward: +{todayTask?.expReward || 25} EXP
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#06080E] hover:bg-slate-800 text-slate-300 font-mono text-xs rounded border border-slate-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-pixel font-bold text-xs rounded border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>CONFIRM & SUBMIT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: RESIGN CONFIRMATION ─────────────────────── */}
        {showResignModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F1424] border-2 border-rose-600 rounded-2xl max-w-md w-full p-6 space-y-4 arcade-panel shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-pixel font-bold text-rose-300 uppercase">RESIGN FROM POSITION?</h3>
                  <p className="text-xs text-slate-400 font-sans">Formal contract termination</p>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-sans space-y-2.5">
                <p>
                  Are you sure you want to resign from{' '}
                  <strong className="text-slate-100">{employeeRecord?.role?.title || 'Engineer'}</strong> at{' '}
                  <strong className="text-cyan-300">{employeeRecord?.company?.name || 'Company'}</strong>?
                </p>

                <div className="p-3 bg-[#06080E] rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your employee record will be officially closed</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>You'll return to Job Seeker status</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All {user?.expTotal || 0} EXP will be retained</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>You can apply to new positions immediately</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResignModal(false)}
                  disabled={isResigning}
                  className="px-4 py-2 bg-[#06080E] hover:bg-slate-800 text-slate-300 font-mono text-xs rounded border border-slate-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmResign}
                  disabled={isResigning}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-pixel font-bold text-xs rounded border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2"
                >
                  {isResigning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>RESIGNING...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>CONFIRM RESIGNATION</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: PROMOTION CELEBRATION ───────────────────── */}
        <PromotionModal
          isOpen={showPromotionModal}
          onClose={() => setShowPromotionModal(false)}
          previousLevel={promotionData?.previousLevel || 'junior'}
          newLevel={promotionData?.newLevel || 'mid'}
          roleTitle={employeeRecord?.role?.title || 'Engineer'}
          companyName={employeeRecord?.company?.name || 'Company'}
          bonusExp={promotionData?.bonusExp || 50}
          bonusCoins={promotionData?.bonusCoins || 50}
        />

        {/* ─── MODAL: FOUNDER MODE UNLOCK ─────────────────────── */}
        <FounderUnlockModal
          isOpen={showFounderModal}
          onClose={() => setShowFounderModal(false)}
        />
      </DashboardLayout>
    </>
  );
}
