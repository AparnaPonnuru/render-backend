const express = require("express");
const router = express.Router();
const Subscription = require("../models/subscription.model");

// -----------------------------
//  Check Subscription Status
// -----------------------------
router.get("/status", async (req, res) => {
  try {
    const { email, productId } = req.query;

    const sub = await Subscription.findOne({ userEmail: email, productId });

    if (!sub) {
      return res.json({ subscribed: false });
    }

    // Lifetime = always active
    if (sub.billingMethod === "lifetime") {
      return res.json({ subscribed: true, subscription: sub });
    }

    // Expired?
    if (sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.json({ subscribed: false, subscription: sub });
    }

    return res.json({ subscribed: true, subscription: sub });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
