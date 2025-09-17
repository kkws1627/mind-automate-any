import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Brain, Sparkles, ArrowRight, Shield, Zap, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
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
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/feedback')}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            )}
          </div>
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

          {/* Get Started Card */}
          <Card className="max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm mind-shadow-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Get Started
              </CardTitle>
              <CardDescription>
                {user ? 'Welcome back! Ready to automate your tasks?' : 'Sign in with Google to begin automating tasks'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll use your Gmail account to send task confirmations and automate email tasks
                  </p>
                </>
              )}
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