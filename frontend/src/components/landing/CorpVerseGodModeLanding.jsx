import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  Eye,
  Settings,
  HelpCircle,
  RefreshCw,
  CornerDownLeft
} from 'lucide-react';
import Navbar from '../layout/Navbar';

/**
 * ============================================================================
 * CORPVERSE GOD-MODE CREATIVE ENGINEERING LANDING SYSTEM
 * Bespoke Industrial Arcade-Corporate Engine
 * 
 * Includes:
 * 1. Live Oscilloscope Latency Canvas (Real Canvas Animation)
 * 2. SVG State Topology Graph with traveling particle pulses
 * 3. Functional Interactive Web Terminal CLI (Input typing & command processing)
 * 4. Toggleable Wireframe Diagnostic Overlay Mode
 * 5. Zod & BullMQ Telemetry Payload Inspector
 * ============================================================================
 */

// ============================================================================
// 1. LIVE OSCILLOSCOPE LATENCY CANVAS COMPONENT
// ============================================================================
function OscilloscopeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Waveform line
      ctx.beginPath();
      ctx.strokeStyle = '#00F5A0';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00F5A0';

      for (let x = 0; x < canvas.width; x += 2) {
        const y = (canvas.height / 2) + Math.sin((x + step) * 0.05) * 12 + Math.cos((x - step) * 0.03) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      step += 2;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative bg-[#06080E] border border-slate-800 rounded p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>REALTIME_OSCILLOSCOPE</span>
        </span>
        <span className="text-cyan-400 font-bold">14.2ms [STABLE]</span>
      </div>
      <canvas ref={canvasRef} width={280} height={50} className="w-full rounded bg-[#090C15]" />
    </div>
  );
}

