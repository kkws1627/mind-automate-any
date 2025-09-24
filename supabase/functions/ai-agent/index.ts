import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRequest {
  prompt: string;
  taskType: string;
  userEmail: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, taskType, userEmail }: TaskRequest = await req.json();
    
    if (!prompt || !taskType || !userEmail) {
      throw new Error('Missing required fields: prompt, taskType, userEmail');
    }

    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Create a system prompt based on task type
    const systemPrompts = {
      messages: `You are MIND's email assistant. Analyze the user's request to send messages or emails. Extract:
1. Recipients (email addresses or descriptions)
2. Subject line
3. Message content
4. Tone/style preferences
5. Any special requirements
Return a JSON response with these fields.`,
      
      shopping: `You are MIND's shopping assistant. Analyze the user's request to order products. Extract:
1. Product name/description
2. Price range/budget
3. Brand preferences
4. Specifications/requirements
5. Delivery preferences
Return a JSON response with these fields and suggest specific products.`,
      
      entertainment: `You are MIND's entertainment assistant. Analyze the user's request to book movie tickets. Extract:
1. Movie name/genre preferences
2. Location/theater preferences
3. Date and time preferences
4. Number of tickets
5. Seat preferences
Return a JSON response with these fields and suggest available options.`
    };

    const systemPrompt = systemPrompts[taskType as keyof typeof systemPrompts] || systemPrompts.messages;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User request: ${prompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    const aiInterpretation = geminiData.candidates[0]?.content?.parts[0]?.text || '';

    // Store task in database
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: profile.user_id,
        title: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task`,
        description: prompt,
        task_type: taskType,
        prompt: prompt,
        ai_interpretation: { analysis: aiInterpretation },
        status: 'processing'
      })
      .select()
      .single();

    if (taskError) {
      console.error('Database error:', taskError);
      throw new Error(`Failed to store task: ${taskError.message}`);
    }

    console.log('Task created successfully:', task.id);

    // Trigger appropriate task processor based on type
    let processingResult;
    let taskStatus = 'processing';
    
    console.log(`Routing task ${task.id} of type ${taskType} to appropriate processor`);
    
    try {
      switch (taskType) {
        case 'messages':
          console.log('Invoking process-email-task function');
          processingResult = await supabase.functions.invoke('process-email-task', {
            body: { taskId: task.id, interpretation: aiInterpretation, userEmail }
          });
          break;
        case 'shopping':
          console.log('Invoking process-shopping-task function');
          processingResult = await supabase.functions.invoke('process-shopping-task', {
            body: { taskId: task.id, interpretation: aiInterpretation, userEmail }
          });
          break;
        case 'entertainment':
          console.log('Invoking process-entertainment-task function');
          processingResult = await supabase.functions.invoke('process-entertainment-task', {
            body: { taskId: task.id, interpretation: aiInterpretation, userEmail }
          });
          break;
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }

      console.log('Function invoke result:', processingResult);

      if (processingResult.error) {
        console.error('Task processing error:', processingResult.error);
        taskStatus = 'failed';
        
        // Update task status to failed
        await supabase
          .from('tasks')
          .update({
            status: 'failed',
            error_message: processingResult.error.message || 'Processing function failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);
      } else {
        console.log('Task processing completed successfully');
        taskStatus = 'completed';
      }
    } catch (error) {
      console.error('Error triggering task processor:', error);
      taskStatus = 'failed';
      
      // Update task status to failed
      try {
        await supabase
          .from('tasks')
          .update({
            status: 'failed',
            error_message: error.message || 'Failed to trigger task processor',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);
      } catch (updateError) {
        console.error('Error updating task status:', updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      taskId: task.id,
      interpretation: aiInterpretation,
      status: taskStatus,
      processingResult: processingResult?.data || null,
      message: taskStatus === 'failed' 
        ? 'Task processing failed. Please check your request and try again.'
        : 'Task received and is being processed. You will receive an email confirmation shortly.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);