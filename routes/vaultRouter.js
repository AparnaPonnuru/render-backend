const express = require("express");
const router = express.Router();
const VaultTransaction = require("../models/VaultTransaction");

/**
 * ✅ GET – Fetch vault transactions (READ ONLY)
 */
router.get("/txns", async (req, res) => {
  try {
    const { email, coin } = req.query;

    if (!email || !coin) {
      return res.status(400).json({
        status: false,
        message: "email and coin are required",
      });
    }

    const txns = await VaultTransaction.find({
      partnerEmail: email,
      coin,
    }).sort({ timestamp: -1 });

    res.json({ status: true, txns });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * ✅ POST – Create new transaction (PAYMENT)
 */
router.post("/add", async (req, res) => {
  try {
    const newTxn = await VaultTransaction.create(req.body);
    res.json({ status: true, txn: newTxn });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;
