import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Sparkles, Upload, Plus, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ParticleBackground from '../components/ui/ParticleBackground';
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
      setError('Please add at least one skill.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Submit Profile Completion
      await completeProfile({
        skills,
        domainInterest,
        bio: bio.trim(),
      });

      // 2. Upload Resume if selected
      if (resumeFile) {
        await uploadResume(resumeFile);
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to complete profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative">
      <ParticleBackground />
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-2xl w-full">
          <Card className="p-8 sm:p-10 border border-violet-500/30 glow-purple">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Profile Setup</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome, {user?.firstName || 'Explorer'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Configure your career profile to start applying for jobs in the simulation.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Domain Interest */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Target Domain / Industry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DOMAINS.map((domain) => (
                    <button
                      type="button"
                      key={domain}
                      onClick={() => setDomainInterest(domain)}
                      className={`p-3 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        domainInterest === domain
                          ? 'bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{domain}</span>
                        {domainInterest === domain && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Skills & Expertise ({skills.length}/20)
                </label>

                {/* Selected Skills Badges */}
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 rounded-xl bg-slate-900/80 border border-white/10">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-violet-600/20 border border-violet-500/40 text-violet-300"
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
                  {skills.length === 0 && (
                    <span className="text-xs text-slate-500 flex items-center">
                      Select or add skills below...
                    </span>
                  )}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2 mb-3">
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
                    placeholder="Type custom skill and press Add..."
                    className="flex-grow px-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSkill()}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SKILLS.filter((s) => !skills.includes(s)).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handleAddSkill(preset)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/30 transition-all cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Resume (PDF / DOCX, Optional)
                </label>
                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-violet-500/40 transition-colors bg-slate-900/40">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-violet-400" />
                    {resumeFile ? (
                      <span className="text-xs font-semibold text-cyan-300">
                        📁 {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-300">
                          Click or drag resume file here
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Supports PDF or DOCX up to 5MB
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio / Tagline */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Short Bio / Tagline
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell companies brief highlight of your career goals..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <span>Complete Profile & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
