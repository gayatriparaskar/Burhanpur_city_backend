
const express = require ("express");
const authentication = require("../middleware/authentication");
const {checkRole} = require("../middleware/authorization");
const { uploadBusinessImage, handleUploadError, ensureFormDataParsed } = require("../middleware/upload");
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
  addLeadToBusiness,
  getAllLeads,
  getAllLeadsAdmin,
  updateLeadMessage,
  approveBusiness,
  rejectBusiness,
  getPendingBusinesses,
  getBusinessApprovalHistory,
  getAllBussiness,
  adminUpdateBusiness,
  uploadBusinessImage: uploadBusinessImageController,
  debugFormData
} = require ("../controllers/BussinessController");


const BussinessRouter = express.Router();

BussinessRouter.post("/registerBuss", ensureFormDataParsed, uploadBusinessImage, handleUploadError, createBussiness);
BussinessRouter.get("/getBuss", getBussiness);
BussinessRouter.get("/getBussById/:id", getBussinessById);
BussinessRouter.put("/updateBuss/:id", authentication, uploadBusinessImage, handleUploadError, updateBussiness);
BussinessRouter.delete("/deleteBuss/:id", deletedBuss);
BussinessRouter.get("/getMyBuss",authentication, getMyBuss);
BussinessRouter.get("/searchBuss", searchBuss);
BussinessRouter.get("/analytics", getBusinessStats);
BussinessRouter.get("/analyticsForOne/:id", getSingleBusinessStats);
BussinessRouter.post('/add-lead/:id', addLeadToBusiness);
BussinessRouter.get('/leads/:id', authentication, getAllLeads);
BussinessRouter.put('/leads/:businessId/:leadId/message', authentication, updateLeadMessage);
BussinessRouter.post('/upload-image/:id', authentication, uploadBusinessImage, handleUploadError, uploadBusinessImageController);

// Debug endpoint
BussinessRouter.post('/debug', ensureFormDataParsed, uploadBusinessImage, handleUploadError, debugFormData);

// Admin routes for business approval
BussinessRouter.get("/admin/pending", authentication, checkRole('admin'), getPendingBusinesses);
BussinessRouter.get("/admin/history", authentication, checkRole('admin'), getBusinessApprovalHistory);
BussinessRouter.get("/admin/all", authentication, checkRole('admin'), getAllBussiness);
BussinessRouter.get("/admin/leads", authentication, checkRole('admin'), getAllLeadsAdmin);
BussinessRouter.put("/admin/approve/:id", authentication, checkRole('admin'), approveBusiness);
BussinessRouter.put("/admin/reject/:id", authentication, checkRole('admin'), rejectBusiness);
BussinessRouter.put("/admin/update/:id", authentication, checkRole('admin'), uploadBusinessImage, handleUploadError, adminUpdateBusiness);

module.exports = BussinessRouter;
