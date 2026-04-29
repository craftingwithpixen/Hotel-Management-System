const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Billing = require("../models/Billing");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Order = require("../models/Order");
const Table = require("../models/Table");
const User = require("../models/User");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const { verifyPayment } = require("../utils/razorpayVerify");
const { emitPaymentCaptured } = require("../services/socketService");
const emailService = require("../services/emailService");
const { generateInvoice, uploadInvoiceToCloudinary } = require("../services/pdfService");

const applyPaymentEffectsOnRelatedDocs = async (billing, payment) => {
  try {
    if (billing.type === "room" && billing.booking) {
      const booking = await Booking.findById(billing.booking).populate("room");
      if (booking) {
        // Link payment no matter what (if it wasn't already linked).
        if (!booking.payment) booking.payment = payment._id;

        // Conservative room state change: only confirm/book the room if booking
        // is still in pre-check-in states.
        const shouldConfirm = ["pending", "confirmed"].includes(booking.status);
        if (shouldConfirm) {
          booking.status = "confirmed";
          await booking.save();
          if (booking.room) await Room.findByIdAndUpdate(booking.room._id, { status: "booked" });
        } else {
          await booking.save();
        }
      }
    }

    if (billing.type === "restaurant" && billing.order) {
      const order = await Order.findById(billing.order).populate("table");
      if (order) {
        let changed = false;
        if (order.overallStatus !== "billed") {
          order.overallStatus = "billed";
          changed = true;
        }
        if (!order.billing) {
          order.billing = billing._id;
          changed = true;
        }
        if (changed) await order.save();

        // Free the table once there are no other active (non-billed) orders.
        const tableId = order.table?._id || order.table;
        if (tableId) {
          const remaining = await Order.countDocuments({
            table: tableId,
            overallStatus: { $ne: "billed" },
          });
          if (remaining === 0) await Table.findByIdAndUpdate(tableId, { status: "available" });
        }
      }
    }
  } catch (e) {
    console.error("Payment effects error:", e?.message || e);
  }
};

const ensureInvoiceUploadAndEmail = async (billing) => {
  try {
    // Idempotency: if we've already uploaded the invoice, don't re-upload or re-email.
    if (billing.invoiceUrl) return;

    const customer = await User.findById(billing.customer).select("email name");
    if (!customer?.email) return;

    const invoiceBuffer = await generateInvoice(billing);
    const invoiceUrl = await uploadInvoiceToCloudinary(invoiceBuffer, billing._id);
    billing.invoiceUrl = invoiceUrl;
    await billing.save();

    if (billing.type === "room" && billing.booking) {
      const booking = await Booking.findById(billing.booking).populate("room table customer");
      if (booking) {
        await emailService.sendBookingConfirmation(customer.email, booking, invoiceBuffer);
        return;
      }
    }

    await emailService.sendInvoice(customer.email, invoiceUrl);
  } catch (e) {
    // Payment success must remain reliable; invoice/email issues are best-effort.
    console.error("Invoice upload/email error:", e?.message || e);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { billingId } = req.body;
    const billing = await Billing.findById(billingId);
    if (!billing) return res.status(404).json({ message: "Bill not found" });

    const order = await razorpay.orders.create({
      amount: Math.round(billing.total * 100),
      currency: "INR",
      receipt: `bill_${billing._id}`,
    });

    const payment = await Payment.create({
      billing: billingId, method: "upi",
      razorpayOrderId: order.id, amount: billing.total,
    });

    res.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) { next(error); }
};

exports.verify = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ message: "Payment verification failed" });

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    const billing = await Billing.findById(payment.billing);
    billing.status = "paid";
    billing.payment = payment._id;
    billing.paidAt = new Date();
    await billing.save();

    await applyPaymentEffectsOnRelatedDocs(billing, payment);

    await ensureInvoiceUploadAndEmail(billing);

    // Add loyalty points
    const points = Math.floor(billing.total / 100);
    if (points > 0 && billing.customer) {
      const user = await User.findById(billing.customer);
      user.loyaltyPoints += points;
      await user.save();
      await LoyaltyTransaction.create({
        customer: user._id, type: "earn", points,
        description: `Earned on bill #${billing._id}`,
        billing: billing._id, balanceAfter: user.loyaltyPoints,
      });
    }

    if (req.app.get("io")) emitPaymentCaptured(req.app.get("io"), billing);
    res.json({ message: "Payment verified", payment, billing });
  } catch (error) { next(error); }
};

exports.cash = async (req, res, next) => {
  try {
    const { billingId } = req.body;
    const billing = await Billing.findById(billingId);
    const payment = await Payment.create({
      billing: billingId, method: "cash",
      amount: billing.total, status: "captured",
    });
    billing.status = "paid";
    billing.payment = payment._id;
    billing.paidAt = new Date();
    await billing.save();

    await applyPaymentEffectsOnRelatedDocs(billing, payment);

    await ensureInvoiceUploadAndEmail(billing);

    if (req.app.get("io")) emitPaymentCaptured(req.app.get("io"), billing);
    res.json({ payment, billing });
  } catch (error) { next(error); }
};

exports.refund = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await refundPayment(paymentId);
    res.json({ payment });
  } catch (error) { next(error); }
};

// Shared helper so other controllers (like booking cancellation) can trigger refunds safely.
const refundPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  if (payment.razorpayPaymentId && payment.status !== "refunded") {
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { speed: "normal" });
    payment.refundId = refund.id;
  }

  payment.status = "refunded";
  payment.refundedAt = new Date();
  await payment.save();
  return payment;
};

exports.refundPayment = refundPayment;

exports.getById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("billing");
    res.json({ payment });
  } catch (error) { next(error); }
};

// POST /payments/webhook — Razorpay async webhook (uses raw body, not JSON)
exports.webhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = req.body.toString();
    const signature = req.headers["x-razorpay-signature"];
    const digest = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");

    if (digest !== signature) return res.status(400).send("Invalid webhook signature");

    const event = JSON.parse(body);
    const paymentEntity = event?.payload?.payment?.entity;

    if (event.event === "payment.captured" && paymentEntity) {
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
      if (payment && payment.status !== "captured") {
        payment.razorpayPaymentId = paymentEntity.id;
        payment.status = "captured";
        payment.webhookVerified = true;
        await payment.save();

        const billing = await Billing.findById(payment.billing);
        if (billing && billing.status !== "paid") {
          billing.status = "paid";
          billing.payment = payment._id;
          billing.paidAt = new Date();
          await billing.save();

          await applyPaymentEffectsOnRelatedDocs(billing, payment);

          await ensureInvoiceUploadAndEmail(billing);

          // Loyalty points
          const points = Math.floor(billing.total / 100);
          if (points > 0 && billing.customer) {
            const user = await User.findById(billing.customer);
            if (user) {
              user.loyaltyPoints += points;
              await user.save();
              await LoyaltyTransaction.create({
                customer: user._id, type: "earn", points,
                description: `Earned on bill #${billing._id} (webhook)`,
                billing: billing._id, balanceAfter: user.loyaltyPoints,
              });
            }
          }
        }
      }
    }

    if (event.event === "payment.failed" && paymentEntity) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        { status: "failed", webhookVerified: true }
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing error");
  }
};
