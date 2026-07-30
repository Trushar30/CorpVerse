import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import {
  Rocket,
  Radio,
  Building2,
  Users,
  FileText,
  Plus,
  Briefcase,
  TrendingUp,
  Globe,
  Zap,
} from 'lucide-react';

export default function FounderDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">

        {/* Welcome Banner */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-[11px]">
                <Radio className="w-3 h-3 text-violet-400 animate-pulse" />
                <span className="text-violet-300 font-bold">NODE_STATE :: FOUNDER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
                Founder Console :: {user?.name?.split(' ')[0] || 'Operator'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Build your company, define open roles, review applicants, and govern your AI-powered organization.
              </p>
            </div>

            {/* EXP Badge */}
            <div className="p-4 bg-[#06080E] border border-violet-500/30 rounded-lg space-y-1 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400 fill-current" />
                <span className="text-violet-300 font-bold text-sm">{user?.expTotal || 0} EXP</span>
              </div>
              <div className="text-[10px] text-violet-400/60">Founder Tier Unlocked</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'My Companies', value: '0', icon: Building2, color: 'text-violet-400' },
            { label: 'Open Roles', value: '0', icon: Briefcase, color: 'text-cyan-400' },
            { label: 'Applicants', value: '0', icon: Users, color: 'text-emerald-400' },
            { label: 'Revenue', value: '$0', icon: TrendingUp, color: 'text-amber-400' },
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

        {/* Company Management */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-400" />
              My Companies
            </h2>
            <button className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 font-bold rounded transition-colors flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Create Company
            </button>
          </div>

          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
              <Globe className="w-7 h-7" />
            </div>
            <div className="font-bold text-slate-200 text-sm font-sans">No companies yet</div>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              Create your first AI-powered company to start posting roles and attracting talent from the CorpVerse ecosystem.
            </p>
            <button className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs rounded shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all inline-flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>LAUNCH COMPANY</span>
            </button>
          </div>
        </div>

        {/* Applicants & Role Postings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Role Postings */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Active Role Postings
            </h3>
            <div className="p-6 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-500">No roles posted yet</div>
              <p className="text-[10px] text-slate-600 font-sans">
                Create a company first, then post roles to attract candidates.
              </p>
            </div>
          </div>

          {/* Recent Applicants */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Recent Applicants
            </h3>
            <div className="p-6 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-500">No applicants yet</div>
              <p className="text-[10px] text-slate-600 font-sans">
                Applicants will appear here once roles are live.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
