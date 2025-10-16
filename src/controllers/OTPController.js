const crypto = require('crypto');
const bcrypt = require('bcrypt');
const OTPModel = require('../models/OTP');
const { errorResponse, successResponse } = require('../helper/successAndError');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure storage
const hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp, saltRounds);
};

// Verify OTP
const verifyOTP = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};

// Send OTP via WhatsApp Business API
const sendWhatsAppOTP = async (phone, otp) => {
  try {
    // WhatsApp Business API configuration
    const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'otp_verification';

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp API credentials not configured');
    }

    // Format phone number (add country code if not present)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const messageData = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: result.messages?.[0]?.id,
      message: 'OTP sent successfully via WhatsApp'
    };
  } catch (error) {
    console.error('WhatsApp OTP sending failed:', error);
    throw new Error(`Failed to send WhatsApp OTP: ${error.message}`);
  }
};

// Generate and send OTP
module.exports.generateAndSendOTP = async (req, res) => {
  try {
    const { phone, purpose = 'business_registration' } = req.body;

    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json(errorResponse(400, "Valid 10-digit phone number is required"));
    }

    // Check for existing unverified OTP for this phone
    const existingOTP = await OTPModel.findOne({
      phone,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOTP) {
      // Check if user has reached max attempts
      if (existingOTP.hasMaxAttempts()) {
        return res.status(429).json(errorResponse(429, "Maximum OTP attempts reached. Please try again after 5 minutes."));
      }

      // Check if OTP was sent recently (within 1 minute)
      const timeSinceLastOTP = Date.now() - existingOTP.createdAt.getTime();
      if (timeSinceLastOTP < 60000) { // 1 minute
        return res.status(429).json(errorResponse(429, "Please wait before requesting another OTP"));
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    // Delete any existing OTP for this phone and purpose
    await OTPModel.deleteMany({ phone, purpose });

    // Create new OTP record
    const otpRecord = new OTPModel({
      phone,
      otp,
      hashedOtp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await otpRecord.save();

    // Send OTP via WhatsApp
    try {
      const sendResult = await sendWhatsAppOTP(phone, otp);
      
      res.status(200).json(successResponse(200, "OTP sent successfully", {
        phone,
        purpose,
        expiresAt: otpRecord.expiresAt,
        messageId: sendResult.messageId
      }));
    } catch (whatsappError) {
      // If WhatsApp fails, still save OTP but return error
      console.error('WhatsApp sending failed:', whatsappError);
      
      res.status(500).json(errorResponse(500, "Failed to send OTP via WhatsApp", {
        phone,
        purpose,
        expiresAt: otpRecord.expiresAt,
        error: whatsappError.message
      }));
    }
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json(errorResponse(500, "Failed to generate OTP", error.message));
  }
};

// Verify OTP
module.exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, purpose = 'business_registration' } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json(errorResponse(400, "Phone number and OTP are required"));
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json(errorResponse(400, "Valid 10-digit phone number is required"));
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json(errorResponse(400, "Valid 6-digit OTP is required"));
    }

    // Find OTP record
    const otpRecord = await OTPModel.findOne({
      phone,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(404).json(errorResponse(404, "OTP not found or expired"));
    }

    // Check if max attempts reached
    if (otpRecord.hasMaxAttempts()) {
      return res.status(429).json(errorResponse(429, "Maximum OTP attempts reached"));
    }

    // Verify OTP
    const isOtpValid = await verifyOTP(otp, otpRecord.hashedOtp);

    if (!isOtpValid) {
      // Increment attempts
      await otpRecord.incrementAttempts();
      
      const remainingAttempts = 3 - otpRecord.attempts;
      return res.status(400).json(errorResponse(400, `Invalid OTP. ${remainingAttempts} attempts remaining`));
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    res.status(200).json(successResponse(200, "OTP verified successfully", {
      phone,
      purpose,
      verifiedAt: otpRecord.verifiedAt
    }));
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json(errorResponse(500, "Failed to verify OTP", error.message));
  }
};

// Resend OTP
module.exports.resendOTP = async (req, res) => {
  try {
    const { phone, purpose = 'business_registration' } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json(errorResponse(400, "Valid 10-digit phone number is required"));
    }

    // Check for existing OTP
    const existingOTP = await OTPModel.findOne({
      phone,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!existingOTP) {
      return res.status(404).json(errorResponse(404, "No active OTP found for this phone number"));
    }

    // Check if max attempts reached
    if (existingOTP.hasMaxAttempts()) {
      return res.status(429).json(errorResponse(429, "Maximum OTP attempts reached. Please try again after 5 minutes."));
    }

    // Check if OTP was sent recently (within 1 minute)
    const timeSinceLastOTP = Date.now() - existingOTP.createdAt.getTime();
    if (timeSinceLastOTP < 60000) { // 1 minute
      return res.status(429).json(errorResponse(429, "Please wait before requesting another OTP"));
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const hashedOtp = await hashOTP(newOtp);

    // Update existing record
    existingOTP.otp = newOtp;
    existingOTP.hashedOtp = hashedOtp;
    existingOTP.attempts = 0; // Reset attempts
    existingOTP.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    existingOTP.createdAt = new Date();

    await existingOTP.save();

    // Send new OTP via WhatsApp
    try {
      const sendResult = await sendWhatsAppOTP(phone, newOtp);
      
      res.status(200).json(successResponse(200, "OTP resent successfully", {
        phone,
        purpose,
        expiresAt: existingOTP.expiresAt,
        messageId: sendResult.messageId
      }));
    } catch (whatsappError) {
      console.error('WhatsApp resend failed:', whatsappError);
      
      res.status(500).json(errorResponse(500, "Failed to resend OTP via WhatsApp", {
        phone,
        purpose,
        expiresAt: existingOTP.expiresAt,
        error: whatsappError.message
      }));
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json(errorResponse(500, "Failed to resend OTP", error.message));
  }
};

// Check OTP status
module.exports.checkOTPStatus = async (req, res) => {
  try {
    const { phone, purpose = 'business_registration' } = req.query;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json(errorResponse(400, "Valid 10-digit phone number is required"));
    }

    const otpRecord = await OTPModel.findOne({
      phone,
      purpose,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(404).json(errorResponse(404, "No active OTP found"));
    }

    res.status(200).json(successResponse(200, "OTP status retrieved", {
      phone,
      purpose,
      attempts: otpRecord.attempts,
      remainingAttempts: 3 - otpRecord.attempts,
      expiresAt: otpRecord.expiresAt,
      isExpired: otpRecord.isExpired(),
      canResend: Date.now() - otpRecord.createdAt.getTime() > 60000 // 1 minute
    }));
  } catch (error) {
    console.error('Check OTP status error:', error);
    res.status(500).json(errorResponse(500, "Failed to check OTP status", error.message));
  }
};
