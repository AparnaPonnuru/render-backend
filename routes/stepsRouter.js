var express = require("express");
var router = express.Router();

const stepsController = require("../controllers/steps.controller");
const { verifyToken } = require("../middlewares/authJwt");

router.post("/add", stepsController.addStep);
router.get("/get", stepsController.getSteps);
router.put("/update/:id", stepsController.updateStep);
router.delete("/delete/:id", stepsController.deleteStep);
router.put("/restore/:id", [verifyToken], stepsController.restoreStep);
// ⭐ BULK UPLOAD (KEEP BEFORE dynamic routes)
router.post("/bulk", stepsController.bulkUploadSteps);
console.log("bulkUploadSteps =>", stepsController.bulkUploadSteps);
 



// ⭐ ADD THIS — MUST BE ABOVE /:id ⭐
router.get("/partner", stepsController.getStepsByPartner);



router.get("/:id", stepsController.getStepById);

router.patch("/editstep", stepsController.editStep);
router.post("/attachservice", stepsController.addServicesToStep);
router.get("/getall/:step_id", stepsController.getServicesForStep);
router.delete("/remove/:stepId/:serviceId", stepsController.removeServiceFromStep);

module.exports = router;
