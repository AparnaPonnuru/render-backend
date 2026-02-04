const router = require("express").Router();
const {
  login,
  signUp,
  forgotPassword,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOTP,
  updatePassword,
  getAllPartners,
  updatePartnerProfile,
  getPartnerByEmail,
  getPartnerProfilePic,
  verifyOtp,

} = require("../controllers/partners.controller");



router.post("/signup", signUp);
router.get("/logout", logout);
router.post("/verifyotp", verifyOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/updatepassword", updatePassword);
router.post("/resetPassword/:token", resetPassword);
router.post("/confirmation", sendConfirmationEmail);
router.post("/login", login);
router.get("/getpartners", getAllPartners);
router.put('/add', updatePartnerProfile);
router.get('/get', getPartnerByEmail);
router.get('/get-profile-pic', getPartnerProfilePic);
module.exports = router;
