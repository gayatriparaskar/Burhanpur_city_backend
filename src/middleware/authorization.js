const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      return next();
    } else {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Unauthorized - You are not allowed to access this route. need admin access connect to Backend Developer"
      });
    }
  };
};

module.exports = { checkRole };
