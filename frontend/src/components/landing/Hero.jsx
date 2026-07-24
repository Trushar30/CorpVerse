import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden border-b-[1.5px] border-cozy-border-accent bg-cozy-base/50">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">

        {/* Floating decoration sprite placeholder */}
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 p-3 rounded-xl bg-cozy-elevated border-[1.5px] border-cozy-border-accent shadow-[0_4px_0_rgba(0,0,0,0.25)]"
        >
            <Sparkles className="w-6 h-6 text-cozy-accent-tertiary" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-2xl sm:text-3xl md:text-[40px] tracking-tight text-cozy-text-primary max-w-4xl mx-auto leading-[1.4] mb-8"
        >
          Your Career Universe<br/>Starts Here
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-sans text-lg text-cozy-text-secondary max-w-[520px] mx-auto mb-12 leading-relaxed"
        >
          A cozy little career sim where you grow from job seeker to founder, one friendly quest at a time.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link to="/sign-up">
            <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]">
              ▶ Begin your journey
            </Button>
          </Link>
          <a href="#journey">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              Take a peek inside →
            </Button>
          </a>
        </motion.div>

        {/* Hand-drawn nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-2 text-cozy-accent-tertiary"
        >
            <ArrowDown className="w-5 h-5 animate-bounce" />
            <span className="font-hand text-xl -rotate-2">
                psst — scroll down, it's nice down here
            </span>
        </motion.div>

      </div>
    </section>
  );
}
