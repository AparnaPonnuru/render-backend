const fs = require("fs");
const path = require("path");

exports.getAllCurrencies = (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "data", "currencies.json");

    const jsonData = fs.readFileSync(filePath, "utf-8");
    const currencies = JSON.parse(jsonData);

    return res.json({
      status: true,
      count: currencies.length,
      currencies: currencies,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
