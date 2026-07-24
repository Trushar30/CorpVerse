import { motion } from 'framer-motion';
import Card from '../ui/Card';

const steps = [
  {
    step: '01',
    title: 'Profile Creation',
    desc: 'Unpack your bags and set up your cozy profile.',
    badge: 'WELCOME',
  },
  {
    step: '02',
    title: 'Resume Screening',
    desc: 'Send out your little paper airplanes to seed companies.',
    badge: 'APPLY',
  },
  {
    step: '03',
    title: 'Chat Interview',
    desc: 'Have a friendly chat with our AI to see if it\'s a fit.',
    badge: 'MEET',
  },
  {
    step: '04',
    title: 'Job Offer',
    desc: 'Receive your official welcome letter and get hired.',
    badge: 'START',
  },
  {
    step: '05',
    title: 'Work & Promotions',
    desc: 'Water your skills daily to earn EXP and grow your title.',
    badge: 'GROW',
  },
  {
    step: '06',
    title: 'Founder Mode',
    desc: 'Build your own little studio and hire others.',
    badge: 'BUILD',
  },
];

export default function Journey() {
  return (
    <section id="journey" className="py-24 relative bg-cozy-elevated/30 border-y-[1.5px] border-cozy-border-accent">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-subhead text-2xl sm:text-3xl text-cozy-text-primary tracking-wide mb-4">
            The Journey
          </h2>
          <p className="font-sans text-[16px] text-cozy-text-secondary max-w-lg mx-auto">
            Take a stroll through the professional lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 relative">
          {/* Connecting Path - visible on large screens */}
          <div className="hidden lg:block absolute top-[50%] left-[10%] right-[10%] h-[2px] bg-cozy-border-accent border-dashed border-t-[2px] opacity-30 z-0"></div>

          {steps.map((item, index) => {
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative z-10"
              >
                <Card className="h-full group">
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-display text-4xl text-cozy-accent-secondary opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                      {item.step}
                    </span>
                    <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-cozy-elevated border-[1.5px] border-cozy-border-subtle text-cozy-text-muted">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-[18px] text-cozy-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="font-sans text-[15px] text-cozy-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
