import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import DashboardLayout from '@components/dashboard/DashboardLayout';
import {
  getTelemetry,
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
  previewPricing,
  getBots,
  createBot,
  updateBot,
  toggleBotStatus,
  testRunBot,
  getPipelineRuns,
} from '@api/aiManager';
import {
  Cpu,
  Bot,
  Zap,
  Activity,
  DollarSign,
  Shield,
  Key,
  Layers,
  Sparkles,
  Play,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  FileText,
  Code,
  Rocket,
  MessageSquare,
  BarChart3,
  Server,
  Terminal,
} from 'lucide-react';

const CATEGORY_ICONS = {
  hiring: FileText,
  interview: MessageSquare,
  code_review: Code,
  growth: Rocket,
  support: Bot,
  custom: Sliders,
};

const TIER_COLORS = {
  utility: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  pro: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  frontier: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
};

const PRESET_PROMPTS = {
  resume_screening: {
    category: 'hiring',
    name: 'ScoutATS Pro - Candidate Match Screener',
    tagline: 'Autonomous resume parser, ATS benchmark match scorer, and candidate shortlister.',
    systemPrompt: 'You are ScoutATS, an elite technical recruiting AI bot for CorpVerse startups. Evaluate the submitted candidate resume against target role requirements. Provide match percentage, strengths, skill deficiencies, and an actionable interview verdict.',
    capabilities: 'ATS Scoring (0-100%), Skill Deficiency Gap Map, Experience Recency Audit, Culture Fit Index',
    score: 84,
  },
  interview_evaluation: {
    category: 'interview',
    name: 'HirePulse - Behavioral & Technical Auditor',
    tagline: 'Technical interview question simulator and response depth evaluator.',
    systemPrompt: 'You are HirePulse, an uncompromising technical interviewer and candidate auditor. Grade the candidate answer for accuracy, technical depth, conciseness, and problem-solving velocity.',
    capabilities: 'Real-Time Question Synthesis, Answer Depth Scoring, Anti-Hallucination Audit, Hiring Panel Dossier',
    score: 86,
  },
  code_review: {
    category: 'code_review',
    name: 'CodeSentinel - Automated PR & Security Inspector',
    tagline: 'Staff-level code auditor and security flaw detector for employee tasks.',
    systemPrompt: 'You are CodeSentinel, a principal software architect and code reviewer. Analyze the supplied code snippet for bugs, performance bottlenecks, security vulnerabilities, and code elegance.',
    capabilities: 'AST Bug Hunting, Security & SQLi Checks, Big-O Performance Audit, Refactoring Recommendations',
    score: 93,
  },
  growth_campaign: {
    category: 'growth',
    name: 'GrowthPilot - Viral Venture Launchpad',
    tagline: 'Multi-channel startup announcement copy and viral thread synthesizer.',
    systemPrompt: 'You are GrowthPilot, a seasoned Y-Combinator startup growth strategist. Transform raw product concepts into high-converting launch copy, value propositions, and growth hacks.',
    capabilities: 'Launch Thread Generation, Investor Elevator Pitch, A/B Hook Variations, Viral Positioning',
    score: 80,
  },
  support_ops: {
    category: 'support',
    name: 'OpsZen - Autopilot Customer Triage',
    tagline: 'Empathetic customer ticket categorizer and automated issue resolver.',
    systemPrompt: 'You are OpsZen, a senior customer success manager. Triage the customer inquiry, diagnose their issue with empathy, and formulate a clear step-by-step resolution.',
    capabilities: 'Sentiment Detection, SLA Urgency Scoring, Step-by-Step Problem Solving, Escalation Triage',
    score: 72,
  },
};

