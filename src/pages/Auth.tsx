import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useBackend } from '@/context/BackendContext';
import { Loader2 } from 'lucide-react';
import ParallaxContainer from '@/components/ui/parallax-container';
// Fix the import
import TradingLoader from '@/components/ui/loader';

const Auth = () => {
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, isLoading } = useBackend();
  
  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authType === 'login') {
        await login(email, password);
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });
        navigate(from, { replace: true });
      } else {
        await register(name, email, password);
        toast({
          title: "Registration Successful",
          description: "You have successfully registered.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate.",
        variant: "destructive",
      });
    }
  };

  return (
    <ParallaxContainer className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{authType === 'login' ? 'Login' : 'Create Account'}</CardTitle>
            <CardDescription className="text-center">
              {authType === 'login' ? 'Enter your email and password to login' : 'Enter your details to create an account'}
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue={authType} className="px-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" onClick={() => setAuthType('login')}>Login</TabsTrigger>
              <TabsTrigger value="register" onClick={() => setAuthType('register')}>Register</TabsTrigger>
            </TabsList>
          </Tabs>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit}>
              <TabsContent value="register">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
              </TabsContent>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <CardFooter className="flex justify-center mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authType === 'login' ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : (
                    authType === 'login' ? 'Login' : 'Create Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </ParallaxContainer>
  );
};

export default Auth;
