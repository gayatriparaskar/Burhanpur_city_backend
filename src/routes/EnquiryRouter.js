const express = require('express');
const authentication = require('../middleware/authentication');
const {
  submitEnquiry,
  getBusinessEnquiries,
  respondToEnquiry,
  getUserEnquiries,
  getEnquiryDetails
} = require('../controllers/EnquiryController');

const enquiryRouter = express.Router();

// Submit new enquiry
enquiryRouter.post('/submit', authentication, submitEnquiry);

// Get enquiries for business owners (enquiries targeting their category/subcategory)
enquiryRouter.get('/business', authentication, getBusinessEnquiries);

// Respond to an enquiry
enquiryRouter.post('/:enquiryId/respond', authentication, respondToEnquiry);

// Get user's submitted enquiries
enquiryRouter.get('/user', authentication, getUserEnquiries);

// Get enquiry details
enquiryRouter.get('/:enquiryId', authentication, getEnquiryDetails);

module.exports = enquiryRouter;
