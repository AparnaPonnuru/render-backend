const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  creatorEmail: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },

  productName: { type: String, required: true },
  productId: { type: String, required: true },
  amount: { type: Number, required: true },

  billingFrequency: { type: String, default: "One-Time" },
  status: { type: String, default: "Pending" },   // 👈 ADD THIS

  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
