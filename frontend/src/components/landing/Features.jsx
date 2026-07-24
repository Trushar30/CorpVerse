import { motion } from 'framer-motion';
import { Bot, LineChart, Building2, Check } from 'lucide-react';
import Card from '../ui/Card';

const features = [
  {
    icon: Bot,
    title: 'AI Resume Screening',
    description: 'Submit applications and get instant, warm feedback on your resume tailored to the role.',
    points: ['Requirement matching', 'Friendly chat interviews'],
  },
  {
    icon: LineChart,
    title: 'EXP & Promotion Engine',
    description: 'Complete cozy work tasks to earn EXP and watch your career title grow over time.',
    points: ['Earn EXP for tasks', 'Junior to Senior path'],
  },
  {
    icon: Building2,
    title: 'Founder Mode',
    description: 'Gather enough EXP to start your own little studio and hire other players to help you grow.',
    points: ['Create your company', 'Review applications'],
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-subhead text-2xl sm:text-3xl text-cozy-text-primary tracking-wide">
            What you'll find here
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col justify-start">
                  <div className="mb-6">
                    <div className="w-10 h-10 rounded-lg bg-cozy-elevated border-[1.5px] border-cozy-border-accent shadow-[0_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center mb-6">
                      <Icon className="w-5 h-5 text-cozy-accent-tertiary" />
                    </div>
                    <h3 className="font-sans font-bold text-xl text-cozy-text-primary mb-3">
                      {feat.title}
                    </h3>
                    <p className="font-sans text-[15px] text-cozy-text-secondary leading-relaxed h-[60px]">
                      {feat.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mt-auto pt-6 border-t-[1.5px] border-cozy-border-accent/50">
                    {feat.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 font-sans text-[14px] text-cozy-text-primary">
                        <div className="flex-shrink-0 w-5 h-5 rounded-md bg-cozy-status-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-cozy-status-success" strokeWidth={3} />
                        </div>
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
