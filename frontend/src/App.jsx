import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
import Landing from '@pages/Landing';
import AuthPage from '@pages/auth/AuthPage';
import VerifyEmail from '@pages/auth/VerifyEmail';
import Onboarding from '@pages/auth/Onboarding';
import JobSeekerDashboard from '@pages/dashboards/JobSeekerDashboard';
import AdminDashboard from '@pages/dashboards/AdminDashboard';
import EmployeeDashboard from '@pages/dashboards/EmployeeDashboard';
import FounderDashboard from '@pages/dashboards/FounderDashboard';
import AIManagerDashboard from '@pages/dashboards/AIManagerDashboard';
import InterviewRoom from '@pages/InterviewRoom';
import Leaderboard from '@pages/Leaderboard';
import CursorGrid from '@components/common/CursorGrid';

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

  // Admin always has superuser bypass (can view all dashboards & admin panel)
  if (user?.role === 'admin') {
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
    case 'ai_manager':
      return <Navigate to="/dashboard/ai-manager" replace />;
    case 'working':
      return <Navigate to="/dashboard/working" replace />;
    case 'founder':
      return <Navigate to="/dashboard/founder" replace />;
    default:
      return <Navigate to="/dashboard/job-seeker" replace />;
  }
}

function MainLayout() {
  const location = useLocation();

  // Hide the interactive CursorGrid background on dashboard, admin, and leaderboard routes
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/leaderboard');

  return (
    <div className="relative min-h-screen bg-[#090C15]">
      {!isDashboardRoute && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <CursorGrid
            cellSize={60}
            color="#00f5a0"
            radius={180}
            falloff="smooth"
            holdTime={500}
            fadeDuration={800}
            lineWidth={1.2}
            maxOpacity={0.8}
            fillOpacity={0.15}
            gridOpacity={0.08}
            cellRadius={0}
            clickPulse={true}
            pulseSpeed={700}
          />
        </div>
      )}
      <div className="relative z-10">
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

          {/* Global Leaderboard & Trophy Room */}
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

          {/* Role dashboards */}
          <Route path="/dashboard/job-seeker/*" element={<ProtectedRoute roles={['job_seeker']}><JobSeekerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/working/*" element={<ProtectedRoute roles={['working']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/founder/*" element={<ProtectedRoute roles={['founder']}><FounderDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/ai-manager/*" element={<ProtectedRoute roles={['ai_manager', 'admin']}><AIManagerDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* Interview */}
          <Route path="/interview/:applicationId" element={<ProtectedRoute roles={['job_seeker']}><InterviewRoom /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

