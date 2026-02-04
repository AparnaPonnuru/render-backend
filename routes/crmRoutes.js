const express = require("express");
const Client = require("../models/client.model");
const Purchase = require("../models/purchase.model");

const router = express.Router();

/* ---------------------------------------
   ADD CLIENT
---------------------------------------- */
router.post("/clients/add", async (req, res) => {
  try {
    const client = await Client.create(req.body);

    res.json({
      status: true,
      message: "Client created successfully",
      data: client
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   GET ALL CLIENTS OF COUNSELLOR
---------------------------------------- */
router.get("/clients", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    const clients = await Client.find({ creatorEmail })
      .populate("purchaseDetails"); // Allows UI to show purchaseDetails.length

    res.json({ status: true, data: clients });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   ADD PURCHASE
---------------------------------------- */
router.post("/purchases/add", async (req, res) => {
  try {
    // 1️⃣ Create purchase
    const purchase = await Purchase.create(req.body);

    // 2️⃣ Link purchase to client document
    if (req.body.clientId) {
      await Client.findByIdAndUpdate(
        req.body.clientId,
        { $push: { purchaseDetails: purchase._id } },
        { new: true }
      );
    }

    res.json({
      status: true,
      message: "Purchase added successfully",
      data: purchase
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   GET ALL PURCHASES OF COUNSELLOR
---------------------------------------- */
router.get("/purchases", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    const purchases = await Purchase.find({ creatorEmail })
      .populate("clientId", "name email phoneNumber country");

    res.json({ status: true, data: purchases });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;
