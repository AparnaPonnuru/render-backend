const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    return res.json({
      status: true,
      categories: [
        { _id: "1", name: "Education" },
        { _id: "2", name: "Career" },
        { _id: "3", name: "Immigration" },
        { _id: "4", name: "Self Improvement" },
        { _id: "5", name: "Finance" }
      ]
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: err.message
    });
  }
});

module.exports = router;
