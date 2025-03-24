
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  // Handle scroll to section on home page or navigate to home page and then scroll
  const handleSectionNavigation = (sectionId: string) => {
    if (isHomePage) {
      // If already on home page, just scroll to the section
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to home with the section hash
      window.location.href = `/#${sectionId}`;
    }
  };

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
            <Link to="/" className="text-2xl font-bold text-trading-charcoal">
              TradeWizard
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleSectionNavigation('services')} 
              className="text-sm font-medium hover:text-trading-blue transition-colors"
            >
              Services
            </button>
            <button 
              onClick={() => handleSectionNavigation('expertise')} 
              className="text-sm font-medium hover:text-trading-blue transition-colors"
            >
              Expertise
            </button>
            <button 
              onClick={() => handleSectionNavigation('testimonials')} 
              className="text-sm font-medium hover:text-trading-blue transition-colors"
            >
              Testimonials
            </button>
            <Link to="/about-us" className="text-sm font-medium hover:text-trading-blue transition-colors">
              About Us
            </Link>
            <button 
              onClick={() => handleSectionNavigation('contact')} 
              className="text-sm font-medium hover:text-trading-blue transition-colors"
            >
              Contact
            </button>
            <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white" asChild>
              <Link to="/robot-selection">Get Started</Link>
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
              <button 
                onClick={() => handleSectionNavigation('services')} 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => handleSectionNavigation('expertise')} 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                Expertise
              </button>
              <button 
                onClick={() => handleSectionNavigation('testimonials')} 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                Testimonials
              </button>
              <Link 
                to="/about-us" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                About Us
              </Link>
              <button 
                onClick={() => handleSectionNavigation('contact')} 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                Contact
              </button>
              <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white w-full" asChild>
                <Link to="/robot-selection">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
