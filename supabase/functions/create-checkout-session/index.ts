import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutSessionRequest {
  amount: number;
  booking_reference?: string;
  customer_email?: string;
  customer_name?: string;
  booking_id?: string;
  bookingId?: string;
  isAmendment?: boolean;
  amendmentData?: {
    drop_off_datetime: string;
    return_datetime: string;
    vehicle_registration: string;
    vehicle_make: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, booking_reference, customer_email, customer_name, booking_id, bookingId, isAmendment, amendmentData }: CheckoutSessionRequest = await req.json();

    const actualBookingId = bookingId || booking_id;

    // Validate input
    if (!amount || !actualBookingId) {
      throw new Error('Missing required fields: amount, booking_id');
    }

    if (!isAmendment && (!booking_reference || !customer_email)) {
      throw new Error('Missing required fields for new booking: booking_reference, customer_email');
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
    const successUrl = isAmendment
      ? `${origin}/manage-booking?amended=true&booking_id=${actualBookingId}`
      : `${origin}/booking-success?booking_ref=${booking_reference}`;
    const cancelUrl = isAmendment
      ? `${origin}/manage-booking?cancelled_amendment=true`
      : `${origin}/book?cancelled=true`;

    // Prepare metadata
    const metadata: Record<string, string> = {
      booking_id: actualBookingId,
      is_amendment: isAmendment ? 'true' : 'false',
    };

    if (isAmendment && amendmentData) {
      metadata.amendment_drop_off = amendmentData.drop_off_datetime;
      metadata.amendment_return = amendmentData.return_datetime;
      metadata.amendment_vehicle_reg = amendmentData.vehicle_registration;
      metadata.amendment_vehicle_make = amendmentData.vehicle_make;
    }

    if (booking_reference) {
      metadata.booking_reference = booking_reference;
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: isAmendment ? 'Booking Amendment Fee' : 'Cruise Parking Booking',
              description: isAmendment
                ? `Amendment for booking ${actualBookingId}`
                : `Booking Reference: ${booking_reference}`,
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
      client_reference_id: actualBookingId,
      billing_address_collection: 'required',
      locale: 'en-GB',
      currency: 'gbp',
      metadata,
      payment_intent_data: {
        metadata,
        description: isAmendment
          ? `Booking amendment for ${actualBookingId}`
          : `Parking booking ${booking_reference}`,
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
