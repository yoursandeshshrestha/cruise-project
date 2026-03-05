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
  let yPosition = height - 50;

  // Fetch and embed logo
  let logoImage;
  try {
    const logoUrl = Deno.env.get('LOGO_URL') || 'https://simplecruiseparking.com/logos/simplecruise-logo-white.png';
    const logoResponse = await fetch(logoUrl);
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    const logoBytes = new Uint8Array(logoArrayBuffer);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (error) {
    console.warn('Failed to load logo, continuing without it:', error);
    logoImage = null;
  }

  // Brand colors
  const brandPrimary = rgb(0, 0.663, 0.996); // #00a9fe
  const brandDark = rgb(0, 0.094, 0.282); // #001848
  const textGray = rgb(0.467, 0.467, 0.467); // #777
  const lightBg = rgb(0.949, 0.976, 1); // #f2f9ff
  const borderColor = rgb(0.945, 0.945, 0.945); // #f1f1f1

  // Header with colored background
  const headerBg = data.is_amendment ? brandDark : rgb(0, 0.584, 0.898); // #0095e5
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: headerBg,
  });

  // Logo or Company Name in Header (centered)
  if (logoImage) {
    const logoDims = logoImage.scale(0.15); // Scale logo to appropriate size
    page.drawImage(logoImage, {
      x: (width - logoDims.width) / 2,
      y: height - 65,
      width: logoDims.width,
      height: logoDims.height,
    });
  } else {
    // Fallback to text if logo fails to load
    const companyText = 'SIMPLE CRUISE PARKING';
    const companyTextWidth = helveticaBold.widthOfTextAtSize(companyText, 18);
    page.drawText(companyText, {
      x: (width - companyTextWidth) / 2,
      y: yPosition,
      size: 18,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
  }
  yPosition -= 100;

  // Title Section
  const titleText = data.is_amendment ? 'Booking Updated' : 'Booking Confirmed';
  const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 20);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: yPosition,
    size: 20,
    font: helveticaBold,
    color: brandDark,
  });
  yPosition -= 20;

  const messageText = data.is_amendment
    ? 'Your parking booking has been successfully updated.'
    : `Thank you ${data.first_name}. Your parking is successfully reserved.`;
  const messageWidth = helveticaFont.widthOfTextAtSize(messageText, 11);
  page.drawText(messageText, {
    x: (width - messageWidth) / 2,
    y: yPosition,
    size: 11,
    font: helveticaFont,
    color: textGray,
  });
  yPosition -= 35;

  // Booking Reference Box with light blue background
  page.drawRectangle({
    x: 50,
    y: yPosition - 55,
    width: width - 100,
    height: 60,
    color: lightBg,
    borderRadius: 8,
  });

  const refLabelText = 'BOOKING REFERENCE';
  const refLabelWidth = helveticaFont.widthOfTextAtSize(refLabelText, 8);
  page.drawText(refLabelText, {
    x: (width - refLabelWidth) / 2,
    y: yPosition - 15,
    size: 8,
    font: helveticaFont,
    color: brandPrimary,
  });

  const refWidth = helveticaBold.widthOfTextAtSize(data.booking_reference, 20);
  page.drawText(data.booking_reference, {
    x: (width - refWidth) / 2,
    y: yPosition - 40,
    size: 20,
    font: helveticaBold,
    color: brandDark,
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

  details.forEach((detail, index) => {
    page.drawText(detail.label, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: textGray,
    });

    const valueWidth = helveticaBold.widthOfTextAtSize(detail.value, 10);
    page.drawText(detail.value, {
      x: width - 50 - valueWidth,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: brandDark,
    });

    // Draw bottom border for all except last item
    if (index < details.length - 1) {
      yPosition -= 18;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 0.5,
        color: borderColor,
      });
      yPosition -= 6;
    } else {
      yPosition -= 24;
    }
  });

  // Pricing Section Background
  yPosition -= 10;
  const pricingBoxHeight = 55 + (data.discount && data.discount > 0 ? 20 : 0) + (data.amendment_charge && data.amendment_charge > 0 ? 20 : 0);
  page.drawRectangle({
    x: 50,
    y: yPosition - pricingBoxHeight,
    width: width - 100,
    height: pricingBoxHeight,
    color: rgb(0.973, 0.976, 0.980), // #f8f9fa
    borderRadius: 8,
  });

  yPosition -= 15;

  // Discount if applicable
  if (data.discount && data.discount > 0) {
    const discountLabel = `Discount${data.promo_code ? ` (${data.promo_code})` : ''}`;
    const discountValue = `-${formatCurrency(data.discount)}`;

    page.drawText(discountLabel, {
      x: 60,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: brandPrimary,
    });

    const discountWidth = helveticaBold.widthOfTextAtSize(discountValue, 10);
    page.drawText(discountValue, {
      x: width - 60 - discountWidth,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: brandPrimary,
    });

    yPosition -= 20;
  }

  // Amendment charge if applicable
  if (data.amendment_charge && data.amendment_charge > 0) {
    const amendmentLabel = 'Amendment Charge';
    const amendmentValue = formatCurrency(data.amendment_charge);

    page.drawText(amendmentLabel, {
      x: 60,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: textGray,
    });

    const amendmentWidth = helveticaBold.widthOfTextAtSize(amendmentValue, 10);
    page.drawText(amendmentValue, {
      x: width - 60 - amendmentWidth,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: brandDark,
    });

    yPosition -= 20;
  }

  // Total
  page.drawText('Total Paid', {
    x: 60,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: brandDark,
  });

  const totalValue = formatCurrency(data.total);
  const totalWidth = helveticaBold.widthOfTextAtSize(totalValue, 16);
  page.drawText(totalValue, {
    x: width - 60 - totalWidth,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: brandPrimary,
  });
  yPosition -= 35;

  // Important Information with styled box
  const infoBoxHeight = 80;
  page.drawRectangle({
    x: 50,
    y: yPosition - infoBoxHeight,
    width: width - 100,
    height: infoBoxHeight,
    color: rgb(0.961, 0.961, 0.961), // #f5f5f5
    borderRadius: 6,
  });

  // Left border accent
  page.drawRectangle({
    x: 50,
    y: yPosition - infoBoxHeight,
    width: 3,
    height: infoBoxHeight,
    color: rgb(0.863, 0.863, 0.863), // #dcdcdc
  });

  yPosition -= 15;

  page.drawText('Important Information', {
    x: 60,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.133, 0.133, 0.133), // #222
  });
  yPosition -= 18;

  const infoPoints = [
    'Arrive 30 minutes before your scheduled drop-off time',
    'Please bring your booking reference and photo ID',
    'Free shuttle service to the cruise terminal included',
  ];

  infoPoints.forEach((point) => {
    page.drawText(`• ${point}`, {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.333, 0.333, 0.333), // #555
    });
    yPosition -= 14;
  });

  // Footer
  yPosition -= 15;
  const footerY = 60;

  // Footer background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerY,
    color: rgb(0.980, 0.980, 0.980), // #fafafa
  });

  // Top border line
  page.drawLine({
    start: { x: 0, y: footerY },
    end: { x: width, y: footerY },
    thickness: 1,
    color: rgb(0.945, 0.945, 0.945), // #f1f1f1
  });

  const year = new Date().getFullYear();
  const contactText = 'Need help? info@simplecruiseparking.com';
  const contactWidth = helveticaFont.widthOfTextAtSize(contactText, 9);

  page.drawText(contactText, {
    x: (width - contactWidth) / 2,
    y: footerY - 20,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  const copyrightText = `© ${year} Simple Cruise Parking Ltd. All rights reserved.`;
  const copyrightWidth = helveticaFont.widthOfTextAtSize(copyrightText, 8);

  page.drawText(copyrightText, {
    x: (width - copyrightWidth) / 2,
    y: footerY - 35,
    size: 8,
    font: helveticaFont,
    color: rgb(0.667, 0.667, 0.667), // #aaa
  });

  return await pdfDoc.save();
}

function generateBookingEmailHTML(data: BookingEmailData): string {
  const addOnsHTML = data.add_ons && data.add_ons.length > 0
    ? `
                <tr>
                  <td style="padding:14px 0; color:#777;">Add-ons</td>
                  <td align="right" style="padding:14px 0; font-weight:600; color:#001848;">${data.add_ons.join(', ')}</td>
                </tr>
    `
    : '';

  const discountHTML = data.discount && data.discount > 0
    ? `
                  <tr>
                    <td style="padding-bottom:8px; color:#00a9fe; font-weight:600;">Discount${data.promo_code ? ` (${data.promo_code})` : ''}</td>
                    <td align="right" style="padding-bottom:8px; color:#00a9fe; font-weight:600;">-${formatCurrency(data.discount)}</td>
                  </tr>
    `
    : '';

  const amendmentChargeHTML = data.amendment_charge && data.amendment_charge > 0
    ? `
                  <tr>
                    <td style="padding-bottom:8px; color:#777;">Amendment Charge</td>
                    <td align="right" style="padding-bottom:8px; font-weight:600; color:#001848;">${formatCurrency(data.amendment_charge)}</td>
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

  // Different styling for amendments vs new bookings
  const headerBgColor = data.is_amendment ? '#001848' : '#0095e5';
  const headerTitle = data.is_amendment ? 'Booking Updated' : 'Booking Confirmed';
  const headerMessage = data.is_amendment
    ? 'Your parking booking has been successfully updated.'
    : `Thank you ${data.first_name}. Your parking is successfully reserved.`;

  // Logo URL - needs to be absolute for email
  const logoUrl = Deno.env.get('LOGO_URL') || 'https://simplecruiseparking.com/logos/simplecruise-logo-white.png';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.is_amendment ? 'Booking Updated' : 'Booking Confirmation'} - ${data.booking_reference}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family:Poppins,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f4;">
    <tr>
      <td align="center" style="padding:50px 20px;">

        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:${headerBgColor}; padding:30px 20px;">
              <img src="${logoUrl}" alt="Simple Cruise Parking" width="190" style="display:block; margin:0 auto; border:0;" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td align="center" style="padding:40px 30px 20px 30px;">
              <h1 style="margin:0 0 12px 0; font-size:26px; font-weight:700; color:#001848;">
                ${headerTitle}
              </h1>
              <p style="margin:0; font-size:15px; color:#666; line-height:1.7;">
                ${headerMessage}
              </p>
            </td>
          </tr>

          <!-- BOOKING REFERENCE -->
          <tr>
            <td style="padding:0 30px 35px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f2f9ff; border-radius:10px;">
                <tr>
                  <td align="center" style="padding:26px;">
                    <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#00a9fe;">
                      Booking Reference
                    </p>
                    <p style="margin:0; font-size:28px; font-weight:700; letter-spacing:2px; color:#001848;">
                      ${data.booking_reference}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
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
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Ship</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${data.ship_name}</td>
                </tr>
                ${data.terminal ? `
                <tr>
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Terminal</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${data.terminal}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:14px 0; border-bottom:1px solid #f1f1f1; color:#777;">Passengers</td>
                  <td align="right" style="padding:14px 0; border-bottom:1px solid #f1f1f1; font-weight:600; color:#001848;">${data.number_of_passengers}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0; ${addOnsHTML ? 'border-bottom:1px solid #f1f1f1;' : ''} color:#777;">Vehicle</td>
                  <td align="right" style="padding:14px 0; ${addOnsHTML ? 'border-bottom:1px solid #f1f1f1;' : ''} font-weight:600; color:#001848;">${data.vehicle_make} (${data.vehicle_registration})</td>
                </tr>
                ${addOnsHTML}
              </table>
            </td>
          </tr>

          <!-- PRICING -->
          <tr>
            <td style="padding:0 30px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f9fa; border-radius:10px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;">
                      ${discountHTML}
                      ${amendmentChargeHTML}
                      <tr>
                        <td style="padding-top:14px; font-size:18px; font-weight:700; color:#001848;">Total Paid</td>
                        <td align="right" style="padding-top:14px; font-size:24px; font-weight:700; color:#00a9fe;">${formatCurrency(data.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- IMPORTANT INFO -->
          <tr>
            <td style="padding:0 30px 45px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f5; border-left:3px solid #dcdcdc; border-radius:8px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#222;">
                      Important Information
                    </p>
                    <ul style="margin:0; padding-left:18px; font-size:14px; color:#555; line-height:1.8;">
                      <li style="margin-bottom:8px;">Arrive 30 minutes before your scheduled drop-off time</li>
                      <li style="margin-bottom:8px;">Please bring your booking reference and photo ID</li>
                      <li>Free shuttle service to the cruise terminal included</li>
                    </ul>
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
