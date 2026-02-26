import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is not set in environment variables');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface CreatePaymentIntentRequest {
  amount: number;
  booking_reference: string;
  customer_email: string;
  customer_name: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
};

export interface CreateCheckoutSessionRequest {
  amount: number;
  booking_reference: string;
  customer_email: string;
  customer_name: string;
  booking_id: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (
  data: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  console.log('[Stripe] Creating checkout session for booking:', data.booking_reference);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('[Stripe] Checkout session response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Stripe] Checkout session error response:', errorText);

      let errorMessage = 'Failed to create checkout session';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('[Stripe] Checkout session created:', result.sessionId);
    return result;
  } catch (error) {
    console.error('[Stripe] Error in createCheckoutSession:', error);
    throw error;
  }
};

export interface SendBookingEmailRequest {
  booking_reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_registration: string;
  vehicle_make: string;
  cruise_line: string;
  ship_name: string;
  terminal?: string;
  drop_off_datetime: string;
  return_datetime: string;
  number_of_passengers: number;
  add_ons?: string[];
  total: number;
  promo_code?: string;
  discount?: number;
}

export const sendBookingEmail = async (
  data: SendBookingEmailRequest
): Promise<{ success: boolean; message: string }> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send booking email');
  }

  return response.json();
};
