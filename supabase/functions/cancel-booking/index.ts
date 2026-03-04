import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelBookingRequest {
  booking_id: string;
  reason: string;
  refund_amount?: number; // Optional: partial refund amount in pence
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id, reason, refund_amount }: CancelBookingRequest = await req.json();

    if (!booking_id || !reason) {
      throw new Error('Missing required fields: booking_id and reason');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // Prevent cancellation if booking is checked in or completed
    if (booking.status === 'checked_in' || booking.status === 'completed') {
      throw new Error('Cannot cancel booking after check-in. Please contact support for assistance.');
    }

    // Check if payment was completed
    if (booking.payment_status !== 'completed') {
      // If no payment was made, just cancel the booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', booking_id);

      if (updateError) throw updateError;

      // Send cancellation email even without payment
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-cancellation-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            booking_reference: booking.booking_reference,
            first_name: booking.first_name,
            last_name: booking.last_name,
            email: booking.email,
            cruise_line: booking.cruise_line,
            ship_name: booking.ship_name,
            drop_off_datetime: booking.drop_off_datetime,
            return_datetime: booking.return_datetime,
            total: booking.total,
            refund_amount: 0,
            cancellation_reason: reason,
          }),
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Booking cancelled successfully (no refund required)',
          refund_issued: false,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check if cancellation is within 48 hours of drop-off (non-refundable)
    const dropOffDate = new Date(booking.drop_off_datetime);
    const now = new Date();
    const hoursDifference = (dropOffDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isWithin48Hours = hoursDifference < 48;

    // Initialize Stripe only if refund will be processed
    let refundResult = null;
    let refundAmountProcessed = 0;

    // Process Stripe refund only if NOT within 48 hours and payment intent exists
    if (!isWithin48Hours && booking.stripe_payment_intent_id) {
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        throw new Error('Stripe secret key is not configured');
      }
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      try {
        // Determine refund amount (use provided amount or full refund)
        const amountToRefund = refund_amount || booking.total;

        // Create refund
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: amountToRefund,
          reason: 'requested_by_customer',
          metadata: {
            booking_id: booking.id,
            booking_reference: booking.booking_reference,
            cancellation_reason: reason,
          },
        });

        refundResult = refund;
        refundAmountProcessed = amountToRefund;

        console.log('Refund created:', refund.id);
      } catch (stripeError: unknown) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        // Admin can process refund manually
        throw new Error(`Failed to process refund: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}. Please contact support.`);
      }
    }

    // Update booking with cancellation and refund information
    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      payment_status: refundResult ? 'refunded' : 'cancelled',
      cancellation_reason: isWithin48Hours
        ? `${reason} (Non-refundable - cancelled within 48 hours of drop-off)`
        : reason,
      cancelled_at: new Date().toISOString(),
      refund_amount: refundAmountProcessed,
      refund_processed_at: refundResult ? new Date().toISOString() : null,
    };

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      throw updateError;
    }

    // Update payment record status if refund was processed
    if (refundResult) {
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          metadata: {
            refund_amount: refundAmountProcessed,
            refunded_at: new Date().toISOString(),
            cancellation_reason: reason,
          },
        })
        .eq('booking_id', booking_id)
        .eq('status', 'completed'); // Only update completed payments

      if (paymentUpdateError) {
        console.error('Error updating payment status:', paymentUpdateError);
        // Don't fail the entire operation - booking is already updated
      } else {
        console.log('Payment status updated to refunded');
      }
    }

    // Send cancellation email
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-cancellation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          booking_reference: booking.booking_reference,
          first_name: booking.first_name,
          last_name: booking.last_name,
          email: booking.email,
          cruise_line: booking.cruise_line,
          ship_name: booking.ship_name,
          drop_off_datetime: booking.drop_off_datetime,
          return_datetime: booking.return_datetime,
          total: booking.total,
          refund_amount: refundAmountProcessed,
          cancellation_reason: reason,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send cancellation email:', await emailResponse.text());
        // Don't fail the entire operation if email fails
      } else {
        console.log('Cancellation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't fail the entire operation if email fails
    }

    const message = isWithin48Hours
      ? 'Booking cancelled successfully. No refund issued (cancelled within 48 hours of drop-off).'
      : refundResult
      ? 'Booking cancelled and refund processed successfully'
      : 'Booking cancelled successfully';

    return new Response(
      JSON.stringify({
        success: true,
        message,
        refund_issued: !!refundResult,
        refund_amount: refundAmountProcessed,
        refund_id: refundResult?.id,
        non_refundable: isWithin48Hours,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
