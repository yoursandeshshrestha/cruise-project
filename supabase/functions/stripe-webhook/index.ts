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
        console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));

        const bookingId = session.client_reference_id || session.metadata?.booking_id;
        const paymentIntentId = session.payment_intent as string;
        const isAmendment = session.metadata?.is_amendment === 'true';

        if (!bookingId) {
          console.error('No booking ID found in session');
          break;
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
          stripe_checkout_session_id: session.id,
        };

        // If this is an amendment, update the booking details
        if (isAmendment) {
          console.log('Processing booking amendment');
          console.log('Amendment metadata:', {
            drop_off: session.metadata?.amendment_drop_off,
            return: session.metadata?.amendment_return,
            vehicle_reg: session.metadata?.amendment_vehicle_reg,
            vehicle_make: session.metadata?.amendment_vehicle_make,
          });

          // Fetch the current booking to get existing values
          const { data: currentBooking, error: fetchError } = await supabase
            .from('bookings')
            .select('subtotal, vat, total, discount, drop_off_datetime, return_datetime, vehicle_registration, vehicle_make, amendment_history')
            .eq('id', bookingId)
            .single();

          if (fetchError) {
            console.error('Error fetching current booking:', fetchError);
          }

          if (currentBooking && session.amount_total) {
            const amendmentAmount = session.amount_total; // Already in pence

            // Use VAT values from metadata if available (in pounds), otherwise fallback to recalculating
            const amendmentSubtotalPounds = session.metadata?.amendment_subtotal
              ? parseFloat(session.metadata.amendment_subtotal)
              : NaN;
            const amendmentVatPounds = session.metadata?.amendment_vat
              ? parseFloat(session.metadata.amendment_vat)
              : NaN;

            // Convert to pence or calculate if not provided (check for valid numbers)
            const amendmentSubtotal = !isNaN(amendmentSubtotalPounds) && amendmentSubtotalPounds !== null
              ? Math.round(amendmentSubtotalPounds * 100)
              : amendmentAmount; // Fallback: use total amount as subtotal (assumes 0% VAT)
            const amendmentVat = !isNaN(amendmentVatPounds) && amendmentVatPounds !== null
              ? Math.round(amendmentVatPounds * 100)
              : 0; // Fallback: assume 0 VAT if not provided

            // Parse daily breakdown if available
            let dailyBreakdown = null;
            if (session.metadata?.daily_breakdown) {
              try {
                dailyBreakdown = JSON.parse(session.metadata.daily_breakdown);
              } catch (e) {
                console.error('Failed to parse daily_breakdown:', e);
              }
            }

            // Create amendment history entry with comprehensive breakdown
            const amendmentEntry = {
              amended_at: new Date().toISOString(),
              previous_drop_off_datetime: currentBooking.drop_off_datetime,
              previous_return_datetime: currentBooking.return_datetime,
              previous_vehicle_registration: currentBooking.vehicle_registration,
              previous_vehicle_make: currentBooking.vehicle_make,
              previous_subtotal: currentBooking.subtotal,
              previous_vat: currentBooking.vat,
              previous_total: currentBooking.total,
              new_drop_off_datetime: session.metadata?.amendment_drop_off,
              new_return_datetime: session.metadata?.amendment_return,
              new_vehicle_registration: session.metadata?.amendment_vehicle_reg,
              new_vehicle_make: session.metadata?.amendment_vehicle_make,
              amendment_charge: amendmentAmount,
              amendment_vat: amendmentVat,
              amendment_subtotal: amendmentSubtotal,
              stripe_payment_intent_id: paymentIntentId,
              stripe_checkout_session_id: session.id,
              // Additional breakdown fields
              daily_breakdown: dailyBreakdown,
              amendment_fee: session.metadata?.amendment_fee ? parseFloat(session.metadata.amendment_fee) * 100 : null,
              old_parking_cost: session.metadata?.old_parking_cost ? parseFloat(session.metadata.old_parking_cost) * 100 : null,
              new_parking_cost: session.metadata?.new_parking_cost ? parseFloat(session.metadata.new_parking_cost) * 100 : null,
              add_ons_cost: session.metadata?.add_ons_cost ? parseFloat(session.metadata.add_ons_cost) * 100 : null,
              price_difference: session.metadata?.price_difference ? parseFloat(session.metadata.price_difference) * 100 : null,
              vat_rate: session.metadata?.vat_rate ? parseFloat(session.metadata.vat_rate) : null,
              pricing_reason: session.metadata?.pricing_reason || null,
              previous_weekly_discount_percent: session.metadata?.previous_weekly_discount_percent ? parseFloat(session.metadata.previous_weekly_discount_percent) : null,
              previous_weekly_discount_amount: session.metadata?.previous_weekly_discount_amount ? parseFloat(session.metadata.previous_weekly_discount_amount) * 100 : null,
            };

            // Add to amendment history
            const amendmentHistory = Array.isArray(currentBooking.amendment_history)
              ? [...currentBooking.amendment_history, amendmentEntry]
              : [amendmentEntry];

            updateData.amendment_history = amendmentHistory;

            // Update booking dates and vehicle info (only if provided in metadata)
            if (session.metadata?.amendment_drop_off) {
              updateData.drop_off_datetime = session.metadata.amendment_drop_off;
            }
            if (session.metadata?.amendment_return) {
              updateData.return_datetime = session.metadata.amendment_return;
            }
            if (session.metadata?.amendment_vehicle_reg) {
              updateData.vehicle_registration = session.metadata.amendment_vehicle_reg;
            }
            if (session.metadata?.amendment_vehicle_make) {
              updateData.vehicle_make = session.metadata.amendment_vehicle_make;
            }

            // Add amendment charge to existing totals
            updateData.subtotal = currentBooking.subtotal + amendmentSubtotal;
            updateData.vat = currentBooking.vat + amendmentVat;
            updateData.total = currentBooking.total + amendmentAmount;

            console.log('Update data for amendment:', updateData);
          }
          // Don't change status for amendments, just update payment
        } else {
          // For new bookings, confirm and set status
          updateData.confirmed_at = new Date().toISOString();
          updateData.status = 'confirmed';
        }

        // Update booking in database by ID
        const { data: updatedBooking, error } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId)
          .select()
          .single();

        if (error) {
          console.error('Error updating booking after checkout:', error);
          throw error;
        }

        console.log(isAmendment ? 'Booking amended after payment:' : 'Booking confirmed after checkout:', bookingId);

        // Record payment in payments table
        const paymentAmount = session.amount_total || 0;

        // For amendments, use the calculated values from above
        // For new bookings, fetch from the booking record which has correct VAT
        let paymentSubtotal = 0;
        let paymentVat = 0;

        if (isAmendment) {
          // Use amendment values calculated above (from metadata or fallback)
          const amendmentSubtotalPounds = session.metadata?.amendment_subtotal
            ? parseFloat(session.metadata.amendment_subtotal)
            : NaN;
          const amendmentVatPounds = session.metadata?.amendment_vat
            ? parseFloat(session.metadata.amendment_vat)
            : NaN;

          paymentSubtotal = !isNaN(amendmentSubtotalPounds) && amendmentSubtotalPounds !== null
            ? Math.round(amendmentSubtotalPounds * 100)
            : paymentAmount; // Fallback: use total amount as subtotal (assumes 0% VAT)
          paymentVat = !isNaN(amendmentVatPounds) && amendmentVatPounds !== null
            ? Math.round(amendmentVatPounds * 100)
            : 0; // Fallback: assume 0 VAT if not provided
        } else {
          // For new bookings, get VAT from the booking record
          const { data: bookingForPayment } = await supabase
            .from('bookings')
            .select('subtotal, vat')
            .eq('id', bookingId)
            .single();

          if (bookingForPayment) {
            paymentSubtotal = bookingForPayment.subtotal;
            paymentVat = bookingForPayment.vat;
          } else {
            // Fallback if booking not found (shouldn't happen)
            paymentSubtotal = Math.round(paymentAmount / 1.2 * 1.0);
            paymentVat = paymentAmount - paymentSubtotal;
          }
        }

        const paymentRecord = {
          booking_id: bookingId,
          payment_type: isAmendment ? 'amendment' : 'new_booking',
          stripe_payment_intent_id: paymentIntentId,
          stripe_checkout_session_id: session.id,
          amount: paymentAmount,
          subtotal: paymentSubtotal,
          vat: paymentVat,
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: isAmendment ? {
            amendment_data: {
              drop_off_datetime: session.metadata?.amendment_drop_off,
              return_datetime: session.metadata?.amendment_return,
              vehicle_registration: session.metadata?.amendment_vehicle_reg,
              vehicle_make: session.metadata?.amendment_vehicle_make,
            }
          } : {},
        };

        const { error: paymentError } = await supabase
          .from('payments')
          .insert(paymentRecord);

        if (paymentError) {
          console.error('Error recording payment:', paymentError);
          // Don't throw - we still want to send the email even if payment recording fails
        } else {
          console.log('Payment recorded successfully');
        }

        // Send confirmation email (for both new bookings and amendments)
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
                is_amendment: isAmendment,
                amendment_charge: isAmendment && session.amount_total ? session.amount_total : undefined,
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
        const paymentIntentId = charge.payment_intent as string;

        // Update booking with refund information
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'refunded',
            refund_amount: refundAmount,
            refund_processed_at: new Date().toISOString(),
            status: 'cancelled',
          })
          .eq('stripe_charge_id', charge.id);

        if (bookingError) {
          console.error('Error updating booking refund:', bookingError);
          throw bookingError;
        }

        // Update payment record to refunded status
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              refund_amount: refundAmount,
              refunded_at: new Date().toISOString(),
            },
          })
          .eq('stripe_payment_intent_id', paymentIntentId);

        if (paymentError) {
          console.error('Error updating payment refund status:', paymentError);
          // Don't throw - booking is already updated
        }

        console.log('Booking and payment refund recorded');
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

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);

        const bookingId = session.client_reference_id || session.metadata?.booking_id;
        const isAmendment = session.metadata?.is_amendment === 'true';

        if (!bookingId) {
          console.error('No booking ID found in expired session');
          break;
        }

        // For amendments, we don't cancel the booking, just log it
        if (isAmendment) {
          console.log('Amendment checkout expired for booking:', bookingId);
          // Don't cancel the original booking for expired amendment payments
          break;
        }

        // For new bookings, cancel to release capacity
        const { error } = await supabase
          .from('bookings')
          .update({
            payment_status: 'cancelled',
            status: 'cancelled',
            cancellation_reason: 'Checkout session expired (24 hours)',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
          .eq('payment_status', 'pending'); // Only cancel if still pending

        if (error) {
          console.error('Error cancelling expired booking:', error);
          throw error;
        }

        console.log('Expired booking cancelled, capacity released:', bookingId);
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
