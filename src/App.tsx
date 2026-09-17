import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { FullPageLoader } from "@/components/common/LoadingSpinner";
import { InstallBanner } from "@/components/install/InstallBanner";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Vitals from "./pages/Vitals";
import Symptoms from "./pages/Symptoms";
import MentalHealth from "./pages/MentalHealth";
import MedicalImages from "./pages/MedicalImages";
import Medications from "./pages/Medications";
import AssessmentHistory from "./pages/AssessmentHistory";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Wearables from "./pages/Wearables";
import WearablesCallback from "./pages/WearablesCallback";
import Install from "./pages/Install";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      onError: (error) => {
        console.error('[API Mutation Error]', error);
        toast.error('Something went wrong', {
          description: error instanceof Error ? error.message : 'Please try again.',
        });
      },
    },
  },
});

// Global query error handler — catches unhandled Supabase fetch failures
queryClient.getQueryCache().config.onError = (error) => {
  if (import.meta.env.DEV) console.error('[Query Error]', error);
  toast.error('Failed to load data', {
    description: error instanceof Error ? error.message : 'Please check your connection and try again.',
    duration: 4000,
  });
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();

  if (loading) return <FullPageLoader />;
  if (error) return <FullPageLoader message={error} />;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/install" element={<Install />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
      <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
      <Route path="/mental-health" element={<ProtectedRoute><MentalHealth /></ProtectedRoute>} />
      <Route path="/images" element={<ProtectedRoute><MedicalImages /></ProtectedRoute>} />
      <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><AssessmentHistory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/wearables" element={<ProtectedRoute><Wearables /></ProtectedRoute>} />
      <Route path="/wearables/callback" element={<ProtectedRoute><WearablesCallback /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    const handler = () => {
      toast.success("App updated!", {
        description: "You're now running the latest version.",
        duration: 3000,
      });
    };
    window.addEventListener("pwa-updated", handler);
    return () => window.removeEventListener("pwa-updated", handler);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OfflineBanner />
              <AppRoutes />
              <InstallBanner />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
