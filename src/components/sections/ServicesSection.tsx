
import { BarChart3, Binary, Bot, Code, LineChart, Zap } from 'lucide-react';
import ServiceCard from '../ui-elements/ServiceCard';
import SectionHeader from '../ui-elements/SectionHeader';

const ServicesSection = () => {
  const services = [
    {
      icon: <Bot size={28} />,
      title: "MT5 Trading Robots",
      description: "Custom-built MT5 robots designed specifically for your trading strategy and risk profile.",
      features: [
        "Fully automated trading execution",
        "Customizable entry and exit rules",
        "Risk management parameters",
        "Backtesting with historical data",
      ]
    },
    {
      icon: <Binary size={28} />,
      title: "Binary Option Robots",
      description: "Precision-engineered binary option robots with high win-rate strategies.",
      features: [
        "High accuracy signal generation",
        "Multiple timeframe analysis",
        "Adaptive market condition filters",
        "Profit maximization algorithms",
      ]
    },
    {
      icon: <Code size={28} />,
      title: "Custom Indicators",
      description: "Bespoke technical indicators to identify unique trading opportunities.",
      features: [
        "Proprietary calculation methods",
        "Early market movement detection",
        "Multi-factor analysis",
        "Visual and alert notifications",
      ]
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Strategy Optimization",
      description: "Fine-tune your existing strategies to improve performance and reduce risk.",
      features: [
        "Parameter optimization",
        "Drawdown reduction",
        "Performance enhancement",
        "Machine learning integration",
      ]
    },
    {
      icon: <Zap size={28} />,
      title: "Trading Signals",
      description: "Expert-level signals derived from our proprietary trading algorithms.",
      features: [
        "Daily trade recommendations",
        "Entry, stop-loss and take-profit levels",
        "Risk-reward analysis",
        "Market commentary",
      ]
    },
    {
      icon: <LineChart size={28} />,
      title: "Performance Analytics",
      description: "Comprehensive reporting and analytics to track your trading performance.",
      features: [
        "Detailed performance metrics",
        "Risk exposure analysis",
        "Strategy attribution",
        "Improvement recommendations",
      ]
    },
  ];

  return (
    <section id="services" className="relative py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-trading-blue/5 rounded-full blur-3xl" />
      </div>
      <div className="section-container relative z-10">
        <SectionHeader
          subtitle="Our Services"
          title="Trading Solutions Designed for Performance"
          description="We build cutting-edge trading robots and tools that give you the edge in today's competitive markets."
          centered
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="opacity-0 animate-on-scroll">
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
