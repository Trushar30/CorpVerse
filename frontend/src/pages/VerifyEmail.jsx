import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { verifyEmail, resendOTP } from '../api/auth';
import { Terminal, ShieldCheck, Radio, Mail, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isDevOrAdminEmail =
    user?.email?.endsWith('@cv.com') ||
    user?.email?.endsWith('@corpverse.com') ||
    user?.email === 'admin@corpverse.com' ||
    user?.role === 'admin';

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      await verifyEmail(otpCode);
      await refreshUser();
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setIsResending(true);

    try {
      await resendOTP();
      setMessage('Verification code resent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-md w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                [IDENTITY_VERIFICATION] :: OTP_CHALLENGE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>PENDING_VERIFICATION</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold font-sans text-slate-100">
                Verify Your Email Address
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                We sent a 6-digit verification code to <br />
                <span className="text-emerald-400 font-mono font-bold">{user?.email || 'your email'}</span>
              </p>
            </div>

            {/* Dev & Admin helper notice */}
            {isDevOrAdminEmail && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-300 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  <strong>DEV/ADMIN BYPASS:</strong> Use code <code className="bg-cyan-950 px-1 py-0.5 rounded font-bold text-emerald-300">000000</code> for test & admin accounts.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <span>✅ {message}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2 text-center">
                <label className="block font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0 0 0 0 0 0"
                  required
                  className="w-full text-center text-xl font-mono tracking-[1em] py-3 bg-[#06080E] border border-slate-800 rounded focus:border-emerald-500 focus:outline-none text-emerald-300 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-mono"
              >
                <span>{isLoading ? 'VERIFYING CODE...' : '[VERIFY EMAIL & PROCEED]'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            </div>

          </div>

          <div className="p-3 bg-[#06080E] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>EMAIL_GATEKEEPER_ACTIVE</span>
            </span>
            <span>CHALLENGE: 6-DIGIT</span>
          </div>

        </div>
      </div>
    </div>
  );
}
