const router = require("express").Router();
const {
  addService,
  getServices,
  updateService,
  deleteService,
  restoreService,
  getServicesByStep,
  
} = require("../controllers/services.controller");

// ==========================
// CREATE SERVICE
// ==========================
router.post("/add", addService);

// ==========================
// GET ALL SERVICES
// Supports: ?status=active | inactive | delete
// Supports: ?productcreatoremail=email
// FRONTEND CALLS THIS: /api/services/getservices
// ==========================
router.get("/getservices", getServices);

// ==========================
// UPDATE A SERVICE
// ==========================
router.put("/update/:id", updateService);

// ==========================
// DELETE A SERVICE
// ==========================
router.delete("/delete/:id", deleteService);

// ==========================
// RESTORE A DELETED SERVICE
// ==========================
router.put("/restore/:id", restoreService);

// ==========================
// GET SERVICES BY STEP
// FRONTEND CALLS: /api/services/by-step?step_id=xxxx
// ==========================
router.get("/by-step", getServicesByStep);
router.get("/get/byEmail", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ status: false, message: "Email required" });
    }

    const services = await require("../models/services.model").find({
      productcreatoremail: email
    });

    return res.json({
      status: true,
      total: services.length,
      data: services
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
