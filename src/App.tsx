
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import RobotSelection from "./pages/RobotSelection";
import RobotConfiguration from "./pages/RobotConfiguration";
import Auth from "./pages/Auth";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RobotMarketplace from "./pages/RobotMarketplace";
import CustomerDashboard from "./pages/CustomerDashboard";
import { BackendProvider } from "./context/BackendContext";

const App = () => {
  // Create a client instance that persists across renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  // Check for API URL environment variable
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      console.warn('Warning: VITE_API_BASE_URL environment variable is not set. Using default http://localhost:8000/api');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BackendProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/robot-selection" element={<RobotSelection />} />
              <Route path="/configure-robot/:type" element={<RobotConfiguration />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/robot-marketplace" element={<RobotMarketplace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BackendProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
