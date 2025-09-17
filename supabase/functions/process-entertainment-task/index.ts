import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EntertainmentTaskRequest {
  taskId: string;
  interpretation: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, interpretation, userEmail }: EntertainmentTaskRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing entertainment task:', { taskId, userEmail });

    // Parse AI interpretation (simulate BookMyShow booking)
    let entertainmentResult = {};
    let status = 'completed';
    let errorMessage = null;

    try {
      // Simulate BookMyShow booking logic
      // In a real implementation, this would:
      // 1. Parse movie preferences from AI interpretation
      // 2. Search for available movies and showtimes
      // 3. Check seat availability
      // 4. Select best seats based on preferences
      // 5. Complete booking (with user payment confirmation)

      // For now, simulate successful entertainment booking
      entertainmentResult = {
        action: 'movie_search',
        searchQuery: 'latest Marvel movie weekend evening', // Would be parsed from interpretation
        foundMovies: [
          {
            title: 'Guardians of the Galaxy Vol. 3',
            theater: 'AMC Downtown 12',
            showtime: '7:30 PM',
            date: '2025-01-20',
            seats: ['H7', 'H8'],
            price: '$12.50 per ticket',
            total: '$25.00',
            availableSeats: 45
          },
          {
            title: 'Ant-Man and the Wasp: Quantumania',
            theater: 'Regal Cinemas',
            showtime: '8:00 PM', 
            date: '2025-01-20',
            seats: ['F5', 'F6'],
            price: '$11.00 per ticket',
            total: '$22.00',
            availableSeats: 32
          }
        ],
        recommendation: 'Guardians of the Galaxy Vol. 3 at AMC Downtown 12 - Best seats available',
        timestamp: new Date().toISOString(),
        simulation: true,
        note: 'Seats located and reserved. Payment confirmation required to complete booking.'
      };

      console.log('Entertainment task simulated successfully:', entertainmentResult);

    } catch (error) {
      console.error('Error processing entertainment task:', error);
      status = 'failed';
      errorMessage = error.message;
      entertainmentResult = { error: error.message };
    }

    // Update task in database
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status,
        result: entertainmentResult,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        api_calls: [
          {
            service: 'bookmyshow_simulation',
            timestamp: new Date().toISOString(),
            success: status === 'completed',
            response: entertainmentResult
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
          taskType: 'entertainment',
          taskDescription: 'Movie ticket booking automation task',
          result: entertainmentResult,
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
      result: entertainmentResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-entertainment-task function:', error);
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