import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Activity,
  GitCommit,
  ArrowRight,
  CheckCircle2,
  Play,
  Code2,
  Workflow,
  Sparkles,
  Bot,
  UserCheck,
  Building2,
  Sliders,
  Flame,
  Radio,
  Eye,
  Trophy,
  Award,
  Zap,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import Hero from './Hero';
import Features from './Features';
import Journey from './Journey';

/**
 * ============================================================================
 * CORPVERSE RETRO PIXEL LANDING ENGINE
 * Codedex-Inspired Retro Pixel Art & Interactive Arcade Environment
 * ============================================================================
 */

// 1. LIVE OSCILLOSCOPE LATENCY CANVAS COMPONENT
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
      
      // Retro Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
      ctx.strokeStyle = '#ffc700';
      ctx.lineWidth = 2;

      for (let x = 0; x < canvas.width; x += 2) {
        const y = (canvas.height / 2) + Math.sin((x + step) * 0.05) * 12 + Math.cos((x - step) * 0.03) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      step += 2;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="bg-[#06080e] border-2 border-black rounded p-3 font-pixel shadow-[3px_3px_0px_#000]">
      <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-bold">
        <span className="flex items-center gap-1.5 text-[#00f5a0]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>REALTIME_OSCILLOSCOPE</span>
        </span>
        <span className="text-[#ffc700]">14.2ms [STABLE]</span>
      </div>
      <canvas ref={canvasRef} width={280} height={50} className="w-full rounded bg-[#090c15] border border-black" />
    </div>
  );
}

