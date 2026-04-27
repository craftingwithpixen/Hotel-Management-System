const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const Billing = require("../models/Billing");
const User = require("../models/User");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const { verifyPayment } = require("../utils/razorpayVerify");
const { emitPaymentCaptured } = require("../services/socketService");

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

    if (req.app.get("io")) emitPaymentCaptured(req.app.get("io"), billing);
    res.json({ payment, billing });
  } catch (error) { next(error); }
};

exports.refund = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (payment.razorpayPaymentId) {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { speed: "normal" });
      payment.refundId = refund.id;
    }
    payment.status = "refunded";
    payment.refundedAt = new Date();
    await payment.save();
    res.json({ payment });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("billing");
    res.json({ payment });
  } catch (error) { next(error); }
};
