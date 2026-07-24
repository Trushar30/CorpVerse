import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Home, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const seedCompanies = [
  {
    name: 'NovaTech',
    domain: 'Technology',
    rolesCount: 3,
    status: 'Hiring',
    badgeColor: 'bg-cozy-status-success/20 text-cozy-status-success border-cozy-status-success/30',
  },
  {
    name: 'GreenPulse',
    domain: 'Clean Energy',
    rolesCount: 2,
    status: 'Featured',
    badgeColor: 'bg-cozy-accent-primary/20 text-cozy-accent-primary border-cozy-accent-primary/30',
  },
  {
    name: 'MediCore',
    domain: 'Healthcare',
    rolesCount: 4,
    status: 'Startup pick',
    badgeColor: 'bg-cozy-accent-tertiary/20 text-cozy-accent-tertiary border-cozy-accent-tertiary/30',
  },
  {
    name: 'FinEdge',
    domain: 'Finance',
    rolesCount: 1,
    status: 'Hiring',
    badgeColor: 'bg-cozy-status-success/20 text-cozy-status-success border-cozy-status-success/30',
  },
  {
    name: 'CreativeForge',
    domain: 'Design',
    rolesCount: 3,
    status: 'Hiring',
    badgeColor: 'bg-cozy-status-success/20 text-cozy-status-success border-cozy-status-success/30',
  },
];

export default function Companies() {
  return (
    <section id="companies" className="py-24 relative">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-subhead text-2xl sm:text-3xl text-cozy-text-primary tracking-wide mb-4">
            First Stop
          </h2>
          <p className="font-sans text-[16px] text-cozy-text-secondary max-w-lg mx-auto">
            Wander into town and find your first opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
          {seedCompanies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col justify-between p-6 group cursor-pointer hover:bg-cozy-elevated/50">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-2 rounded-lg bg-cozy-base border-[1.5px] border-cozy-border-accent shadow-[0_2px_0_rgba(0,0,0,0.25)] group-hover:-translate-y-1 transition-transform">
                      <Home className="w-5 h-5 text-cozy-accent-primary" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-sans font-bold border-[1.5px] ${company.badgeColor}`}
                    >
                      {company.status}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-cozy-text-primary mb-1">
                    {company.name}
                  </h3>
                  <p className="font-sans text-[13px] text-cozy-text-muted mb-6">
                    {company.domain}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-[1.5px] border-cozy-border-accent/50 text-sm">
                  <span className="flex items-center gap-1.5 font-sans font-bold text-cozy-text-secondary">
                    <Briefcase className="w-4 h-4" />
                    {company.rolesCount} Roles
                  </span>
                  <span className="font-sans font-bold text-[13px] text-cozy-accent-primary group-hover:underline flex items-center">
                    Wander in <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Call to action card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="h-full flex flex-col justify-center items-center text-center p-6 border-dashed border-[2px] border-cozy-border-accent bg-transparent hover:bg-cozy-surface/50">
              <div className="w-10 h-10 rounded-lg bg-cozy-elevated border-[1.5px] border-cozy-border-accent shadow-[0_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center mb-4 text-cozy-text-secondary">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-cozy-text-primary mb-2">
                Your company here?
              </h3>
              <p className="font-sans text-[13px] text-cozy-text-secondary mb-5 px-4">
                Earn enough EXP to unlock Founder Mode.
              </p>
              <Link to="/sign-up">
                <span className="font-sans font-bold text-[14px] text-cozy-accent-primary hover:underline flex items-center">
                  Plant a flag <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
