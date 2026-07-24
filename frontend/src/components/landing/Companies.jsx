import { motion } from 'framer-motion';
import { Building, Sparkles, ChevronRight, Briefcase } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const seedCompanies = [
  {
    name: 'NovaTech Solutions',
    domain: 'Technology',
    tagline: 'Building the future, one deploy at a time',
    rolesCount: 3,
    color: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
  },
  {
    name: 'GreenPulse Energy',
    domain: 'Clean Energy',
    tagline: 'Powering a sustainable tomorrow',
    rolesCount: 3,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    name: 'MediCore Health',
    domain: 'Healthcare',
    tagline: 'Intelligence for healthier lives',
    rolesCount: 3,
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
  {
    name: 'FinEdge Capital',
    domain: 'Finance',
    tagline: 'Edge in every trade',
    rolesCount: 3,
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    name: 'CreativeForge Studios',
    domain: 'Design & Media',
    tagline: 'Where ideas take shape',
    rolesCount: 3,
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
];

export default function Companies() {
  return (
    <section id="companies" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
            Initial Job Market
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            5 Pre-Built Seed Companies
          </p>
          <p className="text-slate-400 mt-4 text-sm sm:text-base">
            Explore active job listings across technology, clean energy, healthcare, finance, and creative industries right on Day 1.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {seedCompanies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-white">
                      <Building className="w-5 h-5 text-purple-400" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${company.color}`}
                    >
                      {company.domain}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {company.name}
                  </h3>
                  <p className="text-xs text-slate-400 italic mb-4">
                    "{company.tagline}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    {company.rolesCount} Open Roles
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Seed Company
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Call to action card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="h-full flex flex-col justify-center items-center text-center p-6 border-dashed border-violet-500/30 bg-violet-950/20">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4 text-violet-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Your Company Here?
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Accumulate 500 EXP to unlock Founder Mode and list your company on the market.
              </p>
              <Link to="/sign-up">
                <Button variant="outline" size="sm">
                  <span>Start Journey</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
