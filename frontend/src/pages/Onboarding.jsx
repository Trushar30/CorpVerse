import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Terminal,
  Sparkles,
  Upload,
  Plus,
  X,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  FileCode,
  Zap,
  Radio
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { completeProfile, uploadResume } from '../api/profile';

const DOMAINS = [
  'Technology',
  'Clean Energy',
  'Healthcare',
  'Finance',
  'Design & Media',
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
];

export default function Onboarding() {
  let user = null;
  try {
    const userRes = useUser();
    user = userRes?.user;
  } catch (err) {
    user = null;
  }
  const navigate = useNavigate();

  const [skills, setSkills] = useState(['JavaScript', 'React.js']);
  const [skillInput, setSkillInput] = useState('');
  const [domainInterest, setDomainInterest] = useState('Technology');
  const [bio, setBio] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        skills,
        domainInterest,
        bio: bio.trim(),
      });

      if (resumeFile) {
        await uploadResume(resumeFile);
      }

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

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-2xl w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Header Chamber Strip */}
          <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                [PERSONA_INITIALIZATION_PROTOCOL] :: STEP 01/01
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              FSM_STATE: REGISTERING
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-100">
                Welcome, {user?.firstName || 'Explorer'}!
              </h1>
              <p className="text-xs text-slate-400">
                Configure candidate parameters to seed your initial profile into the multi-agent market loop.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Target Domain */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  01. Target Domain Sector
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOMAINS.map((domain) => (
                    <button
                      type="button"
                      key={domain}
                      onClick={() => setDomainInterest(domain)}
                      className={`p-3 rounded border text-left transition-all ${
                        domainInterest === domain
                          ? 'bg-[#151B2E] border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(0,245,160,0.15)] font-bold'
                          : 'bg-[#06080E] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span>{domain}</span>
                        {domainInterest === domain && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Matrix */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  02. Skills & Capabilities Matrix ({skills.length}/20)
                </label>

                <div className="flex flex-wrap gap-2 p-3 rounded bg-[#06080E] border border-slate-800 min-h-[44px]">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

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
                    placeholder="Type skill tag and press Add..."
                    className="flex-grow px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_SKILLS.filter((s) => !skills.includes(s)).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handleAddSkill(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume File Upload Node */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  03. Resume Spec (PDF / DOCX)
                </label>
                <div className="relative border border-dashed border-slate-800 rounded p-5 text-center hover:border-emerald-500/50 bg-[#06080E] transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <Upload className="w-5 h-5 text-cyan-400" />
                    {resumeFile ? (
                      <span className="text-xs font-bold text-emerald-400">
                        📄 {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click or drag candidate resume spec here
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tagline / Bio */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  04. Candidate Executive Summary
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summary of career objectives for seed AI recruiters..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isLoading ? 'INITIALIZING PERSONA...' : '[COMPLETE SETUP & ENTER COMMAND DECK]'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
