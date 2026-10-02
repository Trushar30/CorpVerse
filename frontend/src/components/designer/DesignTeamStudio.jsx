import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Palette,
  Layers,
  Sparkles,
  CheckCircle2,
  Check,
  Copy,
  Layout,
  Code,
  Award,
  Zap,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Download,
  FolderArchive,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';

export default function DesignTeamStudio({ onClose, embedded = false }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'tokens' | 'tasks' | 'assets'
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Canvas Sandbox State
  const [componentType, setComponentType] = useState('button'); // 'button' | 'card' | 'badge' | 'input'
  const [variant, setVariant] = useState('primary'); // 'primary' | 'acid' | 'violet' | 'amber'
  const [buttonText, setButtonText] = useState('DISPATCH ACTION');
  const [cardTitle, setCardTitle] = useState('UI Design Token Matrix');

  const handleTaskComplete = (id, exp = 30) => {
    if (!completedTaskIds.includes(id)) {
      setCompletedTaskIds((prev) => [...prev, id]);
      if (refreshUser) refreshUser();
    }
  };

  const getGeneratedCode = () => {
    if (componentType === 'button') {
      const colorMap = {
        primary: 'bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-emerald-400 shadow-[0_0_15px_rgba(0,245,160,0.3)]',
        acid: 'bg-cyan-500 hover:bg-cyan-400 text-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]',
        violet: 'bg-violet-500 hover:bg-violet-400 text-white border-2 border-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
        amber: 'bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-400 shadow-[0_0_15px_rgba(255,184,0,0.3)]',
      };
      return `<button className="px-5 py-2.5 rounded-lg font-mono font-extrabold text-xs transition-all ${colorMap[variant]}">\n  ${buttonText}\n</button>`;
    }

    if (componentType === 'card') {
      return `<div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-3 arcade-card">\n  <h3 className="font-display font-extrabold text-slate-100 text-base">${cardTitle}</h3>\n  <p className="text-xs text-slate-400 font-sans">Arcade design token container with hover glow dynamics.</p>\n</div>`;
    }

    if (componentType === 'badge') {
      return `<span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">\n  ★ VERIFIED TOKEN\n</span>`;
    }

    return `<input type="text" placeholder="Search tokens..." className="w-full px-4 py-2 bg-[#06080E] border-2 border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none" />`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`bg-[#0F1424] border-2 border-violet-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col font-mono text-xs ${embedded ? 'w-full' : 'max-w-5xl mx-auto my-6'}`}>
      
      {/* Studio Bar Header */}
      <div className="p-4 bg-[#06080E] border-b-2 border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <span>CorpVerse Design Team Studio</span>
              <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px]">PRO</span>
            </h2>
            <div className="text-[10px] text-slate-400">Design System Tokens • Component Sandbox • Export Assets</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['canvas', 'tokens', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300'
                  : 'bg-[#0F1424] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Component Sandbox Canvas */}
      {activeTab === 'canvas' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="space-y-4 bg-[#06080E] border border-slate-800 p-4 rounded-xl">
              <h3 className="font-display font-bold text-slate-200 text-xs flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>Component Parameters</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold">TYPE:</label>
                <select
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  className="w-full p-2 bg-[#0F1424] border border-slate-800 rounded text-slate-200 text-xs font-mono"
                >
                  <option value="button">Button Element</option>
                  <option value="card">Arcade Card</option>
                  <option value="badge">Status Badge</option>
                  <option value="input">Tactile Input</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold">COLOR PALETTE VARIANT:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'primary', label: 'Emerald Acid', color: 'bg-emerald-500' },
                    { id: 'acid', label: 'Cyan Cyber', color: 'bg-cyan-500' },
                    { id: 'violet', label: 'Neon Violet', color: 'bg-violet-500' },
                    { id: 'amber', label: 'Arcade Yellow', color: 'bg-amber-500' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(v.id)}
                      className={`p-2 rounded border text-[10px] font-bold flex items-center gap-2 ${
                        variant === v.id
                          ? 'border-violet-400 bg-violet-500/10 text-slate-100'
                          : 'border-slate-800 bg-[#0F1424] text-slate-400'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${v.color}`} />
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {componentType === 'button' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold">BUTTON LABEL:</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full p-2 bg-[#0F1424] border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
              )}

              {componentType === 'card' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold">CARD TITLE:</label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full p-2 bg-[#0F1424] border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Live Canvas Preview & JSX Code Export */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[#06080E] border-2 border-slate-800 rounded-xl p-8 flex items-center justify-center min-h-[200px] relative overflow-hidden">
                <div className="absolute top-3 left-3 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LIVE COMPONENT PREVIEW</span>
                </div>

                {componentType === 'button' && (
                  <button
                    className={`px-6 py-3 rounded-lg font-mono font-extrabold text-xs transition-all ${
                      variant === 'primary'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-emerald-400 shadow-[0_0_20px_rgba(0,245,160,0.4)]'
                        : variant === 'acid'
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                        : variant === 'violet'
                        ? 'bg-violet-500 hover:bg-violet-400 text-white border-2 border-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-400 shadow-[0_0_20px_rgba(255,184,0,0.4)]'
                    }`}
                  >
                    {buttonText}
                  </button>
                )}

                {componentType === 'card' && (
                  <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 max-w-sm space-y-3 arcade-card shadow-2xl">
                    <h3 className="font-display font-extrabold text-slate-100 text-base">{cardTitle}</h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Arcade design token container with hover glow dynamics and pixel-perfect borders.
                    </p>
                  </div>
                )}

                {componentType === 'badge' && (
                  <span className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,245,160,0.2)]">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>★ VERIFIED DESIGN TOKEN</span>
                  </span>
                )}

                {componentType === 'input' && (
                  <input
                    type="text"
                    placeholder="Search design tokens..."
                    className="w-72 px-4 py-2.5 bg-[#0F1424] border-2 border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[#06080E] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    GENERATED TAILWIND JSX SNIPPET:
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1 bg-[#0F1424] border border-slate-800 hover:border-cyan-400 text-cyan-300 rounded font-bold transition-colors flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#090C15] border border-slate-900 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {getGeneratedCode()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Design Tokens Matrix */}
      {activeTab === 'tokens' && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Acid Green', hex: '#00F5A0', variable: '--accent-emerald' },
              { name: 'Cyber Cyan', hex: '#00E5FF', variable: '--accent-cyan' },
              { name: 'Arcade Yellow', hex: '#FFC700', variable: '--retro-yellow' },
              { name: 'Neon Violet', hex: '#A855F7', variable: '--accent-violet' },
            ].map((tok) => (
              <div key={tok.name} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl space-y-2">
                <div className="h-12 rounded-lg border border-slate-700 shadow-inner" style={{ backgroundColor: tok.hex }} />
                <div className="font-bold text-slate-200">{tok.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{tok.hex} • {tok.variable}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Design Team Sprint Tasks */}
      {activeTab === 'tasks' && (
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { id: 'dt-1', title: 'Audit Dark Mode Color Contrast (WCAG AA)', exp: 30 },
              { id: 'dt-2', title: 'Build Retro Button Drop Shadow Utilities', exp: 35 },
              { id: 'dt-3', title: 'Design Cyberpunk Holographic Telemetry Cards', exp: 40 },
            ].map((t) => {
              const isDone = completedTaskIds.includes(t.id);
              return (
                <div key={t.id} className="p-4 bg-[#06080E] border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className={`font-bold ${isDone ? 'line-through text-emerald-400' : 'text-slate-200'}`}>{t.title}</h4>
                    <div className="text-[10px] text-amber-400 font-bold">★ +{t.exp} EXP Awarded on pass</div>
                  </div>
                  <button
                    onClick={() => handleTaskComplete(t.id, t.exp)}
                    disabled={isDone}
                    className={`px-4 py-2 rounded font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : 'MARK COMPLETED'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
