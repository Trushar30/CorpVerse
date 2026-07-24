import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import { setupInterceptors } from './api/client';

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_placeholder_key_for_development';

// Component to configure API token interceptor inside Clerk context
function ClerkAxiosSync({ children }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setupInterceptors(getToken);
  }, [getToken]);

  return children;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkAxiosSync>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
            <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />

            {/* Protected Routes */}
            <Route
              path="/onboarding"
              element={
                <SignedIn>
                  <Onboarding />
                </SignedIn>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <SignedIn>
                  <Dashboard />
                </SignedIn>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ClerkAxiosSync>
    </ClerkProvider>
  );
}
