const router = require("express").Router();
const stepController = require("../controllers/steps.controller");

// GET ALL STEPS
router.get("/get", stepController.getSteps);

// SERVICES
router.post("/services/add", stepController.addServicesToStep);
router.delete("/services/:stepId/:serviceId", stepController.removeServiceFromStep);
router.get("/services/:step_id", stepController.getServicesOfStep);
router.get("/services/remove/:step_id", stepController.getAllServicesForRemove);

// CRUD
router.post("/add", stepController.addStep);
router.put("/update/:id", stepController.updateStep);
router.delete("/delete/:id", stepController.deleteStep);
router.put("/restore/:id", stepController.restoreStep);

module.exports = router;
