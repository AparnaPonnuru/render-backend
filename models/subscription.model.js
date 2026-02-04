const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // lifetime = null
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
