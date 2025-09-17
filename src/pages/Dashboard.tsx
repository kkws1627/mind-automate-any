import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Plus, History, MessageSquare, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  status: string;
  task_type: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchRecentTasks();
    }
  }, [user, loading, navigate]);

  const fetchRecentTasks = async () => {
    if (!user) return;

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, task_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (tasks) {
      setRecentTasks(tasks);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-[hsl(222_20%_6%)] flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'processing': return 'text-yellow-500';
      default: return 'text-muted-foreground';
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Ready to automate your next task?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            onClick={() => navigate('/task-selection')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">New Task</CardTitle>
              <CardDescription>Create a new automation task</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            onClick={() => navigate('/task-history')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <History className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Task History</CardTitle>
              <CardDescription>View all your past tasks</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            onClick={() => navigate('/feedback')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary-deep to-accent flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Feedback</CardTitle>
              <CardDescription>Share your experience</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>Your latest automations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {taskTypeLabels[task.task_type as keyof typeof taskTypeLabels] || task.task_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tasks yet</p>
                <Button onClick={() => navigate('/task-selection')}>
                  Create Your First Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;