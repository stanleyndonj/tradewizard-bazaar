
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Mail, MapPin, Phone, Lock } from 'lucide-react';
import SectionHeader from '../ui-elements/SectionHeader';
import { toast } from '@/hooks/use-toast';

const ContactSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Set auth required animation
      setAuthRequired(true);
      setTimeout(() => setAuthRequired(false), 1500);
      
      // Store form data and redirect to auth page
      localStorage.setItem('redirectAfterAuth', '/messages');
      localStorage.setItem('contactFormData', JSON.stringify(formData));
      
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages to our team",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
      
      // Redirect to auth page after a short delay for animation
      setTimeout(() => {
        navigate('/auth', { 
          state: { 
            redirectAfter: '/messages', 
            message: "Please sign in to continue with your message"
          } 
        });
      }, 1000);
      return;
    }
    
    // Simulate form submission and redirect to messages
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      
      // Redirect to messages page
      navigate('/messages');
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-trading-blue/5 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        <SectionHeader
          subtitle="Get In Touch"
          title="Ready to Elevate Your Trading?"
          description="Let's discuss how our custom trading robots can help you achieve your financial goals."
          centered
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mt-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-2xl space-y-6 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-trading-blue/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-trading-blue/20 hover:scale-110">
                  <Mail size={20} className="text-trading-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Us</p>
                  <p className="font-medium">ndonjstanley@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-trading-blue/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-trading-blue/20 hover:scale-110">
                  <Phone size={20} className="text-trading-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Call Us</p>
                  <p className="font-medium">+254799010442</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-trading-blue/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-trading-blue/20 hover:scale-110">
                  <MapPin size={20} className="text-trading-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Developer</p>
                  <p className="font-medium">Stanley Paul Ndonj<br />Software Developer and Trader</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8 rounded-2xl transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
              <p className="text-muted-foreground mb-6">We're available during market hours to ensure you get the support you need.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 8:00 PM ET</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 2:00 PM ET</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className={`glass-card p-8 rounded-2xl transition-all duration-300 hover:shadow-lg ${authRequired ? 'animate-pulse border-2 border-red-500' : ''}`}>
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                Send Us a Message
                {authRequired && (
                  <div className="ml-3 flex items-center text-red-500 animate-fade-in">
                    <Lock size={16} className="mr-1" />
                    <span className="text-sm">Authentication required</span>
                  </div>
                )}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium mb-1">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-trading-blue focus:border-trading-blue transition-all duration-300"
                    >
                      <option value="" disabled>Select a service</option>
                      <option value="mt5-robot">MT5 Trading Robot</option>
                      <option value="binary-robot">Binary Option Robot</option>
                      <option value="custom-indicator">Custom Indicator</option>
                      <option value="strategy-optimization">Strategy Optimization</option>
                      <option value="trading-signals">Trading Signals</option>
                      <option value="performance-analytics">Performance Analytics</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your trading goals and needs..."
                    rows={5}
                    required
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-trading-blue"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-trading-blue hover:bg-trading-darkBlue text-white transition-all duration-300 hover:scale-[1.02]"
                >
                  {isSubmitting ? 'Sending...' : isSubmitted ? (
                    <span className="flex items-center">
                      <CheckCircle2 size={18} className="mr-2" />
                      Message Sent
                    </span>
                  ) : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
