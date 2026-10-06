import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Building,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { getExitCertificate } from '@api/employee';
import { useAuth } from '@context/AuthContext';

export default function ExitCertificateModal({ isOpen, onClose, onComplete }) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchCert = async () => {
      try {
        setLoading(true);
        const res = await getExitCertificate();
        if (isMounted) {
          setCertificate(res.data?.data || res.data || null);
        }
      } catch (err) {
        console.error('Failed to load exit certificate:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCert();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (certificate?.certificateId) {
      navigator.clipboard.writeText(certificate.certificateId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReturnToJobSeeker = async () => {
    if (refreshUser) await refreshUser();
    if (onComplete) onComplete();
    if (onClose) onClose();
    navigate('/dashboard/job-seeker');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F1424] border-2 border-amber-500/60 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 arcade-panel relative shadow-[0_0_40px_rgba(245,158,11,0.25)] my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                CORPVERSE VERIFIED CREDENTIAL
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-100">
                Alumni Certificate & Reference
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-slate-400">Minting official alumni credential...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* The Formal Certificate Card */}
            <div className="bg-[#06080E] border-2 border-amber-500/40 rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-amber-300" />
              </div>

              <div className="text-center space-y-1 border-b border-slate-800 pb-4">
                <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                  CERTIFICATE OF PROFESSIONAL SERVICE
                </div>
                <div className="text-xs font-mono text-amber-400">
                  ID: {certificate?.certificateId || 'CORP-ALUM-VERIFIED'}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs font-sans text-slate-400">This certifies that</p>
                <h3 className="text-2xl font-black font-display text-amber-300 tracking-wide">
                  {certificate?.employee || 'Employee'}
                </h3>
                <p className="text-xs font-sans text-slate-400">
                  has formally completed service in good standing as
                </p>
                <div className="text-base font-bold font-sans text-slate-200">
                  {certificate?.role || 'Engineer'} at <span className="text-cyan-400">{certificate?.company || 'Company'}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#0F1424] border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-mono">TASKS DELIVERED</span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {certificate?.tasksCompleted ?? 0}
                  </div>
                </div>

                <div className="p-3 bg-[#0F1424] border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-mono">EXP ACCUMULATED</span>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    +{certificate?.totalExpGained ?? 0}
                  </div>
                </div>

                <div className="p-3 bg-[#0F1424] border border-slate-800 rounded-lg text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 font-mono">TENURE DURATION</span>
                  <div className="text-lg font-black text-cyan-400 font-mono">
                    {certificate?.durationDays ?? 1} Days
                  </div>
                </div>
              </div>

              {/* Manager Endorsement */}
              {certificate?.managerEndorsement && (
                <div className="p-4 bg-[#0F1424] border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
                  <div className="text-[10px] text-amber-400 font-mono uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    EXECUTIVE ENDORSEMENT & REFERENCE
                  </div>
                  <p className="text-slate-300 font-sans italic leading-relaxed">
                    "{certificate.managerEndorsement}"
                  </p>
                </div>
              )}

              {/* Certificate Seal & Signatures */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HANDOVER VERIFIED & AUDITED</span>
                </div>
                <div>Issued: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyId}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#06080E] hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'CERTIFICATE ID COPIED' : 'COPY CREDENTIAL ID'}</span>
              </button>

              <button
                onClick={handleReturnToJobSeeker}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs font-mono rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>RETURN TO JOB SEEKER DECK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
