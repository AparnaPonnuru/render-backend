const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/steps.controller");
const { verifyToken, verifyAdmin } = require("../../middlewares/authJwt");


// 🔥 protect ALL admin routes
router.use(verifyToken, verifyAdmin);


// -------- STATIC ROUTES FIRST --------
router.post("/bulk", controller.bulkUploadSteps);
router.post("/", controller.addStep);
router.get("/", controller.getSteps);


// -------- DYNAMIC ROUTES LAST --------
router.get("/:id", controller.getStepById);
router.put("/:id", controller.updateStep);
router.delete("/:id", controller.deleteStep);


module.exports = router;
