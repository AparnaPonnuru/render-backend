const mongoose = require("mongoose");
const Partner = require("../models/partner.model");
require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


const { generateOTP, sendOTP, sendNotificationMail } = require("../middlewares/verifySignUp");


const signUp = async (req, res) => {
  try {
    const { email, username, password, partnerType } = req.body;

    // Validate required fields
    if (!email || !username || !password || !partnerType) {
      return res.status(400).json({
        success: false,
        message: "Email, username, password and partnerType are required",
      });
    }

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    const OTP = generateOTP();
    const currentTime = new Date();

    // Create partner with partnerType
    const temporalPartner = new Partner({
      username,
      email,
      password, // hashed automatically in pre-save
      partnerType, // ✅ SUPER IMPORTANT!!
      OTP,
      isBlocked: false,
      OTPAttempts: 0,
      OTPverified: false,
      OTPCreatedTime: currentTime,
      status: false,
    });

    await temporalPartner.save();

    console.log("✅ Partner saved successfully. OTP:", OTP);

    sendNotificationMail(
      email,
      "Naavi Registration Confirmation OTP",
      `Dear Partner,<br>Your OTP: ${OTP}<br>`
    );

    const token = jwt.sign(
      { id: temporalPartner._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      token,
      partner: {
        id: temporalPartner._id,
        username: temporalPartner.username,
        email: temporalPartner.email,
        partnerType: temporalPartner.partnerType,
      },
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};





// const checkDuplicatedEmail = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     console.log("Email check hit:", req.body);
//     if (user)
//       if(user.userType == req.body.role)
//         return res.status(400).json({ message: "The email already exists" });


//     next();
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Something went wrong , signup fail" });
//   }
//};


// const checkDuplicatedUsername = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user)
//       return res.status(400).json({ message: "The username already exists" });


//       return res.status(200).json({
//         success: true,
//         message: "The username valid",
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Something went wrong , signup fail" });
//   }
// };


const forgotPassword = async (req, res) => {
    var partnerFound


    if (typeof (req.body.email) !== "undefined")
        partnerFound = await Partner.findOne({ email: req.body.email });


    if (!partnerFound) return res.status(400).json({ message: "User Not Found" });


    const OTP = generateOTP();
    console.log(OTP);
    const currentTime = new Date();
    partnerFound.OTP = OTP;
    partnerFound.OTPCreatedTime = currentTime;



    await partnerFound.save();
    sendNotificationMail(req.body.email, "Naavi forgot password OTP", "Dear Partner,<br>Your OTP:" + OTP + " <br>");
    //sendOTP(req.body.email, OTP);
    console.log(partnerFound._id);
    const oneDayInSeconds = 86400;


    const token = jwt.sign({ id: partnerFound._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: oneDayInSeconds,
    });


    return res.status(200).json({
        success: true,
        token: token,
        message: "OTP sent to your emailId",
    });


};
const sendConfirmationEmail = async (req, res) => {
    try {
        const partnerFound = await TemporalPartner.findOne({ email: req.body.email });


        const token = partnerFound.emailToken;


        const url = `${process.env.HOST || "localhost:7000"
            }/api/auth/verification/${token}`;


        await sendConfirmationEmailFunction(url, partnerFound.email);


        return res.status(200).json({
            success: true,
            message: "Account confirmation email has been send successfully",
        });
    } catch (error) {
        console.log(error);


        return res.status(500).json({ message: "something went wrong" });
    }
};




const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Both email and password are required",
            });
        }


        // Find user by email
        const partner = await Partner.findOne({ email });


        if (!partner) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }


        // Compare the entered password with the stored hashed password
        const isMatch = await partner.matchPassword(password);


        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }


        // Generate a JWT token
        const token = jwt.sign({ id: partner._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });


        // Send the response with user data and token
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            partner: {
                id: partner._id,
                username: partner.username,
                email: partner.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


const logout = async (req, res) => {
    try {
        res.clearCookie("delivery-app-session-token");
        return res
            .status(200)
            .json({ successful: true, message: "partner has logout successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
};


const sendResetPasswordEmail = async (req, res) => {
    try {
        const partnerFound = await Partner.findOne({ email: req.body.email });


        if (!partnerFound)
            return res.status(422).json({
                success: false,
                message: "Doesn't exits account link with that email",
            });


        const id = partnerFound._id;


        const token = jwt.sign(
            {
                id,
                expiration: Date.now() + 10 * 60 * 1000,
            },
            process.env.JWT_SECRET_KEY
        );


        const url = `${process.env.HOST || "localhost:3000"
            }/#/authentication/resetPassword/${token}`;


        await sendResetPasswordEmailFunction(url, req.body.email);


        return res.status(200).json({
            success: true,
            message: "Reset password email has been send successfully",
        });
    } catch (err) {
        console.log(err);


        return res.status(500).json({
            success: false,
            message: "Something went wrong, fail to to send reset password email",
        });
    }
};


const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords don't match" });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({ success: false, message: "Password minimum length is 5" });
    }

    const token = req.params.token;
    if (!token)
      return res.status(403).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_RESET_FORGOTTEN_PASSWORD_KEY);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    if (Date.now() > decoded.expiration) {
      return res.status(422).json({
        success: false,
        message: "Time to reset password exceeded",
      });
    }

    const partnerFound = await Partner.findById(decoded.id);
    if (!partnerFound) return res.status(404).json({ message: "User not found" });

    // ✅ Assign directly — pre("save") will hash
    partnerFound.password = newPassword;
    await partnerFound.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, fail to update password",
    });
  }
};



