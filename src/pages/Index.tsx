import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Brain, Sparkles, ArrowRight, Shield, Zap, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Please enter a valid Gmail address",
        description: "We need your Gmail address to send task confirmations.",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('gmail.com')) {
      toast({
        title: "Gmail address required",
        description: "Please use your Gmail address for the integration.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    // Simulate email validation
    setTimeout(() => {
      setIsValidating(false);
      localStorage.setItem('mindUserEmail', email);
      toast({
        title: "Email verified successfully!",
        description: "Welcome to MIND. Let's get started with your first automation task.",
      });
      navigate('/task-selection');
    }, 1500);
  };

  const features = [
    {
      icon: Mail,
      title: "Email Automation",
      description: "Send messages and emails automatically through Gmail integration"
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Your data is encrypted and processed with enterprise-grade security"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute complex tasks in seconds with AI-powered automation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              MIND
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/feedback')}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Model Integrated Network for Delegation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Automate Anything
            </span>
            <br />
            <span className="text-foreground">with Natural Language</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            MIND transforms your natural language instructions into automated actions. 
            Send emails, order products, book tickets, and more - all through simple conversation.
          </p>

          {/* Email Collection Card */}
          <Card className="max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm mind-shadow-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                Enter your Gmail address to begin automating tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Gmail Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />
              </div>
              <Button
                onClick={handleEmailSubmit}
                disabled={isValidating}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Start Automating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We'll use this to send task confirmations and updates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300 hover:bg-card/50"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border/30">
        <div className="text-center text-muted-foreground">
          <p>© 2025 MIND - Model Integrated Network for Delegation</p>
          <p className="text-sm mt-1">Powered by artificial intelligence and secure integrations</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;