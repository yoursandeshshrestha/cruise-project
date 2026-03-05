import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

async function generateCancellationPDF(data: CancellationEmailData): Promise<Uint8Array> {
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
  const cancelRed = rgb(0.863, 0.149, 0.149); // #dc2626

  // Header with red background for cancellation
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: cancelRed,
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
  const titleText = 'Booking Cancelled';
  const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 20);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: yPosition,
    size: 20,
    font: helveticaBold,
    color: brandDark,
  });
  yPosition -= 20;

  const messageText = 'Your parking booking has been cancelled as requested.';
  const messageWidth = helveticaFont.widthOfTextAtSize(messageText, 11);
  page.drawText(messageText, {
    x: (width - messageWidth) / 2,
    y: yPosition,
    size: 11,
    font: helveticaFont,
    color: textGray,
  });
  yPosition -= 35;

  // Booking Reference Box with light red background
  const refBg = rgb(0.996, 0.886, 0.886); // #fee2e2
  page.drawRectangle({
    x: 50,
    y: yPosition - 55,
    width: width - 100,
    height: 60,
    color: refBg,
    borderRadius: 8,
  });

  const refLabelText = 'CANCELLED BOOKING REFERENCE';
  const refLabelWidth = helveticaFont.widthOfTextAtSize(refLabelText, 8);
  page.drawText(refLabelText, {
    x: (width - refLabelWidth) / 2,
    y: yPosition - 15,
    size: 8,
    font: helveticaFont,
    color: cancelRed,
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

  // Refund Section Background
  yPosition -= 10;
  const hasRefund = data.refund_amount > 0;

  if (hasRefund) {
    // Refund issued - green box
    const refundBg = rgb(0.863, 0.988, 0.906); // #dcfce7
    const refundGreen = rgb(0.086, 0.396, 0.204); // #166534

    page.drawRectangle({
      x: 50,
      y: yPosition - 100,
      width: width - 100,
      height: 100,
      color: refundBg,
      borderRadius: 8,
    });

    // Left border accent
    page.drawRectangle({
      x: 50,
      y: yPosition - 100,
      width: 3,
      height: 100,
      color: rgb(0.525, 0.918, 0.671), // #86efac
    });

    yPosition -= 15;

    page.drawText('Refund Issued', {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: refundGreen,
    });
    yPosition -= 16;

    const refundMessage = 'Your refund has been processed and will appear in your';
    page.drawText(refundMessage, {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.082, 0.502, 0.239), // #15803d
    });
    yPosition -= 12;

    page.drawText('account within 5-10 business days.', {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.082, 0.502, 0.239),
    });
    yPosition -= 20;

    // Divider line
    page.drawLine({
      start: { x: 60, y: yPosition },
      end: { x: width - 60, y: yPosition },
      thickness: 0.5,
      color: rgb(0.733, 0.969, 0.816), // #bbf7d0
    });
    yPosition -= 14;

    // Original and refund amounts
    page.drawText('Original Amount', {
      x: 60,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: refundGreen,
    });

    const originalValue = formatCurrency(data.total);
    const originalWidth = helveticaBold.widthOfTextAtSize(originalValue, 10);
    page.drawText(originalValue, {
      x: width - 60 - originalWidth,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: refundGreen,
    });
    yPosition -= 16;

    page.drawText('Refund Amount', {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: refundGreen,
    });

    const refundValue = formatCurrency(data.refund_amount);
    const refundWidth = helveticaBold.widthOfTextAtSize(refundValue, 14);
    page.drawText(refundValue, {
      x: width - 60 - refundWidth,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: refundGreen,
    });
    yPosition -= 25;
  } else {
    // No refund - yellow warning box
    const noRefundBg = rgb(0.996, 0.953, 0.780); // #fef3c7
    const warningYellow = rgb(0.522, 0.302, 0.055); // #854d0e

    page.drawRectangle({
      x: 50,
      y: yPosition - 60,
      width: width - 100,
      height: 60,
      color: noRefundBg,
      borderRadius: 8,
    });

    // Left border accent
    page.drawRectangle({
      x: 50,
      y: yPosition - 60,
      width: 3,
      height: 60,
      color: rgb(0.992, 0.878, 0.278), // #fde047
    });

    yPosition -= 15;

    page.drawText('No Refund Issued', {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: warningYellow,
    });
    yPosition -= 16;

    const noRefundMsg1 = 'As per our cancellation policy, bookings cancelled within 48';
    const noRefundMsg2 = 'hours of the scheduled drop-off time are non-refundable.';

    page.drawText(noRefundMsg1, {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.631, 0.384, 0.027), // #a16207
    });
    yPosition -= 12;

    page.drawText(noRefundMsg2, {
      x: 60,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.631, 0.384, 0.027),
    });
    yPosition -= 20;
  }

  // What Happens Next with styled box
  const infoBoxHeight = hasRefund ? 95 : 75;
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

  page.drawText('What Happens Next', {
    x: 60,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.133, 0.133, 0.133), // #222
  });
  yPosition -= 18;

  const infoPoints = hasRefund
    ? [
        `Your refund of ${formatCurrency(data.refund_amount)} will be processed within 5-10 business days`,
        'The refund will appear in your original payment method',
        'You will receive a confirmation email once this process is complete',
        'If you have any questions, please contact our support team',
      ]
    : [
        'No refund will be issued as per our cancellation policy',
        'You will receive a confirmation email once this process is complete',
        'If you have any questions, please contact our support team',
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

    // Generate PDF
    const pdfBytes = await generateCancellationPDF(data);
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

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

    // Attach PDF to email
    formData.append('attachment', pdfBlob, `cancellation-${data.booking_reference}.pdf`);

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
