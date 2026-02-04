const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    profileId: { type: String },

    productId: { type: String, required: true },
    productName: { type: String, required: true },

    billingMethod: {
      type: String,
      enum: ["monthly", "annual", "lifetime"],
      required: true,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
