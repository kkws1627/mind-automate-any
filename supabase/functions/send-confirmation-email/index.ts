import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  taskType: string;
  taskDescription: string;
  result?: any;
  status: 'completed' | 'failed' | 'processing';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    const resend = new Resend(resendApiKey);
    const { to, taskType, taskDescription, result, status }: EmailRequest = await req.json();

    let subject: string;
    let content: string;

    const taskTypeLabels = {
      messages: 'Email/Message',
      shopping: 'Amazon Order',
      entertainment: 'Movie Ticket Booking'
    };

    const taskLabel = taskTypeLabels[taskType as keyof typeof taskTypeLabels] || 'Task';

    switch (status) {
      case 'completed':
        subject = `✅ ${taskLabel} Completed - MIND Automation`;
        content = `
          <h1>Task Completed Successfully!</h1>
          <p>Hello! Your MIND automation task has been completed successfully.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Task Details:</h3>
            <p><strong>Type:</strong> ${taskLabel}</p>
            <p><strong>Description:</strong> ${taskDescription}</p>
            ${result ? `<p><strong>Result:</strong> ${JSON.stringify(result, null, 2)}</p>` : ''}
          </div>
          
          <p>Thank you for using MIND - Model Integrated Network for Delegation!</p>
          <p>Best regards,<br>The MIND Team</p>
        `;
        break;
        
      case 'failed':
        subject = `❌ ${taskLabel} Failed - MIND Automation`;
        content = `
          <h1>Task Processing Failed</h1>
          <p>We encountered an issue processing your MIND automation task.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Task Details:</h3>
            <p><strong>Type:</strong> ${taskLabel}</p>
            <p><strong>Description:</strong> ${taskDescription}</p>
            ${result ? `<p><strong>Error:</strong> ${result.error || 'Unknown error'}</p>` : ''}
          </div>
          
          <p>Please try again or contact support if the issue persists.</p>
          <p>Best regards,<br>The MIND Team</p>
        `;
        break;
        
      default:
        subject = `🔄 ${taskLabel} Processing - MIND Automation`;
        content = `
          <h1>Task Received and Processing</h1>
          <p>Your MIND automation task has been received and is currently being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Task Details:</h3>
            <p><strong>Type:</strong> ${taskLabel}</p>
            <p><strong>Description:</strong> ${taskDescription}</p>
          </div>
          
          <p>You will receive another email once the task is completed.</p>
          <p>Best regards,<br>The MIND Team</p>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "MIND Automation <noreply@resend.dev>",
      to: [to],
      subject: subject,
      html: content,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);