import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import DashboardLayout from '@components/dashboard/DashboardLayout';
import api from '@api/client';
import {
  getMarketplaceBots,
  purchaseBot,
  getMyPurchasedBots,
  executeBotRun,
  getMyRuns,
} from '@api/aiManager';
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
  Sparkles,
  X,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Bot,
  Play,
  Terminal,
  Shield,
  Layers,
  Code,
  MessageSquare,
  RefreshCw,
  Search,
} from 'lucide-react';

const CATEGORY_ICONS = {
  hiring: FileText,
  interview: MessageSquare,
  code_review: Code,
  growth: Rocket,
  support: Bot,
};

export default function FounderDashboard() {
  const { user, refreshUser } = useAuth();

  // Navigation Tab inside Founder Console
  const [activeTab, setActiveTab] = useState('ventures'); // 'ventures' | 'ai_workforce' | 'runs'

  // Founder Data State
  const [company, setCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [treasury, setTreasury] = useState(user?.corpCoins || 10000);
  const [valuation, setValuation] = useState(1000000);

  // AI Marketplace State
  const [marketplaceBots, setMarketplaceBots] = useState([]);
  const [myBots, setMyBots] = useState([]);
  const [companyRuns, setCompanyRuns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [activeRunBot, setActiveRunBot] = useState(null);

  // Forms
  const [newCompName, setNewCompName] = useState('');
  const [newCompDomain, setNewCompDomain] = useState('Technology');
  const [newCompDesc, setNewCompDesc] = useState('');

  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleSalary, setNewRoleSalary] = useState('130000');
  const [newRoleSalaryMax, setNewRoleSalaryMax] = useState('160000');

  // Interactive Pipeline Run State
  const [runInput, setRunInput] = useState({
    candidate_name: 'Elena Rostova',
    job_title: 'Senior Full Stack Engineer',
    job_requirements: '5+ years experience in React, Node.js, and Distributed AI Services.',
    resume_text: 'Passionate full-stack developer with 6 years building microservices, AI pipelines with FastAPI and React dashboards. Architected multi-region caching in Redis.',
  });
  const [runExecuting, setRunExecuting] = useState(false);
  const [runOutput, setRunOutput] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Founder & Marketplace data
  const loadFounderData = async () => {
    try {
      // 1. Load Company
      const compRes = await api.get('/founder/company').catch(() => null);
      if (compRes?.data?.data?.company) {
        setCompany(compRes.data.data.company);
        setRoles(compRes.data.data.roles || []);
        if (compRes.data.data.company.treasury !== undefined) {
          setTreasury(compRes.data.data.company.treasury);
        }
        if (compRes.data.data.company.valuation !== undefined) {
          setValuation(compRes.data.data.company.valuation);
        }
      }

      // 2. Load Applicants
      const appRes = await api.get('/founder/company/applicants').catch(() => null);
      if (appRes?.data?.data) {
        setApplicants(appRes.data.data);
      }

      // 3. Load Marketplace Bots
      const botsRes = await getMarketplaceBots().catch(() => ({ data: [] }));
      if (botsRes?.data) setMarketplaceBots(botsRes.data);

      // 4. Load Hired Bots
      const myBotsRes = await getMyPurchasedBots().catch(() => null);
      if (myBotsRes?.data?.hiredBots) {
        setMyBots(myBotsRes.data.hiredBots);
      }

      // 5. Load Company Runs
      const runsRes = await getMyRuns().catch(() => ({ data: [] }));
      if (runsRes?.data) setCompanyRuns(runsRes.data);
    } catch (err) {
      console.error('Error loading founder data:', err);
    }
  };

  useEffect(() => {
    loadFounderData();
  }, []);

  // Launch Company
  const handleLaunchCompany = async (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    try {
      const res = await api.post('/founder/company', {
        name: newCompName.trim(),
        domain: newCompDomain,
        description: newCompDesc.trim() || 'AI-driven enterprise startup venture.',
      });

      setShowLaunchModal(false);
      setNewCompName('');
      setNewCompDesc('');
      showToast(res.data?.message || `🚀 Company "${newCompName}" launched!`);
      loadFounderData();
      if (refreshUser) refreshUser();
    } catch (err) {
      showToast(`❌ Error: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Post Role
  const handlePostRole = async (e) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    try {
      await api.post('/founder/company/roles', {
        title: newRoleTitle.trim(),
        domain: company?.domain || 'Technology',
        salaryMin: newRoleSalary,
        salaryMax: newRoleSalaryMax,
        requirements: ['JavaScript', 'React', 'Node.js', 'Team Collaboration'],
      });

      setShowRoleModal(false);
      setNewRoleTitle('');
      showToast(`✨ Open role "${newRoleTitle}" published live!`);
      loadFounderData();
    } catch (err) {
      showToast(`❌ Error: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Hire Bot with CorpCoins
  const handleHireBot = async (bot) => {
    if (treasury < bot.pricing.basePrice) {
      showToast(`⚠️ Insufficient CorpCoins! Need ${bot.pricing.basePrice} CC. Treasury has ${treasury} CC.`);
      return;
    }

    try {
      const res = await purchaseBot(bot._id);
      showToast(res.message || `🤖 Successfully hired ${bot.name} into company workforce!`);
      if (res.data?.remainingTreasury !== undefined) {
        setTreasury(res.data.remainingTreasury);
      }
      loadFounderData();
      if (refreshUser) refreshUser();
    } catch (err) {
      showToast(`❌ Hire error: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Open Pipeline Run Modal
  const openRunModal = (bot) => {
    setActiveRunBot(bot);
    setRunOutput(null);
    setShowRunModal(true);
  };

  // Execute Pipeline Run
  const handleExecuteRun = async () => {
    if (!activeRunBot) return;
    const fee = activeRunBot.pricing?.pricePerRun || 25;
    if (treasury < fee) {
      showToast(`⚠️ Insufficient CorpCoins for run fee (${fee} CC needed).`);
      return;
    }

    setRunExecuting(true);
    setRunOutput(null);

    try {
      const res = await executeBotRun(activeRunBot._id, runInput);
      setRunOutput(res.data?.result || res.data);
      if (res.data?.remainingTreasury !== undefined) {
        setTreasury(res.data.remainingTreasury);
      }
      if (res.data?.companyValuation !== undefined) {
        setValuation(res.data.companyValuation);
      }
      showToast(`⚡ Pipeline executed! -${fee} CorpCoins · Company valuation increased!`);
      loadFounderData();
      if (refreshUser) refreshUser();
    } catch (err) {
      showToast(`❌ Run error: ${err?.response?.data?.message || err.message}`);
    } finally {
      setRunExecuting(false);
    }
  };

  // Filter marketplace bots
  const filteredBots = selectedCategory === 'all'
    ? marketplaceBots
    : marketplaceBots.filter((b) => b.category === selectedCategory);

  const hiredBotIds = new Set(myBots.map((b) => (b.bot?._id || b.bot)));

  return (
    <>
    <DashboardLayout toastMessage={toastMessage}>

        {/* Welcome Banner */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 shadow-2xl arcade-panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/30 text-[11px]">
                <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                <span className="text-violet-300 font-bold">NODE_STATE :: FOUNDER_CONSOLE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 tracking-tight">
                Founder Console :: {user?.name?.split(' ')[0] || 'Operator'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Venture governance: build AI companies, hire autonomous neural bot pipelines with CorpCoins, and scale enterprise throughput.
              </p>
            </div>

            {/* CorpCoin Treasury & Seed Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-4 bg-[#06080E] border-2 border-emerald-500/40 rounded-xl space-y-1 w-full sm:w-auto shrink-0 arcade-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">COMPANY TREASURY</span>
                  <DollarSign className="w-4 h-4 text-emerald-400 fill-current" />
                </div>
                <div className="text-xl font-black font-sans text-emerald-300">
                  {treasury.toLocaleString()} <span className="text-xs font-mono text-emerald-500">CorpCoins</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Seed Grant Active</span>
                </div>
              </div>

              <div className="p-4 bg-[#06080E] border-2 border-violet-500/30 rounded-xl space-y-1 w-full sm:w-auto shrink-0 arcade-card">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400 fill-current" />
                  <span className="text-violet-300 font-extrabold text-sm">{user?.expTotal || 0} EXP</span>
                </div>
                <div className="text-[10px] text-violet-400 font-bold">★ Founder Tier</div>
                <div className="text-[10px] text-slate-400 font-mono">Valuation: ${(valuation / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'ventures', label: 'Venture & Roles', icon: Building2 },
            { id: 'ai_workforce', label: 'AI Bot Marketplace & Workforce', icon: Bot, badge: myBots.length },
            { id: 'runs', label: 'Pipeline Executions', icon: Terminal, badge: companyRuns.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-300 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-[#0F1424] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ──────────────────────────────────────────────────────────
            TAB 1: VENTURE & ROLES
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'ventures' && (
          <div className="space-y-8">
            {/* Action Controls */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 arcade-panel">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowLaunchModal(true)}
                  className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white font-extrabold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-xs"
                >
                  <Rocket className="w-4 h-4" />
                  <span>[LAUNCH NEW AI VENTURE]</span>
                </button>

                <button
                  onClick={() => setShowRoleModal(true)}
                  className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold rounded-lg transition-all flex items-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>[POST OPEN ROLE]</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                VENTURE GOVERNANCE :: ACTIVE
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'My Company', value: company?.name ? 'Active' : 'Unregistered', icon: Building2, color: 'text-violet-400' },
                { label: 'Open Roles', value: `${roles.length}`, icon: Briefcase, color: 'text-cyan-400' },
                { label: 'Hired AI Bots', value: `${myBots.length}`, icon: Bot, color: 'text-emerald-400' },
                { label: 'Est. Valuation', value: `$${(valuation / 1000000).toFixed(2)}M`, icon: TrendingUp, color: 'text-amber-400' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-[#0F1424] border-2 border-slate-800 hover:border-violet-500/40 rounded-xl p-4 space-y-2 arcade-card">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] uppercase font-bold">{stat.label}</span>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-black font-sans text-slate-100">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Company Card */}
            {company && (
              <div className="p-6 rounded-xl bg-[#0F1424] border-2 border-violet-500/30 space-y-4 arcade-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 font-extrabold flex items-center justify-center text-xl font-display shrink-0">
                      {company.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold font-display text-slate-100">{company.name}</h2>
                      <p className="text-xs text-slate-400 font-sans">{company.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30 font-bold text-xs">
                      {company.domain}
                    </span>
                    <span className="text-emerald-400 font-bold text-sm font-sans">
                      ${(valuation / 1000000).toFixed(2)}M Seed Valuation
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
                  <div>
                    <span className="text-slate-500 block">Open Roles:</span>
                    <span className="text-cyan-300 font-bold">{roles.length} Positions</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Candidates Applied:</span>
                    <span className="text-emerald-300 font-bold">{applicants.length} Resumes</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AI Workforce:</span>
                    <span className="text-violet-300 font-bold">{myBots.length} Bots Deployed</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CorpCoins Treasury:</span>
                    <span className="text-emerald-400 font-bold">{treasury.toLocaleString()} CC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Roles & Applicants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Role Postings */}
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 space-y-4 arcade-panel">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Active Open Role Postings</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{roles.length} Roles</span>
                </div>

                <div className="space-y-3">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <div key={role._id || role.title} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{role.title}</span>
                          <span className="text-emerald-400 font-bold text-xs">
                            ${role.salaryRange?.min?.toLocaleString()} - ${role.salaryRange?.max?.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span>Domain: {role.domain}</span>
                          <span className="text-cyan-400 font-bold">Open Position</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 font-mono">
                      No roles posted yet. Click [POST OPEN ROLE] to publish your first opening.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Applicants */}
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 space-y-4 arcade-panel">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Candidate Applications Pipeline</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{applicants.length} Screened</span>
                </div>

                <div className="space-y-3">
                  {applicants.length > 0 ? (
                    applicants.map((cand) => (
                      <div key={cand._id} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-200">{cand.candidate?.name || 'Applicant'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{cand.role?.title || 'Engineer'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400 font-mono">{cand.candidate?.expTotal || 120} EXP</div>
                          <div className="text-[9px] text-cyan-300 font-bold">APPLIED</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 font-mono">
                      No applicants received yet. Hire ScoutATS from the bot marketplace to automate candidate screening!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 2: AI BOT MARKETPLACE & WORKFORCE
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'ai_workforce' && (
          <div className="space-y-6">
            {/* Header with Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold font-display text-slate-100">AI Bot Marketplace</h2>
                <p className="text-xs text-slate-400 font-sans">
                  Hire autonomous bots configured by the AI Manager to accelerate your company hiring, interview, and engineering pipelines.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'hiring', 'interview', 'code_review', 'growth', 'support'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedCategory === cat
                        ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-[#0F1424] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* My Hired Bots Section */}
            {myBots.length > 0 && (
              <div className="bg-[#0F1424] border-2 border-emerald-500/40 rounded-xl p-5 space-y-4 arcade-panel">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-display font-extrabold text-slate-100 text-sm">
                      Company Active AI Workforce ({myBots.length} Bots Hired)
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">READY TO RUN</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myBots.map((purchase) => {
                    const b = purchase.bot;
                    if (!b) return null;
                    const Icon = CATEGORY_ICONS[b.category] || Bot;
                    return (
                      <div key={purchase._id} className="p-4 bg-[#06080E] border-2 border-emerald-500/30 rounded-xl space-y-3 arcade-card">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-100 text-xs">{b.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono uppercase">{b.category}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                          {b.tagline || b.description}
                        </p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 font-bold">
                            Fee: {b.pricing?.pricePerRun || 25} CC / run
                          </span>
                          <button
                            onClick={() => openRunModal(b)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                          >
                            <Play className="w-3 h-3" />
                            <span>Run Pipeline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBots.map((bot) => {
                const Icon = CATEGORY_ICONS[bot.category] || Bot;
                const isHired = hiredBotIds.has(bot._id);

                return (
                  <div
                    key={bot._id}
                    className="p-5 rounded-xl bg-[#0F1424] border-2 border-slate-800 hover:border-violet-500/40 transition-all space-y-4 arcade-card flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {bot.pricing?.tier || 'PRO'} TIER
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono uppercase">
                          {bot.category}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">{bot.name}</h3>
                          <p className="text-[11px] text-slate-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                            {bot.tagline || bot.description}
                          </p>
                        </div>
                      </div>

                      {bot.capabilities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {bot.capabilities.slice(0, 3).map((cap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[9px] bg-[#06080E] border border-slate-800 text-slate-300 font-mono">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="p-3 bg-[#06080E] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Hire Cost</div>
                          <div className="font-bold text-emerald-300">{bot.pricing?.basePrice} CorpCoins</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Execution Fee</div>
                          <div className="font-bold text-cyan-300">{bot.pricing?.pricePerRun} CC / run</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      {isHired ? (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-center py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold">
                            ✓ In Your Workforce
                          </span>
                          <button
                            onClick={() => openRunModal(bot)}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Play className="w-3 h-3" />
                            <span>Run</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleHireBot(bot)}
                          className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 text-white font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                          <Bot className="w-4 h-4" />
                          <span>HIRE BOT ({bot.pricing?.basePrice} CC)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 3: PIPELINE EXECUTIONS HISTORY
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'runs' && (
          <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 space-y-4 arcade-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-extrabold text-slate-100 text-sm">
                  Company Pipeline Execution Logs
                </h3>
              </div>
              <button
                onClick={loadFounderData}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3">
              {companyRuns.length > 0 ? (
                companyRuns.map((r) => (
                  <div key={r._id} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-slate-200 text-xs">{r.bot?.name || 'Agent'}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/30 uppercase font-mono">
                          {r.pipelineType}
                        </span>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <span className="text-emerald-400 font-bold">-{r.costCorpCoins} CorpCoins</span>
                        <span className="text-slate-500 ml-2">({r.durationMs || 250}ms)</span>
                      </div>
                    </div>

                    {r.outputResult && (
                      <div className="p-3 bg-black/40 border border-slate-800/80 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                        <pre>{JSON.stringify(r.outputResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono">
                  No automated pipeline runs triggered yet. Hire an AI bot and click "Run Pipeline" to execute live ATS screening or code review.
                </div>
              )}
            </div>
          </div>
        )}

      </DashboardLayout>
      {/* ──────────────────────────────────────────────────────────
          MODAL: LAUNCH COMPANY
         ────────────────────────────────────────────────────────── */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-violet-500/50 rounded-xl p-6 max-w-md w-full space-y-4 arcade-panel relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-violet-300 font-display font-extrabold text-base">
                <Rocket className="w-5 h-5 text-violet-400" />
                <span>Launch New AI Company Venture</span>
              </div>
              <button onClick={() => setShowLaunchModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchCompany} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">COMPANY NAME:</label>
                <input
                  type="text"
                  required
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="e.g. Nexus AI Labs"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">SECTOR DOMAIN:</label>
                <select
                  value={newCompDomain}
                  onChange={(e) => setNewCompDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-violet-500 focus:outline-none"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Clean Energy">Clean Energy</option>
                  <option value="Finance">Finance</option>
                  <option value="Design & Media">Design & Media</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">VENTURE DESCRIPTION & PITCH:</label>
                <textarea
                  rows={3}
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder="Describe your AI mission and core product offering..."
                  className="w-full p-2.5 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-violet-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300">
                ★ 10,000 CorpCoins seed capital will be allocated into your venture treasury.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-500 hover:bg-violet-400 text-white font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                >
                  LAUNCH VENTURE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: POST OPEN ROLE
         ────────────────────────────────────────────────────────── */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-cyan-500/50 rounded-xl p-6 max-w-md w-full space-y-4 arcade-panel relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-display font-extrabold text-base">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Post Open Role Position</span>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostRole} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">ROLE TITLE:</label>
                <input
                  type="text"
                  required
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">SALARY MIN ($):</label>
                  <input
                    type="number"
                    value={newRoleSalary}
                    onChange={(e) => setNewRoleSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">SALARY MAX ($):</label>
                  <input
                    type="number"
                    value={newRoleSalaryMax}
                    onChange={(e) => setNewRoleSalaryMax(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
                >
                  PUBLISH ROLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: RUN PIPELINE
         ────────────────────────────────────────────────────────── */}
      {showRunModal && activeRunBot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-emerald-500/50 rounded-xl p-6 max-w-2xl w-full space-y-4 arcade-panel relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-300 font-display font-extrabold text-base">
                <Play className="w-5 h-5 text-emerald-400" />
                <span>Execute AI Pipeline :: {activeRunBot.name}</span>
              </div>
              <button onClick={() => setShowRunModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#06080E] border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">EXECUTION PIPELINE:</span>
                  <span className="text-emerald-400 font-bold">{activeRunBot.pipelineType}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">EXECUTION FEE:</span>
                  <span className="text-cyan-400 font-bold">{activeRunBot.pricing?.pricePerRun || 25} CorpCoins</span>
                </div>
              </div>

              {activeRunBot.pipelineType === 'resume_screening' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">CANDIDATE NAME:</label>
                      <input
                        type="text"
                        value={runInput.candidate_name}
                        onChange={(e) => setRunInput({ ...runInput, candidate_name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">TARGET ROLE:</label>
                      <input
                        type="text"
                        value={runInput.job_title}
                        onChange={(e) => setRunInput({ ...runInput, job_title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">JOB REQUIREMENTS:</label>
                    <input
                      type="text"
                      value={runInput.job_requirements}
                      onChange={(e) => setRunInput({ ...runInput, job_requirements: e.target.value })}
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-slate-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">CANDIDATE RESUME TEXT:</label>
                    <textarea
                      rows={4}
                      value={runInput.resume_text}
                      onChange={(e) => setRunInput({ ...runInput, resume_text: e.target.value })}
                      className="w-full p-2.5 bg-[#06080E] border border-slate-800 rounded text-slate-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {activeRunBot.pipelineType !== 'resume_screening' && (
                <div>
                  <label className="text-slate-400 font-bold block mb-1">TASK INPUT / CODE / DETAILS:</label>
                  <textarea
                    rows={6}
                    value={runInput.resume_text || JSON.stringify(runInput, null, 2)}
                    onChange={(e) => setRunInput({ ...runInput, resume_text: e.target.value, task_input: e.target.value })}
                    className="w-full p-3 bg-[#06080E] border border-slate-800 rounded text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-[10px]">
                  Treasury Balance: {treasury} CC
                </span>
                <button
                  onClick={handleExecuteRun}
                  disabled={runExecuting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all"
                >
                  {runExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ANALYZING IN NEURAL PIPELINE...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>RUN PIPELINE (-{activeRunBot.pricing?.pricePerRun || 25} CC)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Output Inspector */}
              {runOutput && (
                <div className="p-4 bg-[#06080E] border-2 border-emerald-500/40 rounded-xl space-y-2 mt-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PIPELINE EXECUTION OUTPUT</span>
                    </span>
                    <span className="text-[10px] text-cyan-300 font-bold">VERDICT READY</span>
                  </div>

                  <pre className="text-[11px] text-slate-200 overflow-x-auto p-3 bg-black/40 rounded max-h-60">
                    {JSON.stringify(runOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    
      </>
  );
}
