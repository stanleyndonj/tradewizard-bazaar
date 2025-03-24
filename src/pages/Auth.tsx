
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import SectionHeader from '@/components/ui-elements/SectionHeader';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';

interface LocationState {
  redirectAfter?: string;
  message?: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    document.title = 'Sign In / Sign Up | TradeWizard';
    window.scrollTo(0, 0);
    
    // Check for redirectAfterAuth in localStorage
    const redirectAfterAuth = localStorage.getItem('redirectAfterAuth');
    if (redirectAfterAuth) {
      setRedirectPath(redirectAfterAuth);
      setRedirectMessage("Please sign in to continue");
      localStorage.removeItem('redirectAfterAuth');
    }
    
    // Check for redirect from location state
    const state = location.state as LocationState;
    if (state?.redirectAfter) {
      setRedirectPath(state.redirectAfter);
      setRedirectMessage(state.message || "Please sign in to continue");
    }
  }, [location]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Demo login - in a real app, you would authenticate with a backend
    if (loginData.email === 'admin@tradewizard.com' && loginData.password === 'admin123') {
      localStorage.setItem('user', JSON.stringify({ 
        email: loginData.email, 
        name: 'Admin User',
        role: 'admin' 
      }));
      toast({
        title: "Success",
        description: "Logged in as admin successfully",
      });
      navigate('/admin-dashboard');
      return;
    }

    // Mock login for demo purposes
    localStorage.setItem('user', JSON.stringify({ 
      email: loginData.email, 
      name: loginData.email.split('@')[0],
      role: 'user' 
    }));
    
    toast({
      title: "Success",
      description: "Logged in successfully",
    });
    
    // Redirect to the saved path or default to messages
    navigate(redirectPath || '/messages');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Mock registration - in a real app, you would register with a backend
    localStorage.setItem('user', JSON.stringify({ 
      email: registerData.email, 
      name: registerData.name,
      role: 'user' 
    }));
    
    toast({
      title: "Success",
      description: "Account created successfully",
    });
    
    // Redirect to the saved path or default to messages
    navigate(redirectPath || '/messages');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-20">
          <SectionHeader
            subtitle="Account Access"
            title={activeTab === "login" ? "Welcome Back" : "Create Your Account"}
            description={activeTab === "login" 
              ? "Sign in to your TradeWizard account to access your messages and trading tools."
              : "Join TradeWizard today to get started with custom trading robots and expert support."
            }
            centered
          />
          
          <div className="max-w-md mx-auto mt-8">
            {redirectMessage && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 animate-fade-in flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Authentication required</p>
                  <p className="text-sm">{redirectMessage}</p>
                </div>
              </div>
            )}
            
            <div className="glass-card p-8 rounded-2xl transition-all duration-300 hover:shadow-lg">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="animate-fade-in">
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="you@example.com"
                          className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="••••••••"
                          className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-[1.02]">
                      Sign In
                    </Button>
                    
                    <div className="text-center text-sm">
                      <p className="text-muted-foreground">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('register')}
                          className="text-trading-blue hover:underline"
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="animate-fade-in">
                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-name"
                          name="name"
                          type="text"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          placeholder="John Doe"
                          className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="you@example.com"
                          className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="••••••••"
                          className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-confirm-password"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="••••••••"
                          className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-[1.02]">
                      Create Account
                    </Button>
                    
                    <div className="text-center text-sm">
                      <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="text-trading-blue hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
