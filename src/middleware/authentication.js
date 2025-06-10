const jwt = require("jsonwebtoken");
const {
  errorResponse,
} = require("../helper/successAndError");

const  JWT_SECRET = process.env.JWT_SECRET;


const authentication = async (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  const token = tokenHeader?.replace(/^Bearer\s+/, "");

  if (!token) {
    return res
      .status(401)
      .json(errorResponse(401, "Unauthorized - No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);  // 🔍 Log to inspect structure

    const userId = decoded.userId || decoded.id || decoded._id || decoded.sub;
    if (!userId) {
      return res
        .status(400)
        .json(errorResponse(400, "Token payload missing user ID"));
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.log("secret key ",process.env.JWT_SECRET);
    
    return res
      .status(401)
      .json(errorResponse(401, "Invalid or expired token", error.message));
  }
};

module.exports = authentication ;
