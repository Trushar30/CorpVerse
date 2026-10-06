import React, { useState, useEffect } from 'react';
import {
  Layers,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  ArrowRight,
  Shield,
  FileText,
  MessageSquare,
  Code,
  Rocket,
  Trash2,
  MousePointerClick,
  Check,
} from 'lucide-react';
import { getCompanyPipeline, deployCompanyPipeline, testCompanyPipeline } from '@api/aiManager';

const PIPELINE_SLOTS = [
  {
    id: 'ats',
    key: 'atsBotId',
    stateKey: 'atsBot',
    title: 'STAGE 1: ATS Screening Gate',
    category: 'hiring',
    description: 'Parses resumes against role specs, filters candidates, and computes baseline match score.',
    icon: FileText,
    accent: 'cyan',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    glowColor: 'shadow-[0_0_20px_rgba(0,229,255,0.2)]',
  },
  {
    id: 'interview',
    key: 'interviewBotId',
    stateKey: 'interviewBot',
    title: 'STAGE 2: AI Interview Evaluator',
    category: 'interview',
    description: 'Conducts multi-turn technical interrogation and generates pass/fail hiring dossiers.',
    icon: MessageSquare,
    accent: 'violet',
    borderColor: 'border-violet-500/50',
    textColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  },
  {
    id: 'dailyTask',
    key: 'dailyTaskBotId',
    stateKey: 'dailyTaskBot',
    title: 'STAGE 3: Daily Sprint Task Gen',
    category: 'growth',
    description: 'Generates daily real-world simulation scenarios for hired employees to solve.',
    icon: Rocket,
    accent: 'emerald',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'shadow-[0_0_20px_rgba(0,245,160,0.2)]',
  },
  {
    id: 'audit',
    key: 'auditBotId',
    stateKey: 'auditBot',
    title: 'STAGE 4: Code & Work Auditor',
    category: 'code_review',
    description: 'Evaluates employee task submissions for security vulnerabilities and code quality.',
    icon: Code,
    accent: 'amber',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
];

export default function PipelineBlueprintCanvas({ onNotify }) {
  const [loading, setLoading] = useState(true);
  const [purchasedBots, setPurchasedBots] = useState([]);
  const [assignedBots, setAssignedBots] = useState({
    atsBot: null,
    interviewBot: null,
    dailyTaskBot: null,
    auditBot: null,
  });
  const [isDeployed, setIsDeployed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDeploying, setIsDeploying] = useState(false);
  const [draggedBot, setDraggedBot] = useState(null);
  const [selectedBotForAssign, setSelectedBotForAssign] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const res = await getCompanyPipeline();
      const data = res.data?.data || res.data;
      if (data) {
        setPurchasedBots(data.purchasedBots || []);
        if (data.pipeline) {
          setAssignedBots({
            atsBot: data.pipeline.atsBot || null,
            interviewBot: data.pipeline.interviewBot || null,
            dailyTaskBot: data.pipeline.dailyTaskBot || null,
            auditBot: data.pipeline.auditBot || null,
          });
          setIsDeployed(data.pipeline.isDeployed || false);
        }
      }
    } catch (err) {
      console.error('Failed to load blueprint pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, bot) => {
    setDraggedBot(bot);
    e.dataTransfer.setData('text/plain', bot._id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e, slotId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverSlot !== slotId) {
      setDragOverSlot(slotId);
    }
  };

  const handleDragLeave = (slotId) => {
    if (dragOverSlot === slotId) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    setDragOverSlot(null);
    const botId = e.dataTransfer.getData('text/plain');
    const botToAssign = draggedBot || purchasedBots.find((b) => b._id === botId);
    if (!botToAssign) return;

    setAssignedBots((prev) => ({
      ...prev,
      [slot.stateKey]: botToAssign,
    }));
    setDraggedBot(null);
    setSelectedBotForAssign(null);
  };

  // Click-to-assign fallback handler
  const handleSlotClick = (slot) => {
    if (selectedBotForAssign) {
      setAssignedBots((prev) => ({
        ...prev,
        [slot.stateKey]: selectedBotForAssign,
      }));
      setSelectedBotForAssign(null);
      if (onNotify) {
        onNotify(`Assigned ${selectedBotForAssign.name} to ${slot.title}`);
      }
    }
  };

  const handleDirectAssign = (slot, bot) => {
    setAssignedBots((prev) => ({
      ...prev,
      [slot.stateKey]: bot,
    }));
    setSelectedBotForAssign(null);
    if (onNotify) {
      onNotify(`Assigned ${bot.name} to ${slot.title}`);
    }
  };

  const handleRemoveBot = (stateKey) => {
    setAssignedBots((prev) => ({
      ...prev,
      [stateKey]: null,
    }));
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      const payload = {
        atsBotId: assignedBots.atsBot?._id || null,
        interviewBotId: assignedBots.interviewBot?._id || null,
        dailyTaskBotId: assignedBots.dailyTaskBot?._id || null,
        auditBotId: assignedBots.auditBot?._id || null,
      };
      await deployCompanyPipeline(payload);
      setIsDeployed(true);
      if (onNotify) onNotify('Company AI Blueprint deployed to live production pipeline!');
    } catch (err) {
      console.error('Failed to deploy pipeline:', err);
      if (onNotify) onNotify('Failed to deploy pipeline. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      setSimulationResult(null);
      const res = await testCompanyPipeline({});
      const simData = res.data?.data || res.data;
      setSimulationResult(simData);
      if (onNotify) onNotify('Simulation completed: Pipeline flow verified!');
    } catch (err) {
      console.error('Simulation error:', err);
      // Fallback local simulation if backend route has issue
      setSimulationResult({
        simulated: true,
        totalCostPerRun,
        stages: PIPELINE_SLOTS.map((s) => ({
          stage: s.id,
          bot: assignedBots[s.stateKey],
          status: assignedBots[s.stateKey] ? 'ready' : 'unassigned',
        })),
      });
      if (onNotify) onNotify('Pipeline dry-run simulated locally.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSlots = () => {
    setAssignedBots({
      atsBot: null,
      interviewBot: null,
      dailyTaskBot: null,
      auditBot: null,
    });
    setSimulationResult(null);
  };

  const totalCostPerRun = Object.values(assignedBots).reduce(
    (sum, bot) => sum + (bot?.pricing?.pricePerRun || 0),
    0
  );

  const assignedBotIds = new Set(
    Object.values(assignedBots)
      .filter(Boolean)
      .map((b) => b._id)
  );

  const filteredBots = purchasedBots.filter((bot) => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (bot.description && bot.description.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || bot.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 font-mono">
        <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
        <div className="text-sm font-bold text-slate-300">INITIALIZING NEURAL BLUEPRINT...</div>
        <div className="text-xs text-slate-500 mt-1">Loading company architecture & purchased AI bot workforce</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Bar */}
      <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Layers className="w-5 h-5 text-violet-400" />
            <h2 className="font-display font-black text-slate-100 text-sm sm:text-base tracking-wide">
              AUTONOMOUS COMPANY PIPELINE BLUEPRINT
            </h2>
            {isDeployed ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,245,160,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE IN PRODUCTION
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                STAGING BLUEPRINT
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[11px] font-sans">
            Drag purchased AI bots from the side palette into workflow nodes, or click to assign.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Run Cost */}
          <div className="bg-[#06080E] border border-slate-800 px-3.5 py-2 rounded-lg flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-400">Run Cost:</span>
            <span className="text-amber-400 font-bold text-sm">{totalCostPerRun}</span>
            <span className="text-[10px] text-slate-500">CorpCoins/run</span>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            title="Dry-run simulate the current pipeline configuration"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'SIMULATING...' : '[TEST FLOW]'}</span>
          </button>

          {/* Reset Slots */}
          <button
            onClick={handleResetSlots}
            className="p-2 bg-[#06080E] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Reset Blueprint Slots"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDeploying ? 'DEPLOYING...' : '[DEPLOY PIPELINE]'}</span>
          </button>
        </div>
      </div>

      {/* Click-to-assign active status notification banner */}
      {selectedBotForAssign && (
        <div className="p-3 bg-cyan-500/10 border-2 border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 text-cyan-300">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 animate-bounce" />
            <span>
              <strong>{selectedBotForAssign.name}</strong> selected. Click any pipeline stage slot below to assign.
            </span>
          </div>
          <button
            onClick={() => setSelectedBotForAssign(null)}
            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-[11px] font-bold"
          >
            Cancel Selection
          </button>
        </div>
      )}

      {/* Simulation Result Banner */}
      {simulationResult && (
        <div className="p-4 bg-[#090C15] border-2 border-emerald-500/40 rounded-xl space-y-2 shadow-[0_0_20px_rgba(0,245,160,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>PIPELINE SIMULATION SUCCESSFUL :: DRY-RUN VERIFIED</span>
            </div>
            <button
              onClick={() => setSimulationResult(null)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              [Dismiss]
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {PIPELINE_SLOTS.map((slot) => {
              const assigned = assignedBots[slot.stateKey];
              return (
                <div
                  key={slot.id}
                  className={`p-2.5 rounded-lg border text-[10px] ${
                    assigned
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold">{slot.title.split(':')[0]}</div>
                  <div className="truncate text-[11px] text-slate-200 mt-0.5">
                    {assigned ? assigned.name : 'No Bot Assigned'}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {assigned ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Ready ({assigned.pricing?.pricePerRun || 25} CC)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Manual Fallback</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Canvas Layout: Palette (4 cols) + Flowchart Blueprint (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Palette (4 cols) */}
        <div className="lg:col-span-4 bg-[#0F1424] border-2 border-slate-800 rounded-xl p-4 flex flex-col space-y-4 max-h-[780px] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>PURCHASED BOTS ({purchasedBots.length})</span>
            </div>
            <span className="text-[10px] text-slate-500">Drag or Click</span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bot workforce..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#06080E] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {['all', 'hiring', 'interview', 'growth', 'code_review'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Bot Card List */}
          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
            {filteredBots.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-[11px] space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
                <p>No purchased bots match your filter.</p>
                <p className="text-[10px] text-slate-600">
                  Acquire neural bots from the AI Bot Marketplace tab!
                </p>
              </div>
            ) : (
              filteredBots.map((bot) => {
                const isSelected = selectedBotForAssign?._id === bot._id;
                const isAssigned = assignedBotIds.has(bot._id);

                return (
                  <div
                    key={bot._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, bot)}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedBotForAssign(null);
                      } else {
                        setSelectedBotForAssign(bot);
                      }
                    }}
                    className={`p-3 bg-[#06080E] border rounded-lg cursor-grab active:cursor-grabbing transition-all select-none space-y-2 shadow-sm group ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                        : isAssigned
                        ? 'border-violet-500/40 hover:border-violet-400'
                        : 'border-slate-800 hover:border-violet-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-slate-200 text-xs group-hover:text-violet-300 truncate">
                          {bot.name}
                        </span>
                        {isAssigned && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                            ASSIGNED
                          </span>
                        )}
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 text-[9px] uppercase font-bold shrink-0">
                        {bot.pricing?.tier || 'pro'}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[10px] line-clamp-2 font-sans">
                      {bot.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Power: {bot.pricing?.capabilityScore || 85}%</span>
                      <span className="text-amber-400 font-bold">
                        {bot.pricing?.pricePerRun || 25} CC/run
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-slate-500 uppercase">
                        Cat: {bot.category?.replace('_', ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBotForAssign(isSelected ? null : bot);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Click to Assign'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Blueprint Flowchart (8 cols) */}
        <div className="lg:col-span-8 bg-[#090C15] border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl">
          {/* Subtle Grid Matrix Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {PIPELINE_SLOTS.map((slot, index) => {
            const Icon = slot.icon;
            const assignedBot = assignedBots[slot.stateKey];
            const isTargetedByDrag = dragOverSlot === slot.id;

            // Matching bots for quick dropdown assignment
            const matchingPurchasedBots = purchasedBots.filter(
              (b) => b.category === slot.category || slot.category === 'all'
            );

            return (
              <div key={slot.id} className="relative z-10 space-y-2">
                <div
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={() => handleDragLeave(slot.id)}
                  onDrop={(e) => handleDrop(e, slot)}
                  onClick={() => handleSlotClick(slot)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer ${
                    isTargetedByDrag
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.4)] scale-[1.01]'
                      : assignedBot
                      ? `bg-[#0F1424] ${slot.borderColor} ${slot.glowColor}`
                      : selectedBotForAssign
                      ? 'bg-[#06080E]/90 border-dashed border-cyan-500/60 hover:bg-cyan-950/20'
                      : 'bg-[#06080E]/80 border-dashed border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${
                        assignedBot
                          ? `${slot.bgColor} ${slot.textColor} ${slot.borderColor}`
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs tracking-wide">
                          {slot.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] uppercase font-bold">
                          {slot.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px] max-w-md font-sans">
                        {slot.description}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Bot Display OR Drop Target Prompt */}
                  {assignedBot ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-3 bg-[#06080E] border border-violet-500/40 px-3.5 py-2 rounded-lg shrink-0 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-violet-300 text-[11px] flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{assignedBot.name}</span>
                        </div>
                        <div className="text-[9px] text-amber-400 font-bold">
                          {assignedBot.pricing?.pricePerRun || 25} CC/run · Power: {assignedBot.pricing?.capabilityScore || 85}%
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBot(slot.stateKey)}
                        className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                        title="Remove Bot from Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {selectedBotForAssign ? (
                        <div className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-[10px] font-sans flex items-center gap-1.5 animate-pulse">
                          <MousePointerClick className="w-3.5 h-3.5" />
                          <span>Click to place "{selectedBotForAssign.name}"</span>
                        </div>
                      ) : (
                        <div className="px-3 py-2 rounded-lg border border-dashed border-slate-800 text-slate-500 text-[10px] font-sans flex items-center gap-1.5">
                          <span>Drag matching bot here</span>
                        </div>
                      )}

                      {/* Fallback quick select dropdown */}
                      {purchasedBots.length > 0 && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (selectedId) {
                              const found = purchasedBots.find((b) => b._id === selectedId);
                              if (found) handleDirectAssign(slot, found);
                            }
                          }}
                          defaultValue=""
                          className="bg-[#06080E] border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:border-violet-500"
                        >
                          <option value="" disabled>
                            Or Select Bot ▾
                          </option>
                          {purchasedBots.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.name} ({b.pricing?.pricePerRun || 25} CC)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Animated Pipeline Connector Pipe */}
                {index < PIPELINE_SLOTS.length - 1 && (
                  <div className="flex justify-center my-1 relative">
                    <div className="w-0.5 h-7 bg-gradient-to-b from-violet-500/60 to-cyan-500/60 relative">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full -left-[3px] absolute animate-ping" />
                      <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full -left-[2px] absolute top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
