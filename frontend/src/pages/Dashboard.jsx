import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Compass,
  Briefcase,
  Rocket,
  Sparkles,
  Search,
  Building,
  Award,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  FileText,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ParticleBackground from '../components/ui/ParticleBackground';
import { getCompanies } from '../api/companies';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  let user = null;
  try {
    const userRes = useUser();
    user = userRes?.user;
  } catch (err) {
    user = null;
  }

  const [activeTab, setActiveTab] = useState('job-seeker');
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync active tab from URL path
  useEffect(() => {
    if (location.pathname.includes('/employee')) {
      setActiveTab('employee');
    } else if (location.pathname.includes('/founder')) {
      setActiveTab('founder');
    } else {
      setActiveTab('job-seeker');
    }
  }, [location.pathname]);

  // Fetch seed companies on mount
  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        setIsLoadingCompanies(true);
        const data = await getCompanies({ domain: selectedDomain === 'All' ? '' : selectedDomain });
        setCompanies(data.data?.companies || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompaniesData();
  }, [selectedDomain]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative">
      <ParticleBackground />
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Status: Job Seeker</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore active job openings across companies, apply for roles, and track your progress.
            </p>
          </div>

          {/* User Progress Mini Badge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 w-full md:w-auto relative z-10">
            <div className="p-3 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Current EXP:</span>
                <span className="text-sm font-bold text-white">0 / 500 EXP</span>
              </div>
              <div className="w-48 h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 w-[0%]" />
              </div>
              <span className="text-[10px] text-amber-400 mt-1 block font-medium">
                500 EXP required to unlock Founder Mode
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Role Tabs Mobile Nav */}
        <div className="flex md:hidden items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 mb-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange('job-seeker')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap ${
              activeTab === 'job-seeker'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            Job Seeker
          </button>
          <button
            onClick={() => handleTabChange('employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap ${
              activeTab === 'employee'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Employee
          </button>
          <button
            onClick={() => handleTabChange('founder')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap ${
              activeTab === 'founder'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <Rocket className="w-4 h-4" />
            Founder
          </button>
        </div>

        {/* TAB 1: JOB SEEKER DASHBOARD */}
        {activeTab === 'job-seeker' && (
          <div className="space-y-8">
            {/* Filter Bar */}
            <Card className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
                  Domain:
                </span>
                {['All', 'Technology', 'Clean Energy', 'Healthcare', 'Finance', 'Design & Media'].map(
                  (dom) => (
                    <button
                      key={dom}
                      onClick={() => setSelectedDomain(dom)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        selectedDomain === dom
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                          : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dom}
                    </button>
                  )
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search roles or companies..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </Card>

            {/* Companies & Open Roles Section */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-violet-400" />
                <span>Companies Market Listings</span>
              </h2>

              {isLoadingCompanies ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="glass-panel h-48 rounded-2xl animate-pulse p-6" />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <Card className="text-center p-12">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No companies found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Try selecting a different domain filter or clear your search term.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies
                    .filter((c) =>
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.domain.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((comp) => (
                      <Card key={comp._id} className="flex flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30">
                              {comp.domain}
                            </span>
                            {comp.isSeedCompany && (
                              <span className="text-[10px] font-medium text-amber-400">
                                ★ Seed
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-white mb-1">
                            {comp.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                            {comp.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                            {comp.openRoleCount} Open Roles
                          </span>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              alert(`Viewing roles for ${comp.name}. Screening pipeline active!`)
                            }
                          >
                            Apply Roles
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>

            {/* My Applications Section */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>My Active Applications</span>
              </h2>

              <Card className="p-6">
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm">You haven't submitted any job applications yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select an open role from the market above to initiate AI screening.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYEE DASHBOARD */}
        {activeTab === 'employee' && (
          <div className="space-y-8">
            <Card className="p-8 text-center border-dashed border-violet-500/30 bg-violet-950/10">
              <div className="w-16 h-16 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Employee Mode Locked
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
                You are currently a Job Seeker. Apply to open roles in the Job Seeker tab, pass the AI interview, and accept a job offer to become an employee!
              </p>
              <Button
                variant="glow"
                size="md"
                onClick={() => handleTabChange('job-seeker')}
              >
                Go to Job Seeker Market
              </Button>
            </Card>
          </div>
        )}

        {/* TAB 3: FOUNDER DASHBOARD */}
        {activeTab === 'founder' && (
          <div className="space-y-8">
            <Card className="p-8 text-center border-dashed border-amber-500/30 bg-amber-950/10">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <Rocket className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Founder Mode Locked
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
                Founder Mode unlocks when you accumulate 500 EXP through task completion as an employee. Get hired and climb the ladder to found your empire!
              </p>
              <div className="w-full max-w-xs mx-auto h-3 bg-slate-900 rounded-full overflow-hidden mb-6 border border-white/10">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-[0%]" />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleTabChange('job-seeker')}
              >
                Back to Job Seeker
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
