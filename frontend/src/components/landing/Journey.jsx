import { motion } from 'framer-motion';
import { UserCheck, FileSearch, MessageSquareCode, Award, TrendingUp, Crown } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Sign Up & Profile Creation',
    icon: UserCheck,
    desc: 'Register via Clerk, upload your resume, and tag your skill set and target industry domain.',
    badge: 'Onboarding',
    color: 'from-violet-500 to-purple-600',
  },
  {
    step: '02',
    title: 'AI Resume Screening',
    icon: FileSearch,
    desc: 'Apply to open roles across seed companies. Instant screening evaluates role requirements match.',
    badge: 'Job Search',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    step: '03',
    title: 'Interactive Chat Interview',
    icon: MessageSquareCode,
    desc: 'Pass screening to enter a multi-turn AI interview. Receive detailed evaluation and feedback.',
    badge: 'Selection',
    color: 'from-indigo-500 to-cyan-500',
  },
  {
    step: '04',
    title: 'Job Offer & Onboarding',
    icon: Award,
    desc: 'Accept the offer to convert your account status to Employee and unlock your work dashboard.',
    badge: 'Hired',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    step: '05',
    title: 'Work Tasks & Promotions',
    icon: TrendingUp,
    desc: 'Complete workplace assignments, gain EXP, and automatically climb from Junior to Senior level.',
    badge: 'Employment',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    step: '06',
    title: 'Unlock Founder Mode',
    icon: Crown,
    desc: 'Reach 500 EXP, resign from employment, found your company, and start hiring player candidates.',
    badge: 'Entrepreneur',
    color: 'from-amber-400 to-orange-500',
  },
];

export default function Journey() {
  return (
    <section id="journey" className="py-20 relative bg-slate-950/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
            Lifecycle Arc
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The Complete Professional Journey
          </p>
          <p className="text-slate-400 mt-4 text-sm sm:text-base">
            From your first job application to becoming a founder running your own venture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl relative overflow-hidden group"
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-extrabold font-display text-slate-700 group-hover:text-slate-500 transition-colors">
                    {item.step}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-violet-300 border border-white/10">
                    {item.badge}
                  </span>
                </div>

                {/* Icon with gradient circle */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} p-[1px] mb-4 shadow-lg`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
