import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/10 mt-20 relative z-10 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-bold text-lg text-white">
                Corp<span className="text-gradient">Verse</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience the full professional lifecycle in a low-stakes, AI-simulated universe. From job seeker to founder.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">AI Resume Screening</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Mock Chat Interviews</a></li>
              <li><a href="#journey" className="hover:text-cyan-400 transition-colors">EXP & Promotions</a></li>
              <li><a href="#companies" className="hover:text-cyan-400 transition-colors">Founder Mode</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>React 19 + Vite</li>
              <li>Node.js + Express API</li>
              <li>MongoDB Atlas</li>
              <li>Clerk Authentication</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Project
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Built for Sem 7 SGP minor project by team CorpVerse.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:text-white hover:border-violet-500/30 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:text-white hover:border-violet-500/30 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:text-white hover:border-violet-500/30 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CorpVerse Simulation Platform. All rights reserved.</p>
          <p>Designed with Dark Cosmos Design System</p>
        </div>
      </div>
    </footer>
  );
}
