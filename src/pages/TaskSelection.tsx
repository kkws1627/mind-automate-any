import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ShoppingBag, Ticket, ArrowLeft } from 'lucide-react';

const TaskSelection = () => {
  const navigate = useNavigate();

  const taskTypes = [
    {
      id: 'messages',
      title: 'Messages & Emails',
      description: 'Send automated messages and emails through Gmail integration',
      icon: MessageCircle,
      color: 'from-primary to-primary-glow'
    },
    {
      id: 'shopping',
      title: 'Amazon Orders',
      description: 'Automate product searches and place orders on Amazon',
      icon: ShoppingBag,
      color: 'from-accent to-primary'
    },
    {
      id: 'entertainment',
      title: 'Movie Tickets',
      description: 'Book movie tickets automatically through BookMyShow',
      icon: Ticket,
      color: 'from-primary-deep to-accent'
    }
  ];

  const handleTaskSelect = (taskId: string) => {
    navigate(`/task-input?type=${taskId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)] p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Choose Your Task Type
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the type of automation you'd like MIND to handle for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {taskTypes.map((task) => {
            const IconComponent = task.icon;
            return (
              <Card 
                key={task.id}
                className="group cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                onClick={() => handleTaskSelect(task.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${task.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {task.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="hero" 
                    className="w-full group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300"
                  >
                    Select Task
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/feedback')}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Provide Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskSelection;