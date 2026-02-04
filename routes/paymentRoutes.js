const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Payment = require("../models/payment.model");
const Subscription = require('../Admin/models/Subscription');

// -----------------------------
//  Razorpay Init
// -----------------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ===============================
//    CREATE ORDER
// ===============================
router.post("/create-order", async (req, res) => {
  try {
    const {
      userEmail,
      productId,
      productName,
      billingMethod,
      profileId,
      amount,
      currency = "INR",
    } = req.body;

    // Store pending payment
    const payment = await Payment.create({
      userEmail,
      productId,
      productName,
      billingMethod,
      profileId,
      amount,
      currency,
      status: "pending",
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency,
      receipt: "receipt_" + payment._id,
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    return res.json({ success: true, order });
  } catch (err) {
    console.error("Create Order Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
//    VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
// ===============================
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Update payment as paid
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    // -----------------------------
    // Create/Update Subscription
    // -----------------------------
    let endDate = null;

    if (payment.billingMethod === "monthly") {
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    if (payment.billingMethod === "annual") {
      endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    if (payment.billingMethod === "lifetime") {
      endDate = null; // never expires
    }

    await Subscription.findOneAndUpdate(
      { userEmail: payment.userEmail, productId: payment.productId },
      {
        userEmail: payment.userEmail,
        productId: payment.productId,
        productName: payment.productName,
        billingMethod: payment.billingMethod,
        profileId: payment.profileId,
        startDate: new Date(),
        endDate,
        status: "active",
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Payment verified & subscription activated",
    });
  } catch (err) {
    console.error("Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
