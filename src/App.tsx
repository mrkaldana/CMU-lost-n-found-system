import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ItemsProvider } from "@/context/ItemsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { AdminNavbar } from "@/components/AdminNavbar";
import Index from "./pages/Index";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminItems from "./pages/AdminItems";
import NotFound from "./pages/NotFound";
import { setupGlobalHaptics } from "@/lib/haptics";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminLoginRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function HomeRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomeRoute><Index /></HomeRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><HomeRoute><Profile /></HomeRoute></ProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/items" element={<AdminRoute><AdminItems /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => {
  useEffect(() => {
    return setupGlobalHaptics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ItemsProvider>
              <AppRoutes />
            </ItemsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
