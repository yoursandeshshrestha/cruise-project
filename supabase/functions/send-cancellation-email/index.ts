import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancellationEmailData {
  booking_reference: string;
  first_name: string;
  last_name: string;
  email: string;
  cruise_line: string;
  ship_name: string;
  drop_off_datetime: string;
  return_datetime: string;
  total: number;
  refund_amount: number;
  cancellation_reason?: string;
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

function generateCancellationEmailHTML(data: CancellationEmailData): string {
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

  const logoUrl = Deno.env.get('LOGO_URL') || 'https://simplecruiseparking.com/logos/simplecruise-logo-white.png';
  const hasRefund = data.refund_amount > 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled - ${data.booking_reference}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family:Poppins,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:50px 20px;">

        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#dc2626; padding:30px 20px;">
              <img src="${logoUrl}" alt="Simple Cruise Parking" width="190" style="display:block; margin:0 auto; border:0;" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td align="center" style="padding:40px 30px 20px 30px;">
              <h1 style="margin:0 0 12px 0; font-size:26px; font-weight:700; color:#001848;">
                Booking Cancelled
              </h1>
              <p style="margin:0; font-size:15px; color:#666; line-height:1.7;">
                Your parking booking has been cancelled as requested.
              </p>
            </td>
          </tr>

          <!-- BOOKING REFERENCE -->
          <tr>
            <td style="padding:0 30px 35px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fee2e2; border-radius:10px;">
                <tr>
                  <td align="center" style="padding:26px;">
                    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#dc2626;">
                      Cancelled Booking Reference
                    </p>
                    <p style="margin:0; font-size:28px; font-weight:700; letter-spacing:2px; color:#001848;">
                      ${data.booking_reference}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CANCELLATION DETAILS -->
          <tr>
            <td style="padding:0 30px 35px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px; border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Drop Off</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${formatSimpleDateTime(data.drop_off_datetime)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Return</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${formatSimpleDateTime(data.return_datetime)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Cruise Line</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${data.cruise_line}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0; color:#777;">Ship</td>
                  <td align="right" style="padding:14px 0; font-weight:600; color:#001848;">${data.ship_name}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${hasRefund ? `
          <!-- REFUND INFO -->
          <tr>
            <td style="padding:0 30px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#dcfce7; border-radius:10px; border:1px solid #86efac;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;">
                      <tr>
                        <td style="padding-bottom:8px; font-size:16px; font-weight:600; color:#166534;">Refund Issued</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:14px; font-size:13px; color:#15803d;">
                          Your refund has been processed and will appear in your account within 5-10 business days.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:8px; border-top:1px solid #bbf7d0;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding-top:10px; font-size:14px; color:#166534;">Original Amount</td>
                              <td align="right" style="padding-top:10px; font-size:14px; font-weight:600; color:#166534;">${formatCurrency(data.total)}</td>
                            </tr>
                            <tr>
                              <td style="padding-top:6px; font-size:16px; font-weight:700; color:#166534;">Refund Amount</td>
                              <td align="right" style="padding-top:6px; font-size:20px; font-weight:700; color:#166534;">${formatCurrency(data.refund_amount)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : `
          <!-- NO REFUND INFO -->
          <tr>
            <td style="padding:0 30px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fef3c7; border-radius:10px; border:1px solid #fde047;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 8px 0; font-size:16px; font-weight:600; color:#854d0e;">
                      No Refund Issued
                    </p>
                    <p style="margin:0; font-size:13px; color:#a16207; line-height:1.6;">
                      As per our cancellation policy, bookings cancelled within 48 hours of the scheduled drop-off time are non-refundable.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `}

          <!-- WHAT HAPPENS NEXT -->
          <tr>
            <td style="padding:0 30px 45px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f5; border-left:3px solid #dcdcdc; border-radius:8px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#222;">
                      What Happens Next
                    </p>
                    <ul style="margin:0; padding-left:18px; font-size:14px; color:#555; line-height:1.8;">
                      ${hasRefund ? `
                      <li style="margin-bottom:8px;">Your refund of ${formatCurrency(data.refund_amount)} will be processed within 5-10 business days</li>
                      <li style="margin-bottom:8px;">The refund will appear in your original payment method</li>
                      ` : `
                      <li style="margin-bottom:8px;">No refund will be issued as per our cancellation policy</li>
                      `}
                      <li style="margin-bottom:8px;">You will receive a confirmation email once this process is complete</li>
                      <li>If you have any questions, please contact our support team</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- NEED HELP -->
          <tr>
            <td style="padding:0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f2f9ff; border-radius:10px;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <p style="margin:0 0 10px 0; font-size:15px; font-weight:600; color:#001848;">
                      Need to Book Again?
                    </p>
                    <p style="margin:0 0 16px 0; font-size:13px; color:#666;">
                      We'd love to serve you in the future. Visit our website to make a new reservation.
                    </p>
                    <a href="https://simplecruiseparking.com" style="display:inline-block; padding:10px 24px; background:#00a9fe; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:600;">
                      Make New Booking
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:30px; background:#fafafa; border-top:1px solid #f1f1f1;">
              <p style="margin:0 0 6px 0; font-size:13px; color:#999;">
                Need help? <a href="mailto:info@simplecruiseparking.com" style="color:#00a9fe; text-decoration:none;">info@simplecruiseparking.com</a>
              </p>
              <p style="margin:0; font-size:12px; color:#aaa;">
                © ${new Date().getFullYear()} Simple Cruise Parking Ltd. All rights reserved.
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
    const data: CancellationEmailData = await req.json();

    // Validate required fields
    if (!data.booking_reference || !data.email || !data.first_name) {
      throw new Error('Missing required cancellation data');
    }

    // Get Mailgun credentials from environment
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
    const fromEmail = Deno.env.get('MAILGUN_FROM_EMAIL') || 'info@simplecruiseparking.com';

    if (!mailgunApiKey || !mailgunDomain) {
      throw new Error('Mailgun credentials are not configured');
    }

    // Generate email HTML
    const emailHTML = generateCancellationEmailHTML(data);

    // Prepare form data for Mailgun
    const formData = new FormData();
    formData.append('from', `Simple Cruise Parking <${fromEmail}>`);
    formData.append('to', data.email);
    formData.append('subject', `Booking Cancelled - ${data.booking_reference}`);

    const hasRefund = data.refund_amount > 0;
    formData.append('text', `
Booking Cancelled

Hello ${data.first_name},

Your parking booking has been cancelled as requested.

Booking Reference: ${data.booking_reference}

BOOKING DETAILS:
Drop Off: ${formatDateTime(data.drop_off_datetime)}
Return: ${formatDateTime(data.return_datetime)}
Cruise Line: ${data.cruise_line}
Ship: ${data.ship_name}

${hasRefund ? `
REFUND INFORMATION:
Original Amount: ${formatCurrency(data.total)}
Refund Amount: ${formatCurrency(data.refund_amount)}

Your refund has been processed and will appear in your account within 5-10 business days.
` : `
NO REFUND:
As per our cancellation policy, bookings cancelled within 48 hours of the scheduled drop-off time are non-refundable.
`}

If you have any questions, please contact us at info@simplecruiseparking.com

© ${new Date().getFullYear()} Simple Cruise Parking
    `);

    formData.append('html', emailHTML);

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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cancellation email sent successfully',
        messageId: result.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send cancellation email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
