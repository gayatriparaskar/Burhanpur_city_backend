const jwt = require("jsonwebtoken");
const {
  errorResponse,
} = require("../helper/successAndError");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;


const authentication = async (req, res, next) => {
  
  let token = req.header("Authorization");
  token = token && token.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json(errorResponse(401, "Unauthorized - No token provided", null));
  }
  try {

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);


    const userId = decoded.userId;
    req.userId = userId;

    next();
  } catch (error) {

    return res
      .status(401)
      .json(
        errorResponse(
          401,
          "error inside authentication middleware",
          error.message
        )
      );
  }
};

module.exports =  authentication ;
