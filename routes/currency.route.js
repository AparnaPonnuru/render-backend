const express = require("express");
const router = express.Router();
const currencyCtrl = require("../controllers/currency.controller");

router.get("/currencies", currencyCtrl.getAllCurrencies);

module.exports = router;
