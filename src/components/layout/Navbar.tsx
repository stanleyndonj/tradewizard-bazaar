
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, ShoppingCart, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBackend } from '@/context/BackendContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useBackend();

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
      // If on another page, navigate to home and then scroll after the page loads
      navigate('/');
      // Wait for the navigation to complete and DOM to update
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
            <Link to="/robot-marketplace" className="text-sm font-medium hover:text-trading-blue transition-colors">
              Marketplace
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/customer-dashboard" className="text-sm font-medium hover:text-trading-blue transition-colors">
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" aria-label="User menu">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 bg-trading-blue text-white">
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/customer-dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/robot-marketplace" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Marketplace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            )}
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
              <Link 
                to="/robot-marketplace" 
                className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
              >
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/customer-dashboard" 
                    className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/messages" 
                    className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                  >
                    Messages
                  </Link>
                  {user.is_admin && (
                    <Link 
                      to="/admin-dashboard" 
                      className="text-sm font-medium py-2 hover:text-trading-blue transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="justify-start p-0 h-auto text-red-500 hover:bg-transparent hover:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <Button className="bg-trading-blue hover:bg-trading-darkBlue text-white w-full" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
