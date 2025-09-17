import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShoppingTaskRequest {
  taskId: string;
  interpretation: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, interpretation, userEmail }: ShoppingTaskRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing shopping task:', { taskId, userEmail });

    // Parse AI interpretation (simulate Amazon shopping)
    let shoppingResult = {};
    let status = 'completed';
    let errorMessage = null;

    try {
      // Simulate Amazon shopping logic
      // In a real implementation, this would:
      // 1. Parse product requirements from AI interpretation
      // 2. Search Amazon products using their API or web scraping
      // 3. Compare prices and reviews
      // 4. Add selected items to cart
      // 5. Complete purchase (with user consent)

      // For now, simulate successful shopping processing
      shoppingResult = {
        action: 'product_search',
        searchQuery: 'wireless mouse under $50', // Would be parsed from interpretation
        foundProducts: [
          {
            name: 'Logitech MX Master 3S',
            price: '$49.99',
            rating: '4.5/5',
            url: 'https://amazon.com/example',
            inStock: true
          },
          {
            name: 'Microsoft Arc Mouse',
            price: '$39.99',
            rating: '4.3/5', 
            url: 'https://amazon.com/example2',
            inStock: true
          }
        ],
        recommendation: 'Logitech MX Master 3S - Best value for money',
        timestamp: new Date().toISOString(),
        simulation: true,
        note: 'Products found and compared. Manual purchase confirmation required.'
      };

      console.log('Shopping task simulated successfully:', shoppingResult);

    } catch (error) {
      console.error('Error processing shopping task:', error);
      status = 'failed';
      errorMessage = error.message;
      shoppingResult = { error: error.message };
    }

    // Update task in database
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status,
        result: shoppingResult,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        api_calls: [
          {
            service: 'amazon_simulation',
            timestamp: new Date().toISOString(),
            success: status === 'completed',
            response: shoppingResult
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
          taskType: 'shopping',
          taskDescription: 'Amazon shopping automation task',
          result: shoppingResult,
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
      result: shoppingResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-shopping-task function:', error);
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