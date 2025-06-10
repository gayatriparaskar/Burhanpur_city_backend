const express = require ("express");
const authenticat = require("../middleware/authentication");
const {checkRole} = require("../middleware/authorization");
const { createBussiness,getBussiness , updateBussiness ,deletedBuss} = require ("../controllers/BussinessController");

const BussinessRouter = express.Router();

BussinessRouter.post("/createBuss",authenticat,createBussiness);
BussinessRouter.get("/getBuss",getBussiness);
BussinessRouter.put("/updateBuss/:id",updateBussiness);
BussinessRouter.delete("/deleteBuss/:id",deletedBuss);

module.exports = BussinessRouter ; 