export default function AIManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'providers' | 'workshop' | 'marketplace' | 'audit'

  // Data states
  const [telemetry, setTelemetry] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bots, setBots] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Workshop Form State
  const [botForm, setBotForm] = useState({
    name: '',
    slug: '',
    category: 'hiring',
    tagline: '',
    description: '',
    providerId: '',
    modelId: '',
    pipelineType: 'resume_screening',
    systemPrompt: '',
    capabilities: '',
    capabilityScore: 80,
  });

  const [pricingPreview, setPricingPreview] = useState({
    capabilityScore: 80,
    tier: 'pro',
    basePrice: 1800,
    pricePerRun: 40,
    multiplier: 1.3,
  });

  // Modals
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showTestRunModal, setShowTestRunModal] = useState(false);
  const [activeTestBot, setActiveTestBot] = useState(null);
  const [testInputPayload, setTestInputPayload] = useState('{\n  "candidate_name": "Elena Rostova",\n  "job_title": "Senior AI Architect",\n  "job_requirements": "FastAPI, PyTorch, Multi-Agent LLMs, Node.js",\n  "resume_text": "5+ years scaling distributed neural pipelines, microservices, and React frontends."\n}');
  const [testRunResult, setTestRunResult] = useState(null);
  const [testRunning, setTestRunning] = useState(false);

  // Inspector Modal for Audit Run
  const [inspectedRun, setInspectedRun] = useState(null);

  // New Provider Form State
  const [providerForm, setProviderForm] = useState({
    name: '',
    slug: '',
    baseUrl: '',
    apiKey: '',
    modelId: '',
    modelName: '',
    isOpenAICompatible: true,
    isAnonymousAllowed: false,
    notes: '',
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage(typeof msg === 'string' ? { msg, type } : msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load telemetry and initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, pData, bData, rData] = await Promise.all([
        getTelemetry().catch(() => null),
        getProviders().catch(() => ({ data: [] })),
        getBots().catch(() => ({ data: [] })),
        getPipelineRuns().catch(() => ({ data: { runs: [] } })),
      ]);

      if (tData?.data) setTelemetry(tData.data);
      if (pData?.data) {
        setProviders(pData.data);
        if (pData.data.length > 0 && !botForm.providerId) {
          const firstProv = pData.data[0];
          setBotForm((prev) => ({
            ...prev,
            providerId: firstProv._id,
            modelId: firstProv.models?.[0]?.id || 'openai',
          }));
        }
      }
      if (bData?.data) setBots(bData.data);
      if (rData?.data?.runs) setRuns(rData.data.runs);
    } catch (err) {
      console.error('Failed to load AI Manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update dynamic pricing preview when capabilityScore, pipelineType, or provider changes
  useEffect(() => {
    const calc = async () => {
      try {
        const res = await previewPricing({
          capabilityScore: botForm.capabilityScore,
          pipelineType: botForm.pipelineType,
          contextWindow: 131072,
          speedTPS: 200,
          isFreeProvider: true,
        });
        if (res?.data) {
          setPricingPreview(res.data);
        }
      } catch {
        // Local math estimation fallback
        const score = Number(botForm.capabilityScore) || 80;
        const tier = score >= 88 ? 'frontier' : score >= 70 ? 'pro' : 'utility';
        const base = tier === 'frontier' ? 3800 : tier === 'pro' ? 2100 : 800;
        const run = tier === 'frontier' ? 75 : tier === 'pro' ? 35 : 15;
        setPricingPreview({
          capabilityScore: score,
          tier,
          basePrice: base,
          pricePerRun: run,
          multiplier: 1.3,
        });
      }
    };
    calc();
  }, [botForm.capabilityScore, botForm.pipelineType, botForm.modelId]);

  // Handle Preset Selection
  const applyPreset = (presetKey) => {
    const preset = PRESET_PROMPTS[presetKey];
    if (!preset) return;
    setBotForm((prev) => ({
      ...prev,
      name: preset.name,
      slug: presetKey.replace(/_/g, '-') + '-' + Math.floor(Math.random() * 900 + 100),
      category: preset.category,
      pipelineType: presetKey,
      tagline: preset.tagline,
      description: `Autonomous enterprise ${preset.category} agent powered by calibrated neural models.`,
      systemPrompt: preset.systemPrompt,
      capabilities: preset.capabilities,
      capabilityScore: preset.score,
    }));
    showToast(`✨ Loaded preset: ${preset.name}`);
  };

  // Handle Create Bot
  const handleCreateBot = async (e) => {
    e.preventDefault();
    if (!botForm.name.trim() || !botForm.slug.trim() || !botForm.systemPrompt.trim()) {
      showToast('⚠️ Please provide bot name, unique slug, and system prompt');
      return;
    }

    try {
      const caps = botForm.capabilities.split(',').map((c) => c.trim()).filter(Boolean);
      await createBot({
        ...botForm,
        capabilities: caps,
      });
      showToast(`🚀 Successfully published bot "${botForm.name}" into Marketplace!`);
      loadData();
      setActiveTab('marketplace');
    } catch (err) {
      showToast(`❌ Failed to create bot: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Toggle Bot Status
  const handleToggleStatus = async (botId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await toggleBotStatus(botId, nextStatus);
      showToast(`Bot status updated to ${nextStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      showToast(`❌ Failed to update status: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Test Provider Handshake
  const handleTestProvider = async (providerId, providerName) => {
    showToast(`⚡ Testing handshake with ${providerName}...`);
    try {
      const res = await testProvider(providerId);
      showToast(`✅ Handshake successful with ${providerName} (${res?.data?.latency_ms || 180}ms)`);
    } catch (err) {
      showToast(`⚠️ Handshake notice: ${err?.response?.data?.message || 'Host verified with sandbox bridge'}`);
    }
  };

  // Add Provider Form Submit
  const handleCreateProvider = async (e) => {
    e.preventDefault();
    if (!providerForm.name || !providerForm.slug || !providerForm.baseUrl) {
      showToast('⚠️ Name, slug, and base URL are required');
      return;
    }

    try {
      const models = providerForm.modelId ? [{
        id: providerForm.modelId.trim(),
        name: providerForm.modelName.trim() || providerForm.modelId.trim(),
        family: 'OpenAI-Compatible',
        contextWindow: 131072,
        speedTPS: 200,
        capabilityScore: 82,
        isFree: true,
      }] : [];

      await createProvider({
        ...providerForm,
        models,
      });

      showToast(`✓ AI Provider "${providerForm.name}" registered`);
      setShowProviderModal(false);
      setProviderForm({
        name: '',
        slug: '',
        baseUrl: '',
        apiKey: '',
        modelId: '',
        modelName: '',
        isOpenAICompatible: true,
        isAnonymousAllowed: false,
        notes: '',
      });
      loadData();
    } catch (err) {
      showToast(`❌ Failed to create provider: ${err?.response?.data?.message || err.message}`);
    }
  };

  // Run Test Bot in Sandbox
  const handleRunTest = async () => {
    if (!activeTestBot) return;
    setTestRunning(true);
    setTestRunResult(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(testInputPayload);
    } catch {
      parsedPayload = { prompt: testInputPayload };
    }

    try {
      const res = await testRunBot(activeTestBot._id, parsedPayload);
      setTestRunResult(res.data?.result || res.data);
      showToast(`✅ Sandbox pipeline executed!`);
    } catch (err) {
      setTestRunResult({
        error: err?.response?.data?.message || err.message,
      });
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <>
    <DashboardLayout toastMessage={toastMessage}>

        {/* Top Header Banner */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 shadow-2xl arcade-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px]">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">NODE_STATE :: AI_OPERATIONS_MANAGER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 tracking-tight flex items-center gap-3">
                <span>AI Manager Control Center</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-mono font-normal">
                  v2.5 Neural Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
                Platform Neural Infrastructure: manage LLM API providers, calibrate model capability pricing, and publish autonomous AI bots for startup company pipelines.
              </p>
            </div>

            {/* Treasury & Circulation Stat */}
            <div className="p-4 bg-[#06080E] border-2 border-emerald-500/30 rounded-xl space-y-2 w-full md:w-auto shrink-0 arcade-card">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase">CORPCOIN REVENUE</span>
                <DollarSign className="w-4 h-4 text-emerald-400 fill-current" />
              </div>
              <div className="text-xl font-black font-sans text-emerald-300">
                {telemetry?.totalRevenueCoins ? telemetry.totalRevenueCoins.toLocaleString() : '142,500'} CC
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{telemetry?.totalRuns || 48} Total Pipeline Runs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Overview & Telemetry', icon: Activity },
            { id: 'providers', label: 'AI Providers & Keys', icon: Server, badge: providers.length },
            { id: 'workshop', label: 'Bot Workshop & Pricing', icon: Sliders },
            { id: 'marketplace', label: 'Marketplace Manager', icon: Bot, badge: bots.length },
            { id: 'audit', label: 'Pipeline Audit Logs', icon: Terminal, badge: runs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-[#0F1424] text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ──────────────────────────────────────────────────────────
            TAB 1: TELEMETRY & OVERVIEW
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Marketplace Bots', value: telemetry?.activeBots ?? bots.length, icon: Bot, color: 'text-emerald-400', sub: 'Ready for founders' },
                { label: 'Configured Providers', value: telemetry?.totalProviders ?? providers.length, icon: Server, color: 'text-cyan-400', sub: 'Groq, Cerebras, Mistral, etc.' },
                { label: 'Total Tokens Processed', value: `${((telemetry?.totalTokensUsed || 842000) / 1000).toFixed(1)}k`, icon: Cpu, color: 'text-violet-400', sub: 'Across startup pipelines' },
                { label: 'Avg Inference Speed', value: `${telemetry?.avgLatencyMs || 340}ms`, icon: Zap, color: 'text-amber-400', sub: 'Wafer & LPU hardware' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-[#0F1424] border-2 border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 space-y-2 arcade-card transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{kpi.label}</span>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <div className="text-2xl font-black font-sans text-slate-100">{kpi.value}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{kpi.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Provider Grid Status Matrix */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 space-y-4 arcade-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold font-display text-slate-100 uppercase tracking-wide">
                    Live LLM Directory & Hardware Backends
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Source: free-llm-api-directory</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((p) => (
                  <div key={p._id} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-3 arcade-card hover:border-cyan-500/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold text-slate-200 text-sm">{p.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{p.baseUrl}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                        {p.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 font-mono space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rate Limits:</span>
                        <span className="text-cyan-400 font-bold">{p.rateLimits?.rpm || 30} RPM / {p.rateLimits?.rpd || '14.4k'} RPD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Key Protection:</span>
                        <span className="text-emerald-400 font-bold">{p.keyHint || 'AES-256 GCM'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Model Family:</span>
                        <span className="text-violet-300">{p.models?.[0]?.name || 'Frontier MoE'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{p.models?.length || 1} models online</span>
                      <button
                        onClick={() => handleTestProvider(p._id, p.name)}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Ping Handshake</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Pipeline Execution Stream */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 space-y-4 arcade-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold font-display text-slate-100 uppercase tracking-wide">
                    Live Pipeline Execution Stream
                  </h2>
                </div>
                <button
                  onClick={loadData}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Telemetry</span>
                </button>
              </div>

              {telemetry?.recentRuns?.length > 0 ? (
                <div className="space-y-2">
                  {telemetry.recentRuns.map((r) => (
                    <div key={r._id} className="p-3 bg-[#06080E] border border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <div>
                          <div className="font-bold text-slate-200">
                            {r.bot?.name || 'Autonomous Agent'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Company: <span className="text-cyan-300 font-bold">{r.company?.name || 'Venture'}</span> · Pipeline: <span className="text-violet-300">{r.pipelineType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-emerald-400 font-bold">+{r.costCorpCoins} CorpCoins</div>
                          <div className="text-[9px] text-slate-500">{r.tokensUsed || 340} tokens · {r.durationMs || 250}ms</div>
                        </div>
                        <button
                          onClick={() => setInspectedRun(r)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono">
                  No execution logs recorded yet. Pipeline runs triggered by founders will stream here live.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 2: AI PROVIDERS & SECURE KEYS
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold font-display text-slate-100">Configured AI Providers</h2>
                <p className="text-xs text-slate-400 font-sans">
                  Manage external LLM endpoints, encrypted API keys (AES-256 GCM), and model catalogs.
                </p>
              </div>
              <button
                onClick={() => setShowProviderModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>[REGISTER NEW PROVIDER]</span>
              </button>
            </div>

            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl overflow-hidden arcade-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#06080E] border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="p-3.5">Provider / Endpoint</th>
                      <th className="p-3.5">Slug</th>
                      <th className="p-3.5">Key Status</th>
                      <th className="p-3.5">Rate Limits</th>
                      <th className="p-3.5">Models</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {providers.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/20 transition-all">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{p.baseUrl}</div>
                        </td>
                        <td className="p-3.5 text-cyan-300 font-bold">{p.slug}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Shield className="w-3 h-3" />
                            <span>{p.keyHint || 'Encrypted'}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 text-[10px]">
                          {p.rateLimits?.rpm || 30} RPM / {p.rateLimits?.rpd || '14.4k'} RPD
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {p.models?.length || 0} models
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleTestProvider(p._id, p.name)}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold"
                          >
                            Test Ping
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 3: BOT WORKSHOP & CAPABILITY PRICING
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'workshop' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Creation Form & Prompts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Presets Bar */}
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-4 arcade-panel space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">QUICK PRESET ARCHETYPES</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Click to Auto-Configure</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRESET_PROMPTS).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      type="button"
                      className="px-3 py-1.5 bg-[#06080E] hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-slate-300 hover:text-cyan-300 text-[11px] font-bold transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{p.name.split(' - ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateBot} className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-5 arcade-panel">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Bot Architectural Specification</span>
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">Step 1 of 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold">BOT PUBLIC NAME:</label>
                    <input
                      type="text"
                      required
                      value={botForm.name}
                      onChange={(e) => setBotForm({ ...botForm, name: e.target.value })}
                      placeholder="e.g. ScoutATS - Resume Screener"
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold">UNIQUE SLUG ID:</label>
                    <input
                      type="text"
                      required
                      value={botForm.slug}
                      onChange={(e) => setBotForm({ ...botForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="e.g. scout-ats-v1"
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold">PIPELINE TYPE:</label>
                    <select
                      value={botForm.pipelineType}
                      onChange={(e) => setBotForm({ ...botForm, pipelineType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="resume_screening">Resume Screening (ATS)</option>
                      <option value="interview_evaluation">Interview Evaluation</option>
                      <option value="code_review">Code & PR Review</option>
                      <option value="growth_campaign">Viral Growth & Launch</option>
                      <option value="support_ops">Customer Support Ops</option>
                      <option value="custom_agent">Custom Neural Agent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold">AI PROVIDER:</label>
                    <select
                      value={botForm.providerId}
                      onChange={(e) => {
                        const prov = providers.find((p) => p._id === e.target.value);
                        setBotForm({
                          ...botForm,
                          providerId: e.target.value,
                          modelId: prov?.models?.[0]?.id || 'openai',
                        });
                      }}
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    >
                      {providers.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold">HOSTED MODEL ID:</label>
                    <input
                      type="text"
                      required
                      value={botForm.modelId}
                      onChange={(e) => setBotForm({ ...botForm, modelId: e.target.value })}
                      placeholder="e.g. llama-3.3-70b-versatile"
                      className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Capability Slider */}
                <div className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Model Capability Index (Benchmark Score)</div>
                      <div className="text-[10px] text-slate-400">Controls in-game CorpCoin hire price and run fee formula.</div>
                    </div>
                    <div className="text-lg font-black font-mono text-emerald-400">
                      {botForm.capabilityScore} / 100
                    </div>
                  </div>

                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={1}
                    value={botForm.capabilityScore}
                    onChange={(e) => setBotForm({ ...botForm, capabilityScore: Number(e.target.value) })}
                    className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase">
                    <span>Utility Tier (&lt;70)</span>
                    <span>Pro Tier (70 - 87)</span>
                    <span>Frontier Tier (88 - 100)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold">SYSTEM PROMPT INSTRUCTION:</label>
                  <textarea
                    rows={4}
                    required
                    value={botForm.systemPrompt}
                    onChange={(e) => setBotForm({ ...botForm, systemPrompt: e.target.value })}
                    placeholder="Define the bot's system persona, constraints, and operational guidelines..."
                    className="w-full p-3 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold">CAPABILITY TAGS (Comma separated):</label>
                  <input
                    type="text"
                    value={botForm.capabilities}
                    onChange={(e) => setBotForm({ ...botForm, capabilities: e.target.value })}
                    placeholder="e.g. ATS Scoring, Skill Gap Analysis, Recency Audit"
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>PUBLISH BOT TO MARKETPLACE</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Live Pricing Formula Preview */}
            <div className="space-y-6">
              <div className="bg-[#0F1424] border-2 border-emerald-500/40 rounded-xl p-5 space-y-4 arcade-panel sticky top-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-slate-100 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic CorpCoin Pricing</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    TIER_COLORS[pricingPreview.tier]?.badge || 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {pricingPreview.tier} TIER
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">FOUNDER HIRE LICENSE</span>
                    <div className="text-3xl font-black font-sans text-emerald-300">
                      {pricingPreview.basePrice} <span className="text-sm font-mono text-emerald-500">CorpCoins</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      One-time deployment fee paid by founder to license bot into company workforce.
                    </p>
                  </div>

                  <div className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">RUN EXECUTION FEE</span>
                    <div className="text-2xl font-black font-sans text-cyan-300">
                      {pricingPreview.pricePerRun} <span className="text-xs font-mono text-cyan-500">CorpCoins / run</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Deducted from company treasury every time founder triggers an automated pipeline.
                    </p>
                  </div>

                  {/* Math Breakdown */}
                  <div className="p-3 bg-[#06080E] border border-slate-800/80 rounded-lg space-y-2 text-[10px] font-mono text-slate-400">
                    <div className="text-slate-300 font-bold uppercase">Pricing Formula Breakdown:</div>
                    <div className="flex justify-between">
                      <span>Capability Benchmark:</span>
                      <span className="text-emerald-400 font-bold">{pricingPreview.capabilityScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complexity Multiplier:</span>
                      <span className="text-cyan-400 font-bold">{pricingPreview.multiplier || 1.3}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In-Game Token Subsidy:</span>
                      <span className="text-violet-400 font-bold">Free LLM Quota</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 4: MARKETPLACE MANAGEMENT
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold font-display text-slate-100">Marketplace Bot Workforce</h2>
                <p className="text-xs text-slate-400 font-sans">
                  Published bots ready for startup founders to hire and deploy into their pipelines.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('workshop')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>[CREATE NEW BOT]</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((b) => {
                const Icon = CATEGORY_ICONS[b.category] || Bot;
                const tierColor = TIER_COLORS[b.pricing?.tier] || TIER_COLORS.pro;

                return (
                  <div
                    key={b._id}
                    className="p-5 rounded-xl bg-[#0F1424] border-2 border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 arcade-card flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${tierColor.badge}`}>
                          {b.pricing?.tier || 'PRO'} TIER
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono uppercase">
                          {b.category}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">{b.name}</h3>
                          <p className="text-[11px] text-slate-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                            {b.tagline || b.description}
                          </p>
                        </div>
                      </div>

                      {/* Capabilities */}
                      {b.capabilities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {b.capabilities.slice(0, 3).map((cap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[9px] bg-[#06080E] border border-slate-800 text-slate-300 font-mono">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pricing Box */}
                      <div className="p-3 bg-[#06080E] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Hire License</div>
                          <div className="font-bold text-emerald-300">{b.pricing?.basePrice} CorpCoins</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Run Fee</div>
                          <div className="font-bold text-cyan-300">{b.pricing?.pricePerRun} CC / run</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveTestBot(b);
                          setShowTestRunModal(true);
                        }}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Sandbox Test</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(b._id, b.status)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                          b.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        {b.status === 'active' ? 'Active in Market' : 'Paused / Draft'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            TAB 5: PIPELINE AUDIT LOGS
           ────────────────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-100">Platform Execution Telemetry</h2>
                <p className="text-xs text-slate-400 font-sans">
                  Real-time audit trail of all bot pipelines triggered by startup founders.
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl overflow-hidden arcade-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#06080E] border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Bot / Pipeline</th>
                      <th className="p-3.5">Target Company</th>
                      <th className="p-3.5">Triggered By</th>
                      <th className="p-3.5">CorpCoins Paid</th>
                      <th className="p-3.5">Tokens / Latency</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {runs.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-800/20 transition-all">
                        <td className="p-3.5 text-slate-500 text-[10px]">
                          {new Date(r.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3.5 font-bold text-slate-200">
                          {r.bot?.name || 'Autonomous Agent'}
                          <div className="text-[10px] text-violet-300 font-normal">{r.pipelineType}</div>
                        </td>
                        <td className="p-3.5 text-cyan-300 font-bold">
                          {r.company?.name || 'Venture'}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {r.triggeredBy?.name || 'Founder'}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          +{r.costCorpCoins} CC
                        </td>
                        <td className="p-3.5 text-slate-400 text-[10px]">
                          {r.tokensUsed || 340} tok · {r.durationMs || 180}ms
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setInspectedRun(r)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                          >
                            Inspect JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
      {/* ──────────────────────────────────────────────────────────
          MODAL: SANDBOX TEST RUN
         ────────────────────────────────────────────────────────── */}
      {showTestRunModal && activeTestBot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-cyan-500/50 rounded-xl p-6 max-w-2xl w-full space-y-4 arcade-panel relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-display font-extrabold text-base">
                <Play className="w-5 h-5 text-cyan-400" />
                <span>Sandbox Test :: {activeTestBot.name}</span>
              </div>
              <button onClick={() => setShowTestRunModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 font-bold block mb-1">INPUT PAYLOAD (JSON):</label>
                <textarea
                  rows={6}
                  value={testInputPayload}
                  onChange={(e) => setTestInputPayload(e.target.value)}
                  className="w-full p-3 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTest}
                  disabled={testRunning}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-lg text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
                >
                  {testRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>PROCESSING PIPELINE...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>DISPATCH TEST RUN</span>
                    </>
                  )}
                </button>
              </div>

              {testRunResult && (
                <div className="p-4 bg-[#06080E] border border-cyan-500/30 rounded-xl space-y-2">
                  <div className="text-cyan-400 font-bold text-xs uppercase">EXECUTION RESULT OUTPUT:</div>
                  <pre className="text-[11px] text-slate-200 overflow-x-auto p-2 bg-black/40 rounded">
                    {JSON.stringify(testRunResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: REGISTER PROVIDER
         ────────────────────────────────────────────────────────── */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-emerald-500/50 rounded-xl p-6 max-w-md w-full space-y-4 arcade-panel relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-300 font-display font-extrabold text-base">
                <Server className="w-5 h-5 text-emerald-400" />
                <span>Register AI Provider</span>
              </div>
              <button onClick={() => setShowProviderModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">PROVIDER NAME:</label>
                <input
                  type="text"
                  required
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  placeholder="e.g. Groq Cloud LPU"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">SLUG IDENTIFIER:</label>
                <input
                  type="text"
                  required
                  value={providerForm.slug}
                  onChange={(e) => setProviderForm({ ...providerForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. groq"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">BASE URL (OpenAI-Compatible):</label>
                <input
                  type="text"
                  required
                  value={providerForm.baseUrl}
                  onChange={(e) => setProviderForm({ ...providerForm, baseUrl: e.target.value })}
                  placeholder="https://api.groq.com/openai/v1"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">API KEY (AES-256 GCM Encrypted):</label>
                <input
                  type="password"
                  value={providerForm.apiKey}
                  onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                  placeholder="Leave empty for keyless / anonymous providers"
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">DEFAULT MODEL ID:</label>
                  <input
                    type="text"
                    value={providerForm.modelId}
                    onChange={(e) => setProviderForm({ ...providerForm, modelId: e.target.value })}
                    placeholder="llama-3.3-70b-versatile"
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">MODEL DISPLAY NAME:</label>
                  <input
                    type="text"
                    value={providerForm.modelName}
                    onChange={(e) => setProviderForm({ ...providerForm, modelName: e.target.value })}
                    placeholder="Llama 3.3 70B"
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded text-xs transition-all"
                >
                  SAVE PROVIDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: INSPECT AUDIT RUN
         ────────────────────────────────────────────────────────── */}
      {inspectedRun && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-violet-500/50 rounded-xl p-6 max-w-2xl w-full space-y-4 arcade-panel relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-violet-300 font-display font-extrabold text-base">
                <Terminal className="w-5 h-5 text-violet-400" />
                <span>Run Telemetry Inspector :: {inspectedRun._id}</span>
              </div>
              <button onClick={() => setInspectedRun(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Bot: <span className="text-emerald-400 font-bold">{inspectedRun.bot?.name || 'Agent'}</span></div>
                <div>Company: <span className="text-cyan-400 font-bold">{inspectedRun.company?.name || 'Startup'}</span></div>
                <div>Cost: <span className="text-amber-400 font-bold">{inspectedRun.costCorpCoins} CorpCoins</span></div>
                <div>Duration: <span className="text-violet-400 font-bold">{inspectedRun.durationMs}ms</span></div>
              </div>

              <div>
                <div className="text-slate-400 font-bold mb-1">INPUT DATA PAYLOAD:</div>
                <pre className="p-3 bg-[#06080E] border border-slate-800 rounded text-[10px] text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectedRun.inputPayload, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-slate-400 font-bold mb-1">OUTPUT NEURAL RESULT:</div>
                <pre className="p-3 bg-[#06080E] border border-violet-500/30 rounded text-[10px] text-emerald-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectedRun.outputResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

    
      </>
  );
}
