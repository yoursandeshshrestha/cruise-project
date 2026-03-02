import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  is_amendment?: boolean;
  amendment_charge?: number;
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

async function generateBookingPDF(data: BookingEmailData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let yPosition = height - 60;

  // Header
  page.drawText('Simple Cruise Parking', {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });
  yPosition -= 25;

  page.drawText('Booking Confirmation', {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaFont,
    color: rgb(0.467, 0.467, 0.467),
  });
  yPosition -= 40;

  // Booking Confirmed Section
  page.drawText('Booking Confirmed', {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });
  yPosition -= 25;

  page.drawText(`Thank you ${data.first_name}. Your parking is reserved.`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0.333, 0.333, 0.333),
  });
  yPosition -= 35;

  // Booking Reference Box
  page.drawRectangle({
    x: 50,
    y: yPosition - 50,
    width: width - 100,
    height: 60,
    color: rgb(0.949, 0.957, 0.965),
  });

  page.drawText('BOOKING REFERENCE', {
    x: 65,
    y: yPosition - 15,
    size: 9,
    font: helveticaFont,
    color: rgb(0.467, 0.467, 0.467),
  });

  page.drawText(data.booking_reference, {
    x: 65,
    y: yPosition - 38,
    size: 18,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });
  yPosition -= 80;

  // Booking Details
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

  const details = [
    { label: 'Drop Off', value: formatSimpleDateTime(data.drop_off_datetime) },
    { label: 'Return', value: formatSimpleDateTime(data.return_datetime) },
    { label: 'Cruise Line', value: data.cruise_line },
    { label: 'Ship', value: data.ship_name },
    ...(data.terminal ? [{ label: 'Terminal', value: data.terminal }] : []),
    { label: 'Passengers', value: data.number_of_passengers.toString() },
    { label: 'Vehicle', value: `${data.vehicle_make} (${data.vehicle_registration})` },
    ...(data.add_ons && data.add_ons.length > 0 ? [{ label: 'Add-ons', value: data.add_ons.join(', ') }] : []),
  ];

  details.forEach((detail) => {
    page.drawText(detail.label, {
      x: 50,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.267, 0.267, 0.267),
    });

    const valueWidth = helveticaBold.widthOfTextAtSize(detail.value, 11);
    page.drawText(detail.value, {
      x: width - 50 - valueWidth,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: rgb(0.067, 0.067, 0.067),
    });

    yPosition -= 22;
  });

  // Divider line
  yPosition -= 10;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  yPosition -= 25;

  // Discount if applicable
  if (data.discount && data.discount > 0) {
    const discountLabel = `Discount${data.promo_code ? ` (${data.promo_code})` : ''}`;
    const discountValue = `-${formatCurrency(data.discount)}`;

    page.drawText(discountLabel, {
      x: 50,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.467, 0.467, 0.467),
    });

    const discountWidth = helveticaFont.widthOfTextAtSize(discountValue, 11);
    page.drawText(discountValue, {
      x: width - 50 - discountWidth,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.467, 0.467, 0.467),
    });

    yPosition -= 25;
  }

  // Total
  page.drawText('Total Paid', {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });

  const totalValue = formatCurrency(data.total);
  const totalWidth = helveticaBold.widthOfTextAtSize(totalValue, 14);
  page.drawText(totalValue, {
    x: width - 50 - totalWidth,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });
  yPosition -= 40;

  // Important Information
  page.drawText('Important Information', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.067, 0.067, 0.067),
  });
  yPosition -= 20;

  const infoPoints = [
    '• Arrive 30 minutes before drop-off',
    '• Bring booking reference and photo ID',
    '• Free shuttle to the cruise terminal',
  ];

  infoPoints.forEach((point) => {
    page.drawText(point, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 18;
  });

  // Footer
  const footerY = 60;
  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: width - 50, y: footerY + 30 },
    thickness: 1,
    color: rgb(0.933, 0.933, 0.933),
  });

  const year = new Date().getFullYear();
  const copyrightText = `© ${year} Simple Cruise Parking`;
  const copyrightWidth = helveticaFont.widthOfTextAtSize(copyrightText, 9);

  page.drawText(copyrightText, {
    x: (width - copyrightWidth) / 2,
    y: footerY + 10,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  page.drawText('info@simplecruiseparking.com', {
    x: (width - helveticaFont.widthOfTextAtSize('info@simplecruiseparking.com', 9)) / 2,
    y: footerY - 5,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
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

    // Generate PDF
    console.log('Generating PDF for booking:', bookingData.booking_reference);
    const pdfBytes = await generateBookingPDF(bookingData);
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

    // Prepare form data for Mailgun
    const formData = new FormData();
    formData.append('from', `Simple Cruise Parking <${fromEmail}>`);
    formData.append('to', bookingData.email);

    // Different subject and body for amendments vs new bookings
    if (bookingData.is_amendment) {
      formData.append('subject', `Booking Updated - ${bookingData.booking_reference}`);
      formData.append('text', `
Booking Updated!

Hello ${bookingData.first_name}, your parking booking has been successfully updated.

Booking Reference: ${bookingData.booking_reference}

UPDATED DETAILS:
Drop Off: ${formatDateTime(bookingData.drop_off_datetime)}
Return: ${formatDateTime(bookingData.return_datetime)}
Cruise Line: ${bookingData.cruise_line}
Ship: ${bookingData.ship_name}
${bookingData.terminal ? `Terminal: ${bookingData.terminal}\n` : ''}
Vehicle: ${bookingData.vehicle_make} (${bookingData.vehicle_registration})

${bookingData.amendment_charge ? `Amendment Charge: ${formatCurrency(bookingData.amendment_charge)}\n` : ''}
Total Paid (including amendment): ${formatCurrency(bookingData.total)}

Please arrive at least 30 minutes before your scheduled drop-off time.

Need help? Email us at info@simplecruiseparking.com or call us.

© ${new Date().getFullYear()} Simple Cruise Parking
      `);
    } else {
      formData.append('subject', `Booking Confirmation - ${bookingData.booking_reference}`);
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
    }

    formData.append('html', emailHTML);

    // Attach PDF to email
    formData.append('attachment', pdfBlob, `booking-${bookingData.booking_reference}.pdf`);

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
