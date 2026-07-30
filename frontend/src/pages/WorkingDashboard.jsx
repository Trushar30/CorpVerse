import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
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
  ArrowUpRight,
} from 'lucide-react';

export default function WorkingDashboard() {
  const { user } = useAuth();

  const expProgress = Math.min(((user?.expTotal || 0) / 500) * 100, 100);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">

        {/* Welcome Banner */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[11px]">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-bold">NODE_STATE :: WORKING_PROFESSIONAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
                Workstation :: {user?.name?.split(' ')[0] || 'Operator'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Track active tasks, accumulate EXP, and progress toward promotion milestones.
              </p>
            </div>

            {/* EXP Meter */}
            <div className="p-4 bg-[#06080E] border border-slate-800 rounded-lg space-y-2 w-full md:w-auto shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[11px]">CAREER_EXP:</span>
                <span className="text-cyan-400 font-bold">{user?.expTotal || 0} / 500 EXP</span>
              </div>
              <div className="w-full md:w-56 h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${expProgress}%` }} />
              </div>
              <div className="text-[10px] text-amber-400">
                ★ Reach 500 EXP to unlock Founder mode
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tasks Completed', value: '0', icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Tasks Pending', value: '0', icon: Clock, color: 'text-amber-400' },
            { label: 'Current Level', value: 'Junior', icon: Award, color: 'text-cyan-400' },
            { label: 'EXP This Week', value: '+0', icon: TrendingUp, color: 'text-violet-400' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#0F1424] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] uppercase font-bold">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold font-sans">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Active Tasks */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-cyan-400" />
              Active Task Queue
            </h2>
            <span className="text-[10px] text-slate-500">0 tasks assigned</span>
          </div>

          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="font-bold text-slate-200 text-sm font-sans">No active tasks</div>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              Tasks are assigned by the AI simulation engine based on your role level and domain expertise. Complete tasks to earn EXP and advance your career.
            </p>
          </div>
        </div>

        {/* Performance & Promotion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promotion Path */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Promotion Path
            </h3>
            <div className="space-y-3">
              {[
                { level: 'Junior', exp: 0, next: 200, status: 'current' },
                { level: 'Mid', exp: 200, next: 500, status: 'locked' },
                { level: 'Senior', exp: 500, next: null, status: 'locked' },
              ].map((tier) => (
                <div key={tier.level} className={`flex items-center gap-3 p-3 rounded border ${
                  tier.status === 'current'
                    ? 'bg-cyan-500/5 border-cyan-500/30'
                    : 'bg-[#06080E] border-slate-800'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    tier.status === 'current'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tier.level[0]}
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs font-bold text-slate-200">{tier.level}</div>
                    <div className="text-[10px] text-slate-500">
                      {tier.next ? `${tier.exp} → ${tier.next} EXP` : `${tier.exp}+ EXP`}
                    </div>
                  </div>
                  {tier.status === 'current' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      CURRENT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* EXP History */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              EXP Activity Log
            </h3>
            <div className="p-6 text-center space-y-2">
              <Zap className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-500">No EXP transactions yet</div>
              <p className="text-[10px] text-slate-600 font-sans">
                Complete tasks to start earning EXP points.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
