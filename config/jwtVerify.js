const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

exports.tokenCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      !authHeader.split(" ")[1]
    ) {
      return res.status(401).json({
        success: false,
        errorMessage: "Please provide a bearer token",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          code: "401",
          success: false,
          message: "Unauthorized",
        });
      }

      console.log(decoded);

      // Role-based user assignment
      if (decoded.role === "admin") {
        req.adminData = decoded.id;
        req.role = decoded.role;
      } else if (decoded.role === "user") {
        req.userData = decoded.id;
        req.role = decoded.role;
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Role not allowed",
        });
      }

      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
