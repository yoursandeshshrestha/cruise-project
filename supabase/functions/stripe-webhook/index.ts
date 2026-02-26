import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.97.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing signature or webhook secret' }),
      { status: 400 }
    );
  }

  try {
    const body = await req.text();

    // Verify webhook signature (use async version for Deno)
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        const bookingId = session.client_reference_id || session.metadata?.booking_id;
        const paymentIntentId = session.payment_intent as string;

        if (!bookingId) {
          console.error('No booking ID found in session');
          break;
        }

        // Update booking in database by ID
        const { data: updatedBooking, error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'completed',
            stripe_payment_intent_id: paymentIntentId,
            stripe_checkout_session_id: session.id,
            confirmed_at: new Date().toISOString(),
            status: 'confirmed',
          })
          .eq('id', bookingId)
          .select()
          .single();

        if (error) {
          console.error('Error updating booking after checkout:', error);
          throw error;
        }

        console.log('Booking confirmed after checkout:', bookingId);

        // Send confirmation email
        if (updatedBooking) {
          try {
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                booking_reference: updatedBooking.booking_reference,
                first_name: updatedBooking.first_name,
                last_name: updatedBooking.last_name,
                email: updatedBooking.email,
                phone: updatedBooking.phone,
                vehicle_registration: updatedBooking.vehicle_registration,
                vehicle_make: updatedBooking.vehicle_make,
                cruise_line: updatedBooking.cruise_line,
                ship_name: updatedBooking.ship_name,
                terminal: updatedBooking.terminal,
                drop_off_datetime: updatedBooking.drop_off_datetime,
                return_datetime: updatedBooking.return_datetime,
                number_of_passengers: updatedBooking.number_of_passengers,
                add_ons: updatedBooking.add_ons || [],
                total: updatedBooking.total,
                promo_code: updatedBooking.promo_code,
                discount: updatedBooking.discount,
              }),
            });

            if (emailResponse.ok) {
              console.log('Confirmation email sent successfully');
            } else {
              console.error('Failed to send confirmation email:', await emailResponse.text());
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        const bookingId = paymentIntent.metadata?.booking_id;

        // Try to find booking by booking_id from metadata first, then fall back to payment_intent_id
        let query = supabase
          .from('bookings')
          .update({
            payment_status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            stripe_charge_id: paymentIntent.charges?.data[0]?.id || null,
            confirmed_at: new Date().toISOString(),
            status: 'confirmed',
          });

        if (bookingId) {
          query = query.eq('id', bookingId);
        } else {
          query = query.eq('stripe_payment_intent_id', paymentIntent.id);
        }

        const { error } = await query;

        if (error) {
          console.error('Error updating booking:', error);
          throw error;
        }

        console.log('Booking updated successfully');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // Update booking to failed status
        const { error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            cancellation_reason: 'Payment failed',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating booking:', error);
          throw error;
        }

        console.log('Booking marked as failed');
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);

        // Get the refund amount
        const refundAmount = charge.amount_refunded;

        // Update booking with refund information
        const { error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'refunded',
            refund_amount: refundAmount,
            refund_processed_at: new Date().toISOString(),
            status: 'cancelled',
          })
          .eq('stripe_charge_id', charge.id);

        if (error) {
          console.error('Error updating booking refund:', error);
          throw error;
        }

        console.log('Booking refund recorded');
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent canceled:', paymentIntent.id);

        // Update booking to cancelled
        const { error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'cancelled',
            status: 'cancelled',
            cancellation_reason: 'Payment cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error cancelling booking:', error);
          throw error;
        }

        console.log('Booking cancelled successfully');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
});
