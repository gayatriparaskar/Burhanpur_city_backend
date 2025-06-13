
const express = require ("express");
const authentication = require("../middleware/authentication");
const checkRole = require("../middleware/authorization")
const { createBussiness,getBussiness , updateBussiness ,deletedBuss , getMyBuss , searchBuss} = require ("../controllers/BussinessController");


const BussinessRouter = express.Router();

BussinessRouter.post("/createBuss", createBussiness);
BussinessRouter.get("/getBuss", getBussiness);
BussinessRouter.put("/updateBuss/:id", updateBussiness);
BussinessRouter.delete("/deleteBuss/:id", deletedBuss);
BussinessRouter.get("/getMyBuss",authentication, getMyBuss);
BussinessRouter.get("/searchBuss", searchBuss);

module.exports = BussinessRouter;
