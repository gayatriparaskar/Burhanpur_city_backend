
const express = require ("express");
const authentication = require("../middleware/authentication");
const checkRole = require("../middleware/authorization")
const { 
  createBussiness,
  getBussiness, 
  updateBussiness,
  deletedBuss, 
  getMyBuss, 
  searchBuss, 
  getBussinessById,
  getBusinessStats,
  getSingleBusinessStats,
  addLeadToBusiness
} = require ("../controllers/BussinessController");


const BussinessRouter = express.Router();

BussinessRouter.post("/registerBuss", createBussiness);
BussinessRouter.get("/getBuss", getBussiness);
BussinessRouter.get("/getBussById/:id", getBussinessById);
BussinessRouter.put("/updateBuss/:id", updateBussiness);
BussinessRouter.delete("/deleteBuss/:id", deletedBuss);
BussinessRouter.get("/getMyBuss",authentication, getMyBuss);
BussinessRouter.get("/searchBuss", searchBuss);
BussinessRouter.get("/analytics", getBusinessStats);
BussinessRouter.get("/analyticsForOne/:id", getSingleBusinessStats);
BussinessRouter.post('/add-lead/:id', addLeadToBusiness);

module.exports = BussinessRouter;
