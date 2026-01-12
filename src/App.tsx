import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CookieConsent } from "@/components/CookieConsent";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import DashboardOpportunities from "./pages/DashboardOpportunities";
import DashboardOpportunityDetail from "./pages/DashboardOpportunityDetail";
import DashboardDocuments from "./pages/DashboardDocuments";
import DashboardEmailScanner from "./pages/DashboardEmailScanner";
import DashboardRequests from "./pages/DashboardRequests";
import DashboardNotifications from "./pages/DashboardNotifications";
import DashboardSettings from "./pages/DashboardSettings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookie from "./pages/Cookie";
import Opportunities from "./pages/Opportunities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/opportunita" element={<Opportunities />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie" element={<Cookie />} />
            
            {/* Quiz route - protected */}
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            
            {/* Dashboard routes - protected with layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="opportunities" element={<DashboardOpportunities />} />
              <Route path="opportunities/:id" element={<DashboardOpportunityDetail />} />
              <Route path="documents" element={<DashboardDocuments />} />
              <Route path="email-scanner" element={<DashboardEmailScanner />} />
              <Route path="requests" element={<DashboardRequests />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
