const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken");
const crypto = require("crypto");
const {
    errorResponse,
    successResponse,
  } = require("../helper/successAndError");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

const UserModel = require("../models/User");
const { uploadUserImage, handleUploadError, deleteOldImage, getRelativePath } = require("../middleware/upload");

module.exports.createUser = async (req, res) => {
  try {
    const data = req.body;

    // Handle profile image upload
    if (req.file) {
      data.profileImage = getRelativePath(req.file.path);
    }

    // Validate phone number
    if (!/^\d{10}$/.test(data.phone)) {
      return res.status(404).json(errorResponse(404, "Invalid phone number. Must be 10 digits only."));
    }

    // Check if user already exists by phone or email
    const existingUser = await UserModel.findOne({
      $or: [{ phone: data.phone }, { email: data.email }],
    });

    if (existingUser) {
      return res.status(404).json(errorResponse(404, "User already registered", existingUser));
    }

    // Hash password
    const bcryptPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    delete data.password;

    // Create and save user
    const newUser = new UserModel({ ...data, password: bcryptPassword });
    await newUser.save();

    console.log(newUser);

    res.status(200).json(successResponse(200, "User is created successfully", newUser));
  } catch (error) {
    console.log(error);
    res.status(500).json(errorResponse(500, "User is not created",error));
  }
};


module.exports.getAllUser = async (req,res)=>{
    try {
        const data = req.body;
        const userDetails = await UserModel.find();
        console.log("data",data);
        
        res.status(200).json(successResponse(200,"User Details is fetched",userDetails));
    } catch (error) {
        res.status(500).json(errorResponse(500,"Details is not found",error.message));
    }
};

module.exports.updateUer = async (req,res)=>{
    try {
        const query = req.body;
        const id = req.params.id;

        // Handle profile image upload
        if (req.file) {
            // Get the current user to check for existing profile image
            const currentUser = await UserModel.findById(id);
            if (currentUser && currentUser.profileImage) {
                // Delete old profile image file
                deleteOldImage(currentUser.profileImage);
            }
            query.profileImage = getRelativePath(req.file.path);
        }
        
        // Check if status is being updated and validate it
        if (query.status && !['active', 'inactive', 'blocked'].includes(query.status)) {
            return res.status(400).json(errorResponse(400, 'Invalid status. Must be active, inactive, or blocked'));
        }
        
        const updatedUser = await UserModel.findByIdAndUpdate(id, query, {
            new: true,
            runValidators: true
        });
        
        if (!updatedUser) {
            return res.status(404).json(errorResponse(404, 'User not found'));
        }
        
        res.status(200).json(successResponse(200, "User is updated successfully", updatedUser));
    } catch (error) {
        res.status(500).json(errorResponse(500, "User is not Updated", error));
    }
};

module.exports.deleteUser = async (req,res)=>{
    try {
        const id = req.params.id;
        const deletedUser = await UserModel.findByIdAndDelete(id);
        res.status(200).json(successResponse(200,"User is deleted successfully",deletedUser));
    } catch (error) {
        res.status(500).json(errorResponse(500,"User is not deleted",error));
    }
};

module.exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(401).json(errorResponse(401, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(errorResponse(401, "Invalid credentials"));
    }

     // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
    return res
      .status(200)
      .json(successResponse(200, "Login successful", { token , user:userWithoutPassword}));
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json(errorResponse(500, "Server Error"));
  }
};


module.exports.getOneUser = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Request userId:", userId);

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json(errorResponse(400, "Malformed user ID in token"));
    }

    const user = await UserModel.findById(userId)
      .select("name address role email phone id");
       console.log("Fetched user:", user); // 👈 ADD THIS
    if (!user) {
      return res
        .status(404)
        .json(errorResponse(404, "User not found not registered"));
    }

    return res
      .status(200)
      .json(successResponse(200, "Get One User Detail", user));
  } catch (err) {
    console.error("getOneUser error:", err);
    return res
      .status(500)
      .json(errorResponse(500, "Server Error"));
  }
};

