import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden bg-[#0f172a] border-b-4 border-white">
      <div className="absolute inset-0 bg-[url('/src/assets/office-theme.jpeg')] bg-cover bg-center opacity-30 z-0"></div>
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/20 via-purple-600/15 to-cyan-500/20 rounded-none blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none pixel-panel border border-violet-500/30 text-xs font-semibold text-violet-300 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Next Generation Career Simulation Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6"
        >
          Your Career Universe <br />
          <span className="text-gradient">Starts Here</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Experience the complete professional journey — from job applications and AI interviews to earning EXP, getting promoted, and founding your own company.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/sign-up">
            <Button variant="glow" size="lg" className="w-full sm:w-auto">
              <span>Launch Your Career</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <a href="#journey">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Career Arc
            </Button>
          </a>
        </motion.div>

        {/* Feature Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="pixel-card p-5 rounded-none flex items-center gap-4 text-left">
            <div className="p-3 rounded-none bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">AI Screening & Feedback</h3>
              <p className="text-xs text-slate-400">Instant actionable insights on every rejection</p>
            </div>
          </div>

          <div className="pixel-card p-5 rounded-none flex items-center gap-4 text-left">
            <div className="p-3 rounded-none bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">EXP Promotion Engine</h3>
              <p className="text-xs text-slate-400">Complete tasks to climb from Junior to Senior</p>
            </div>
          </div>

          <div className="pixel-card p-5 rounded-none flex items-center gap-4 text-left">
            <div className="p-3 rounded-none bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Founder Ecosystem</h3>
              <p className="text-xs text-slate-400">Unlock founder mode and hire real applicants</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
