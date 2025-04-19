
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackend } from '@/context/BackendContext';
import { FullPageLoader } from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Registration form validation schema
const registerSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, login, register: registerUser, isLoading } = useBackend();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Set page title
    document.title = 'Sign In | TradeWizard';

    // Redirect if already logged in
    if (user) {
      console.log("User authentication detected, redirecting...", user);
      
      // Redirect to admin dashboard if user is admin, otherwise to customer dashboard
      if (user.is_admin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // The redirect will happen in the useEffect when user state is updated
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
      // The redirect will happen in the useEffect when user state is updated
      toast({
        title: "Registration Successful",
        description: "Your account has been created! Redirecting to dashboard...",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Registration failed. Please try again.";
      
      // Extract the most specific error message
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error patterns to provide friendly messages
      if (errorMessage.toLowerCase().includes("email already registered")) {
        errorMessage = "This email is already registered. Please log in or use a different email.";
      } else if (errorMessage.toLowerCase().includes("all fields are required")) {
        errorMessage = "Please fill out all required fields.";
      } else if (errorMessage.toLowerCase().includes("password")) {
        errorMessage = "Please check your password format.";
      } else if (errorMessage.toLowerCase().includes("email")) {
        errorMessage = "Please check your email format.";
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FullPageLoader text="Loading your account..." />
      </div>
    );
  }
  
  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="section-container py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Your password" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-105"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <span className="mr-2">Signing in</span>
                          <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                      ) : 'Sign In'}
                    </Button>
                  </form>
                </Form>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="text-trading-blue hover:underline font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Your password" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field} 
                              className="transition-all duration-300 focus:ring-2 focus:ring-trading-blue" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-trading-blue hover:bg-trading-darkBlue transition-all duration-300 hover:scale-105"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <span className="mr-2">Creating account</span>
                          <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                      ) : 'Create Account'}
                    </Button>
                  </form>
                </Form>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('login')}
                      className="text-trading-blue hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