module.exports.searchUser = async (req,res)=>{
  const { name, phone, isActive } = req.query;

 const filter = {};

 if (name && phone) {
   // If both name and phone are provided, search in both fields
   filter.$or = [
     { name: { $regex: name, $options: 'i' } },
     { phone: { $regex: phone, $options: 'i' } }
   ];
 } else if (name) {
   // If only name is provided, search only in name field
   filter.name = { $regex: name, $options: 'i' };
 } else if (phone) {
   // If only phone is provided, search only in phone field
   filter.phone = { $regex: phone, $options: 'i' };
 }

 if (isActive !== undefined) {
   filter.isActive = isActive === 'true';
 }

 console.log('Search parameters:', { name, phone, isActive });
 console.log('Filter applied:', JSON.stringify(filter));

 try {
   const users = await UserModel.find(filter).select('-password');

   // ✅ Yeh check karega agar empty hai
   if (users.length === 0) {
     return res.status(200).json({
       success: true,
       message: 'No users found matching the search criteria',
       data: []
     });
   }

   // ✅ Agar mil gaya to
   return res.status(200).json({
     success: true,
     message: 'Users found',
     data: users
   });

 } catch (error) {
   return res.status(500).json({
     success: false,
     message: 'Server Error',
     error: error.message || error
   });
 }
}

module.exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate role
    const validRoles = ['user', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json(
        errorResponse(400, "Invalid role. Must be one of: user, admin, owner")
      );
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users by role
    const users = await UserModel.find({ role })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalUsers = await UserModel.countDocuments({ role });
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    const responseData = {
      users,
      role,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    };

    res.status(200).json(
      successResponse(200, `Users with role '${role}' fetched successfully`, responseData)
    );
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json(
      errorResponse(500, "Failed to fetch users by role", error.message)
    );
  }
};

// Change password (for authenticated users)
module.exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId; // From authentication middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json(errorResponse(400, "Current password and new password are required"));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(errorResponse(400, "New password must be at least 6 characters long"));
    }

    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse(404, "User not found"));
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(errorResponse(400, "Current password is incorrect"));
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json(successResponse(200, "Password changed successfully"));
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json(errorResponse(500, "Failed to change password", error.message));
  }
};

// Forgot password (send reset token)
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(errorResponse(400, "Email is required"));
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json(errorResponse(404, "User not found with this email"));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // In a real application, you would send this token via email
    // For now, we'll return it in the response (remove this in production)
    res.status(200).json(successResponse(200, "Password reset token generated", {
      resetToken: resetToken, // Remove this in production
      expiresAt: resetTokenExpires,
      message: "Password reset token has been generated. Please check your email for reset instructions."
    }));
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json(errorResponse(500, "Failed to process forgot password request", error.message));
  }
};

// Reset password (using reset token)
module.exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json(errorResponse(400, "Reset token and new password are required"));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(errorResponse(400, "New password must be at least 6 characters long"));
    }

    // Find user with valid reset token
    const user = await UserModel.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(errorResponse(400, "Invalid or expired reset token"));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json(successResponse(200, "Password reset successfully"));
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json(errorResponse(500, "Failed to reset password", error.message));
  }
};

// Verify reset token
module.exports.verifyResetToken = async (req, res) => {
  try {
    const { resetToken } = req.body;

    if (!resetToken) {
      return res.status(400).json(errorResponse(400, "Reset token is required"));
    }

    // Find user with valid reset token
    const user = await UserModel.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(errorResponse(400, "Invalid or expired reset token"));
    }

    res.status(200).json(successResponse(200, "Reset token is valid", {
      email: user.email,
      expiresAt: user.resetPasswordExpires
    }));
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json(errorResponse(500, "Failed to verify reset token", error.message));
  }
};

// Upload user profile image
module.exports.uploadUserProfileImage = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json(errorResponse(400, "No image file provided"));
    }

    // Get the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse(404, "User not found"));
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      deleteOldImage(user.profileImage);
    }

    // Update user with new profile image
    user.profileImage = getRelativePath(req.file.path);
    await user.save();

    res.status(200).json(successResponse(200, "Profile image uploaded successfully", {
      userId: user._id,
      profileImage: user.profileImage
    }));
  } catch (error) {
    res.status(500).json(errorResponse(500, "Failed to upload profile image", error.message));
  }
};