// 2. INTERACTIVE CLI TERMINAL PROMPT COMPONENT
function InteractiveTerminalCLI() {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: 'CorpVerse Retro Arcade Shell v2.5.0-PROD', type: 'info' },
    { text: 'Type "help" to view available arcade commands.', type: 'sys' },
  ]);

  const handleCommand = (e) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      const cmd = inputVal.trim().toLowerCase();
      const newHistory = [...history, { text: `$ corpverse ${inputVal}`, type: 'user' }];

      if (cmd === 'help') {
        newHistory.push(
          { text: 'Available Arcade Commands:', type: 'sys' },
          { text: '  status       - Inspect current FSM & active agent metrics', type: 'info' },
          { text: '  fsm          - Simulate state machine transition cycle', type: 'info' },
          { text: '  quest        - Launch active RPG quest module', type: 'info' },
          { text: '  exec         - Start onboarding adventure', type: 'info' },
          { text: '  clear        - Clear terminal console', type: 'sys' }
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
      } else if (cmd === 'quest') {
        newHistory.push(
          { text: 'Active Quests: AI Resume Screening, Chat Interview, Founder Mode', type: 'info' }
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
    <div className="bg-[#06080e] border-2 border-black rounded-lg overflow-hidden font-pixel text-xs shadow-[4px_4px_0px_#000]">
      <div className="bg-[#111728] px-4 py-2 border-b-2 border-black flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#ffc700]" />
          <span className="font-bold text-slate-200">corpverse-arcade-shell.sh</span>
        </div>
        <span className="text-[10px] text-[#00f5a0] animate-pulse">● LIVE_INPUT</span>
      </div>

      <div className="p-4 h-52 overflow-y-auto space-y-1.5 font-semibold">
        {history.map((item, idx) => (
          <div key={idx} className={`leading-relaxed ${
            item.type === 'user' ? 'text-cyan-300 font-bold' :
            item.type === 'emerald' ? 'text-[#00f5a0]' :
            item.type === 'amber' ? 'text-[#ffc700]' :
            item.type === 'err' ? 'text-rose-400' : 'text-slate-300'
          }`}>
            {item.text}
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 bg-[#090c15] border-t-2 border-black flex items-center gap-2">
        <span className="text-[#ffc700] font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Type 'help' or 'status'..."
          className="w-full bg-transparent text-slate-100 focus:outline-none text-xs font-pixel font-bold"
        />
        <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </div>
  );
}

// MAIN GOD-MODE RETRO LANDING COMPONENT
export default function CorpVerseGodModeLanding() {
  const [showDiagnosticOverlay, setShowDiagnosticOverlay] = useState(false);
  const [activeFsmNode, setActiveFsmNode] = useState('JOB_SEEKER');

  const handleExecute = () => {
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-[#090c15] text-slate-100 font-pixel relative selection:bg-[#ffc700] selection:text-black">
      
      {/* Universal Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Feature Modules */}
      <Features />

      {/* Career Lifecycle Journey */}
      <Journey />

      {/* INTERACTIVE ARCADE SIMULATOR & CLI TERMINAL */}
      <section id="simulator" className="py-20 px-4 bg-[#0b0e14] border-b-2 border-black font-pixel">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 bg-[#a855f7] text-white text-xs font-bold rounded border-2 border-black shadow-[2px_2px_0px_#000]">
              INTERACTIVE CRT SIMULATOR
            </div>
            <h2 className="font-pixel-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[3px_3px_0px_#000]">
              Real-Time CLI & State Machine
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-semibold">
              Test live state mutations, inspect Zod-validated payloads, and execute real-time commands.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: FSM Controls */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="retro-pixel-card p-6 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <span className="font-pixel-heading text-sm font-bold text-[#ffc700] flex items-center gap-2">
                    <GitCommit className="w-4 h-4" /> ACTIVE FSM STATE NODE
                  </span>
                  <span className="px-2 py-0.5 bg-[#00f5a0] text-black font-bold text-[11px] border border-black rounded">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'JOB_SEEKER', title: 'JOB_SEEKER', desc: 'AI Interview Screening' },
                    { id: 'EMPLOYEE', title: 'EMPLOYEE', desc: 'EXP & Salary Sprints' },
                    { id: 'FOUNDER', title: 'FOUNDER', desc: 'Venture & Team Hiring' }
                  ].map(node => (
                    <button
                      key={node.id}
                      onClick={() => setActiveFsmNode(node.id)}
                      className={`p-3 rounded text-left border-2 border-black transition-all ${
                        activeFsmNode === node.id
                          ? 'bg-[#ffc700] text-black shadow-[3px_3px_0px_#000] font-bold'
                          : 'bg-[#06080e] text-slate-300 hover:bg-[#151b2e]'
                      }`}
                    >
                      <div className="text-xs">{node.title}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{node.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#06080e] p-4 border-2 border-black rounded text-xs space-y-2">
                  <div className="text-slate-400">STATE_MUTATION_METRICS:</div>
                  <div className="text-[#00f5a0] font-bold">
                    Active Node: <span className="text-[#ffc700]">{activeFsmNode}</span>
                  </div>
                  <div className="text-slate-300">
                    {activeFsmNode === 'JOB_SEEKER' && 'Status: Submitting resumes & unlocking AI feedback.'}
                    {activeFsmNode === 'EMPLOYEE' && 'Status: Completing tasks, earning yield & climbing levels.'}
                    {activeFsmNode === 'FOUNDER' && 'Status: Managing startup treasury & evaluating player applications.'}
                  </div>
                </div>

                <button
                  onClick={handleExecute}
                  className="retro-btn-yellow w-full py-3 rounded text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Simulation Deck</span>
                </button>
              </div>

            </div>

            {/* Right Column: Oscilloscope & CLI */}
            <div className="lg:col-span-6 space-y-4">
              <OscilloscopeCanvas />
              <InteractiveTerminalCLI />
            </div>

          </div>

        </div>
      </section>

      {/* LEADERBOARD & RANK BADGES SHOWCASE */}
      <section id="leaderboard" className="py-20 px-4 bg-[#090c15] border-b-2 border-black font-pixel">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 bg-[#00f5a0] text-black text-xs font-bold rounded border-2 border-black shadow-[2px_2px_0px_#000]">
              HALL OF FAME
            </div>
            <h2 className="font-pixel-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[3px_3px_0px_#000]">
              Global Player Ranks
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-semibold">
              Compete against other candidates, earn EXP badges, and get hired by top player founders.
            </p>
          </div>

          {/* Ranks Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { rank: 'DIAMOND', exp: '2,500+ EXP', title: 'Chief Architect', color: 'bg-cyan-400 text-black' },
              { rank: 'PLATINUM', exp: '1,500 EXP', title: 'Senior Lead', color: 'bg-purple-400 text-black' },
              { rank: 'GOLD', exp: '800 EXP', title: 'Mid-Level Engineer', color: 'bg-[#ffc700] text-black' },
              { rank: 'SILVER', exp: '300 EXP', title: 'Junior Associate', color: 'bg-slate-300 text-black' },
            ].map((r, idx) => (
              <div key={r.rank} className="retro-pixel-card p-6 rounded-lg text-center space-y-3">
                <div className="w-12 h-12 rounded-full mx-auto bg-[#06080e] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Trophy className="w-6 h-6 text-[#ffc700]" />
                </div>
                <div className={`inline-block px-2.5 py-0.5 text-xs font-bold border border-black rounded ${r.color}`}>
                  {r.rank}
                </div>
                <h3 className="font-pixel-heading text-sm font-bold text-white">{r.title}</h3>
                <p className="text-xs text-[#00f5a0] font-bold">{r.exp}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* RETRO LEVEL-UP CTA BANNER */}
      <section className="py-20 px-4 bg-[#0b0e14] font-pixel text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto retro-pixel-card p-10 sm:p-14 rounded-xl space-y-6 bg-gradient-to-b from-[#111728] to-[#090c15]">
          <div className="w-16 h-16 rounded-full mx-auto bg-[#ffc700] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] animate-bounce">
            <Award className="w-8 h-8 text-black" />
          </div>

          <h2 className="font-pixel-heading text-3xl sm:text-5xl font-extrabold text-[#fff3a1] drop-shadow-[4px_4px_0px_#000]">
            Ready to Begin Your Adventure?
          </h2>

          <p className="text-slate-200 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            Join thousands of applicants and founders simulating their career journey in CorpVerse.
          </p>

          <div className="pt-2">
            <a
              href="/sign-up"
              className="retro-btn-yellow text-lg px-9 py-4 rounded-md"
            >
              <span>Get started</span>
            </a>
          </div>
        </div>
      </section>

      {/* RETRO FOOTER */}
      <footer className="py-8 px-4 bg-[#06080e] border-t-2 border-black text-center font-pixel text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>CorpVerse Retro Adventure Engine © 2026. All rights reserved.</div>
          <div className="text-[#00f5a0] font-bold">[ALL_SYSTEMS_OPERATIONAL]</div>
        </div>
      </footer>

    </div>
  );
}
