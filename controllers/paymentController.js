const Payment = require("../models/payment.model");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* ============================================================
   CREATE ORDER + SAVE "pending" PAYMENT RECORD
   ============================================================ */
exports.createOrder = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      email,
      billing_method,
      currency,
      profile_id
    } = req.body;

    // 🔥 Define billing prices
    let price = 0;
    if (billing_method === "monthly") price = 299;
    else if (billing_method === "annual") price = 2499;
    else if (billing_method === "lifetime") price = 4999;

    const options = {
      amount: price * 100,
      currency,
      receipt: "receipt_" + Date.now(),
      notes: {
        userEmail: email,
        productId: product_id,
        productName: product_name,
        billing_method,
        profile_id
      }
    };

    const order = await razorpay.orders.create(options);

    // 🔥 Save pending payment into database
    await Payment.create({
      userEmail: email,
      profileId: profile_id,
      productId: product_id,
      productName: product_name,
      billingMethod: billing_method,
      currency,
      amount: price,
      razorpayOrderId: order.id,
      status: "pending",
    });

    res.json({ success: true, order });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ============================================================
   VERIFY PAYMENT + UPDATE PAYMENT RECORD
   ============================================================ */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // ❌ Update to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed", razorpayPaymentId: null, razorpaySignature: null }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Payment Verified — update DB entry
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }
    );

    res.json({
      success: true,
      message: "Payment verified & stored successfully",
    });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
