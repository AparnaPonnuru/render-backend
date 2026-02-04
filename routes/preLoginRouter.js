var express = require("express");
var router = express.Router();

const preLoginController = require("../controllers/preLogin.controller")
const { verifyToken } = require("../middlewares/authJwt");

router.post("/store",  [verifyToken], preLoginController.storePreLogin);
router.get("/get_path", preLoginController.getPreLoginPath);
router.get("/get_coordinates", preLoginController.getCoordinates);


module.exports = router;