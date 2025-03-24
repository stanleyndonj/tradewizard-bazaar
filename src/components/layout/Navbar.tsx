
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-4 bg-white/80 backdrop-blur-lg shadow-subtle'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold text-trading-charcoal">
              TradeWizard
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-sm font-medium hover:text-trading-blue transition-colors">
              Services
            </a>
            <a href="#expertise" className="text-sm font-medium hover:text-trading-blue transition-colors">
              Expertise
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-trading-blue transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-trading-blue transition-colors">
              Contact
            </a>
            <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 p-4 bg-white/90 backdrop-blur-lg shadow-subtle border-t border-gray-100 animate-fade-down">
            <div className="flex flex-col space-y-4">
              <a 
                href="#services" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Services
              </a>
              <a 
                href="#expertise" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Expertise
              </a>
              <a 
                href="#testimonials" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Testimonials
              </a>
              <a 
                href="#contact" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>
              <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white w-full">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
