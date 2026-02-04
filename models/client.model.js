const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  country: String,
  creatorEmail: String,

  // NEW FIELD: store all purchases linked to this client
  purchaseDetails: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
