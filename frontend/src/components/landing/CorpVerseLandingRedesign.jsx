import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Cpu,
  Zap,
  Activity,
  GitCommit,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Code2,
  Database,
  Workflow,
  Sparkles,
  Bot,
  UserCheck,
  Building2,
  ChevronRight,
  Maximize2,
  Sliders,
  Flame,
  Radio
} from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURAL DESIGN SYSTEM: TACTILE ARCADE-CORPORATE (CorpVerse Kernel)
 * Domain-Driven Modular Architecture (DDoSA) Specification
 * 
 * Aesthetic Rules:
 * - Base Palette: Deep Slate Arcade (#0F172A bg, #162032 surface, #1E293B card)
 * - Status Accents:
 *    * Emerald (#10B981) -> State: Active / Hired / Operational
 *    * Amber   (#F59E0B) -> State: Pending / Evaluating / Review
 *    * Crimson (#EF4444) -> State: Terminated / Alert / Fault
 *    * Cyan    (#06B6D4) -> Telemetry / Data Streams / Queues
 *    * Violet  (#8B5CF6) -> Quantum Agent Engine / Kernel
 * - Fonts: Sans-Serif (Inter / SF Pro) for UI labels; Monospace (JetBrains Mono / Fira Code) for logs & metrics.
 * ============================================================================
 */

// ============================================================================
// 1. SYSTEM HEADER (Diagnostic Bar & System Status Strip)
// ============================================================================
function SystemHeader({ onTriggerInit }) {
  const [ping, setPing] = useState(14);
  const [activeAgents, setActiveAgents] = useState(1420);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(12 + Math.random() * 6));
      setActiveAgents(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 text-xs font-mono">
      {/* Top Status Strip */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Kernel Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-100 tracking-wider">CORPVERSE</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 text-[10px] uppercase tracking-widest">[FSM_ONLINE]</span>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>LATENCY: <strong className="text-cyan-300">{ping}ms</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3 text-violet-400" />
              <span>ACTIVE_AGENTS: <strong className="text-violet-300">{activeAgents.toLocaleString()}</strong></span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-500">
              <span>KERNEL: </span>
              <span className="text-slate-300">v2.4.0-PROD</span>
            </span>
          </div>
        </div>

        {/* Diagnostic Actions */}
        <div className="flex items-center space-x-3">
          <a
            href="#architecture"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors rounded"
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>ARCH_VIEW</span>
          </a>
          <a
            href="#fsm-states"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors rounded"
          >
            <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
            <span>FSM_STATES</span>
          </a>

          <button
            onClick={onTriggerInit}
            className="group relative inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold transition-all rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>[INITIALIZE]</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// 2. HERO SECTION: THE INITIALIZATION PROTOCOL (Fourth-Wall Simulator Hook)
// ============================================================================
function InitializationHero({ onExecuteProtocol }) {
  const [selectedPersona, setSelectedPersona] = useState('SWE_LEVEL_4');
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([
    { id: 1, time: '00:00.01', type: 'SYS', msg: 'CorpVerse Kernel Bootstrap initialized.' },
    { id: 2, time: '00:00.04', type: 'FSM', msg: 'Deterministic Finite State Machine online.' },
    { id: 3, time: '00:00.12', type: 'AGENT', msg: '14 Seeded AI Companies loaded into memory matrix.' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Micro-interaction: Interactive event injection into live log console
  const handleInjectEvent = (eventType) => {
    const timestamp = new Date().toISOString().slice(14, 21);
    let newLog = {};

    if (eventType === 'APPLICATION') {
      newLog = { id: Date.now(), time: timestamp, type: 'EVENT', msg: `[JOB_SEEKER] Applied to Cyberdyne AI -> Payload validated via Zod` };
    } else if (eventType === 'EVALUATION') {
      newLog = { id: Date.now(), time: timestamp, type: 'AI_HR', msg: `[SEED_HR_AGENT] Score: 94.8% fit. Generating offer spec.` };
    } else if (eventType === 'STATE_MUTATION') {
      newLog = { id: Date.now(), time: timestamp, type: 'FSM', msg: `[MUTATION] State transitioned: JOB_SEEKER -> EMPLOYEE ($14,500/mo)` };
    }

    setLogs(prev => [newLog, ...prev.slice(0, 5)]);
  };

  const runSimCycle = () => {
    setIsSimulating(true);
    setStepIndex(1);

    setTimeout(() => {
      handleInjectEvent('APPLICATION');
      setStepIndex(2);
    }, 1000);

    setTimeout(() => {
      handleInjectEvent('EVALUATION');
      setStepIndex(3);
    }, 2200);

    setTimeout(() => {
      handleInjectEvent('STATE_MUTATION');
      setIsSimulating(false);
    }, 3500);
  };

  return (
    <section className="relative min-h-[85vh] pt-12 pb-20 px-4 flex flex-col justify-center overflow-hidden border-b border-slate-800">
      {/* Background CRT Scanline & Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Command & Concept Hook */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Status Diagnostic Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">PROTOCOL_ID:</span>
            <span className="text-cyan-300 font-semibold">INITIALIZATION_V2</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/30">DETERMINISTIC</span>
          </div>

          {/* Non-Generic Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 font-sans leading-tight">
              Bypass Cold-Start.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 font-mono">
                Execute Corporate FSM.
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl font-sans leading-relaxed">
              CorpVerse is not a job board. It is a high-fidelity, gamified Multi-Agent Corporate Lifecycle Simulator powered by seeded AI companies and deterministic state transition logic.
            </p>
          </div>

          {/* Interactive Persona Selector (Tactile Controls) */}
          <div className="p-4 bg-[#162032] border border-slate-700/80 rounded-lg space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>BOOT_PARAMETERS</span>
              </span>
              <span className="text-[10px] text-slate-500">SELECT INITIALIZATION SEED</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SWE_LEVEL_4', label: 'SWE L4', role: 'Job Seeker', icon: Bot },
                { id: 'ENGINEERING_LEAD', label: 'Eng Lead', role: 'Employee', icon: Zap },
                { id: 'AI_FOUNDER', label: 'AI Founder', role: 'Founder', icon: Building2 }
              ].map(persona => {
                const Icon = persona.icon;
                const active = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-2.5 rounded border text-left transition-all ${
                      active
                        ? 'bg-slate-800 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    </div>
                    <div className="font-bold text-[11px]">{persona.label}</div>
                    <div className="text-[9px] text-slate-500">{persona.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExecuteProtocol}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs rounded transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>INITIALIZE LIFECYCLE PROTOCOL</span>
            </button>

            <button
              onClick={runSimCycle}
              disabled={isSimulating}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-cyan-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'EVALUATING...' : 'TEST_SIMULATION_CYCLE'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Central Initialization Engine Visualizer */}
        <div className="lg:col-span-6">
          <div className="relative bg-[#162032] border border-slate-700 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
            
            {/* Terminal Window Bar */}
            <div className="bg-[#090D16] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-slate-400 text-[11px] ml-2">corpverse-lifecycle-engine.exe</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>MEM_ALLOC: 42MB</span>
                <span className="text-emerald-400">[ACTIVE]</span>
              </div>
            </div>

            {/* Diagnostic Visualization Canvas */}
            <div className="p-5 space-y-5 bg-[#0F172A]/90 relative">
              
              {/* Process Step Visualizer */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: 1, name: 'SEED_LOADER', desc: '14 Seeded Companies', status: stepIndex >= 1 ? 'DONE' : 'READY', accent: 'border-emerald-500 text-emerald-400' },
                  { step: 2, name: 'AGENT_QUEUE', desc: 'BullMQ Event Loop', status: stepIndex >= 2 ? 'DONE' : 'IDLE', accent: 'border-amber-500 text-amber-400' },
                  { step: 3, name: 'FSM_TRANSITION', desc: 'Zod State Guard', status: stepIndex >= 3 ? 'MUTATED' : 'WAITING', accent: 'border-cyan-500 text-cyan-400' }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-3 bg-slate-900/80 border rounded transition-all ${
                      stepIndex === s.step ? `${s.accent} shadow-lg bg-slate-800/80` : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-500">STEP 0{s.step}</span>
                      <span className="font-bold">{s.status}</span>
                    </div>
                    <div className="font-bold text-[11px] text-slate-200">{s.name}</div>
                    <div className="text-[9px] text-slate-500 truncate">{s.desc}</div>
                  </div>
                ))}
              </div>

              {/* Console Telemetry Output Log Stream */}
              <div className="bg-[#090D16] border border-slate-800 rounded p-3 h-44 overflow-y-auto space-y-2 font-mono text-[11px]">
                <div className="text-slate-500 text-[10px] border-b border-slate-800/60 pb-1 flex justify-between">
                  <span>LIVE_TELEMETRY_STREAM</span>
                  <span className="text-emerald-400 animate-pulse">● LIVE</span>
                </div>
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-tight">
                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                    <span className={`shrink-0 font-bold ${
                      log.type === 'SYS' ? 'text-cyan-400' :
                      log.type === 'FSM' ? 'text-violet-400' :
                      log.type === 'EVENT' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      [{log.type}]
                    </span>
                    <span className="text-slate-300">{log.msg}</span>
                  </div>
                ))}
              </div>

              {/* Micro-Interaction Bar */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInjectEvent('APPLICATION')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 transition-colors"
                  >
                    + Apply Event
                  </button>
                  <button
                    onClick={() => handleInjectEvent('EVALUATION')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors"
                  >
                    + Agent Eval
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-sans">
                  *Click buttons to simulate real-time event queue injection
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// 3. CORE SIMULATION LOGIC: THE ARCHITECTURE VIEW (Cold-Start Resolution)
// ============================================================================
function ArchitectureView() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: 'STAGE_01',
      title: 'Real User Input',
      actor: 'User Agent Node',
      accent: 'border-cyan-500 text-cyan-400',
      bgGlow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
      desc: 'User submits career intention or skill profile payload. Schema validated instantly via Zod guard before reaching queue.',
      telemetrySchema: {
        eventType: 'USER_REGISTER_INTENTION',
        payload: { userId: 'usr_8829a', roleTarget: 'Backend Lead', expYears: 5 },
        validation: 'ZodSchema::OK'
      }
    },
    {
      id: 'STAGE_02',
      title: 'User State Check',
      actor: 'Deterministic FSM Guard',
      accent: 'border-violet-500 text-violet-400',
      bgGlow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]',
      desc: 'System checks current user node state (JOB_SEEKER, EMPLOYEE, or FOUNDER) to prevent illegal concurrent state mutations.',
      telemetrySchema: {
        currentState: 'JOB_SEEKER',
        allowedMutations: ['OFFER_ACCEPTED', 'APPLICATION_CANCELLED'],
        guardStatus: 'PERMITTED'
      }
    },
    {
      id: 'STAGE_03',
      title: 'Asynchronous Worker Queue',
      actor: 'BullMQ + Redis Stream',
      accent: 'border-amber-500 text-amber-400',
      bgGlow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      desc: 'Payload is placed onto high-throughput Redis event queue. Zero blocking on main execution thread during peak inference load.',
      telemetrySchema: {
        queueName: 'corpverse-evaluation-queue',
        jobId: 'job_99812_eval',
        latencyMs: 3.2,
        concurrency: 16
      }
    },
    {
      id: 'STAGE_04',
      title: 'Seed Company Agent Evaluation',
      actor: 'Multi-Agent HR Board',
      accent: 'border-emerald-500 text-emerald-400',
      bgGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      desc: 'Seeded AI Company filler models evaluate candidate specifications instantly, eliminating cold-start liquidity bottlenecks.',
      telemetrySchema: {
        companySeedId: 'corp_cyberdyne_01',
        agentEvaluator: 'AI_RECRUITER_ALPHA',
        score: 0.942,
        decision: 'GENERATING_OFFER_CONTRACT'
      }
    }
  ];

  return (
    <section id="architecture" className="py-20 px-4 bg-[#090D16] border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Workflow className="w-4 h-4" />
              <span>SYSTEM_ARCHITECTURE_VIEW</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
              Cold-Start Solution: Seeded Multi-Agent Pipeline
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-mono max-w-md">
            Deterministic flow guarantees instant evaluation liquidity even on day one.
          </p>
        </div>

        {/* Low-Fi Tactile Pipeline Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={`cursor-pointer p-5 bg-[#162032] border rounded-lg transition-all relative ${
                activeStage === idx
                  ? `${stage.accent} bg-slate-800 shadow-xl scale-[1.02]`
                  : 'border-slate-800 text-slate-400 hover:border-slate-700'
              } ${stage.bgGlow}`}
            >
              {/* Connector Arrow for Desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                    ➔
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="text-slate-500 font-bold">{stage.id}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                  {stage.actor}
                </span>
              </div>

              <h3 className="font-sans font-bold text-slate-100 text-base mb-2">{stage.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans mb-4">{stage.desc}</p>

              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <span>INSPECT TELEMETRY</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Live JSON Telemetry Inspector Panel */}
        <div className="bg-[#162032] border border-slate-700 rounded-lg p-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">TELEMETRY_SCHEMA_INSPECTOR</span>
              <span className="text-slate-500">:: {stages[activeStage].id}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ZOD_VALIDATED
            </span>
          </div>

          <pre className="bg-[#090D16] p-4 rounded text-slate-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-800">
            <code>{JSON.stringify(stages[activeStage].telemetrySchema, null, 2)}</code>
          </pre>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// 4. THE FSM CAREER PATH VISUALIZATION (Three Deterministic States)
// ============================================================================
function FSMPathVisualizer() {
  const [fsmState, setFsmState] = useState('JOB_SEEKER'); // JOB_SEEKER | EMPLOYEE | FOUNDER
  const [mutationLog, setMutationLog] = useState('INITIAL STATE: JOB_SEEKER');

  const transitionTo = (newState, reason) => {
    setFsmState(newState);
    setMutationLog(`MUTATION SUCCESS: Transitioned to ${newState} via trigger: [${reason}]`);
  };

  return (
    <section id="fsm-states" className="py-20 px-4 bg-[#0F172A] border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400">
            <GitCommit className="w-4 h-4" />
            <span>FSM_STATE_MACHINE_VISUALIZER</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
            Deterministic Career State Nodes
          </h2>
          <p className="text-slate-400 text-sm font-sans max-w-2xl">
            Accepting an offer or pitching a venture physically shifts the node state in the deterministic finite state machine.
          </p>
        </div>

        {/* Deterministic FSM Nodes Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* STATE 01: JOB SEEKER (Amber Accents) */}
          <div className={`p-6 bg-[#162032] border rounded-xl transition-all relative font-mono text-xs ${
            fsmState === 'JOB_SEEKER'
              ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-slate-800'
              : 'border-slate-800 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 text-[10px] font-bold">
                STATE 01
              </span>
              <Bot className="w-5 h-5 text-amber-400" />
            </div>

            <h3 className="text-xl font-bold font-sans text-slate-100 mb-2">JOB_SEEKER</h3>
            <p className="text-slate-400 text-xs font-sans mb-4">
              Active candidate node evaluating market roles and undergoing multi-agent AI interviews.
            </p>

            <div className="space-y-2 bg-[#090D16] p-3 rounded border border-slate-800 text-[11px] mb-6">
              <div className="flex justify-between"><span className="text-slate-500">interviewTokens:</span><span className="text-amber-300">5 / 5</span></div>
              <div className="flex justify-between"><span className="text-slate-500">activeApplications:</span><span className="text-slate-200">12 roles</span></div>
              <div className="flex justify-between"><span className="text-slate-500">rejectionResilience:</span><span className="text-emerald-400">98.4%</span></div>
            </div>

            <button
              onClick={() => transitionTo('EMPLOYEE', 'ACCEPT_OFFER')}
              className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold rounded transition-colors flex items-center justify-center gap-2"
            >
              <span>[TRIGGER: ACCEPT_OFFER]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* STATE 02: EMPLOYEE (Emerald Accents) */}
          <div className={`p-6 bg-[#162032] border rounded-xl transition-all relative font-mono text-xs ${
            fsmState === 'EMPLOYEE'
              ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-slate-800'
              : 'border-slate-800 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-bold">
                STATE 02
              </span>
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <h3 className="text-xl font-bold font-sans text-slate-100 mb-2">EMPLOYEE</h3>
            <p className="text-slate-400 text-xs font-sans mb-4">
              Hired state. Earning corporate yield, building reputation, and executing daily sprints.
            </p>

            <div className="space-y-2 bg-[#090D16] p-3 rounded border border-slate-800 text-[11px] mb-6">
              <div className="flex justify-between"><span className="text-slate-500">monthlySalary:</span><span className="text-emerald-300">$14,500/mo</span></div>
              <div className="flex justify-between"><span className="text-slate-500">corporateYield:</span><span className="text-cyan-300">+2,400 CORP</span></div>
              <div className="flex justify-between"><span className="text-slate-500">kpiPerformance:</span><span className="text-emerald-400">99.1%</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => transitionTo('FOUNDER', 'PITCH_VENTURE')}
                className="py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-300 font-bold rounded transition-colors text-[10px]"
              >
                PITCH VENTURE ➔
              </button>
              <button
                onClick={() => transitionTo('JOB_SEEKER', 'RESIGNATION')}
                className="py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold rounded transition-colors text-[10px]"
              >
                RESIGN ➔
              </button>
            </div>
          </div>

          {/* STATE 03: FOUNDER (Violet / Cyan Accents) */}
          <div className={`p-6 bg-[#162032] border rounded-xl transition-all relative font-mono text-xs ${
            fsmState === 'FOUNDER'
              ? 'border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-slate-800'
              : 'border-slate-800 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded border border-violet-500/30 text-[10px] font-bold">
                STATE 03
              </span>
              <Building2 className="w-5 h-5 text-violet-400" />
            </div>

            <h3 className="text-xl font-bold font-sans text-slate-100 mb-2">FOUNDER</h3>
            <p className="text-slate-400 text-xs font-sans mb-4">
              Governor node. Managing capital treasury, seeding company AI agents, and scaling valuation.
            </p>

            <div className="space-y-2 bg-[#090D16] p-3 rounded border border-slate-800 text-[11px] mb-6">
              <div className="flex justify-between"><span className="text-slate-500">treasuryBalance:</span><span className="text-violet-300">$1,250,000</span></div>
              <div className="flex justify-between"><span className="text-slate-500">seededAgentCount:</span><span className="text-cyan-300">18 AI Employees</span></div>
              <div className="flex justify-between"><span className="text-slate-500">marketValuation:</span><span className="text-emerald-400">$12.4M</span></div>
            </div>

            <button
              onClick={() => transitionTo('JOB_SEEKER', 'LIQUIDATION')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>[RESET TO JOB_SEEKER]</span>
            </button>
          </div>

        </div>

        {/* FSM Mutation Log Footer */}
        <div className="p-4 bg-[#090D16] border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">STATE_MUTATION_FEED:</span>
            <span className="text-emerald-300 font-bold">{mutationLog}</span>
          </div>
          <span className="text-slate-500 text-[10px] hidden sm:inline">GUARANTEED_ZERO_ILLEGAL_MUTATIONS</span>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// 5. PROOF OF COMPLEXITY: SYSTEM ENGINEERING ADVANTAGE
// ============================================================================
function EngineeringPillars() {
  const pillars = [
    {
      title: 'Asynchronous Worker Queues',
      tech: 'BullMQ + Redis Event Loop',
      icon: Server,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      desc: 'Handles high-frequency background agent interaction loops without blocking main execution threads.'
    },
    {
      title: 'Token Budget Management',
      tech: 'LLM Prompt Throttling Engine',
      icon: Cpu,
      accent: 'text-violet-400',
      border: 'border-violet-500/30',
      desc: 'Dynamic context window budget management ensuring cost efficiency during complex multi-agent interviews.'
    },
    {
      title: 'Strict Zod Schema Guards',
      tech: 'Runtime Contract Validation',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      desc: 'Zero-trust payload verification guaranteeing 100% deterministic FSM state transitions.'
    },
    {
      title: 'Simulation Economy Engine',
      tech: 'Agent Capital Allocation Model',
      icon: Layers,
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      desc: 'Calculates corporate treasury balance sheets, payroll distributions, and agent equity options algorithms.'
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#090D16] border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Code2 className="w-4 h-4" />
            <span>PROOF_OF_COMPLEXITY</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
            Engineered as a System, Not a Template
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className={`p-6 bg-[#162032] border ${p.border} rounded-xl space-y-4 hover:bg-slate-800/80 transition-all font-mono`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-6 h-6 ${p.accent}`} />
                  <span className="text-[10px] text-slate-500">PILLAR_0{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-100 mb-1">{p.title}</h3>
                  <div className={`text-[11px] font-bold ${p.accent}`}>{p.tech}</div>
                </div>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Empirical Engineering Stats Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#162032] border border-slate-700 rounded-xl font-mono text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.99%</div>
            <div className="text-[11px] text-slate-400">FSM Determinism Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">&lt; 12ms</div>
            <div className="text-[11px] text-slate-400">Worker Queue Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-400">14 Companies</div>
            <div className="text-[11px] text-slate-400">Seeded Agent Pool</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">0 Cold-Start</div>
            <div className="text-[11px] text-slate-400">Liquidity Bottleneck</div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// 6. EXECUTE CTA: COMMAND LINE AESTHETIC
// ============================================================================
function ExecuteConsoleCTA({ onExecuteProtocol }) {
  return (
    <section className="py-24 px-4 bg-[#0F172A] relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        
        {/* Terminal Box */}
        <div className="bg-[#090D16] border border-slate-700 rounded-xl p-6 shadow-2xl text-left font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-bold">corpverse-cli --execute</span>
            </div>
            <span className="text-emerald-400">[SYS_READY]</span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="text-slate-500">$ corpverse init --mode=god --seed=agent_mesh_v2</div>
            <div className="text-emerald-400">[SYS_OK] Seed company models active. 14 companies broadcasting roles.</div>
            <div className="text-cyan-400">[SYS_OK] Deterministic state machine listening on queue channel.</div>
            <div className="text-amber-400">[SYS_OK] Awaiting user protocol execution...</div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="space-y-4">
          <button
            onClick={onExecuteProtocol}
            className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold font-mono text-sm sm:text-base rounded-lg transition-all shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 mx-auto group"
          >
            <Zap className="w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
            <span>EXECUTE THE CORPVERSE PROTOCOL</span>
          </button>
          
          <p className="text-slate-500 text-xs font-mono">
            Zero setup required • Seeded AI agents online • Immediate execution
          </p>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// MAIN LANDING PAGE CONTAINER COMPONENT
// ============================================================================
export default function CorpVerseLandingRedesign() {
  const handleExecuteProtocol = () => {
    // Navigates or initiates onboarding simulation execution
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* System Diagnostics Header */}
      <SystemHeader onTriggerInit={handleExecuteProtocol} />

      {/* Hero Section: Initialization Protocol */}
      <InitializationHero onExecuteProtocol={handleExecuteProtocol} />

      {/* Core Simulation Logic: Architecture View */}
      <ArchitectureView />

      {/* FSM Career Path Visualization */}
      <FSMPathVisualizer />

      {/* Proof of Complexity: System Engineering Advantage */}
      <EngineeringPillars />

      {/* Command Line CTA */}
      <ExecuteConsoleCTA onExecuteProtocol={handleExecuteProtocol} />

      {/* Diagnostic Footer */}
      <footer className="py-8 px-4 bg-[#090D16] border-t border-slate-800 text-center font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>CorpVerse Simulator Engine © 2026. All FSM States Guarded.</div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400">[FSM: STABLE]</span>
            <span className="text-cyan-400">[REDIS_QUEUE: ONLINE]</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
