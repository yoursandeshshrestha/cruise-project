import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.65.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    // Validate input
    if (!message || message.trim() === '') {
      throw new Error('Message is required');
    }

    // Get Grok (X.AI) API key from environment
    const xaiApiKey = Deno.env.get('XAI_API_KEY');
    if (!xaiApiKey) {
      throw new Error('XAI_API_KEY is not set');
    }

    // Initialize OpenAI client with Grok endpoint
    const openai = new OpenAI({
      apiKey: xaiApiKey,
      baseURL: 'https://api.x.ai/v1',
    });

    // System prompt for the chatbot
    const systemPrompt = `You are a helpful and friendly customer service assistant for Simple Cruise Parking in Southampton, UK, powered by Grok.

About Simple Cruise Parking:
- We provide secure, affordable off-site parking for cruise passengers
- We offer fast shuttle transfers to all Southampton cruise terminals (Ocean, Mayflower, City, QEII, and Horizon terminals)
- Our facility is fully fenced with CCTV monitoring, gated access, ADT security, and nightly patrols
- Shuttle transfers take approximately 10 minutes to the terminal
- We are located in Southampton and serve all major cruise lines
- We offer additional services like car washing and EV charging
- We have 5-star reviews from hundreds of satisfied customers
- Bookings can be made online easily
- We provide 24/7 service

Your role:
- Answer questions about our parking services, facilities, and booking process
- Be friendly, professional, and helpful
- Keep responses concise and informative
- If you don't know specific details (like exact pricing or availability), encourage them to visit our booking page or contact us directly
- Provide accurate information about our location, security features, and shuttle service

Contact information:
- Phone: +44 2382 002020
- Website: simplecruiseparking.com`;

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call Grok API
    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-non-reasoning',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage },
        ],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred processing your request',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