const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const partner = await Partner.findOne({ email });


        if (!partner) {
            return res.status(400).json({ success: false, message: "Partner not found" });
        }

       // 🔍 ADD DEBUG LOGS HERE
        console.log("=================================");
        console.log("Stored OTP:", partner.OTP);
        console.log("Stored OTP Created Time:", partner.OTPCreatedTime);
        console.log("User entered OTP:", otp);
        console.log("Now:", new Date());
        console.log("Time difference (ms):", Date.now() - partner.OTPCreatedTime);
        console.log("=================================");
        // Check if OTP is expired const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

        if (partner.isOTPExpired()) {
            return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
        }


        // Compare OTPs safely
        if (
            !partner.OTP ||
            partner.OTP.toString().trim().toLowerCase() !== otp.toString().trim().toLowerCase()
        ) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
        }



        partner.status = true;
        partner.OTPverified = true;
        partner.OTP = null; // clear OTP
        await partner.save();


        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during OTP verification",
        });
    }
};






const updatePassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP code, and new password are required",
      });
    }

    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    // ✅ Validate OTP
    if (String(partner.OTP) !== String(code)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ Assign plain password (auto-hashed by pre-save)
    partner.password = newPassword;
    partner.OTP = null;
    await partner.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, failed to update password",
    });
  }
};




const getAllPartners = async (req, res) => {
    try {
        const partners = await Partner.find({}, { password: 0 }); // Exclude password for security


        return res.status(200).json({
            success: true,
            message: "Partners retrieved successfully",
            partners,
        });
    } catch (error) {
        console.error("Error fetching partners:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};



const updatePartnerProfile = async (req, res) => {
    try {
        const { email } = req.body; // Identify the partner by email


        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }


        // Find the partner by email
        let partner = await Partner.findOne({ email });


        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }


        // Update profile details
        const updatedFields = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            businessName: req.body.businessName,
            logo: req.body.logo,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country,
            description: req.body.description,
            website: req.body.website,
            type: req.body.type,
            yourPosition: req.body.yourPosition
        };


        // Remove undefined values (only update provided fields)
        Object.keys(updatedFields).forEach(
            (key) => updatedFields[key] === undefined && delete updatedFields[key]
        );


        // Update the partner's profile
        await Partner.updateOne({ email }, { $set: updatedFields });


        res.status(200).json({ success: true, message: "Profile updated successfully!" });


    } catch (error) {
        console.error("Error updating partner profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const getPartnerByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Email received:", email);


        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }


        const partner = await Partner.findOne({ email });
        console.log("Partner found:", partner);


        if (!partner) {
            return res.status(200).json({ success: false, message: "No profile found" });
        }


        const requiredFields = [
            "firstName", "lastName", "businessName", "logo", "street",
            "city", "state", "pincode", "country", "description",
            "website", "type", "yourPosition"
        ];


       const missingFields = requiredFields.filter(field => !partner[field]);
console.log("Missing fields:", missingFields);

if (missingFields.length > 0) {
  return res.status(200).json({
    success: true,                        // ✔ profile exists
    profileIncomplete: true,              // ✔ new flag
    missingFields,
    data: partner
  });
}

return res.status(200).json({
  success: true,
  profileIncomplete: false,
  data: partner
});



    } catch (error) {
        console.error("Error fetching partner:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const getPartnerProfilePic = async (req, res) => {
    const { email } = req.query;


    if (!email) {
        return res.status(400).json({ status: false, message: "Email is required" });
    }


    try {
        const partner = await Partner.findOne({ email });


        if (!partner || !partner.logo) {
            return res.status(404).json({ status: false, message: "Partner logo not found" });
        }


        res.json({ status: true, profilePic: partner.logo });
    } catch (error) {
        console.error("Error fetching partner logo:", error);
        res.status(500).json({ status: false, message: "Server Error" });
    }
};



module.exports = {
    signUp,
    forgotPassword,
    login,
    sendConfirmationEmail,
    sendResetPasswordEmail,
    resetPassword,
    logout,
    verifyOtp, 
    updatePassword,
    getAllPartners,
    updatePartnerProfile,
    getPartnerByEmail,
    getPartnerProfilePic,
};