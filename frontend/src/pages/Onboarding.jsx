import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Upload,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Cpu,
  Leaf,
  Activity,
  DollarSign,
  Palette,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Compass,
  Rocket,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { completeProfile, uploadResume } from '../api/profile';
import { getDomains } from '../api/companies';
import OptionWheel from '../components/common/OptionWheel';

const PRESET_DOMAIN_METADATA = {
  Technology: {
    icon: Cpu,
    title: 'Technology & Cloud',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/5',
    border: 'border-emerald-500',
    badge: 'HIGH DEMAND',
  },
  'Clean Energy': {
    icon: Leaf,
    title: 'Clean Energy & Sustainability',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/5',
    border: 'border-cyan-500',
    badge: 'GROWING',
  },
  Healthcare: {
    icon: Activity,
    title: 'Healthcare & Biotech',
    color: 'rose',
    gradient: 'from-rose-500/20 to-pink-500/5',
    border: 'border-rose-500',
    badge: 'STABLE',
  },
  Finance: {
    icon: DollarSign,
    title: 'Finance & Fintech',
    color: 'amber',
    gradient: 'from-amber-500/20 to-yellow-500/5',
    border: 'border-amber-500',
    badge: 'HIGH REWARD',
  },
  'Design & Media': {
    icon: Palette,
    title: 'Design & Digital Media',
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/5',
    border: 'border-violet-500',
    badge: 'CREATIVE',
  },
};

const DEFAULT_META = {
  icon: Compass,
  color: 'indigo',
  gradient: 'from-indigo-500/20 to-blue-500/5',
  border: 'border-indigo-500',
  badge: 'ACTIVE SECTOR',
};

const INITIAL_DOMAIN_CARDS = [
  {
    id: 'Technology',
    title: 'Technology & Cloud',
    desc: 'Software development, AI, cloud infra & tech platforms',
    icon: Cpu,
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/5',
    border: 'border-emerald-500',
    badge: 'HIGH DEMAND',
  },
  {
    id: 'Clean Energy',
    title: 'Clean Energy & Sustainability',
    desc: 'Renewables, smart grid, EV tech & green engineering',
    icon: Leaf,
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/5',
    border: 'border-cyan-500',
    badge: 'GROWING',
  },
  {
    id: 'Healthcare',
    title: 'Healthcare & Biotech',
    desc: 'Healthtech, medtech, clinical analytics & bio discovery',
    icon: Activity,
    color: 'rose',
    gradient: 'from-rose-500/20 to-pink-500/5',
    border: 'border-rose-500',
    badge: 'STABLE',
  },
  {
    id: 'Finance',
    title: 'Finance & Fintech',
    desc: 'Fintech systems, quantitative trading & risk management',
    icon: DollarSign,
    color: 'amber',
    gradient: 'from-amber-500/20 to-yellow-500/5',
    border: 'border-amber-500',
    badge: 'HIGH REWARD',
  },
  {
    id: 'Design & Media',
    title: 'Design & Digital Media',
    desc: 'UI/UX design, brand systems, content & product design',
    icon: Palette,
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/5',
    border: 'border-violet-500',
    badge: 'CREATIVE',
  },
];

const PRESET_SKILLS = [
  'JavaScript',
  'React.js',
  'Node.js',
  'Python',
  'Data Analysis',
  'SQL',
  'UI/UX Design',
  'Project Management',
  'Figma',
  'Cloud Infrastructure',
  'Machine Learning',
  'Strategic Planning',
  'Docker',
  'TailwindCSS',
];

