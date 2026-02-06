const express = require("express");
const router = express.Router();
const {
  getDashboardOverview,
} = require("../controllers/adminDashboardController");

// GET admin dashboard analytics
router.get("/overview", getDashboardOverview);

module.exports = router;