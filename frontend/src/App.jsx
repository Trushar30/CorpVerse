import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkingDashboard from './pages/WorkingDashboard';
import FounderDashboard from './pages/FounderDashboard';

// Redirect authenticated users away from auth pages to their appropriate setup stage
function GuestRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (!user?.isVerified) return <Navigate to="/verify-email" replace />;
    if (!user?.profileComplete) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Protect routes that require login and enforce verification + profile completion
function ProtectedRoute({ children, roles, allowUnverified = false, allowIncompleteProfile = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;

  // Admin always bypasses candidate setup (email verification & candidate onboarding)
  if (user?.role === 'admin') {
    if (roles && !roles.includes('admin')) return <Navigate to="/admin" replace />;
    return children;
  }

  // 1. Force email verification for non-admin users
  if (!user?.isVerified && !allowUnverified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 2. Force profile setup for non-admin users
  if (user?.isVerified && !user?.profileComplete && !allowIncompleteProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Role check
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Smart redirect after login — sends user to their role-appropriate dashboard
function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/sign-in" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'working':
      return <Navigate to="/dashboard/working" replace />;
    case 'founder':
      return <Navigate to="/dashboard/founder" replace />;
    default:
      return <Navigate to="/dashboard/job-seeker" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/sign-in" element={<GuestRoute><AuthPage mode="sign-in" /></GuestRoute>} />
          <Route path="/sign-up" element={<GuestRoute><AuthPage mode="sign-up" /></GuestRoute>} />

          {/* Email Verification */}
          <Route path="/verify-email" element={<ProtectedRoute allowUnverified={true} allowIncompleteProfile={true}><VerifyEmail /></ProtectedRoute>} />

          {/* Profile Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute allowIncompleteProfile={true}><Onboarding /></ProtectedRoute>} />

          {/* Smart dashboard redirect */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

          {/* Role dashboards */}
          <Route path="/dashboard/job-seeker/*" element={<ProtectedRoute roles={['job_seeker']}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/working/*" element={<ProtectedRoute roles={['working']}><WorkingDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/founder/*" element={<ProtectedRoute roles={['founder']}><FounderDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
