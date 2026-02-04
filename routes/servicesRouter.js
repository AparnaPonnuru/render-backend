const express = require("express");
const router = express.Router();

const servicesController = require("../controllers/services.controller");

/* ==========================
   CREATE SERVICE
========================== */
router.post("/add", servicesController.addService);

/* ==========================
   GET SERVICES (BY CREATOR EMAIL)
========================== */
router.get("/getservices", servicesController.getServices);

/* ==========================
   ADMIN: GET ALL SERVICES
========================== */
router.get("/admin", servicesController.getAllServicesForAdmin);


/* ==========================
   UPDATE SERVICE
========================== */
router.put("/update/:id", servicesController.updateService);

/* ==========================
   DELETE / RESTORE SERVICE
========================== */
router.delete("/delete/:id", servicesController.deleteService);
router.put("/restore/:id", servicesController.restoreService);

/* ==========================
   UPDATE SERVICE ICON
========================== */
router.put("/icon/:serviceId", servicesController.updateServiceIcon);

/* ==========================
   BULK UPLOAD SERVICES
========================== */
router.post("/bulk", servicesController.bulkUploadServices);

/* ==========================
   GET SERVICES BY STEP
   /api/services/by-step?step_id=xxxx
========================== */
router.get(
  "/by-step",
  (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
  },
  servicesController.getServicesByStep
);

module.exports = router;
