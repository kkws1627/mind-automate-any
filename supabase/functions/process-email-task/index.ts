import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTaskRequest {
  taskId: string;
  interpretation: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, interpretation, userEmail }: EmailTaskRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing email task:', { taskId, userEmail });

    // Parse AI interpretation (simulate email processing)
    let emailResult = {};
    let status = 'completed';
    let errorMessage = null;

    try {
      // Simulate email processing logic
      // In a real implementation, this would:
      // 1. Parse recipients from the AI interpretation
      // 2. Generate email content
      // 3. Use Gmail API to send emails
      // 4. Track delivery status

      // For now, simulate successful email processing
      emailResult = {
        action: 'email_sent',
        recipients: ['example@gmail.com'], // Would be parsed from interpretation
        subject: 'Automated Email from MIND',
        message: 'This email was sent automatically based on your request.',
        timestamp: new Date().toISOString(),
        simulation: true
      };

      console.log('Email task simulated successfully:', emailResult);

    } catch (error) {
      console.error('Error processing email task:', error);
      status = 'failed';
      errorMessage = error.message;
      emailResult = { error: error.message };
    }

    // Update task in database
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status,
        result: emailResult,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        api_calls: [
          {
            service: 'gmail_simulation',
            timestamp: new Date().toISOString(),
            success: status === 'completed',
            response: emailResult
          }
        ]
      })
      .eq('id', taskId);

    if (updateError) {
      throw new Error(`Failed to update task: ${updateError.message}`);
    }

    // Send confirmation email
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          taskType: 'messages',
          taskDescription: 'Email automation task',
          result: emailResult,
          status: status
        }
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the main task if confirmation email fails
    }

    return new Response(JSON.stringify({
      success: true,
      taskId,
      status,
      result: emailResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-email-task function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);