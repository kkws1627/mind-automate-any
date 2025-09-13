import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TaskInput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [taskDescription, setTaskDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const taskType = searchParams.get('type') || 'messages';

  const taskConfig = {
    messages: {
      title: 'Messages & Emails',
      description: 'Describe the email or message you want to send',
      placeholder: 'Example: "Send a follow-up email to john@example.com about the meeting tomorrow, asking if he needs any additional materials and confirming the 2 PM time slot."',
      examples: [
        'Send a thank you email to my recent clients',
        'Message my team about the project deadline',
        'Send birthday wishes to contacts'
      ]
    },
    shopping: {
      title: 'Amazon Orders',
      description: 'Tell me what you want to order and your preferences',
      placeholder: 'Example: "Order a wireless mouse under $50 with good reviews, preferably from Logitech or Microsoft, and have it delivered to my home address."',
      examples: [
        'Order office supplies for my workspace',
        'Buy birthday gift for a 10-year-old',
        'Get groceries for the week'
      ]
    },
    entertainment: {
      title: 'Movie Tickets',
      description: 'Specify the movie, location, and timing preferences',
      placeholder: 'Example: "Book 2 tickets for the latest Marvel movie at a theater near downtown Seattle, preferably for evening shows this weekend."',
      examples: [
        'Book tickets for date night this Friday',
        'Get family tickets for the new animation',
        'Reserve seats for IMAX screening'
      ]
    }
  };

  const config = taskConfig[taskType as keyof typeof taskConfig] || taskConfig.messages;

  const handleSubmit = async () => {
    if (!taskDescription.trim()) {
      toast({
        title: "Please describe your task",
        description: "Add some details about what you'd like MIND to do for you.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      toast({
        title: "Task received successfully!",
        description: "MIND is processing your request. You'll receive a confirmation email shortly.",
      });
      
      setIsProcessing(false);
      setTaskDescription('');
      
      // Navigate back or to a success page
      setTimeout(() => navigate('/task-selection'), 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)] p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/task-selection')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Task Selection
        </Button>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm mind-shadow-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">{config.title}</CardTitle>
            <CardDescription className="text-lg">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label htmlFor="task-input" className="block text-sm font-medium mb-2">
                Describe your task in natural language
              </label>
              <Textarea
                id="task-input"
                placeholder={config.placeholder}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Example prompts:</h4>
              <div className="grid gap-2">
                {config.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setTaskDescription(example)}
                    className="text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm border border-border/30 hover:border-primary/30"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Processing with MIND...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Execute Task
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            MIND will process your request and send you a confirmation email once completed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskInput;