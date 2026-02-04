const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    productcreatoremail: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "" },
    description: { type: String, default: "" },
    chargingtype: { type: String, required: true },
    revenue_account: { type: String, default: "" },
    client_app: { type: String, default: "" },
    product_category_code: { type: String, default: "" },
    sub_category_code: { type: String, default: "" },
    custom_product_label: { type: String, default: "" },
    points_creation: { type: Boolean, default: false },
    sub_text: { type: String, default: "" },

    first_purchase: {
      price: { type: Number, default: 0 },
      coin: { type: String, default: "" }
    },

    billing_cycle: {
      monthly: {
        price: { type: Number, default: 0 },
        coin: { type: String, default: "" }
      },
      annual: {
        price: { type: Number, default: 0 },
        coin: { type: String, default: "" }
      },
      lifetime: {
        price: { type: Number, default: 0 },
        coin: { type: String, default: "" }
      }
    },

    grace_period: { type: Number, default: 0 },
    first_retry: { type: Number, default: 0 },
    second_retry: { type: Number, default: 0 },

    staking_allowed: { type: Boolean, default: false },
    staking_details: { type: Object, default: {} },

    step_id: { type: String, default: null },

    serviceProvider: { type: String, default: "" },
    access: { type: String, default: "" },
    goal: { type: String, default: "" },

    grade: { type: Array, default: [] },
    financialSituation: { type: String, default: "" },
    stream: { type: String, default: "" },

    cost: { type: Number, default: 0 },
    price: { type: Number, default: 0 },

    discountType: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },

    duration: { type: Number, default: 0 },

    features: { type: Array, default: [] },

    status: { type: String, default: "active" },

    outcome: { type: String, default: "" },

    // EXISTING FIELD (used to group services):
    type: { type: String, default: "" }, 
    // Possible: Distributor, Vendor, Mentor, Institution

    iterations: { type: Array, default: [] },
    ServiceDetails: { type: Array, default: [] },

    // ⭐ NEW FIELD — VIEW TYPE
    view: {
      type: String,
      enum: ["macro", "micro", "nano"],
      default: "macro", // backward compatible
    }
  },
  { timestamps: true }
);

// ✔ Register model
module.exports = mongoose.model("naavi_services", ServiceSchema);
