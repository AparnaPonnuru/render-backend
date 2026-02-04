const mongoose = require("mongoose");

const VaultTransactionSchema = new mongoose.Schema({
  partnerEmail: { type: String, required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  coin: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  balanceAfter: { type: Number, required: true },
  metadata: { type: Object }
});

module.exports = mongoose.model("VaultTransaction", VaultTransactionSchema);
