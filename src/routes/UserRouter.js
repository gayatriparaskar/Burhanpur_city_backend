
const express = require ("express");
const authentication = require ("../middleware/authentication");
const checkRole = require("../middleware/authorization");
const { 
  createUser, 
  getAllUser, 
  updateUer, 
  deleteUser, 
  login, 
  getOneUser, 
  searchUser, 
  getUsersByRole,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require ("../controllers/UserController");

const userRouter = express.Router();

userRouter.post("/createUser",createUser);
userRouter.get("/userDetails",getAllUser);
userRouter.put("/updatedUser/:id",updateUer);
userRouter.delete("/deleteUser/:id",deleteUser);
userRouter.post("/login",login);
userRouter.get("/me",authentication,getOneUser);

// Search routes
userRouter.get("/search", authentication, searchUser);
userRouter.get("/role/:role", authentication, getUsersByRole); 

// Password management routes
userRouter.put("/change-password", authentication, changePassword);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/verify-reset-token", verifyResetToken);

module.exports = userRouter ;

