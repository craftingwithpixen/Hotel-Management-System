// Email service using Resend (graceful fallback when API key not configured)
let resend = null;

try {
  const { Resend } = require("resend");
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.log("Resend not configured, emails will be logged to console");
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@hospitalityos.com";

const sendEmail = async ({ to, subject, html, attachments }) => {
  if (!resend) {
    console.log(`📧 [EMAIL LOG] To: ${to} | Subject: ${subject}`);
    return { success: true, logged: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      ...(attachments && { attachments }),
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

const sendOTP = async (email, otp) => {
  console.log(`📧 [EMAIL LOG] To: ${email} | and  otp is ${otp}`);
  return sendEmail({
    to: email,
    subject: "Your Grand Paradise verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e;">Grand Paradise</h2>
        <p>Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 8px;">${otp}</div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

const sendBookingConfirmation = async (email, booking, invoiceBuffer) => {
  return sendEmail({
    to: email,
    subject: `Booking confirmed — ${booking.room?.roomNumber || booking.table?.tableNumber || ""}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Booking Confirmed! ✅</h2>
        <p>Your ${booking.type} booking has been confirmed.</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Guests:</strong> ${booking.guestCount}</p>
        ${booking.checkIn ? `<p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>` : ""}
        ${booking.checkOut ? `<p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>` : ""}
        ${booking.bookingDate ? `<p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>` : ""}
        <p>Thank you for choosing Grand Paradise!</p>
      </div>
    `,
    ...(invoiceBuffer && {
      attachments: [{ filename: "invoice.pdf", content: invoiceBuffer }],
    }),
  });
};

const sendLowStockAlert = async (email, items) => {
  const itemsList = items
    .map((i) => `<li>${i.name}: ${i.currentStock} ${i.unit} (threshold: ${i.lowStockThreshold})</li>`)
    .join("");

  return sendEmail({
    to: email,
    subject: "⚠️ Low Stock Alert - Grand Paradise",
    html: `
      <div style="font-family: sans-serif;">
        <h2>Low Stock Alert</h2>
        <p>The following items are at or below their low stock threshold:</p>
        <ul>${itemsList}</ul>
        <p>Please restock these items as soon as possible.</p>
      </div>
    `,
  });
};

const sendInvoice = async (email, invoiceUrl) => {
  return sendEmail({
    to: email,
    subject: "Your Invoice - Grand Paradise",
    html: `
      <div style="font-family: sans-serif;">
        <h2>Invoice Ready</h2>
        <p>Your invoice is ready. <a href="${invoiceUrl}">Download Invoice</a></p>
        <p>Thank you for your visit!</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTP,
  sendBookingConfirmation,
  sendLowStockAlert,
  sendInvoice,
  sendEmail,
};
