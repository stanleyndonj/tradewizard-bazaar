import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, ShoppingCart, Settings, MessageSquare, BarChart2, ChevronDown } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBackend } from '@/context/BackendContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useBackend();

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
    await logoutUser();
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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg shadow-lg'
          : 'py-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center">
              <img 
                src="/tradeWizard-logo.png" 
                alt="TradeWizard Logo" 
                className="h-10 w-10 mr-3 filter drop-shadow-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                TradeWizard
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Nav Items with hover effects */}
            <motion.button 
              onClick={() => handleSectionNavigation('services')} 
              className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors relative px-2 py-1"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Services</span>
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500" 
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            
            <motion.button 
              onClick={() => handleSectionNavigation('expertise')} 
              className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors relative px-2 py-1"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Expertise</span>
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500" 
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            
            <motion.button 
              onClick={() => handleSectionNavigation('testimonials')} 
              className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors relative px-2 py-1"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">Testimonials</span>
              <motion.span 
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500" 
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                to="/about-us" 
                className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors relative px-2 py-1"
              >
                <span className="relative z-10">About Us</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500" 
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                to="/robot-marketplace" 
                className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors relative px-2 py-1"
              >
                <span className="relative z-10">Marketplace</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500" 
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.div>
            
            {user ? (
              <div className="flex items-center space-x-5">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link 
                    to="/customer-dashboard" 
                    className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link 
                    to="/ai-trading-signals" 
                    className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors"
                  >
                    Trading Signals
                  </Link>
                </motion.div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1 h-auto bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 rounded-lg" aria-label="User menu">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-blue-500">
                          <AvatarFallback className="bg-blue-600 text-white font-medium">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white/90 mr-1">{user.name}</span>
                        <ChevronDown className="h-4 w-4 text-blue-400" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border border-gray-700" align="end">
                    <DropdownMenuLabel className="text-white/90">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild className="focus:bg-gray-700">
                      <Link to="/customer-dashboard" className="flex items-center text-white/80 hover:text-white">
                        <User className="mr-2 h-4 w-4 text-blue-400" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-gray-700">
                      <Link to="/robot-marketplace" className="flex items-center text-white/80 hover:text-white">
                        <ShoppingCart className="mr-2 h-4 w-4 text-blue-400" />
                        Marketplace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-gray-700">
                      <Link to="/ai-trading-signals" className="flex items-center text-white/80 hover:text-white">
                        <BarChart2 className="mr-2 h-4 w-4 text-blue-400" />
                        Trading Signals
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-gray-700">
                      <Link to="/messages" className="flex items-center text-white/80 hover:text-white">
                        <MessageSquare className="mr-2 h-4 w-4 text-blue-400" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild className="focus:bg-gray-700">
                        <Link to="/admin-dashboard" className="flex items-center text-white/80 hover:text-white">
                          <Settings className="mr-2 h-4 w-4 text-blue-400" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 focus:bg-gray-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-lg transition-all duration-200 border border-blue-500/30" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-blue-400 focus:outline-none bg-gray-800/60 p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-lg shadow-lg border-t border-gray-800"
          >
            <div className="flex flex-col space-y-3">
              <motion.button 
                onClick={() => handleSectionNavigation('services')} 
                className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                whileTap={{ scale: 0.98 }}
              >
                Services
              </motion.button>
              <motion.button 
                onClick={() => handleSectionNavigation('expertise')} 
                className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                whileTap={{ scale: 0.98 }}
              >
                Expertise
              </motion.button>
              <motion.button 
                onClick={() => handleSectionNavigation('testimonials')} 
                className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                whileTap={{ scale: 0.98 }}
              >
                Testimonials
              </motion.button>
              <Link 
                to="/about-us" 
                className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
              >
                About Us
              </Link>
              <Link 
                to="/robot-marketplace" 
                className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
              >
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/customer-dashboard" 
                    className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/ai-trading-signals" 
                    className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                  >
                    Trading Signals
                  </Link>
                  <Link 
                    to="/messages" 
                    className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                  >
                    Messages
                  </Link>
                  {user.is_admin && (
                    <Link 
                      to="/admin-dashboard" 
                      className="text-sm font-medium py-2 px-3 text-white/90 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-800/80"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="justify-start p-2 h-auto text-red-400 hover:bg-gray-800/80 hover:text-red-300 mt-2 rounded-md"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-2 shadow-md" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
