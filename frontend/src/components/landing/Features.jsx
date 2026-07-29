import { motion } from 'framer-motion';
import { Bot, LineChart, Building2, CheckCircle2, Shield, Flame, Award } from 'lucide-react';

const features = [
  {
    icon: Bot,
    questTag: 'QUEST #01',
    levelBadge: 'LVL 1-5',
    tagColor: 'bg-[#a855f7] text-white',
    borderColor: 'border-[#a855f7]',
    title: 'AI Screening & Chat Interviews',
    description:
      'Submit your application to seed companies or player enterprises. Experience instant AI screening and multi-turn chat interviews contextualized to your specific resume.',
    points: [
      'Automated resume requirement matching',
      'Context-aware multi-turn AI interview chat',
      'Detailed feedback on rejection with 48h cooldown',
    ],
  },
  {
    icon: LineChart,
    questTag: 'QUEST #02',
    levelBadge: 'LVL 6-15',
    tagColor: 'bg-[#00f5a0] text-black',
    borderColor: 'border-[#00f5a0]',
    title: 'EXP & Promotion Growth Arc',
    description:
      'Once hired as an employee, execute assigned work tasks to earn EXP. Track your growth progress directly toward structured promotion thresholds.',
    points: [
      'Task execution with EXP rewards',
      'Automatic promotion from Junior → Mid → Senior',
      'Transparent EXP audit trail & career history',
    ],
  },
  {
    icon: Building2,
    questTag: 'QUEST #03',
    levelBadge: 'LVL 16+',
    tagColor: 'bg-[#ffc700] text-black',
    borderColor: 'border-[#ffc700]',
    title: 'Founder Mode & Team Hiring',
    description:
      'Accumulate 500 EXP to unlock Founder Mode. Resign from employment, register your own venture, post open roles, and evaluate applicants through the hiring engine.',
    points: [
      'Create and brand your company',
      'Post custom roles with targeted skill sets',
      'Review player applications & build your team',
    ],
  },
];

export default function Features() {
  return (
    <section id="quests" className="py-20 relative bg-[#090c15] font-pixel border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-[#ffc700] text-black text-xs font-bold rounded border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
            EXPLORE 250+ HOURS OF CAREER QUESTS
          </div>
          <h2 className="font-pixel-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[3px_3px_0px_#000]">
            Master the Corporate World
          </h2>
          <p className="text-slate-300 mt-4 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
            Every module in CorpVerse mirrors real-world workplace mechanics in a gamified 8-bit RPG format.
          </p>
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="retro-pixel-card p-6 sm:p-8 flex flex-col justify-between rounded-lg"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-2.5 py-1 text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_#000] rounded-xs ${feat.tagColor}`}>
                      {feat.questTag}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#1e293b] text-slate-200 border border-black rounded">
                      {feat.levelBadge}
                    </span>
                  </div>

                  {/* Quest Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-[#0b0e14] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                      <Icon className="w-5 h-5 text-[#ffc700]" />
                    </div>
                    <h3 className="font-pixel-heading text-lg font-bold text-white leading-snug drop-shadow-[1px_1px_0px_#000]">
                      {feat.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Key Points Checklist */}
                <ul className="space-y-3 pt-5 border-t-2 border-slate-800">
                  {feat.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#00f5a0] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

