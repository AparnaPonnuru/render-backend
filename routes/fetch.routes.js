// const express = require("express");
// const router = express.Router();
// const User = require("../models/User"); // make sure User is imported

// router.post("/selectpath", async (req, res) => {
//   try {
//     const { email, universityId } = req.body;

//     console.log("BODY RECEIVED:", req.body);

//     if (!email || !programId) {
//       return res.status(400).json({
//         success: false,
//         message: "email and programId are required",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.selectedProgram = programId;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       pathId: programId,
//     });

//   } catch (error) {
//     console.error("Error in /selectpath →", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// });


// module.exports = router;
