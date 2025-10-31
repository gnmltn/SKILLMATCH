import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import StudentActivityLogger from "../utils/studentActivityLogger.js";

const router = express.Router();

const handleError = (res, error, customMessage = "Server error") => {
  console.error(customMessage, error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: Object.values(error.errors).map(err => err.message) 
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  return res.status(500).json({ message: customMessage });
};

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const responseData = {
      success: true,
      user: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        course: user.course || null,
        yearLevel: user.yearLevel || null,
        profilePicture: user.profilePicture || null,
      },
      skills: user.skills || [],
      projectHistory: user.projectHistory || [],
      recommendations: user.recommendations || [],
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return handleError(res, error, "Error fetching profile:");
  }
});

router.get("/test-debug", protect, async (req, res) => {
  console.log("✅ Profile routes are working!");
  res.json({ 
    success: true, 
    message: "Profile routes are working",
    user: req.user._id 
  });
});

router.patch("/user", protect, async (req, res) => {
  try {
    const { firstName, lastName, email, course, yearLevel, profilePicture } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.user._id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Track which fields are being updated
    const updatedFields = [];
    if (firstName.trim() !== user.firstName) updatedFields.push('firstName');
    if (lastName.trim() !== user.lastName) updatedFields.push('lastName');
    if (email.toLowerCase() !== user.email) updatedFields.push('email');
    if (course?.trim() !== user.course) updatedFields.push('course');
    if (yearLevel !== user.yearLevel) updatedFields.push('yearLevel');

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.email = email.toLowerCase().trim();
    user.course = course?.trim() || null;
    user.yearLevel = yearLevel || null;

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    // Log profile update activity
    if (updatedFields.length > 0) {
      await StudentActivityLogger.logProfileUpdate(
        user._id, 
        user, 
        updatedFields
      );
    }

    const updatedUser = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        course: updatedUser.course,
        yearLevel: updatedUser.yearLevel,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    return handleError(res, error, "Error updating profile:");
  }
});

router.patch("/avatar", protect, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture data is required" });
    }

    const allowedFormats = [
      "data:image/jpeg", 
      "data:image/jpg", 
      "data:image/png", 
      "data:image/gif", 
      "data:image/webp", 
      "data:image/svg+xml"
    ];
    
    const isValidFormat = allowedFormats.some(format => profilePicture.startsWith(format));
    if (!isValidFormat) {
      return res.status(400).json({ 
        message: "Invalid image format. Supported formats: JPG, PNG, GIF, WEBP, SVG" 
      });
    }

    const base64Data = profilePicture.split(',')[1];
    const sizeInMB = Buffer.from(base64Data, 'base64').length / (1024 * 1024);
    if (sizeInMB > 10) {
      return res.status(400).json({ message: "Image size must be less than 10MB" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = profilePicture;
    await user.save();

    // Log profile picture update activity
    await StudentActivityLogger.logActivity(
      user._id, 
      user, 
      'Updated profile picture', 
      'profile', 
      { action: 'avatar_update' }
    );

    console.log("Profile picture updated for user:", user._id);

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return handleError(res, error, "Error updating profile picture:");
  }
});

router.post("/skills", protect, async (req, res) => {
  try {
    const { name, level, category } = req.body;

    if (!name?.trim() || level === undefined || level === null || !category?.trim()) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        message: "Please provide all required fields: name, level, and category" 
      });
    }

    if (typeof level !== 'number' || level < 0 || level > 100) {
      console.log("Invalid level:", level);
      return res.status(400).json({ 
        message: "Level must be a number between 0 and 100" 
      });
    }

    const allowedCategories = [
      "PROGRAMMING", "WEB DEVELOPMENT", "UI/UX DESIGN", "FRONTEND", "BACKEND", "TOOLS", 
      "MOBILE DEVELOPMENT", "DATA SCIENCE", "DEVOPS & CLOUD", "PROJECT MANAGEMENT", 
      "CYBERSECURITY", "SOFTWARE ARCHITECTURE", "QUALITY ASSURANCE", "BUSINESS & PRODUCT", 
      "IT & INFRASTRUCTURE", "OTHER"
    ];
    
    if (!allowedCategories.includes(category)) {
      console.log("Invalid category:", category);
      return res.status(400).json({ 
        message: `Invalid category. Allowed categories: ${allowedCategories.join(', ')}` 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const skillExists = user.skills.some(
      skill => skill.name.toLowerCase() === name.toLowerCase().trim()
    );
    
    if (skillExists) {
      console.log("Skill already exists:", name);
      return res.status(400).json({ message: "Skill already exists" });
    }

    const newSkill = {
      name: name.trim(),
      level: Math.round(level),
      category: category.trim()
    };

    user.skills.push(newSkill);
    await user.save();

    const addedSkill = user.skills[user.skills.length - 1];
    console.log("Skill added successfully:", addedSkill);

    // Log skill addition activity
    await StudentActivityLogger.logActivity(
      user._id, 
      user, 
      `Added new skill: ${name} at level ${level}`, 
      'skill', 
      { 
        skillName: name,
        level: level,
        category: category
      }
    );

    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
      skill: addedSkill,
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    return handleError(res, error, "Error adding skill:");
  }
});

router.patch("/skills/:skillId", protect, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { level, name } = req.body;

    if (level && (level < 0 || level > 100)) {
      return res.status(400).json({ message: "Level must be between 0 and 100" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const skill = user.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const previousLevel = skill.level;
    
    if (level !== undefined) skill.level = level;
    if (name !== undefined) skill.name = name;

    await user.save();

    // Log skill update activity
    if (level !== undefined && level !== previousLevel) {
      await StudentActivityLogger.logSkillUpdate(
        user._id, 
        user, 
        skill.name, 
        previousLevel, 
        level
      );
    }

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      skill,
    });
  } catch (error) {
    return handleError(res, error, "Error updating skill:");
  }
});

router.delete("/skills/:skillId", protect, async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user._id;

    console.log("DELETE Request - Skill ID:", skillId, "User ID:", userId);

    // Get user and skill details before deletion for logging
    const userBeforeDelete = await User.findById(userId);
    const skillToDelete = userBeforeDelete.skills.id(skillId);
    
    if (!skillToDelete) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Delete the skill
    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log skill deletion activity
    await StudentActivityLogger.logActivity(
      userId, 
      userBeforeDelete, 
      `Deleted skill: ${skillToDelete.name}`, 
      'skill', 
      { 
        skillName: skillToDelete.name,
        previousLevel: skillToDelete.level,
        category: skillToDelete.category
      }
    );

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return handleError(res, error, "Error deleting skill:");
  }
});

export default router;