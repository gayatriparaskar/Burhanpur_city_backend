const User = require('../models/User');
const Business = require('../models/Business');
const { errorResponse } = require('../helper/successAndError');

// Middleware to check if user is blocked
const checkUserStatus = async (req, res, next) => {
  try {
    const userId = req.userId || req.params.userId || req.body.user_id;
    
    if (!userId) {
      return next(); // Skip if no user ID provided
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json(errorResponse(404, 'User not found'));
    }

    if (user.status === 'blocked') {
      return res.status(403).json(errorResponse(403, 'User account is blocked. Please contact support.'));
    }

    if (user.status === 'inactive') {
      return res.status(403).json(errorResponse(403, 'User account is inactive. Please contact support to reactivate.'));
    }

    // Add user status to request for use in other middleware
    req.userStatus = user.status;
    next();
  } catch (error) {
    console.error('Error checking user status:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Middleware to check if business is blocked
const checkBusinessStatus = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.business_id || req.query.business_id;
    
    if (!businessId) {
      return next(); // Skip if no business ID provided
    }

    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json(errorResponse(404, 'Business not found'));
    }

    if (business.status === 'blocked') {
      return res.status(403).json(errorResponse(403, 'Business account is blocked. Please contact support.'));
    }

    if (business.status === 'inactive') {
      return res.status(403).json(errorResponse(403, 'Business account is inactive. Please contact support to reactivate.'));
    }

    // Add business status to request for use in other middleware
    req.businessStatus = business.status;
    next();
  } catch (error) {
    console.error('Error checking business status:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Middleware to check both user and business status
const checkUserAndBusinessStatus = async (req, res, next) => {
  try {
    const userId = req.userId || req.params.userId || req.body.user_id;
    const businessId = req.params.businessId || req.body.business_id || req.query.business_id;

    // Check user status if user ID is provided
    if (userId) {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json(errorResponse(404, 'User not found'));
      }

      if (user.status === 'blocked') {
        return res.status(403).json(errorResponse(403, 'User account is blocked. Please contact support.'));
      }

      if (user.status === 'inactive') {
        return res.status(403).json(errorResponse(403, 'User account is inactive. Please contact support to reactivate.'));
      }

      req.userStatus = user.status;
    }

    // Check business status if business ID is provided
    if (businessId) {
      const business = await Business.findById(businessId);
      
      if (!business) {
        return res.status(404).json(errorResponse(404, 'Business not found'));
      }

      if (business.status === 'blocked') {
        return res.status(403).json(errorResponse(403, 'Business account is blocked. Please contact support.'));
      }

      if (business.status === 'inactive') {
        return res.status(403).json(errorResponse(403, 'Business account is inactive. Please contact support to reactivate.'));
      }

      req.businessStatus = business.status;
    }

    next();
  } catch (error) {
    console.error('Error checking user and business status:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

// Middleware to prevent blocked users from creating bookings
const preventBlockedUserBooking = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.user_id;
    
    if (!userId) {
      return res.status(400).json(errorResponse(400, 'User ID is required'));
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json(errorResponse(404, 'User not found'));
    }

    if (user.status === 'blocked') {
      return res.status(403).json(errorResponse(403, 'Blocked users cannot create bookings. Please contact support.'));
    }

    if (user.status === 'inactive') {
      return res.status(403).json(errorResponse(403, 'Inactive users cannot create bookings. Please contact support to reactivate your account.'));
    }

    next();
  } catch (error) {
    console.error('Error checking user status for booking:', error);
    return res.status(500).json(errorResponse(500, 'Internal server error', error.message));
  }
};

module.exports = {
  checkUserStatus,
  checkBusinessStatus,
  checkUserAndBusinessStatus,
  preventBlockedUserBooking
};

