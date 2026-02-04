const express = require("express");
const router = express.Router();

const usersController = require("../controllers/user_controller");
const userController = require("../controllers/user.controller"); // << NEW LINE
const { getAllUsers, getUserProfilePic } = require("../controllers/authControllers");

// User profile CRUD
router.post("/add", usersController.addUserProfile);
router.get("/get/:email", usersController.getUserProfile);
router.put("/update/:profileDataId", usersController.updateLevelTwoProfile);
router.put("/addPersonality", usersController.addPersonality);

// Username check endpoint for profile registration
router.get('/check-username', userController.checkUsername); // << NEW ROUTE

// Utility routes
router.get("/", getAllUsers);
router.get("/profile-pic", getUserProfilePic);

module.exports = router;
