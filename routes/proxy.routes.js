const express = require("express");
const router = express.Router();

/**
 * 🔹 GET ALL COINS (LOCAL STATIC DATA)
 */
router.get("/coins", (req, res) => {
  res.json({
    status: true,
    coins: [
      { type: "crypto", coinSymbol: "BTC", coinName: "Bitcoin", coinImage: "" },
      { type: "crypto", coinSymbol: "ETH", coinName: "Ethereum", coinImage: "" },
      { type: "fiat", coinSymbol: "USD", coinName: "US Dollar", coinImage: "" },
      { type: "fiat", coinSymbol: "INR", coinName: "Indian Rupee", coinImage: "" }
    ]
  });
});

/**
 * 🔹 GET REGISTERED APPS (LOCAL)
 */
router.get("/applications", (req, res) => {
  res.json({
    status: true,
    userApps: [
      { app_name: "Naaviverse", app_code: "naavi", app_icon: "" },
      { app_name: "Vault", app_code: "vault", app_icon: "" }
    ]
  });
});

/**
 * 🔹 GET USER DETAILS (LOCAL)
 */
router.get("/user-details", (req, res) => {
  const email = req.query.email;

  res.json({
    status: true,
    user: {
      name: "Demo User",
      email,
      profile: "Standard User",
      createdAt: new Date()
    }
  });
});

/**
 * 🔹 GET BANKERS (LOCAL)
 */
router.get("/bankers", (req, res) => {
  res.json({
    status: true,
    bankers: [
      { name: "John Doe", id: "B01" },
      { name: "Jane Smith", id: "B02" }
    ]
  });
});

/**
 * 🔹 FOREX CONVERSION (LOCAL)
 */
router.get("/convert", (req, res) => {
  const { buy, from } = req.query;

  res.json({
    status: true,
    from,
    buy,
    rate: 81.25,
    convertedAmount: buy * 81.25
  });
});

/**
 * 🔹 CMC Prices (LOCAL)
 */
router.get("/cmc", (req, res) => {
  const coin = req.query.convert;

  res.json({
    status: true,
    coin,
    price: 50000, // demo price
    change24h: 2.5
  });
});

/**
 * 🔹 BOND EARNINGS (LOCAL)
 */
router.get("/bond-earnings", (req, res) => {
  const { email, coin } = req.query;

  res.json({
    status: true,
    email,
    coin,
    logs: [
      { date: "2025-01-01", amount: 10 },
      { date: "2025-01-02", amount: 12 }
    ]
  });
});

/**
 * 🔹 MONEY MARKET DATA (LOCAL)
 */
router.get("/money-market", (req, res) => {
  const { email, app_code, coin } = req.query;

  res.json({
    status: true,
    email,
    app_code,
    coin,
    deposits: [
      { txnId: "T1001", amount: 500, date: "2025-01-01" },
      { txnId: "T1002", amount: 1000, date: "2025-01-05" }
    ]
  });
});

module.exports = router;
