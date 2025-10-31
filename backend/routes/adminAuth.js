import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id, isAdmin = true) => {
  return jwt.sign(
    { id, isAdmin }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: '30d' }
  );
};

router.post("/login", async (req, res) => {
  try {
    console.log("ADMIN LOGIN ATTEMPT:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both email and password" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log("Cleaned email:", cleanEmail);

    // Debug: Check MongoDB connection and database info
    const dbName = mongoose.connection.name;
    const adminCollectionName = Admin.collection.name;
    console.log("🔍 DEBUG - MongoDB Connection Info:", {
      databaseName: dbName,
      collectionName: adminCollectionName,
      connectionState: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'
    });

    // Debug: Check all admins in the database via Mongoose
    const allAdmins = await Admin.find({});
    console.log("🔍 DEBUG - Mongoose query result:", allAdmins.length, "admins found");
    console.log("🔍 DEBUG - All admins in database:", allAdmins.map(a => ({
      _id: a._id,
      id: a.id,
      email: a.email,
      emailType: typeof a.email,
      emailLength: a.email?.length,
      name: a.name
    })));

    // Try exact match first
    let admin = await Admin.findOne({ email: cleanEmail });
    
    // If Mongoose query returns empty, try direct MongoDB query bypassing Mongoose schema
    if (!admin) {
      try {
        const directCollection = mongoose.connection.db.collection('admin');
        const directAdmins = await directCollection.find({}).toArray();
        console.log("🔍 DEBUG - Direct MongoDB query (bypassing Mongoose):", directAdmins.length, "documents found");
        if (directAdmins.length > 0) {
          console.log("🔍 DEBUG - Direct query results:", directAdmins.map(a => ({
            _id: a._id,
            id: a.id,
            email: a.email,
            name: a.name,
            hasPassword: !!a.password
          })));
          
          // If found via direct query but not Mongoose, try to use the direct result
          const matchingAdmin = directAdmins.find(a => 
            a.email?.toString().toLowerCase().trim() === cleanEmail
          );
          
          if (matchingAdmin) {
            console.log("✅ Found admin via direct MongoDB query!");
            // Load the document using Mongoose by _id
            admin = await Admin.findById(matchingAdmin._id);
            if (!admin) {
              // If still not found, create a new instance from the raw data
              admin = new Admin(matchingAdmin);
              // Manually set password from raw data
              admin.password = matchingAdmin.password;
            }
          }
        }
      } catch (err) {
        console.log("🔍 DEBUG - Direct query error:", err.message);
      }
    }
    
    // If not found, try case-insensitive regex search (handles case mismatches)
    if (!admin) {
      console.log("🔍 Trying case-insensitive search...");
      admin = await Admin.findOne({ 
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    // If still not found, try trimming whitespace from stored emails
    if (!admin) {
      console.log("🔍 Trying to find by trimming whitespace...");
      const allAdminsRaw = await Admin.find({});
      admin = allAdminsRaw.find(a => a.email?.trim().toLowerCase() === cleanEmail);
    }
    
    console.log("🔍 DEBUG - Query result:", admin ? "Found admin" : "No admin found");
    console.log("🔍 DEBUG - Searching for email:", cleanEmail);
    
    if (admin) {
      console.log("✅ Admin found in Admin collection:", {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        passwordStartsWith: admin.password ? admin.password.substring(0, 10) + "..." : "no password"
      });

      console.log("Starting password comparison...");
      let isPasswordValid = false;
      
      // If admin was created from raw MongoDB data, validate password directly
      if (admin.password && typeof admin.matchPassword === 'function') {
        isPasswordValid = await admin.matchPassword(password);
      } else {
        // Fallback: direct password comparison
        const storedPassword = admin.password;
        if (storedPassword && storedPassword.startsWith('$2')) {
          // Hashed password - use bcrypt
          isPasswordValid = await bcrypt.compare(password, storedPassword);
        } else {
          // Plain text password
          isPasswordValid = storedPassword === password;
        }
      }
      
      console.log("Password comparison result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Password incorrect");
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      if (isPasswordValid && admin.password && !admin.password.startsWith('$2')) {
        console.log("🔄 Hashing plain text password for future logins...");
        await admin.hashPassword();
      }

      const token = generateToken(admin._id, true);
      console.log("✅ Admin token generated");

      console.log("🎉 ADMIN LOGIN SUCCESSFUL for admin:", admin.email);
      
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isAdmin: true
        },
        token
      });
    }

    console.log("Admin not found in Admin collection, checking User collection...");
    const user = await User.findOne({ 
      email: cleanEmail,
      $or: [
        { isAdmin: true },
        { userType: 'admin' },
        { role: 'admin' }
      ]
    }).select('+password');

    if (user) {
      console.log("Admin user found in User collection:", {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin,
        role: user.role
      });

      const isPasswordValid = await user.matchPassword(password);
      console.log("Password comparison result:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      const token = generateToken(user._id, true);
      console.log("Admin token generated");

      console.log("ADMIN LOGIN SUCCESSFUL for user:", user.email);
      
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          userType: user.userType,
          isAdmin: true,
          role: user.role
        },
        token
      });
    }

    console.log("❌ No admin found with email:", cleanEmail);
    return res.status(401).json({ 
      success: false,
      message: "Invalid email or password" 
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during admin login",
      error: error.message 
    });
  }
});

router.get("/debug-admin-details", async (req, res) => {
  try {
    const admins = await Admin.find({});
    
    const adminData = admins.map(admin => ({
      _id: admin._id,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0,
      passwordPreview: admin.password ? admin.password.substring(0, 20) + "..." : "no password",
      isHashed: admin.password ? admin.password.startsWith('$2') : false
    }));
    
    console.log("DEBUG - Admin collection details:", adminData);
    res.json({
      success: true,
      admins: adminData,
      total: adminData.length
    });
  } catch (error) {
    console.error("Admin details debug error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.post("/hash-all-passwords", async (req, res) => {
  try {
    const admins = await Admin.find({});
    let updatedCount = 0;

    for (let admin of admins) {
      if (admin.password && !admin.password.startsWith('$2')) {
        console.log(`Hashing password for admin: ${admin.email}`);
        await admin.hashPassword();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully hashed passwords for ${updatedCount} admins`,
      updatedCount
    });
  } catch (error) {
    console.error("Hash passwords error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export const adminAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      let admin = await Admin.findById(decoded.id);
      
      if (admin) {
        req.user = admin;
        req.user.isAdmin = true;
        return next();
      }

      let user = await User.findById(decoded.id);
      
      if (user) {
        const isUserAdmin = user.isAdmin || user.userType === 'admin' || user.role === 'admin';
        
        if (!isUserAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
          });
        }

        req.user = user;
        req.user.isAdmin = true;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'User not found'
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

router.get("/profile", adminAuth, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;