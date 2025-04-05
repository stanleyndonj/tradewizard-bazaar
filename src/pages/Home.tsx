
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, LineChart, Shield } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Revolutionize Your Trading with AI
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Access powerful trading robots, AI signals, and expert analysis to maximize your profits in any market condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/robot-marketplace')} 
                size="lg" 
                className="bg-trading-blue hover:bg-trading-darkBlue text-white font-medium px-8"
              >
                Explore Robots
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                variant="outline" 
                className="font-medium px-8"
              >
                Sign Up Now
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide a comprehensive suite of trading tools designed to help both beginners and professionals succeed in the market.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:translate-y-[-5px]">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Bot className="h-6 w-6 text-trading-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trading Robots</h3>
                <p className="text-gray-600">
                  Automated trading solutions for MT5 and Binary Options platforms, designed to execute trades with precision.
                </p>
                <Button 
                  onClick={() => navigate('/robot-marketplace')} 
                  variant="link" 
                  className="mt-4 p-0 text-trading-blue font-medium"
                >
                  Browse Robots
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {/* Service 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:translate-y-[-5px]">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <LineChart className="h-6 w-6 text-trading-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Trading Signals</h3>
                <p className="text-gray-600">
                  Real-time market insights and trading signals powered by our advanced AI algorithms.
                </p>
                <Button 
                  onClick={() => navigate('/ai-trading-signals')} 
                  variant="link" 
                  className="mt-4 p-0 text-trading-blue font-medium"
                >
                  See Signals
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {/* Service 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:translate-y-[-5px]">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Shield className="h-6 w-6 text-trading-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Custom Robot Solutions</h3>
                <p className="text-gray-600">
                  Tailor-made trading robots designed to meet your specific trading strategy and requirements.
                </p>
                <Button 
                  onClick={() => navigate('/robot-configuration')} 
                  variant="link" 
                  className="mt-4 p-0 text-trading-blue font-medium"
                >
                  Request Custom Robot
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Expertise Section */}
        <section id="expertise" className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Expertise</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                With years of experience in the trading industry, our team brings knowledge and technical expertise to every solution we offer.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Expertise items */}
              {["Algorithmic Trading", "Technical Analysis", "Risk Management", "Market Prediction"].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <h3 className="text-lg font-bold mb-2">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't just take our word for it. Here's what traders using our platform have to say.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sample testimonials */}
              {[
                {
                  name: "David K.",
                  role: "Forex Trader",
                  text: "The MT5 robots have completely changed my trading approach. More consistent returns with less time spent analyzing markets."
                },
                {
                  name: "Sarah M.",
                  role: "Options Trader",
                  text: "AI trading signals have been incredibly accurate. I've seen a 40% improvement in my win rate since subscribing."
                },
                {
                  name: "Michael R.",
                  role: "Day Trader",
                  text: "Customer support is outstanding. They helped me configure my custom robot perfectly for my trading strategy."
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-lg">
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-trading-blue text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Trading?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of traders already using TradeWizard to achieve their financial goals.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="bg-white text-trading-blue hover:bg-gray-100 font-medium px-8"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
