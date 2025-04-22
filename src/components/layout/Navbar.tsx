import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, User, Settings, LogOut, BarChart2, Home, DollarSign, MessageSquare, ShoppingBag } from 'lucide-react';
import { useBackend } from '@/context/BackendContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useBackend();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      // Call the logoutUser function from the BackendContext
      await logoutUser();
      // Then clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      // Force navigate to home and reload the page to clear any in-memory state
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  const isRobotMarketplace = location.pathname === '/robots';
  const isAITradingSignals = location.pathname.includes('/signals');
  const isActiveLink = (path: string) => location.pathname === path;

  if (isAuthPage) return null;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-white h-6 w-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
          </motion.div>
          <div className="font-bold text-white text-xl">TradeWizard</div>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem to="/" label="Home" icon={<Home className="w-4 h-4 mr-1" />} isActive={isActiveLink('/')} />
            <NavItem to="/robots" label="Robot Marketplace" icon={<ShoppingBag className="w-4 h-4 mr-1" />} isActive={isActiveLink('/robots')} />
            <NavItem to="/signals" label="AI Trading Signals" icon={<BarChart2 className="w-4 h-4 mr-1" />} isActive={isActiveLink('/signals')} />

            {user && (
              <NavItem to="/dashboard" label="Dashboard" icon={<Settings className="w-4 h-4 mr-1" />} isActive={isActiveLink('/dashboard')} />
            )}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative border border-gray-700 bg-gray-800/70 hover:bg-gray-800 rounded-full p-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium uppercase">
                      {user.name ? user.name.charAt(0) : user.email?.charAt(0)}
                    </div>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 py-2 bg-gray-900 border border-gray-700 text-white">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>

                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="hover:bg-gray-800 cursor-pointer mt-1">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>

                  {user.is_admin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-gray-800 cursor-pointer">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate('/messages')} className="hover:bg-gray-800 cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-800 cursor-pointer text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/auth">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <MobileNavItem to="/" label="Home" icon={<Home className="w-5 h-5 mr-2" />} />
              <MobileNavItem to="/robots" label="Robot Marketplace" icon={<ShoppingBag className="w-5 h-5 mr-2" />} />
              <MobileNavItem to="/signals" label="AI Trading Signals" icon={<BarChart2 className="w-5 h-5 mr-2" />} />

              {user && (
                <>
                  <MobileNavItem to="/dashboard" label="Dashboard" icon={<Settings className="w-5 h-5 mr-2" />} />
                  {user.is_admin && (
                    <MobileNavItem to="/admin" label="Admin Panel" icon={<DollarSign className="w-5 h-5 mr-2" />} />
                  )}
                  <MobileNavItem to="/messages" label="Messages" icon={<MessageSquare className="w-5 h-5 mr-2" />} />
                  <div className="pt-2 mt-2 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800 py-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// Desktop NavItem component
const NavItem = ({ to, label, icon, isActive }: { to: string; label: string; icon: React.ReactNode, isActive: boolean }) => (
  <Link 
    to={to} 
    className={`px-3 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-gray-800 text-white' 
        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
    }`}
  >
    {icon}
    {label}
  </Link>
);

// Mobile NavItem component
const MobileNavItem = ({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) => (
  <Link 
    to={to} 
    className="flex items-center py-3 px-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;