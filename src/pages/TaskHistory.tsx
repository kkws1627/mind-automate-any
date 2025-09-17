import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  task_type: string;
  created_at: string;
  completed_at: string | null;
  ai_interpretation: any;
  result: any;
  error_message: string | null;
}

const TaskHistory = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchTasks();
    }
  }, [user, loading, navigate]);

  const fetchTasks = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)] flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const taskTypeLabels = {
    messages: 'Email/Message',
    shopping: 'Amazon Order',
    entertainment: 'Movie Booking'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

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
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Task History</h1>
          <p className="text-muted-foreground">View and manage all your automation tasks</p>
        </div>

        {tasks.length > 0 ? (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <CardTitle className="text-xl">{task.title}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-base mb-2">
                        {taskTypeLabels[task.task_type as keyof typeof taskTypeLabels] || task.task_type}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(task.created_at).toLocaleString()}
                        {task.completed_at && (
                          <> • Completed: {new Date(task.completed_at).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Task Description:</h4>
                    <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                      {task.description}
                    </p>
                  </div>

                  {task.ai_interpretation && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI Analysis:</h4>
                      <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans">
                          {typeof task.ai_interpretation === 'object' 
                            ? JSON.stringify(task.ai_interpretation, null, 2)
                            : task.ai_interpretation}
                        </pre>
                      </div>
                    </div>
                  )}

                  {task.result && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Result:</h4>
                      <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans">
                          {typeof task.result === 'object' 
                            ? JSON.stringify(task.result, null, 2)
                            : task.result}
                        </pre>
                      </div>
                    </div>
                  )}

                  {task.error_message && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-red-500">Error:</h4>
                      <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {task.error_message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first automation task
              </p>
              <Button onClick={() => navigate('/task-selection')}>
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TaskHistory;