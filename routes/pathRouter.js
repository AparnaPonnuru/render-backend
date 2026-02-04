var express = require("express");
var router = express.Router();

const pathController = require("../controllers/paths.controller");
const { verifyToken } = require("../middlewares/authJwt");

// ADD NEW PATH
router.post("/add", pathController.addPath);

// GET PATHS (general fetch)
router.get("/get", pathController.getPath);

// GET PATHS (specific criteria)
router.get("/get/specific", pathController.getPathSpecific);

// POST BASED SEARCH
router.post("/get", pathController.getPathNormal);

// DELETE PATH
router.delete("/delete/:id", pathController.deletePath);

// RESTORE PATH (requires token)
router.put("/restore/:id", [verifyToken], pathController.restorePath);

// UPDATE MULTIPLE FIELDS
router.put("/updateFields", pathController.updateFields);

// EDIT PATH
router.patch("/edit", pathController.updatePath);

// GET ACTIVE PATHS
router.get("/active", pathController.getActivePaths);

// UPDATE PATH STATUS
router.put("/updatepath/:id", pathController.updatePathStatus);

// ⭐ VIEW PATH BY MONGO ID (IMPORTANT for frontend View Page)
router.get("/viewpath/:path_id", pathController.getPathById);

// BULK UPLOAD PATHS
router.post("/bulk", pathController.uploadBulkPaths);

module.exports = router;
