const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');

// Save push notification subscription
router.post('/save-subscription', async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({
        success: false,
        message: 'User ID and subscription are required'
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription saved successfully',
      user
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving subscription',
      error: error.message
    });
  }
});

module.exports = router;
