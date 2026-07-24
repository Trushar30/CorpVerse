import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { useEffect, Component } from 'react';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import { setupInterceptors } from './api/client';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Component to configure API token interceptor inside Clerk context
function ClerkAxiosSync({ children }) {
  try {
    const { getToken } = useAuth();
    useEffect(() => {
      setupInterceptors(getToken);
    }, [getToken]);
  } catch (err) {
    console.warn('Clerk auth hook unavailable:', err);
  }

  return children;
}

// React Error Boundary to catch Clerk initialization failures gracefully
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Clerk Error Boundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback rendering without Clerk wrapper if Clerk key fails
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function App() {
  const AppRoutes = (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
      <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />

      {/* App Routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard/*" element={<Dashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  // If no valid Clerk key is provided in .env, render standard app without Clerk crash
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.includes('placeholder')) {
    return <BrowserRouter>{AppRoutes}</BrowserRouter>;
  }

  return (
    <ErrorBoundary fallback={<BrowserRouter>{AppRoutes}</BrowserRouter>}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ClerkAxiosSync>
          <BrowserRouter>{AppRoutes}</BrowserRouter>
        </ClerkAxiosSync>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
