import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building,
  Search,
  AlertCircle,
  FileText,
  Radio,
  ArrowRight,
  Zap,
  Gift,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  X,
  Layers,
  BarChart3,
  Check,
  Star,
  Plus,
  Briefcase,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '@components/dashboard/DashboardLayout';
import { getCompanies, getDomains, getCompanyRoles } from '@api/companies';
import { redeemCode as apiRedeemCode } from '@api/profile';
import { getMyApplications, createApplication } from '@api/applications';
import FeedbackModal from '@components/modals/FeedbackModal';
import AnimatedExpBar from '@components/dashboard/AnimatedExpBar';
import BadgeShowcase from '@components/dashboard/BadgeShowcase';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active page sub-route state: 'market' | 'applications' | 'analytics' | 'rewards'
  const getSubPage = () => {
    const path = location.pathname;
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/rewards')) return 'rewards';
    return 'market';
  };

  const activeSubPage = getSubPage();

  // Data States
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
  const [applications, setApplications] = useState([]);

  // Application & Roles State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyRole, setApplyRole] = useState(null);
  const [applyCompany, setApplyCompany] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedFeedbackApp, setSelectedFeedbackApp] = useState(null);

  // Company Details Modal State
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);

  // Voucher Form State
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Seed default applications if empty
  const defaultApplications = [
    {
      id: 'app-seed-1',
      companyName: 'Apex AI Dynamics',
      role: 'Senior Machine Learning Engineer',
      domain: 'Technology',
      appliedAt: '2026-08-05',
      status: 'APPLICATION_SUBMITTED',
      stepIndex: 1, // 0: Applied, 1: Under Review, 2: Technical Interview, 3: Offer Stage
      matchScore: 94,
      logs: ['Resume ingested into candidate pipeline', 'Profile matched with CTO criteria', 'Scheduled for team review'],
    },
    {
      id: 'app-seed-2',
      companyName: 'BioGenix Systems',
      role: 'Full Stack Computational Biology Lead',
      domain: 'Healthcare',
      appliedAt: '2026-08-04',
      status: 'TECHNICAL_REVIEW',
      stepIndex: 2,
      matchScore: 88,
      logs: ['Profile verified', 'Technical portfolio approved', 'Interview invitation sent'],
    },
  ];

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

  // Fetch companies on mount or domain change
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

  // Fetch user applications
  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      const apps = res.data?.applications || res.data || [];
      setApplications(apps);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Poll for Screening Results
  useEffect(() => {
    const pendingApps = applications.filter(a => a.status === 'pending_screening');
    if (pendingApps.length === 0) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await getMyApplications();
        const newApps = res.data?.applications || res.data || [];
        setApplications(newApps);
        
        if (!newApps.some(a => a.status === 'pending_screening')) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [applications]);

  const handleApplyClick = async (comp) => {
    const canApply = user.resumeUrl || user.resumeMetadata || user.resumeText;
    if (!canApply) {
      showToast('Resume Required: Please upload your resume in profile to apply. Your resume will be screened by our AI ATS system.', 'error');
      return;
    }

    try {
      const res = await getCompanyRoles(comp._id || comp.id);
      const roles = res.data || res; // depending on interceptor
      if (roles && roles.length > 0) {
        setApplyRole(roles[0]); // Auto-select first open role
        setApplyCompany(comp);
        setShowCompanyDetailsModal(false);
        setShowApplyModal(true);
      } else {
        showToast('No open roles available for this company.', 'error');
      }
    } catch (err) {
      showToast('Failed to fetch roles.', 'error');
    }
  };

  const handleConfirmApply = async () => {
    if (!applyRole) return;
    setIsApplying(true);
    try {
      showToast('⚙ Submitting application... ATS screening in progress', 'success');
      await createApplication({ roleId: applyRole._id || applyRole.id });
      showToast('Application submitted successfully!', 'success');
      setShowApplyModal(false);
      navigate('/dashboard/job-seeker/applications');
      fetchApplications();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to submit application', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  // Handle Voucher Code Redemption
  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;

    setIsRedeeming(true);
    setVoucherError('');
    setVoucherSuccess('');

    try {
      const res = await apiRedeemCode(voucherInput.trim().toUpperCase());
      setVoucherSuccess(res.message || `Code redeemed successfully! +${res.expAwarded || 50} EXP added.`);
      showToast(`★ Code Redeemed! +${res.expAwarded || 50} EXP added to your profile`, 'success');
      setVoucherInput('');
      if (refreshUser) refreshUser();
    } catch (err) {
      setVoucherError(err.response?.data?.message || 'Invalid or expired redeem code. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const expTotal = user?.expTotal || 0;
  const expProgress = Math.min((expTotal / 500) * 100, 100);

  const getRankTitle = (exp) => {
    if (exp >= 500) return { title: 'FOUNDER / CHIEF ARCHITECT', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40' };
    if (exp >= 300) return { title: 'PRINCIPAL OPERATOR', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (exp >= 150) return { title: 'SENIOR SYSTEMS LEAD', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    return { title: 'SYSTEM CADET (LVL 1)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  };

  const currentRank = getRankTitle(expTotal);


  const getPipelineSteps = (status) => {
    const steps = [
      { key: 'submit', label: 'ATS SUBMIT', status: 'pending' },
      { key: 'screen', label: 'SCREEN RESULT', status: 'pending' },
      { key: 'interview', label: 'INTERV. ROUND', status: 'pending' },
      { key: 'offer', label: 'OFFER STAGE', status: 'pending' },
    ];

    if (status === 'pending_screening') {
      steps[0].status = 'active';
    } else if (status === 'screening_passed') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'ready';
    } else if (status === 'screening_rejected') {
      steps[0].status = 'done'; steps[1].status = 'rejected';
    } else if (status === 'interview_in_progress') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'active';
    } else if (status === 'interview_passed') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'done'; steps[3].status = 'ready';
    } else if (status === 'interview_rejected') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'rejected';
    } else if (status === 'offer_pending') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'done'; steps[3].status = 'active';
    } else if (status === 'offer_accepted') {
      steps.forEach(s => s.status = 'done');
    } else if (status === 'offer_declined') {
      steps[0].status = 'done'; steps[1].status = 'done'; steps[2].status = 'done'; steps[3].status = 'rejected';
    }
    return steps;
  };

  return (
    <>
    <DashboardLayout toastMessage={toastMessage}>

        {/* Top Header Banner */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden arcade-panel">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#06080E] border border-slate-800 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-slate-400">NODE_STATE:</span>
                  <span className="text-emerald-300 font-bold uppercase tracking-wider">CANDIDATE_COMMAND_DECK</span>
                </div>
                <div className={`px-2.5 py-1 rounded border text-[11px] font-bold ${currentRank.badge}`}>
                  ★ {currentRank.title}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 tracking-tight flex items-center gap-3">
                <span>Welcome, {user?.name?.split(' ')[0] || 'Operator'}</span>
                <span className="text-emerald-400 animate-pulse text-xl">///</span>
              </h1>
              <p className="text-xs text-slate-400 font-sans max-w-2xl">
                Explore AI company ventures, track applied role progress, inspect skill telemetry visualizations, and redeem EXP vouchers.
              </p>
            </div>

            {/* EXP Gauge Widget */}
            <div className="p-4 bg-[#06080E] border-2 border-slate-800 rounded-xl space-y-2.5 w-full lg:w-80 shrink-0 arcade-card">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  CAREER EXP PROGRESSION
                </span>
                <span className="text-emerald-400 font-extrabold text-sm">{expTotal} / 500 EXP</span>
              </div>

              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,245,160,0.5)]"
                  style={{ width: `${expProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">FOUNDER UNLOCK:</span>
                <span className="text-amber-400 font-bold">{Math.max(0, 500 - expTotal)} EXP Needed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Page Navigation Bar */}
        <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 arcade-panel">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard/job-seeker/market')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeSubPage === 'market'
                  ? 'bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(0,245,160,0.2)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4 text-emerald-400" />
              <span>[1] AI MARKET LISTINGS</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/job-seeker/applications')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeSubPage === 'applications'
                  ? 'bg-cyan-500/20 border-2 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>[2] APPLICATION PROGRESS ({applications.length})</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/job-seeker/analytics')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeSubPage === 'analytics'
                  ? 'bg-violet-500/20 border-2 border-violet-500/60 text-violet-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span>[3] VISUALIZATION & SKILLS</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/job-seeker/rewards')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeSubPage === 'rewards'
                  ? 'bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(255,184,0,0.2)]'
                  : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>[4] REDEEM EXP VOUCHERS</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SUB-ROUTINE :: {activeSubPage.toUpperCase()}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 1: AI COMPANY MARKET LISTINGS */}
        {/* ========================================================================= */}
        {activeSubPage === 'market' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#0F1424] border-2 border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 arcade-card">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-slate-500 font-bold text-[11px] uppercase mr-1 shrink-0">
                  SECTOR:
                </span>
                {availableDomains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-3 py-1 rounded text-xs transition-colors shrink-0 font-bold ${
                      selectedDomain === dom
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(0,245,160,0.2)]'
                        : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tech stack, roles, or company..."
                  className="w-full pl-9 pr-3 py-2 bg-[#06080E] border border-slate-800 rounded-lg text-xs focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {isLoadingCompanies ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#0F1424] h-56 rounded-xl border border-slate-800 animate-pulse p-6" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl text-center p-12 space-y-3 arcade-panel">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <div className="font-bold text-slate-200 text-base font-display">No company ventures found</div>
                <p className="text-slate-400 text-xs font-sans max-w-md mx-auto">
                  No active companies match sector filter "{selectedDomain}". Try clearing your search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((comp) => {
                    const isAlreadyApplied = applications.some((a) => (a.role?.company?.name === comp.name || a.companyName === comp.name) && !a.status?.includes('rejected') && !a.status?.includes('declined'));
                    return (
                      <div
                        key={comp._id || comp.id}
                        className="bg-[#0F1424] border-2 border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:bg-[#151B2E] group arcade-card"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                              {comp.domain || 'Technology'}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                              <Zap className="w-3 h-3 fill-current" />
                              <span>+50 EXP</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0 group-hover:border-emerald-400/50">
                              {comp.name[0]}
                            </div>
                            <div>
                              <h3 className="font-display font-extrabold text-slate-100 text-base group-hover:text-emerald-300 transition-colors">
                                {comp.name}
                              </h3>
                              <div className="text-[10px] text-slate-400 font-sans">
                                {comp.location || 'Remote / Global'} • {comp.size || '50-200 Employees'}
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-400 text-xs font-sans line-clamp-2 leading-relaxed">
                            {comp.description || 'Pioneering AI infrastructure and autonomous agent workflows for enterprise applications.'}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['React', 'Node.js', 'AI Agents', 'Python'].map((tech) => (
                              <span key={tech} className="px-2 py-0.5 rounded bg-[#06080E] border border-slate-800 text-[9px] text-slate-400 font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-bold">{comp.openRoleCount || 3} Roles</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCompanyDetails(comp);
                                setShowCompanyDetailsModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#06080E] hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded text-xs transition-colors"
                            >
                              Details
                            </button>

                            {isAlreadyApplied ? (
                              <button
                                onClick={() => navigate('/dashboard/job-seeker/applications')}
                                className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold rounded text-xs transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 text-cyan-400" />
                                <span>APPLIED</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApplyClick(comp)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded text-xs transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(0,245,160,0.3)]"
                              >
                                <span>APPLY NOW</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: APPLICATION PROGRESS TELEMETRY */}
        {/* ========================================================================= */}
        {activeSubPage === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-extrabold font-display text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Applied Roles & Progress Telemetry</span>
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Track the multi-stage progression of your active role submissions.
                </p>
              </div>
              <span className="text-slate-500 text-xs font-mono">
                {applications.length} Records In Queue
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3 arcade-panel">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="font-bold text-slate-300 text-base font-display">No application submissions yet</div>
                <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                  Browse open companies in the Market tab and click Apply Now to trigger candidate telemetry.
                </p>
                <button
                  onClick={() => navigate('/dashboard/job-seeker/market')}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs"
                >
                  BROWSE AI MARKET LISTINGS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-[#0F1424] border-2 border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 space-y-4 transition-all arcade-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                            {app.domain || 'Technology'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">APP_ID: {app.id.slice(0, 10)}</span>
                        </div>
                        <h3 className="font-display font-extrabold text-slate-100 text-lg">{app.role?.title || app.role}</h3>
                        <div className="text-xs text-slate-400 font-sans flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{app.role?.company?.name || app.companyName}</span>
                          <span>•</span>
                          <span>Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.appliedAt}</span>
                        </div>
                      </div>

                      <div className="px-4 py-2 rounded-lg bg-[#06080E] border border-slate-800 text-center shrink-0">
                        <div className="text-[10px] text-slate-400 font-mono">MATCH RATING</div>
                        <div className="text-base font-black text-emerald-400 font-sans">{app.screeningScore || app.matchScore || '--'}/100</div>
                      </div>
                    </div>

                    {/* Multi-Stage Pipeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">STAGE PROGRESSION:</span>
                        <span className="text-emerald-400 font-bold font-mono">STATUS :: {app.status}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        {getPipelineSteps(app.status).map((step) => (
                          <div
                            key={step.key}
                            className={`p-2.5 rounded border text-[10px] font-mono flex flex-col items-center justify-center gap-1 ${
                              step.status === 'done'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                                : step.status === 'active'
                                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold animate-pulse'
                                : step.status === 'rejected'
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                                : step.status === 'ready'
                                ? 'bg-[#06080E] border-amber-500/40 text-amber-300 font-bold'
                                : 'bg-[#06080E] border-slate-800 text-slate-600'
                            }`}
                          >
                            {step.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            {step.status === 'active' && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                            {step.status === 'rejected' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                            {step.status === 'ready' && <Star className="w-3.5 h-3.5 text-amber-400" />}
                            {step.status === 'pending' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />}
                            
                            <span>{step.label}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-slate-800/80 flex justify-end gap-2">
                         {app.status && app.status.includes('rejected') && app.feedbacks && app.feedbacks.length > 0 && (
                            <button onClick={() => setSelectedFeedbackApp(app)} className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-rose-500/30">
                               <AlertCircle className="w-3.5 h-3.5" />
                               VIEW ATS FEEDBACK
                            </button>
                         )}
                         {app.status === 'screening_passed' && (
                            <button 
                              onClick={() => navigate(`/interview/${app._id || app.id}`)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold rounded flex items-center gap-1 shadow-[0_0_10px_rgba(255,184,0,0.3)]"
                            >
                               <Sparkles className="w-3.5 h-3.5" />
                               START INTERVIEW
                            </button>
                         )}
                         {['interview_in_progress'].includes(app.status) && (
                            <button 
                              onClick={() => navigate(`/interview/${app._id || app.id}`)}
                              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-extrabold rounded flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                            >
                               <Zap className="w-3.5 h-3.5" />
                               RESUME INTERVIEW
                            </button>
                         )}
                         {['interview_passed', 'interview_rejected', 'offer_pending', 'offer_accepted', 'offer_declined'].includes(app.status) && (
                            <button 
                              onClick={() => navigate(`/interview/${app._id || app.id}`)}
                              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold rounded flex items-center gap-1 hover:bg-emerald-500/30"
                            >
                               <Award className="w-3.5 h-3.5" />
                               VIEW RESULTS
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: VISUALIZATIONS & SKILL MATRIX */}
        {/* ========================================================================= */}
        {activeSubPage === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-6 arcade-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  <span>Candidate Skill Telemetry & Analytics</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">ECOSYSTEM OVERVIEW</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Full Stack Development', level: '94%', color: 'from-cyan-500 to-blue-500', exp: '140 EXP' },
                  { name: 'System Architecture & APIs', level: '88%', color: 'from-emerald-500 to-teal-500', exp: '110 EXP' },
                  { name: 'AI Engineering & Prompting', level: '92%', color: 'from-violet-500 to-purple-500', exp: '130 EXP' },
                  { name: 'Database & Data Modeling', level: '85%', color: 'from-amber-500 to-orange-500', exp: '95 EXP' },
                  { name: 'Cloud Infrastructure & DevOps', level: '82%', color: 'from-pink-500 to-rose-500', exp: '90 EXP' },
                  { name: 'UI / UX Design Systems', level: '90%', color: 'from-cyan-400 to-emerald-400', exp: '120 EXP' },
                ].map((sk) => (
                  <div key={sk.name} className="bg-[#06080E] border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-xs">{sk.name}</span>
                      <span className="text-cyan-400 font-extrabold text-xs">{sk.level}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${sk.color}`} style={{ width: sk.level }} />
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Match Rating</span>
                      <span className="text-amber-400 font-bold">{sk.exp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Level Progression Roadmap */}
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 space-y-4 arcade-panel">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold font-display text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>Ecosystem Career Progression Milestones</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { stage: '1. Candidate / Job-Seeker', req: '0 - 199 EXP', desc: 'Browse AI companies, submit role applications, and accumulate EXP.', current: true },
                  { stage: '2. Working Professional', req: '200 - 499 EXP', desc: 'Join engineering teams, execute production tasks, and earn salary.', current: expTotal >= 200 },
                  { stage: '3. Founder Console', req: '500+ EXP', desc: 'Launch AI startup ventures, post open roles, and govern teams.', current: expTotal >= 500 },
                ].map((tier) => (
                  <div
                    key={tier.stage}
                    className={`p-5 rounded-xl border-2 space-y-3 ${
                      tier.current
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(0,245,160,0.2)]'
                        : 'bg-[#06080E] border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm font-display text-slate-100">{tier.stage}</span>
                      {tier.current && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">ACTIVE</span>}
                    </div>
                    <div className="text-xs text-amber-400 font-bold">{tier.req}</div>
                    <p className="text-xs text-slate-400 font-sans">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: REDEEM EXP VOUCHERS & REWARDS */}
        {/* ========================================================================= */}
        {activeSubPage === 'rewards' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#0F1424] border-2 border-amber-500/50 rounded-xl p-6 space-y-6 arcade-panel shadow-[0_0_30px_rgba(255,184,0,0.15)]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-display font-extrabold text-lg">
                  <Gift className="w-6 h-6 text-amber-400" />
                  <span>Redeem EXP Voucher Code Hub</span>
                </div>
                <div className="text-xs text-amber-400 font-bold font-mono">
                  CURRENT BALANCE: {expTotal} EXP
                </div>
              </div>

              <form onSubmit={handleRedeemSubmit} className="space-y-4">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Enter your promotional or event code below to claim instant EXP points towards unlocking Founder Mode!
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-bold">PROMO / VOUCHER CODE:</label>
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="e.g. CORPVERSE2026 or PIONEER50"
                    className="w-full px-4 py-3 bg-[#06080E] border-2 border-slate-800 focus:border-amber-400 rounded-lg text-slate-100 font-mono text-base uppercase tracking-widest focus:outline-none"
                  />
                </div>

                {voucherError && (
                  <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans">
                    {voucherError}
                  </div>
                )}

                {voucherSuccess && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-sans font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{voucherSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>Enter promo codes from events or admin to earn EXP</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isRedeeming}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(255,184,0,0.3)] transition-all flex items-center gap-2"
                  >
                    {isRedeeming ? (
                      <span>VERIFYING...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>REDEEM VOUCHER</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* EXP Progression Matrix */}
            <AnimatedExpBar
              expTotal={expTotal}
              maxExp={500}
              showMilestones={true}
              className="border-slate-800"
            />

            {/* Badges Trophy Room */}
            <div className="space-y-3">
              <BadgeShowcase />
            </div>
          </div>
        )}

        {/* APPLY CONFIRMATION MODAL */}
        {showApplyModal && applyRole && applyCompany && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-5 arcade-panel relative shadow-[8px_8px_0px_#000]">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(0,245,160,0.2)]">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-display font-extrabold text-slate-100 text-xl tracking-tight uppercase">⚡ Apply for Role</h3>
              </div>
              
              <div className="bg-[#06080E] border-2 border-slate-800 rounded p-4 space-y-2 font-mono text-xs">
                 <div className="flex justify-between"><span className="text-slate-500">Role:</span> <span className="text-emerald-300 font-bold">{applyRole.title}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">Company:</span> <span className="text-slate-200">{applyCompany.name}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">Level:</span> <span className="text-slate-200 uppercase">{applyRole.level}</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">Domain:</span> <span className="text-slate-200">{applyRole.domain}</span></div>
              </div>
              
              <p className="text-[11px] text-slate-400 font-sans text-center leading-relaxed">
                Your resume will be screened by our AI-powered ATS system. You'll receive detailed feedback regardless of result.
              </p>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 bg-[#06080E] border-2 border-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-xs transition-colors"
                  disabled={isApplying}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all disabled:opacity-50 flex justify-center"
                >
                  {isApplying ? 'SUBMITTING...' : 'SUBMIT APP'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* FEEDBACK MODAL */}
        <FeedbackModal 
          feedback={selectedFeedbackApp?.feedbacks?.[0]} 
          roleTitle={selectedFeedbackApp?.role?.title}
          cooldownUntil={selectedFeedbackApp?.cooldownUntil}
          onClose={() => setSelectedFeedbackApp(null)} 
        />

      </DashboardLayout>
      {/* COMPANY DETAILS MODAL */}
      {showCompanyDetailsModal && selectedCompanyDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border-2 border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-5 arcade-panel relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-lg font-display">
                  {selectedCompanyDetails.name[0]}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-100 text-base">
                    {selectedCompanyDetails.name}
                  </h3>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    Sector: {selectedCompanyDetails.domain || 'Technology'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyDetailsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <p className="leading-relaxed">
                {selectedCompanyDetails.description || 'Pioneering AI systems and computational engineering solutions.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded bg-[#06080E] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono">OPEN ROLES</span>
                  <div className="font-bold text-slate-200 text-sm">{selectedCompanyDetails.openRoleCount || 3} Positions</div>
                </div>
                <div className="p-3 rounded bg-[#06080E] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono">APPLICATION BONUS</span>
                  <div className="font-bold text-amber-400 text-sm">+50 EXP</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCompanyDetailsModal(false)}
                className="px-4 py-2 bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCompanyDetailsModal(false);
                  handleApplyClick(selectedCompanyDetails);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center gap-2"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    
      </>
  );
}
