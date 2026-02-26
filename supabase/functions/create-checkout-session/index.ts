import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutSessionRequest {
  amount: number;
  booking_reference: string;
  customer_email: string;
  customer_name: string;
  booking_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, booking_reference, customer_email, customer_name, booking_id }: CheckoutSessionRequest = await req.json();

    // Validate input
    if (!amount || !booking_reference || !customer_email || !booking_id) {
      throw new Error('Missing required fields: amount, booking_reference, customer_email, booking_id');
    }

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the base URL for success/cancel redirects
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const successUrl = `${origin}/booking-success?booking_ref=${booking_reference}`;
    const cancelUrl = `${origin}/book?cancelled=true`;

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Cruise Parking Booking',
              description: `Booking Reference: ${booking_reference}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customer_email,
      client_reference_id: booking_id,
      billing_address_collection: 'required',
      locale: 'en-GB',
      metadata: {
        booking_reference,
        booking_id,
      },
      payment_intent_data: {
        metadata: {
          booking_reference,
          booking_id,
        },
        description: `Parking booking ${booking_reference}`,
        receipt_email: customer_email,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
