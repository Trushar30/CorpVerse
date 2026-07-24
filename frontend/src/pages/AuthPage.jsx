import { SignIn, SignUp } from '@clerk/clerk-react';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/ui/ParticleBackground';

export default function AuthPage({ mode = 'sign-in' }) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative">
      <ParticleBackground />
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4 py-16 relative z-10">
        <div className="glass-panel p-2 sm:p-4 rounded-3xl border border-violet-500/20 shadow-2xl glow-purple">
          {mode === 'sign-in' ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-4',
                  headerTitle: 'text-white font-display text-xl font-bold',
                  headerSubtitle: 'text-slate-400 text-xs',
                  formButtonPrimary:
                    'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold py-2.5 rounded-xl border border-violet-400/20',
                  formFieldLabel: 'text-slate-300 text-xs font-medium',
                  formFieldInput:
                    'bg-slate-900/80 border-slate-700 text-white rounded-xl text-xs py-2 text-slate-100 focus:border-violet-500',
                  footerActionLink: 'text-cyan-400 hover:text-cyan-300 text-xs font-medium',
                  identityPreviewText: 'text-slate-200 text-xs',
                  identityPreviewEditButtonIcon: 'text-cyan-400',
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
                  card: 'bg-transparent shadow-none p-4',
                  headerTitle: 'text-white font-display text-xl font-bold',
                  headerSubtitle: 'text-slate-400 text-xs',
                  formButtonPrimary:
                    'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold py-2.5 rounded-xl border border-violet-400/20',
                  formFieldLabel: 'text-slate-300 text-xs font-medium',
                  formFieldInput:
                    'bg-slate-900/80 border-slate-700 text-white rounded-xl text-xs py-2 text-slate-100 focus:border-violet-500',
                  footerActionLink: 'text-cyan-400 hover:text-cyan-300 text-xs font-medium',
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
