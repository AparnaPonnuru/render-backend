const jwt = require("jsonwebtoken");
const User = require("../models/users.model");

const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "No user found" });

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};


// const isAdmin = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.userId);
//     //const roles = await Role.find({ _id: { $in: user.roles } });

//     for (let i = 0; i < roles.length; i++) {
//       if (roles[i].name === "admin") {
//         next();
//         return;
//       }
//     }

//     return res.status(403).json({ message: "Require Admin Role!" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: error });
//   }
// };


module.exports = {
  verifyToken,
};
