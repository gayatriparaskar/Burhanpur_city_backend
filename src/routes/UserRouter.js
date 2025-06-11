
const express = require ("express");
const authentication = require ("../middleware/authentication");
const checkRole = require("../middleware/authorization");
const { createUser , getAllUser , updateUer , deleteUser , login , getOneUser } = require ("../controllers/UserController");

const userRouter = express.Router();

userRouter.post("/createUser",createUser);
userRouter.get("/userDetails",getAllUser);
userRouter.put("/updatedUser/:id",updateUer);
userRouter.delete("/deleteUser/:id",deleteUser);
userRouter.post("/login",login);
userRouter.get("/me",authentication,getOneUser); 

module.exports = userRouter ;

