import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import api from '../api/client';
import {
  Shield,
  Users,
  Building,
  TrendingUp,
  Search,
  Trash2,
  Edit3,
  Radio,
  ChevronLeft,
  ChevronRight,
  Compass,
  Briefcase,
  Rocket,
  Plus,
  Globe,
  Layers,
  X,
  CheckCircle2,
  Cpu,
  Leaf,
  Activity,
  DollarSign,
  Palette,
  Gift,
  KeyRound,
  Zap,
} from 'lucide-react';

const ROLE_BADGE = {
  admin: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
  job_seeker: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  working: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  founder: { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/30' },
};

const ROLE_ICON = {
  admin: Shield,
  job_seeker: Compass,
  working: Briefcase,
  founder: Rocket,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'domains' | 'codes'
  const [stats, setStats] = useState(null);

  // User management state
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  // Domain management state
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [domainError, setDomainError] = useState('');

  // Redeem code management state
  const [redeemCodes, setRedeemCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(50);
  const [newMaxUses, setNewMaxUses] = useState(100);
  const [codeError, setCodeError] = useState('');

  // Fetch stats
  const fetchStats = () => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch users
  useEffect(() => {
    if (activeTab !== 'users') return;
    setLoadingUsers(true);
    const params = { page: pagination.page, limit: 15 };
    if (roleFilter) params.role = roleFilter;
    if (searchQuery) params.search = searchQuery;

    api.get('/admin/users', { params })
      .then((r) => {
        setUsers(r.data.data.users);
        setPagination(r.data.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [activeTab, pagination.page, roleFilter, searchQuery]);

  // Fetch domains
  useEffect(() => {
    if (activeTab === 'domains') {
      setLoadingDomains(true);
      api.get('/admin/domains')
        .then((r) => setDomains(r.data.data))
        .catch(console.error)
        .finally(() => setLoadingDomains(false));
    }
  }, [activeTab]);

  // Fetch redeem codes
  useEffect(() => {
    if (activeTab === 'codes') {
      setLoadingCodes(true);
      api.get('/admin/redeem-codes')
        .then((r) => setRedeemCodes(r.data.data))
        .catch(console.error)
        .finally(() => setLoadingCodes(false));
    }
  }, [activeTab]);

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateRole = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}`, { role: editRole });
      setUsers(users.map((u) => (u._id === id ? res.data.data : u)));
      setEditingUser(null);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    setDomainError('');
    if (!newDomainName.trim()) {
      setDomainError('Domain name is required.');
      return;
    }

    try {
      const res = await api.post('/admin/domains', {
        name: newDomainName,
        description: newDomainDesc,
      });

      setDomains([...domains, { ...res.data.data, companyCount: 0 }]);
      setShowAddDomainModal(false);
      setNewDomainName('');
      setNewDomainDesc('');
      fetchStats();
    } catch (err) {
      setDomainError(err.response?.data?.message || 'Failed to create domain sector.');
    }
  };

  const handleDeleteDomain = async (id, name) => {
    if (!confirm(`Delete domain sector "${name}"?`)) return;
    try {
      await api.delete(`/admin/domains/${id}`);
      setDomains(domains.filter((d) => d._id !== id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete domain sector');
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCodeError('');
    if (!newCodeName.trim()) {
      setCodeError('Code string is required');
      return;
    }

    try {
      const res = await api.post('/admin/redeem-codes', {
        code: newCodeName,
        expAmount: newExpAmount,
        maxUses: newMaxUses,
      });

      setRedeemCodes([res.data.data, ...redeemCodes]);
      setShowAddCodeModal(false);
      setNewCodeName('');
      setNewExpAmount(50);
      fetchStats();
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Failed to create redeem code');
    }
  };

  const handleDeleteCode = async (id, codeStr) => {
    if (!confirm(`Revoke redeem code "${codeStr}"?`)) return;
    try {
      await api.delete(`/admin/redeem-codes/${id}`);
      setRedeemCodes(redeemCodes.filter((c) => c._id !== id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete code');
    }
  };

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">

        {/* Admin Banner */}
        <div className="bg-[#0F1424] border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-[11px]">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                <span className="text-rose-300 font-bold">ADMIN :: GOVERNANCE & CONTROL PANEL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
                CorpVerse Platform Command
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Manage user accounts, roles, domain sectors, and EXP redeem code generation.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'emerald' },
              { label: 'Domains', value: stats.totalDomains || domains.length, icon: Layers, color: 'amber' },
              { label: 'Companies', value: stats.totalCompanies || 0, icon: Building, color: 'cyan' },
              { label: 'EXP Codes', value: stats.totalRedeemCodes || redeemCodes.length, icon: Gift, color: 'rose' },
              { label: 'Job Seekers', value: stats.byRole?.job_seeker || 0, icon: Compass, color: 'emerald' },
            ].map((stat) => {
              const Icon = stat.icon;
              const colors = {
                emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
              };
              return (
                <div key={stat.label} className="bg-[#0F1424] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] uppercase font-bold">{stat.label}</span>
                    <div className={`p-1.5 rounded ${colors[stat.color]} border`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-sans">{stat.value}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Control Section Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(0,245,160,0.15)]'
                : 'bg-[#06080E] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>[USER MANAGEMENT]</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'domains'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-[#06080E] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>[DOMAIN SECTOR CONTROL]</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'codes'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                : 'bg-[#06080E] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>[EXP REDEEM CODES]</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-grow w-full md:w-auto">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                  placeholder="Search users by name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                {['', 'admin', 'job_seeker', 'working', 'founder'].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRoleFilter(r); setPagination((p) => ({ ...p, page: 1 })); }}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${
                      roleFilter === r
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-[#06080E] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#06080E] text-slate-400 text-left">
                    <th className="px-4 py-3 font-bold uppercase">User</th>
                    <th className="px-4 py-3 font-bold uppercase">Email</th>
                    <th className="px-4 py-3 font-bold uppercase">Role</th>
                    <th className="px-4 py-3 font-bold uppercase">EXP Total</th>
                    <th className="px-4 py-3 font-bold uppercase">Profile</th>
                    <th className="px-4 py-3 font-bold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
                  ) : (
                    users.map((u) => {
                      const badge = ROLE_BADGE[u.role] || ROLE_BADGE.job_seeker;
                      const RIcon = ROLE_ICON[u.role] || Compass;
                      return (
                        <tr key={u._id} className="border-t border-slate-800/50 hover:bg-[#151B2E] transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-100">{u.name}</td>
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>
                          <td className="px-4 py-3">
                            {editingUser === u._id ? (
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="bg-[#06080E] border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                                >
                                  {['admin', 'job_seeker', 'working', 'founder'].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                                <button onClick={() => handleUpdateRole(u._id)} className="text-emerald-400 hover:text-emerald-300 font-bold">Save</button>
                                <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-300">Cancel</button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                <RIcon className="w-2.5 h-2.5" />
                                {u.role?.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">
                            ⚡ {u.expTotal || 0} EXP
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold ${u.profileComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {u.profileComplete ? '✓ Complete' : '○ Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingUser(u._id); setEditRole(u.role); }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Edit role"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOMAIN SECTOR CONTROL */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Manage Platform Domain Sectors
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Add or remove industry sector domains available for onboarding and company listings.
                </p>
              </div>

              <button
                onClick={() => setShowAddDomainModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>[ADD NEW DOMAIN]</span>
              </button>
            </div>

            {loadingDomains ? (
              <div className="p-8 text-center text-slate-500">Loading domain sectors...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map((dom) => (
                  <div
                    key={dom._id}
                    className="bg-[#0F1424] border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          {dom.name}
                        </span>
                        {dom.isSystem && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">
                            SYSTEM DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-sans line-clamp-2">
                        {dom.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        🏢 {dom.companyCount || 0} Companies
                      </span>
                      <button
                        onClick={() => handleDeleteDomain(dom._id, dom.name)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXP REDEEM CODES CONTROL */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-400" />
                  Manage EXP Redeem Codes
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Create promo or boost codes for users to redeem and boost their career EXP total.
                </p>
              </div>

              <button
                onClick={() => setShowAddCodeModal(true)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center gap-1.5 font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>[CREATE EXP CODE]</span>
              </button>
            </div>

            {loadingCodes ? (
              <div className="p-8 text-center text-slate-500">Loading redeem codes...</div>
            ) : (
              <div className="bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#06080E] text-slate-400 text-left">
                        <th className="px-4 py-3 font-bold uppercase">Code</th>
                        <th className="px-4 py-3 font-bold uppercase">EXP Reward</th>
                        <th className="px-4 py-3 font-bold uppercase">Usage</th>
                        <th className="px-4 py-3 font-bold uppercase">Status</th>
                        <th className="px-4 py-3 font-bold uppercase">Created</th>
                        <th className="px-4 py-3 font-bold uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redeemCodes.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No EXP redeem codes created yet</td></tr>
                      ) : (
                        redeemCodes.map((c) => (
                          <tr key={c._id} className="border-t border-slate-800/50 hover:bg-[#151B2E] transition-colors">
                            <td className="px-4 py-3 font-bold text-amber-300 font-mono tracking-wider">
                              <span className="bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                                🔑 {c.code}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-400">
                              + {c.expAmount} EXP
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {c.usedCount} / {c.maxUses} uses
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                c.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteCode(c._id, c.code)}
                                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 font-bold text-[11px] ml-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>REVOKE</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Add New Domain Modal */}
      {showAddDomainModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                CREATE DOMAIN SECTOR
              </span>
              <button onClick={() => setShowAddDomainModal(false)} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDomain} className="p-6 space-y-4">
              {domainError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded">
                  ⚠️ {domainError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Domain Sector Name
                </label>
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="e.g. Cybersecurity, AI & Robotics"
                  required
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-amber-500 focus:outline-none text-slate-100 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={newDomainDesc}
                  onChange={(e) => setNewDomainDesc(e.target.value)}
                  placeholder="Short overview of roles & companies in this sector..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-amber-500 focus:outline-none text-slate-100 font-mono resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDomainModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[SAVE DOMAIN]</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Redeem Code Modal */}
      {showAddCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Gift className="w-4 h-4 text-rose-400" />
                CREATE EXP REDEEM CODE
              </span>
              <button onClick={() => setShowAddCodeModal(false)} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="p-6 space-y-4">
              {codeError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded">
                  ⚠️ {codeError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Code String
                </label>
                <input
                  type="text"
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                  placeholder="e.g. EXP100, BOOST50, FOUNDER2026"
                  required
                  className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-rose-500 focus:outline-none text-amber-300 font-mono font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    EXP Reward Amount
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-rose-500 focus:outline-none text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#06080E] border border-slate-800 rounded text-xs focus:border-rose-500 focus:outline-none text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCodeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>[GENERATE CODE]</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