const STEPS = [
  { id: 1, label: '01_HANDLE', title: 'Operator Username' },
  { id: 2, label: '02_SECTOR', title: 'Target Operational Sector' },
  { id: 3, label: '03_SKILLS', title: 'Capabilities Matrix' },
  { id: 4, label: '04_SPEC', title: 'Resume Spec Upload' },
  { id: 5, label: '05_LAUNCH', title: 'Persona Confirmation' },
];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState(user?.name || '');
  const [domainCards, setDomainCards] = useState(INITIAL_DOMAIN_CARDS);
  const [domainInterest, setDomainInterest] = useState('Technology');
  const [skills, setSkills] = useState(['JavaScript', 'React.js']);
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [bio, setBio] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name && !username) {
      setUsername(user.name);
    }
  }, [user]);

  useEffect(() => {
    getDomains()
      .then((res) => {
        const fetchedDomains = res.data || [];
        if (fetchedDomains.length > 0) {
          const mappedCards = fetchedDomains.map((d) => {
            const preset = PRESET_DOMAIN_METADATA[d.name] || DEFAULT_META;
            return {
              id: d.name,
              title: preset.title || d.name,
              desc: d.description || `${d.name} industry sector`,
              icon: preset.icon,
              color: preset.color,
              gradient: preset.gradient,
              border: preset.border,
              badge: preset.badge,
            };
          });
          setDomainCards(mappedCards);
          setDomainInterest((prev) =>
            mappedCards.some((c) => c.id === prev) ? prev : mappedCards[0].id
          );
        }
      })
      .catch((err) => {
        console.error('Failed to fetch admin domains:', err);
      });
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const val = skillToAdd || skillInput.trim();
    if (val && !skills.includes(val) && skills.length < 20) {
      setSkills([...skills, val]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!username.trim() || username.trim().length < 2) {
        setError('Please enter a username with at least 2 characters.');
        return;
      }
    }
    if (currentStep === 3 && skills.length === 0) {
      setError('Please add at least 1 skill to proceed.');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Please add at least one skill to initialize profile.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await completeProfile({
        name: username.trim(),
        skills,
        domainInterest,
        bio: bio.trim(),
      });

      if (resumeFile) {
        await uploadResume(resumeFile);
      }

      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to complete persona setup. Please retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = Math.round((currentStep / 5) * 100);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-8 relative z-10">
        <div className="max-w-3xl w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">

          {/* Header Bar */}
          <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                [PERSONA_INITIALIZATION_PROTOCOL] :: STEP 0{currentStep}/05
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                PROGRESS: {progressPercent}%
              </span>
            </div>
          </div>

          {/* Glowing Progress Bar */}
          <div className="w-full h-1 bg-slate-900 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400"
              initial={{ width: '20%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Interactive Step Navigator Header */}
          <div className="p-4 bg-[#06080E]/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (
                      step.id < currentStep ||
                      (step.id === 2 && username.trim().length >= 2) ||
                      (step.id === 3 && skills.length > 0)
                    ) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold shadow-[0_0_10px_rgba(0,245,160,0.2)]'
                      : isCompleted
                      ? 'bg-slate-900 text-slate-300 border border-slate-800'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className="text-[11px] font-bold">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Form Content */}
          <div className="p-6 sm:p-8 space-y-6">

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">

              {/* STEP 1: OPERATOR USERNAME */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                      <Terminal className="w-4 h-4" />
                      <span>STEP 01 / 05 :: OPERATOR IDENTITY</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                      Set Your CorpVerse Handle & Username
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      This operator handle identifies your persona across AI interview screeners, system logs, leaderboards, and company applications.
                    </p>
                  </div>

                  <div className="bg-[#06080E] border border-slate-800 rounded-xl p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        OPERATOR HANDLE / USERNAME:
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. CyberOperator_99"
                          maxLength={100}
                          className="w-full pl-9 pr-4 py-3 bg-[#0F1424] border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>MIN 2 CHARACTERS • LETTERS, NUMBERS, SPACES ALLOWED</span>
                        <span>{username.trim().length} / 100</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0F1424] border border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                        {username.trim() ? username.trim()[0].toUpperCase() : 'OP'}
                      </div>
                      <div className="space-y-0.5 font-mono">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">SYSTEM IDENTITY BADGE:</span>
                        <span className="text-xs font-bold text-emerald-300 block">
                          {username.trim() ? `@${username.trim()}` : '@unassigned_operator'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: TARGET DOMAIN SECTOR */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>STEP 02 / 05 :: OPERATIONAL DOMAIN</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                      Select Your Target Industry Sector
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Scroll or drag the 3D OptionWheel below to pick your operational target sector.
                    </p>
                  </div>

                  {/* OptionWheel & Active Spec Split View */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    {/* OptionWheel 3D Radial Selector */}
                    <div className="md:col-span-5 bg-[#06080E] border border-slate-800 rounded-xl p-3 flex flex-col justify-between h-[300px] relative overflow-hidden shadow-inner">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between border-b border-slate-800/80 pb-2 z-10">
                        <span>✦ 3D DOMAIN WHEEL</span>
                        <span className="text-emerald-400 text-[9px]">SCROLL / DRAG</span>
                      </div>
                      
                      <div className="relative flex-grow w-full">
                        <OptionWheel
                          items={domainCards.map((c) => c.title || c.id)}
                          defaultSelected={Math.max(0, domainCards.findIndex((c) => c.id === domainInterest))}
                          onChange={(index) => {
                            const selectedCard = domainCards[index];
                            if (selectedCard) setDomainInterest(selectedCard.id);
                          }}
                          textColor="#64748b"
                          activeColor="#00f5a0"
                          side="left"
                          fontSize={0.95}
                          spacing={1.8}
                          curve={1.2}
                          tilt={10}
                          blur={1.0}
                          fade={0.35}
                          inset={16}
                          draggable
                        />
                      </div>

                      <div className="text-[9px] text-slate-500 font-mono text-center pt-1 border-t border-slate-800/80 z-10">
                        ▲ USE MOUSE WHEEL, DRAG, OR ARROW KEYS ▼
                      </div>
                    </div>

                    {/* Active Domain Info Card */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      {(() => {
                        const selectedCard = domainCards.find((c) => c.id === domainInterest) || domainCards[0];
                        const Icon = selectedCard?.icon || Cpu;
                        return (
                          <div className={`h-full p-6 rounded-xl border flex flex-col justify-between space-y-4 bg-gradient-to-br ${selectedCard?.gradient || 'from-emerald-500/20 to-teal-500/5'} ${selectedCard?.border || 'border-emerald-500'} shadow-[0_0_20px_rgba(0,245,160,0.15)] relative overflow-hidden`}>
                            <div className="flex items-center justify-between">
                              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                                <Icon className="w-7 h-7" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold uppercase">
                                  {selectedCard?.badge || 'ACTIVE'}
                                </span>
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                                SELECTED OPERATIONAL SECTOR:
                              </div>
                              <h3 className="font-sans font-extrabold text-lg text-slate-100">
                                {selectedCard?.title || selectedCard?.id}
                              </h3>
                              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                {selectedCard?.desc}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                              <span>MATCHING ENGINE: ACTIVE</span>
                              <span className="text-emerald-400 font-bold">READY FOR STEP 03 →</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Quick Pill Selector for Direct Tap */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      QUICK SECTOR TAGS:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {domainCards.map((card) => {
                        const isSelected = domainInterest === card.id;
                        return (
                          <button
                            type="button"
                            key={card.id}
                            onClick={() => setDomainInterest(card.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(0,245,160,0.2)]'
                                : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{card.title || card.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SKILLS MATRIX */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>STEP 03 / 05 :: CAPABILITIES MATRIX</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                      Build Your Skills & Tech Stack Matrix
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Select or add skill tags ({skills.length}/20). AI recruiters parse these tags for automated candidate ranking.
                    </p>
                  </div>

                  {/* Active Selected Skills Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span>ACTIVE SKILL TAGS ({skills.length}/20):</span>
                      <span className="text-emerald-400">{skills.length > 0 ? '✓ READY' : '⚠️ AT LEAST 1 REQUIRED'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-[#06080E] border border-slate-800 min-h-[60px] items-center">
                      {skills.map((skill) => (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold shadow-[0_0_8px_rgba(0,245,160,0.1)]"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-400 transition-colors p-0.5 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {skills.length === 0 && (
                        <span className="text-slate-500 text-xs italic">No skill tags selected yet. Pick from below or type custom skills.</span>
                      )}
                    </div>
                  </div>

                  {/* Custom Skill Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type custom skill (e.g. GraphQL, PyTorch) and press Add..."
                      className="flex-grow px-3.5 py-2.5 bg-[#06080E] border border-slate-800 rounded-lg text-xs focus:border-cyan-500 focus:outline-none text-slate-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ADD</span>
                    </button>
                  </div>

                  {/* Quick Preset Skill Suggestions */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      QUICK ADD SUGGESTED SKILLS:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SKILLS.filter((s) => !skills.includes(s)).map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => handleAddSkill(preset)}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900 transition-all font-mono"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: RESUME SPEC UPLOAD */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-violet-400 text-xs font-bold">
                      <Upload className="w-4 h-4" />
                      <span>STEP 04 / 05 :: RESUME SPECIFICATION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                      Upload Candidate Resume Spec (Optional)
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Attach your resume spec (PDF or DOCX, max 5MB). AI screeners extract experience metrics for job matching.
                    </p>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files?.[0]) setResumeFile(e.dataTransfer.files[0]);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all bg-[#06080E] ${
                      isDragOver
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(0,245,160,0.2)]'
                        : resumeFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                      {resumeFile ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                            <FileCheck className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-emerald-300 block">
                              📄 {resumeFile.name}
                            </span>
                            <span className="text-xs text-slate-400 block font-mono">
                              File size: {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Format: {resumeFile.name.split('.').pop().toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                            ✓ SPECIFICATION ATTACHED
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                            <Upload className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-200 block font-sans">
                              Drag and drop candidate resume spec here
                            </span>
                            <span className="text-xs text-slate-400 block font-sans">
                              or click to browse local files (PDF or DOCX up to 5MB)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            OPTIONAL STEP — YOU CAN SKIP AND UPLOAD LATER
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {resumeFile && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove Attached Resume</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 5: EXECUTIVE BIO & LAUNCH CONFIRMATION */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Rocket className="w-4 h-4" />
                      <span>STEP 05 / 05 :: PERSONA CONFIRMATION & LAUNCH</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                      Final Protocol Review & Execution
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Add an executive summary bio and verify your candidate parameters before deploying into the CorpVerse command deck.
                    </p>
                  </div>

                  {/* Summary Spec Card */}
                  <div className="bg-[#06080E] border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <span className="font-bold text-slate-200 text-xs uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        PERSONA SPECIFICATION SNAPSHOT
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        READY TO DEPLOY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Operator Username:</span>
                        <div className="text-emerald-300 font-bold">@{username.trim() || 'Operator'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Target Sector:</span>
                        <div className="text-emerald-300 font-bold">{domainInterest}</div>
                      </div>
                      <div className="space-y-1 col-span-full">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Resume Spec:</span>
                        <div className="text-cyan-300 font-bold">{resumeFile ? `📄 ${resumeFile.name}` : 'Not Uploaded (Optional)'}</div>
                      </div>
                      <div className="col-span-full space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Skills Matrix ({skills.length}):</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Bio */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                      Candidate Executive Summary Bio (Optional)
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a short summary of your career background and ambitions for AI screeners..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-[#06080E] border border-slate-800 rounded-lg text-xs focus:border-amber-500 focus:outline-none resize-none text-slate-100 font-mono"
                    />
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Footer Controls */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>[BACK]</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center gap-2"
                >
                  <span>[CONTINUE TO STEP 0{currentStep + 1}]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_20px_rgba(0,245,160,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isLoading ? 'INITIALIZING PERSONA...' : '[INITIALIZE PERSONA & ENTER DECK]'}</span>
                  <Rocket className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
