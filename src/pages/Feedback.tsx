import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Please provide feedback",
        description: "Your feedback helps us improve MIND.",
        variant: "destructive"
      });
      return;
    }

    if (!rating) {
      toast({
        title: "Please provide a rating",
        description: "Help us understand your experience.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          message: feedback,
          email: email || null,
          category,
          rating
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for helping us improve MIND. We'll review your suggestions.",
      });
      
      setFeedback('');
      setEmail('');
      setRating('');
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)] p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mind-shadow-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">Share Your Feedback</CardTitle>
            <CardDescription className="text-lg">
              Help us improve MIND with your suggestions and ideas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="category">Feedback Category</Label>
              <RadioGroup value={category} onValueChange={setCategory}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general">General Feedback</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature">Feature Request</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug">Bug Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ui" id="ui" />
                  <Label htmlFor="ui">UI/UX Improvement</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="rating">How would you rate your experience?</Label>
              <RadioGroup value={rating} onValueChange={setRating}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="5" />
                  <Label htmlFor="5" className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Excellent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="4" />
                  <Label htmlFor="4">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="3" />
                  <Label htmlFor="3">Average</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="2" />
                  <Label htmlFor="2">Poor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="1" />
                  <Label htmlFor="1">Very Poor</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think about MIND, what features you'd like to see, or any issues you've encountered..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                Leave your email if you'd like us to follow up with you
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4 animate-pulse" />
                  Submitting Feedback...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;