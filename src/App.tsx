
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { BackendProvider } from "./context/BackendContext";
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
import AITradingSignals from "./pages/AITradingSignals";
import { TradingLoader } from "./components/ui/loader";

const App = () => {
  return (
    <BackendProvider>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><TradingLoader text="Loading TradeWizard..." /></div>}>
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
          <Route path="/ai-trading-signals" element={<AITradingSignals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BackendProvider>
  );
};

export default App;