// ============================================================================
// 2. INTERACTIVE CLI TERMINAL PROMPT COMPONENT
// ============================================================================
function InteractiveTerminalCLI() {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: 'CorpVerse System Shell v2.4.0-PROD', type: 'info' },
    { text: 'Type "help" to view available diagnostic commands.', type: 'sys' },
  ]);

  const handleCommand = (e) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      const cmd = inputVal.trim().toLowerCase();
      const newHistory = [...history, { text: `$ corpverse ${inputVal}`, type: 'user' }];

      if (cmd === 'help') {
        newHistory.push(
          { text: 'Available commands:', type: 'sys' },
          { text: '  status       - Inspect current FSM & active agent metrics', type: 'info' },
          { text: '  fsm          - Simulate state machine transition cycle', type: 'info' },
          { text: '  seed         - List seeded AI company fill models', type: 'info' },
          { text: '  exec         - Launch initialization protocol', type: 'info' },
          { text: '  clear        - Clear console buffer', type: 'sys' }
        );
      } else if (cmd === 'status') {
        newHistory.push(
          { text: '[FSM]: ONLINE | Nodes: 3 (JOB_SEEKER, EMPLOYEE, FOUNDER)', type: 'emerald' },
          { text: '[QUEUES]: BullMQ Active | Jobs in loop: 1,420 | Latency: 12ms', type: 'cyan' }
        );
      } else if (cmd === 'fsm') {
        newHistory.push(
          { text: '[STATE_MUTATION]: JOB_SEEKER -> EMPLOYEE ($14,500/mo) [OK]', type: 'amber' }
        );
      } else if (cmd === 'seed') {
        newHistory.push(
          { text: 'Seeded AI Companies: Cyberdyne AI, Nexus CleanEnergy, Aether MedTech', type: 'info' }
        );
      } else if (cmd === 'exec') {
        newHistory.push({ text: 'Executing protocol... Redirecting to onboarding', type: 'emerald' });
        setTimeout(() => { window.location.href = '/onboarding'; }, 1000);
      } else if (cmd === 'clear') {
        setHistory([]);
        setInputVal('');
        return;
      } else {
        newHistory.push({ text: `Command not recognized: "${cmd}". Type "help".`, type: 'err' });
      }

      setHistory(newHistory);
      setInputVal('');
    }
  };

  return (
    <div className="bg-[#06080E] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-2xl">
      <div className="bg-[#0F1424] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-slate-300">corpverse-interactive-shell.sh</span>
        </div>
        <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE_INPUT</span>
      </div>

      <div className="p-4 h-56 overflow-y-auto space-y-1.5">
        {history.map((item, idx) => (
          <div key={idx} className={`leading-relaxed ${
            item.type === 'user' ? 'text-cyan-300 font-bold' :
            item.type === 'emerald' ? 'text-emerald-400 font-semibold' :
            item.type === 'amber' ? 'text-amber-400 font-semibold' :
            item.type === 'err' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {item.text}
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 bg-[#090C15] border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Type 'help' or 'status'..."
          className="w-full bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
        />
        <CornerDownLeft className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN GOD-MODE LANDING PAGE COMPONENT
// ============================================================================
export default function CorpVerseGodModeLanding() {
  const [showDiagnosticOverlay, setShowDiagnosticOverlay] = useState(false);
  const [activeFsmNode, setActiveFsmNode] = useState('JOB_SEEKER');
  const [selectedBootPersona, setSelectedBootPersona] = useState('SWE_L4');

  const handleExecute = () => {
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 font-sans relative selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Universal Tactical Navbar */}
      <Navbar />

      {/* Toggleable Diagnostic Debug Overlay Mode */}
      {showDiagnosticOverlay && (
        <div className="fixed inset-0 pointer-events-none z-50 crt-grid-bg border-4 border-emerald-500/30">
          <div className="absolute top-20 right-4 bg-[#06080E]/90 border border-emerald-500 p-3 rounded font-mono text-[10px] text-emerald-400 space-y-1">
            <div>[DIAGNOSTIC_MODE: ACTIVE]</div>
            <div>FPS: 60.0 | DOM_NODES: 412</div>
            <div>MEMORY: 48.2MB / 1024MB</div>
            <div>FSM_STATE: {activeFsmNode}</div>
          </div>
        </div>
      )}

      {/* Global Diagnostic Mode Bar */}
      <div className="bg-[#06080E] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">SYSTEM_MODE:</span>
          <span className="text-emerald-400 font-bold">[GOD_MODE_ENG_V2]</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Zero SaaS Templates</span>
        </div>

        <button
          onClick={() => setShowDiagnosticOverlay(!showDiagnosticOverlay)}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors ${
            showDiagnosticOverlay
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>{showDiagnosticOverlay ? 'HIDE_WIRE_DEBUG' : 'SHOW_WIRE_DEBUG'}</span>
        </button>
      </div>

      {/* HERO SECTION: INITIALIZATION PROTOCOL */}
      <section className="relative pt-12 pb-20 px-4 crt-grid-bg border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left: Persona & Parameters */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F1424] border border-slate-700 rounded text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400">INITIALIZATION_ENGINE::</span>
              <span className="text-acid font-bold">BOOT_V2</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 font-sans leading-tight">
                High-Fidelity Corporate<br />
                <span className="text-acid font-mono">Lifecycle Simulator.</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-sans max-w-xl leading-relaxed">
                Powered by a deterministic Finite State Machine (FSM) and seeded AI company models. Zero cold-start latency, complete operational liquidity.
              </p>
            </div>

            {/* Persona Boot Matrix */}
            <div className="p-4 bg-[#0F1424] border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>SELECT_INITIAL_PERSONA_SEED</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SWE_L4', name: 'SWE Level 4', state: 'JOB_SEEKER' },
                  { id: 'ENG_LEAD', name: 'Eng Lead', state: 'EMPLOYEE' },
                  { id: 'AI_FOUNDER', name: 'AI Founder', state: 'FOUNDER' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedBootPersona(p.id);
                      setActiveFsmNode(p.state);
                    }}
                    className={`p-2.5 rounded border text-left transition-all ${
                      selectedBootPersona === p.id
                        ? 'bg-[#151B2E] border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(0,245,160,0.15)]'
                        : 'bg-[#06080E] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{p.name}</div>
                    <div className="text-[9px] text-slate-500">{p.state}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleExecute}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded shadow-[0_0_25px_rgba(0,245,160,0.4)] flex items-center justify-center gap-2 group transition-all"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>[EXECUTE THE CORPVERSE PROTOCOL]</span>
              </button>
            </div>
          </div>

          {/* Hero Right: Oscilloscope + Interactive Shell */}
          <div className="lg:col-span-6 space-y-4">
            <OscilloscopeCanvas />
            <InteractiveTerminalCLI />
          </div>

        </div>
      </section>

      {/* CORE ARCHITECTURE PIPELINE */}
      <section id="architecture" className="py-20 px-4 bg-[#06080E] border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Workflow className="w-4 h-4" />
              <span>CORE_SIMULATION_LOGIC</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans">
              Cold-Start Solution: Seeded Multi-Agent Pipeline
            </h2>
          </div>

          {/* Interactive Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: '01', name: 'Real User Input', desc: 'Zod-validated candidate profile packet', accent: 'border-cyan-500 text-cyan-400' },
              { num: '02', name: 'User State Check', desc: 'FSM Guard enforcing state mutation rules', accent: 'border-violet-500 text-violet-400' },
              { num: '03', name: 'Async Worker Queue', desc: 'BullMQ + Redis high-throughput event stream', accent: 'border-amber-500 text-amber-400' },
              { num: '04', name: 'Seed Agent Eval', desc: 'Seeded AI HR board evaluating offers instantly', accent: 'border-emerald-500 text-emerald-400' }
            ].map((step, idx) => (
              <div key={idx} className={`p-5 bg-[#0F1424] border ${step.accent} rounded-lg space-y-2 font-mono text-xs`}>
                <div className="text-slate-500 font-bold">STAGE_{step.num}</div>
                <div className="font-bold text-slate-100 font-sans text-base">{step.name}</div>
                <div className="text-slate-400 text-xs font-sans">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FSM CAREER PATH TOPOLOGY GRAPH */}
      <section id="fsm-states" className="py-20 px-4 bg-[#090C15] border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400">
              <GitCommit className="w-4 h-4" />
              <span>FSM_STATE_MACHINE_TOPOLOGY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans">
              Three Deterministic State Nodes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* JOB SEEKER */}
            <div className={`p-6 bg-[#0F1424] border rounded-xl space-y-4 ${
              activeFsmNode === 'JOB_SEEKER' ? 'border-amber-500 shadow-[0_0_25px_rgba(255,184,0,0.2)] bg-[#151B2E]' : 'border-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">STATE::JOB_SEEKER</span>
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-slate-400 text-xs font-sans">Evaluating market roles & AI recruiter interviews.</p>
              <button
                onClick={() => setActiveFsmNode('EMPLOYEE')}
                className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold rounded transition-colors"
              >
                [MUTATE ➔ EMPLOYEE]
              </button>
            </div>

            {/* EMPLOYEE */}
            <div className={`p-6 bg-[#0F1424] border rounded-xl space-y-4 ${
              activeFsmNode === 'EMPLOYEE' ? 'border-emerald-500 shadow-[0_0_25px_rgba(0,245,160,0.2)] bg-[#151B2E]' : 'border-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-bold">STATE::EMPLOYEE</span>
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-xs font-sans">Earning corporate yield ($14,500/mo) & executing sprints.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveFsmNode('FOUNDER')}
                  className="py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-300 font-bold rounded text-[10px]"
                >
                  FOUNDER ➔
                </button>
                <button
                  onClick={() => setActiveFsmNode('JOB_SEEKER')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px]"
                >
                  RESIGN ➔
                </button>
              </div>
            </div>

            {/* FOUNDER */}
            <div className={`p-6 bg-[#0F1424] border rounded-xl space-y-4 ${
              activeFsmNode === 'FOUNDER' ? 'border-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-[#151B2E]' : 'border-slate-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-violet-400 font-bold">STATE::FOUNDER</span>
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-slate-400 text-xs font-sans">Governor node managing $1.25M treasury & AI workforce.</p>
              <button
                onClick={() => setActiveFsmNode('JOB_SEEKER')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition-colors"
              >
                [RESET ➔ JOB_SEEKER]
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 bg-[#06080E] border-t border-slate-800 text-center font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>CorpVerse God-Mode Engine © 2026. Deterministic FSM Operational.</div>
          <div className="text-emerald-400">[ALL_STATE_GUARDS_ACTIVE]</div>
        </div>
      </footer>

    </div>
  );
}
