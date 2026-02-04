const router = require("express").Router();
const {
  login,
  

} = require("../controllers/adminControllers");




router.post("/login", login);
module.exports = router;
