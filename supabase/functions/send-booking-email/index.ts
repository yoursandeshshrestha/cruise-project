import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingEmailData {
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

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-GB', options);
}

function formatCurrency(amountInPence: number): string {
  return `£${(amountInPence / 100).toFixed(2)}`;
}

function generateBookingEmailHTML(data: BookingEmailData): string {
  const addOnsHTML = data.add_ons && data.add_ons.length > 0
    ? `
      <tr>
        <td style="padding:8px 0;">Add-ons</td>
        <td align="right" style="padding:8px 0; font-weight:500;">${data.add_ons.join(', ')}</td>
      </tr>
    `
    : '';

  const discountHTML = data.discount && data.discount > 0
    ? `
      <tr>
        <td style="padding:6px 0; color:#777;">Discount${data.promo_code ? ` (${data.promo_code})` : ''}</td>
        <td align="right" style="padding:6px 0; color:#777;">-${formatCurrency(data.discount)}</td>
      </tr>
    `
    : '';

  const formatSimpleDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${data.booking_reference}</title>
</head>
<body style="margin:0; padding:0; background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:8px;">

        <table role="presentation" width="560" style="max-width:100%; background:#ffffff;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding:20px 16px 8px 16px;">
              <h1 style="margin:0; font-size:22px; font-weight:600; color:#111;">
                Simple Cruise Parking
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#777;">
                Booking Confirmation
              </p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding:8px 16px;">
              <h2 style="margin:0; font-size:20px; font-weight:600; color:#111;">
                Booking Confirmed
              </h2>
              <p style="margin:10px 0 12px; font-size:15px; color:#555;">
                Thank you ${data.first_name}. Your parking is reserved.
              </p>

              <div style="padding:10px 14px; background:#f2f4f6; border-radius:4px;">
                <p style="margin:0; font-size:12px; color:#777; text-transform:uppercase; letter-spacing:1px;">
                  Booking Reference
                </p>
                <p style="margin:6px 0 0; font-size:20px; font-weight:600; color:#111;">
                  ${data.booking_reference}
                </p>
              </div>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#444;">

                <tr>
                  <td style="padding:5px 0;">Drop Off</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${formatSimpleDateTime(data.drop_off_datetime)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;">Return</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${formatSimpleDateTime(data.return_datetime)}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;">Cruise Line</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${data.cruise_line}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;">Ship</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${data.ship_name}</td>
                </tr>
                ${data.terminal ? `
                <tr>
                  <td style="padding:5px 0;">Terminal</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${data.terminal}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:5px 0;">Passengers</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${data.number_of_passengers}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;">Vehicle</td>
                  <td align="right" style="padding:5px 0; font-weight:500;">${data.vehicle_make} (${data.vehicle_registration})</td>
                </tr>
                ${addOnsHTML}

              </table>

              <hr style="border:none; border-top:1px solid #e5e5e5; margin:16px 0;">

              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                ${discountHTML}
                <tr>
                  <td style="padding:4px 0; font-size:16px; font-weight:600; color:#111;">
                    Total Paid
                  </td>
                  <td align="right" style="padding:4px 0; font-size:16px; font-weight:600; color:#111;">
                    ${formatCurrency(data.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding:0 16px 16px 16px;">
              <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:#111;">
                Important Information
              </p>
              <ul style="margin:0; padding-left:18px; font-size:13px; color:#666; line-height:1.6;">
                <li>Arrive 30 minutes before drop-off</li>
                <li>Bring booking reference and photo ID</li>
                <li>Free shuttle to the cruise terminal</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 16px; text-align:center; border-top:1px solid #eee;">
              <p style="margin:0; font-size:12px; color:#999;">
                © ${new Date().getFullYear()} Simple Cruise Parking
              </p>
              <p style="margin:6px 0 0; font-size:12px; color:#999;">
                info@simplecruiseparking.com
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingEmailData = await req.json();

    // Validate required fields
    if (!bookingData.booking_reference || !bookingData.email || !bookingData.first_name) {
      throw new Error('Missing required booking data');
    }

    // Get Mailgun credentials from environment
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const fromEmail = Deno.env.get('MAILGUN_FROM_EMAIL') || 'info@simplecruiseparking.com';

    if (!mailgunApiKey || !mailgunDomain) {
      throw new Error('Mailgun credentials are not configured');
    }

    // Generate email HTML
    const emailHTML = generateBookingEmailHTML(bookingData);

    // Prepare form data for Mailgun
    const formData = new FormData();
    formData.append('from', `Simple Cruise Parking <${fromEmail}>`);
    formData.append('to', bookingData.email);
    formData.append('subject', `Booking Confirmation - ${bookingData.booking_reference}`);
    formData.append('html', emailHTML);
    formData.append('text', `
Booking Confirmed!

Thank you ${bookingData.first_name}, your parking reservation is confirmed.

Booking Reference: ${bookingData.booking_reference}

Drop Off: ${formatDateTime(bookingData.drop_off_datetime)}
Return: ${formatDateTime(bookingData.return_datetime)}
Cruise Line: ${bookingData.cruise_line}
Ship: ${bookingData.ship_name}
${bookingData.terminal ? `Terminal: ${bookingData.terminal}\n` : ''}
Vehicle: ${bookingData.vehicle_make} (${bookingData.vehicle_registration})

Total Paid: ${formatCurrency(bookingData.total)}

Please arrive at least 30 minutes before your scheduled drop-off time.

Need help? Email us at info@simplecruiseparking.com

© ${new Date().getFullYear()} Simple Cruise Parking
    `);

    // Send email via Mailgun
    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      }
    );

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text();
      console.error('Mailgun error:', errorText);
      throw new Error(`Failed to send email: ${mailgunResponse.statusText}`);
    }

    const result = await mailgunResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking confirmation email sent successfully',
        messageId: result.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending booking email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
