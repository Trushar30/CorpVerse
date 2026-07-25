import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Compass,
  Briefcase,
  Rocket,
  Search,
  Building,
  Award,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  FileText,
  Terminal,
  Activity,
  Zap,
  Radio,
  Bot,
  UserCheck,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
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
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Operations Welcome Banner & Diagnostic Bar */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#06080E] border border-slate-800 text-[11px]">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-slate-400">NODE_STATE:</span>
                <span className="text-amber-300 font-bold uppercase">STATE::JOB_SEEKER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
                Command Deck :: {user?.firstName || 'Operator'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Monitor market liquidity, dispatch AI interview screeners, and track career state progression.
              </p>
            </div>

            {/* EXP Diagnostics Meter */}
            <div className="p-4 bg-[#06080E] border border-slate-800 rounded-lg space-y-2 w-full md:w-auto shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[11px]">CAREER_PROGRESSION_EXP:</span>
                <span className="text-emerald-400 font-bold">0 / 500 EXP</span>
              </div>
              <div className="w-full md:w-56 h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[0%]" />
              </div>
              <div className="text-[10px] text-amber-400">
                ★ 500 EXP required for FOUNDER mode transition
              </div>
            </div>
          </div>
        </div>

        {/* Role Tab Navigation for Mobile */}
        <div className="flex md:hidden items-center gap-2 p-1 bg-[#06080E] rounded-lg border border-slate-800">
          {[
            { id: 'job-seeker', label: 'JOB_SEEKER', icon: Compass },
            { id: 'employee', label: 'EMPLOYEE', icon: Briefcase },
            { id: 'founder', label: 'FOUNDER', icon: Rocket }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-[11px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: JOB SEEKER DASHBOARD */}
        {activeTab === 'job-seeker' && (
          <div className="space-y-8">
            
            {/* Market Search & Domain Filter Bar */}
            <div className="p-4 bg-[#0F1424] border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-slate-500 font-bold text-[11px] uppercase mr-1 shrink-0">
                  SECTOR:
                </span>
                {['All', 'Technology', 'Clean Energy', 'Healthcare', 'Finance', 'Design & Media'].map(
                  (dom) => (
                    <button
                      key={dom}
                      onClick={() => setSelectedDomain(dom)}
                      className={`px-3 py-1 rounded text-xs transition-colors shrink-0 ${
                        selectedDomain === dom
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {dom}
                    </button>
                  )
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search roles or companies..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Companies Market Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Seeded AI Company Market Listings</span>
                </h2>
                <span className="text-slate-500 text-[11px]">
                  {companies.length} Companies Active
                </span>
              </div>

              {isLoadingCompanies ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-[#0F1424] h-48 rounded-xl border border-slate-800 animate-pulse p-6" />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <div className="bg-[#0F1424] border border-slate-800 rounded-xl text-center p-12 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <div className="font-bold text-slate-200 text-sm">No company models found</div>
                  <p className="text-slate-400 text-xs font-sans">
                    Try selecting a different domain filter or clearing your query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies
                    .filter((c) =>
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.domain.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((comp) => (
                      <div
                        key={comp._id}
                        className="bg-[#0F1424] border border-slate-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:bg-[#151B2E]"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                              {comp.domain}
                            </span>
                            {comp.isSeedCompany && (
                              <span className="text-[10px] text-amber-400 font-bold">
                                ★ SEEDED
                              </span>
                            )}
                          </div>

                          <h3 className="font-sans font-bold text-slate-100 text-base">
                            {comp.name}
                          </h3>
                          <p className="text-slate-400 text-xs font-sans line-clamp-2">
                            {comp.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{comp.openRoleCount} Open Roles</span>
                          </span>

                          <button
                            onClick={() =>
                              alert(`Screening pipeline active for ${comp.name}. Initiating AI HR eval...`)
                            }
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded transition-colors"
                          >
                            [APPLY]
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Active Applications Queue */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Active Application Telemetry Queue</span>
              </h2>

              <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="font-bold text-slate-300 text-sm">Application queue buffer empty</div>
                <p className="text-xs text-slate-500 font-sans">
                  Select a company from the market above to trigger multi-agent evaluation.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: EMPLOYEE DASHBOARD (LOCKED) */}
        {activeTab === 'employee' && (
          <div className="bg-[#0F1424] border border-dashed border-emerald-500/40 rounded-xl p-10 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-sans text-slate-100">EMPLOYEE NODE LOCKED</h2>
              <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                Currently in JOB_SEEKER state. Complete an AI recruiter interview and accept an offer contract to mutate node state to EMPLOYEE.
              </p>
            </div>
            <button
              onClick={() => handleTabChange('job-seeker')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all inline-flex items-center gap-2"
            >
              <span>RETURN TO JOB SEEKER MARKET</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 3: FOUNDER DASHBOARD (LOCKED) */}
        {activeTab === 'founder' && (
          <div className="bg-[#0F1424] border border-dashed border-violet-500/40 rounded-xl p-10 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
              <Rocket className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-sans text-slate-100">FOUNDER NODE LOCKED</h2>
              <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                Requires 500 EXP accumulated through employee task execution to unlock capital treasury governance mode.
              </p>
            </div>
            <button
              onClick={() => handleTabChange('job-seeker')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded border border-slate-700 transition-colors inline-flex items-center gap-2"
            >
              <span>RETURN TO COMMAND DECK</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
