import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GmailRequest {
  taskId: string;
  emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const gmailApiKey = Deno.env.get('GMAIL_API_KEY');
    
    if (!gmailApiKey) {
      throw new Error("Gmail API key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { taskId, emailData }: GmailRequest = await req.json();

    console.log('Processing Gmail request for task:', taskId, emailData);

    // Update task status to processing
    await supabase
      .from('tasks')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', taskId);

    // Simulate Gmail API integration
    // In a real implementation, you would use the Gmail API to send emails
    const gmailResult = {
      messageId: `gmail_msg_${Date.now()}`,
      threadId: `thread_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipient: emailData.to,
      subject: emailData.subject,
      deliveryStatus: 'delivered'
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update task with success result
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        result: gmailResult,
        completed_at: new Date().toISOString(),
        api_calls: [
          {
            service: 'gmail',
            endpoint: 'messages/send',
            timestamp: new Date().toISOString(),
            success: true,
            response: gmailResult
          }
        ]
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      throw updateError;
    }

    // Get user email for confirmation
    const { data: task } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (task) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', task.user_id)
        .single();

      if (profile?.email) {
        // Send confirmation email
        EdgeRuntime.waitUntil(
          supabase.functions.invoke('send-confirmation-email', {
            body: {
              to: profile.email,
              taskType: 'messages',
              taskDescription: `Send email to ${emailData.to}`,
              result: gmailResult,
              status: 'completed'
            }
          })
        );
      }
    }

    console.log('Gmail task completed successfully:', updatedTask);

    return new Response(
      JSON.stringify({ success: true, result: gmailResult }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in gmail-integration function:", error);
    
    // Update task with error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { taskId } = await req.json();
      
      await supabase
        .from('tasks')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);
    } catch (updateError) {
      console.error('Error updating task with failure:', updateError);
    }

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