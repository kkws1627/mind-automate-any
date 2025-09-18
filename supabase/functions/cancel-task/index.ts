import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelTaskRequest {
  taskId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { taskId }: CancelTaskRequest = await req.json();

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // First, check if the task exists and belongs to the user
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('id, status, user_id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if task can be cancelled
    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: `Cannot cancel task with status: ${task.status}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update task status to cancelled
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'cancelled',
        error_message: 'Task was cancelled by user',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      throw updateError;
    }

    // Log the cancellation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        task_id: taskId,
        action: 'task_cancelled',
        resource_type: 'task',
        resource_id: taskId,
        new_values: { status: 'cancelled' },
        old_values: { status: task.status }
      });

    console.log('Task cancelled successfully:', updatedTask);

    return new Response(
      JSON.stringify({ 
        success: true, 
        task: updatedTask,
        message: 'Task cancelled successfully'
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in cancel-task function:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);