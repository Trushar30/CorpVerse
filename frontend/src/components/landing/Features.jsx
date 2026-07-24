import { motion } from 'framer-motion';
import { Bot, LineChart, Building2, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';

const features = [
  {
    icon: Bot,
    color: 'text-violet-400',
    bgColor: 'bg-violet-600/20',
    borderColor: 'border-violet-500/30',
    title: 'AI Resume Screening & Chat Interviews',
    description:
      'Submit your application to seed companies or player companies. Experience instant AI screening and dynamic multi-turn chat interviews contextualized to your specific resume and target role.',
    points: [
      'Automated resume requirement matching',
      'Context-aware multi-turn AI interview chat',
      'Detailed feedback on rejection with 48h cooldown',
    ],
  },
  {
    icon: LineChart,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    title: 'Transparent EXP & Promotion Growth',
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
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    title: 'Founder Mode & Team Hiring',
    description:
      'Accumulate 500 EXP to unlock Founder Mode. Resign from employment, register your own venture, post open roles, and evaluate applicants through the platform hiring engine.',
    points: [
      'Create and brand your company',
      'Post custom roles with targeted skill sets',
      'Review player applications & build your team',
    ],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
            Core Modules
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed to Bridge the Academic to Professional Gap
          </p>
          <p className="text-slate-400 mt-4 text-sm sm:text-base">
            Every component in CorpVerse mirrors real-world workplace mechanics while keeping the stakes low and the learning curve high.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col justify-between p-8">
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${feat.bgColor} ${feat.color} border ${feat.borderColor} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feat.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                      {feat.description}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-white/5">
                    {feat.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 ${feat.color} shrink-0`} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
