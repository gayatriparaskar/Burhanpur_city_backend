const express = require ("express");
const authorization = require ("../middleware/authentication");

const { createUser , getAllUser , updateUer , deleteUser , adminLogin , getOneUser } = require ("../controllers/UserController");

const userRouter = express.Router();

userRouter.post("/createUser",createUser);
userRouter.get("/userDetails",getAllUser);
userRouter.put("/updatedUser/:id",updateUer);
userRouter.delete("/deleteUser/:id",deleteUser);
userRouter.post("/adminLogin",adminLogin);
userRouter.get("/getUser",getOneUser); 


module.exports = userRouter ; 