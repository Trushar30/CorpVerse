import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function CTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cozy-surface rounded-3xl p-10 sm:p-16 border-[1.5px] border-cozy-border-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_0_rgba(0,0,0,0.25)] text-center relative overflow-hidden">

          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cozy-accent-primary/10 via-transparent to-cozy-accent-tertiary/10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 space-y-6"
          >
            <h2 className="font-hand text-4xl sm:text-5xl text-cozy-text-primary mb-4 rotate-[-2deg]">
              Ready when you are.
            </h2>

            <p className="font-sans text-[17px] text-cozy-text-secondary max-w-lg mx-auto leading-relaxed mb-8">
              Your CorpVerse is waiting. No pressure, no leaderboards, just you and the journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/sign-up">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-10">
                  Start free
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto px-10 border-[1.5px] border-transparent hover:border-cozy-border-accent">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
