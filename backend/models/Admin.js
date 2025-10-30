import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'admin'
    }
  },
  { 
    timestamps: true,
    collection: 'admin'
  }
);

adminSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    if (this.password && this.password.startsWith('$2')) {
      return await bcrypt.compare(enteredPassword, this.password);
    } else {
      return this.password === enteredPassword;
    }
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

adminSchema.methods.hashPassword = async function () {
  if (this.password && !this.password.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    await this.save();
    console.log("Password hashed successfully");
  }
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

adminSchema.methods.logActivity = async function (action, type = 'system', metadata = {}) {
  try {
    const ActivityLog = mongoose.model('ActivityLog');
    
    const activity = new ActivityLog({
      user: this.name || this.email,
      action,
      type,
      ipAddress: metadata.ipAddress || 'N/A',
      userAgent: metadata.userAgent || 'N/A',
      metadata
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// Add static method for system activities
adminSchema.statics.logSystemActivity = async function (action, metadata = {}) {
  try {
    const ActivityLog = mongoose.model('ActivityLog');
    
    const activity = new ActivityLog({
      user: 'System',
      action,
      type: 'system',
      ipAddress: 'N/A',
      userAgent: 'N/A',
      metadata
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('System activity logging error:', error);
  }
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;