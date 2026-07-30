import { motion } from 'framer-motion';
import { UserCheck, FileSearch, MessageSquareCode, Award, TrendingUp, Crown } from 'lucide-react';

const steps = [
  {
    step: 'STAGE 01',
    title: 'Sign Up & Profile Creation',
    icon: UserCheck,
    desc: 'Register via CorpVerse Auth, upload your resume, tag your skill set and target industry domain.',
    badge: 'START',
    badgeColor: 'bg-purple-500 text-white',
  },
  {
    step: 'STAGE 02',
    title: 'AI Resume Screening',
    icon: FileSearch,
    desc: 'Apply to open roles across seed companies. Instant screening evaluates role match.',
    badge: 'APPLY',
    badgeColor: 'bg-indigo-500 text-white',
  },
  {
    step: 'STAGE 03',
    title: 'Interactive Chat Interview',
    icon: MessageSquareCode,
    desc: 'Pass screening to enter a multi-turn AI interview. Receive detailed evaluation and feedback.',
    badge: 'INTERVIEW',
    badgeColor: 'bg-cyan-500 text-black',
  },
  {
    step: 'STAGE 04',
    title: 'Job Offer & Onboarding',
    icon: Award,
    desc: 'Accept the offer to convert your account status to Employee and unlock work tasks.',
    badge: 'HIRED',
    badgeColor: 'bg-emerald-400 text-black',
  },
  {
    step: 'STAGE 05',
    title: 'Work Tasks & Promotions',
    icon: TrendingUp,
    desc: 'Complete workplace assignments, gain EXP, and automatically climb from Junior to Senior.',
    badge: 'EMPLOYMENT',
    badgeColor: 'bg-emerald-500 text-black',
  },
  {
    step: 'STAGE 06',
    title: 'Unlock Founder Mode',
    icon: Crown,
    desc: 'Reach 500 EXP, resign from employment, found your company, and start hiring candidates.',
    badge: 'FOUNDER',
    badgeColor: 'bg-[#ffc700] text-black',
  },
];

export default function Journey() {
  return (
    <section id="journey" className="py-20 relative bg-[#0b0e14] font-pixel border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-[#00f5a0] text-black text-xs font-bold rounded border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
            CAREER ARC QUEST MAP
          </div>
          <h2 className="font-pixel-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[3px_3px_0px_#000]">
            The Full Professional Lifecycle
          </h2>
          <p className="text-slate-300 mt-4 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
            Climb from a Level 1 job applicant all the way to an elite Level 50 Startup Founder.
          </p>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="retro-pixel-card p-6 rounded-lg flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-pixel text-xs font-extrabold text-[#ffc700]">
                      {item.step}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border border-black shadow-[1px_1px_0px_#000] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon Box */}
                  <div className="w-11 h-11 rounded bg-[#06080e] border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000]">
                    <Icon className="w-5 h-5 text-[#ffc700]" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-pixel-heading text-base font-bold text-white mb-2 leading-snug drop-shadow-[1px_1px_0px_#000]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

