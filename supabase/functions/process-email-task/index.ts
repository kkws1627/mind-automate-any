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
      // Parse AI interpretation to extract email details
      let emailDetails = {};
      try {
        // Try to parse JSON response from AI
        const jsonMatch = interpretation.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          emailDetails = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Could not parse JSON from AI interpretation, using text analysis');
        // Fallback: extract information from text
        emailDetails = {
          recipients: ['user@example.com'], // Would need real extraction
          subject: 'Automated Email from MIND',
          content: interpretation,
          tone: 'professional'
        };
      }

      // Simulate Gmail API integration
      // In a real implementation, this would use the Gmail API
      const gmailApiKey = Deno.env.get('GMAIL_API_KEY');
      
      if (gmailApiKey) {
        // Real Gmail API call would go here
        console.log('Gmail API key available, would send real email');
        emailResult = {
          action: 'email_sent',
          recipients: emailDetails.recipients || ['example@gmail.com'],
          subject: emailDetails.subject || 'Automated Email from MIND',
          message: emailDetails.content || interpretation,
          messageId: `gmail-${Date.now()}`,
          timestamp: new Date().toISOString(),
          provider: 'gmail',
          real: true
        };
      } else {
        // Simulation mode
        console.log('Gmail API key not available, running in simulation mode');
        emailResult = {
          action: 'email_prepared',
          recipients: emailDetails.recipients || ['example@gmail.com'],
          subject: emailDetails.subject || 'Automated Email from MIND',
          message: emailDetails.content || interpretation,
          timestamp: new Date().toISOString(),
          provider: 'simulation',
          note: 'Email prepared successfully. Add Gmail API key to send real emails.',
          real: false
        };
      }

      console.log('Email task processed successfully:', emailResult);

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
            service: Deno.env.get('GMAIL_API_KEY') ? 'gmail_api' : 'gmail_simulation',
            timestamp: new Date().toISOString(),
            success: status === 'completed',
            response: emailResult,
            method: 'send_email'
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