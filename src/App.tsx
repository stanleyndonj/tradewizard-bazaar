
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BackendProvider } from './context/BackendContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import RobotMarketplace from './pages/RobotMarketplace';
import RobotConfiguration from './pages/RobotConfiguration';
import AITradingSignals from './pages/AITradingSignals';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <BackendProvider>
      <SocketProvider>
        <Routes>
        {/* Main routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Dashboard routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        
        {/* Robot routes */}
        <Route path="/marketplace" element={<RobotMarketplace />} />
        <Route path="/robot-marketplace" element={<RobotMarketplace />} />
        <Route path="/robot-configuration" element={<RobotConfiguration />} />
        
        {/* Trading features */}
        <Route path="/ai-trading-signals" element={<AITradingSignals />} />
        <Route path="/ai-trading-signals/:tab" element={<AITradingSignals />} />
        <Route path="/trading-signals" element={<AITradingSignals />} />
        <Route path="/trading" element={<AITradingSignals />} />
        
        {/* Messaging */}
        <Route path="/messages" element={<Messages />} />
        
        {/* Not found - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </SocketProvider>
    </BackendProvider>
  );
}

export default App;
