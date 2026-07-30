import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Briefcase,
  Search,
  Building,
  AlertCircle,
  Clock,
  FileText,
  Radio,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getCompanies, getDomains } from '../api/companies';

export default function Dashboard() {
  const { user } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableDomains, setAvailableDomains] = useState([
    'All',
    'Technology',
    'Clean Energy',
    'Healthcare',
    'Finance',
    'Design & Media',
  ]);

  // Fetch available domains from admin database on mount
  useEffect(() => {
    getDomains()
      .then((res) => {
        const fetched = (res.data || []).map((d) => d.name);
        if (fetched.length > 0) {
          setAvailableDomains(['All', ...fetched]);
        }
      })
      .catch((err) => {
        console.error('Failed to load domains in dashboard:', err);
      });
  }, []);

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

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">

        {/* Welcome Banner */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#06080E] border border-slate-800 text-[11px]">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-slate-400">NODE_STATE:</span>
                <span className="text-amber-300 font-bold uppercase">STATE::JOB_SEEKER</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
                Command Deck :: {user?.name?.split(' ')[0] || 'Operator'}
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Monitor market liquidity, dispatch AI interview screeners, and track career state progression.
              </p>
            </div>

            {/* EXP Meter */}
            <div className="p-4 bg-[#06080E] border border-slate-800 rounded-lg space-y-2 w-full md:w-auto shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 text-[11px]">CAREER_PROGRESSION_EXP:</span>
                <span className="text-emerald-400 font-bold">{user?.expTotal || 0} / 500 EXP</span>
              </div>
              <div className="w-full md:w-56 h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${Math.min(((user?.expTotal || 0) / 500) * 100, 100)}%` }} />
              </div>
              <div className="text-[10px] text-amber-400">
                ★ 500 EXP required for FOUNDER mode transition
              </div>
            </div>
          </div>
        </div>

        {/* Market Search & Domain Filter */}
        <div className="p-4 bg-[#0F1424] border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <span className="text-slate-500 font-bold text-[11px] uppercase mr-1 shrink-0">
              SECTOR:
            </span>
            {availableDomains.map(
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

        {/* Company Listings */}
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
                          <span className="text-[10px] text-amber-400 font-bold">★ SEEDED</span>
                        )}
                      </div>
                      <h3 className="font-sans font-bold text-slate-100 text-base">{comp.name}</h3>
                      <p className="text-slate-400 text-xs font-sans line-clamp-2">{comp.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{comp.openRoleCount} Open Roles</span>
                      </span>
                      <button
                        onClick={() => alert(`Screening pipeline active for ${comp.name}. Initiating AI HR eval...`)}
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

        {/* Applications Queue */}
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

      </main>
    </div>
  );
}
