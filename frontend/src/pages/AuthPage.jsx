import { SignIn, SignUp } from '@clerk/clerk-react';
import Navbar from '../components/layout/Navbar';
import { Terminal, ShieldCheck, Lock, Radio } from 'lucide-react';

export default function AuthPage({ mode = 'sign-in' }) {
  return (
    <div className="min-h-screen bg-[#090C15] text-slate-100 flex flex-col relative font-mono text-xs crt-grid-bg">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12 relative z-10">
        <div className="max-w-md w-full bg-[#0F1424] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Tactical Terminal Header */}
          <div className="bg-[#06080E] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                [AUTH_GATEWAY_V2] :: {mode === 'sign-in' ? 'AUTHENTICATE' : 'INITIALIZE_IDENTITY'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>TLS_ENCRYPTED</span>
            </div>
          </div>

          {/* Clerk Auth Chamber */}
          <div className="p-4 sm:p-6 bg-[#0F1424]">
            {mode === 'sign-in' ? (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    card: 'bg-transparent shadow-none p-0',
                    headerTitle: 'text-slate-100 font-sans text-lg font-bold',
                    headerSubtitle: 'text-slate-400 text-xs font-mono',
                    formButtonPrimary:
                      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 rounded border border-emerald-400/40 font-mono shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all',
                    formFieldLabel: 'text-slate-300 text-xs font-mono font-semibold',
                    formFieldInput:
                      'bg-[#06080E] border-slate-800 text-slate-100 rounded text-xs py-2 px-3 font-mono focus:border-emerald-500',
                    footerActionLink: 'text-cyan-400 hover:text-cyan-300 text-xs font-mono',
                    identityPreviewText: 'text-slate-200 text-xs font-mono',
                  },
                }}
              />
            ) : (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    card: 'bg-transparent shadow-none p-0',
                    headerTitle: 'text-slate-100 font-sans text-lg font-bold',
                    headerSubtitle: 'text-slate-400 text-xs font-mono',
                    formButtonPrimary:
                      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 rounded border border-emerald-400/40 font-mono shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all',
                    formFieldLabel: 'text-slate-300 text-xs font-mono font-semibold',
                    formFieldInput:
                      'bg-[#06080E] border-slate-800 text-slate-100 rounded text-xs py-2 px-3 font-mono focus:border-emerald-500',
                    footerActionLink: 'text-cyan-400 hover:text-cyan-300 text-xs font-mono',
                  },
                }}
              />
            )}
          </div>

          {/* Security Diagnostic Footer */}
          <div className="p-3 bg-[#06080E] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DETERMINISTIC_SECURITY_OK</span>
            </span>
            <span>HASH: 0x88f21e</span>
          </div>

        </div>
      </div>
    </div>
  );
}
