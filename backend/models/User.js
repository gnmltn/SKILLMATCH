import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "PROGRAMMING", "WEB DEVELOPMENT", "UI/UX DESIGN", "FRONTEND", "BACKEND", "TOOLS", 
      "MOBILE DEVELOPMENT", "DATA SCIENCE", "DEVOPS & CLOUD", "PROJECT MANAGEMENT", 
      "CYBERSECURITY", "SOFTWARE ARCHITECTURE", "QUALITY ASSURANCE", "BUSINESS & PRODUCT", 
      "IT & INFRASTRUCTURE", "OTHER"
    ],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  projectImages: {
    type: [String],
    default: [],
  },
  projectUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const recommendationSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    trim: true,
  },
  reason: {
    type: String,
    required: true,
  },
  suggestedAction: {
    type: String,
    required: true,
  },
  resourceLinks: [
    {
      title: String,
      url: String,
    },
  ],
  priority: {
    type: String,
    enum: ["HIGH", "MEDIUM", "LOW"],
    default: "MEDIUM",
  },
  currentLevel: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const settingsSchema = new mongoose.Schema({
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    skillAlerts: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    },
    recommendations: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisible: {
      type: Boolean,
      default: true
    },
    skillsVisible: {
      type: Boolean,
      default: true
    },
    projectsVisible: {
      type: Boolean,
      default: true
    }
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@gmail\.com$/i, 'Please enter a valid Gmail address']
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    course: {
      type: String,
      default: null,
    },
    yearLevel: {
      type: String,
      default: null,
    },
    
    skills: [skillSchema],
    projectHistory: [projectSchema],
    recommendations: [recommendationSchema],
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    userType: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: 'user'
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Add generateRecommendations method
userSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const skillLevels = {};

  this.skills.forEach(skill => {
    skillLevels[skill.name] = skill.level;
  });

  const recommendationRules = [
    {
      skillName: "JavaScript",
      minLevel: 0,
      maxLevel: 70,
      reason: "Essential for modern web development. Your current level indicates room for improvement.",
      suggestedAction: "Build interactive projects and master ES6+ features.",
      resourceLinks: [
        { title: "JavaScript Modern Tutorial", url: "https://javascript.info" },
        { title: "JavaScript Projects", url: "https://github.com/topics/javascript-projects" }
      ]
    },
    {
      skillName: "Git",
      minLevel: 0,
      maxLevel: 80,
      reason: "Essential for collaboration and professional development workflows.",
      suggestedAction: "Learn branching strategies and team collaboration.",
      resourceLinks: [
        { title: "Git Handbook", url: "https://guides.github.com/introduction/git-handbook/" },
        { title: "Git Practice", url: "https://learngitbranching.js.org" }
      ]
    },
    {
      skillName: "React",
      minLevel: 0,
      maxLevel: 60,
      reason: "Most popular frontend framework. High demand in job market.",
      suggestedAction: "Build component-based applications and learn state management.",
      resourceLinks: [
        { title: "React Official Tutorial", url: "https://reactjs.org/tutorial" },
        { title: "React Projects", url: "https://github.com/enaqx/awesome-react" }
      ]
    },
    {
      skillName: "Node.js",
      minLevel: 0,
      maxLevel: 65,
      reason: "Essential for backend development and full-stack applications.",
      suggestedAction: "Build REST APIs and learn about middleware and authentication.",
      resourceLinks: [
        { title: "Node.js Guide", url: "https://nodejs.org/en/docs/guides/" },
        { title: "Express Tutorial", url: "https://expressjs.com/en/starter/installing.html" }
      ]
    },
    {
      skillName: "CSS",
      minLevel: 0,
      maxLevel: 75,
      reason: "Fundamental for styling and creating responsive designs.",
      suggestedAction: "Master Flexbox, Grid, and modern CSS frameworks.",
      resourceLinks: [
        { title: "CSS Tricks", url: "https://css-tricks.com" },
        { title: "Flexbox Guide", url: "https://flexboxfroggy.com" }
      ]
    }
  ];

  recommendationRules.forEach(rule => {
    const currentLevel = skillLevels[rule.skillName] || 0;
    
    if (currentLevel >= rule.minLevel && currentLevel <= rule.maxLevel) {
      recommendations.push({
        skillName: rule.skillName,
        currentLevel,
        reason: rule.reason,
        suggestedAction: rule.suggestedAction,
        resourceLinks: rule.resourceLinks,
        priority: currentLevel < 30 ? "HIGH" : currentLevel < 60 ? "MEDIUM" : "LOW"
      });
    }
  });

  // Sort by priority (skills needing most improvement first)
  return recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Improved password hashing middleware
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    // If password is not selected, we need to fetch it first
    if (!this.password) {
      const userWithPassword = await mongoose.model('User').findById(this._id).select('+password');
      return await bcrypt.compare(enteredPassword, userWithPassword.password);
    }
    
    const match = await bcrypt.compare(enteredPassword, this.password);
    return match;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Add activity logging method for users
userSchema.methods.logActivity = async function (action, type = 'system', metadata = {}) {
  try {
    const ActivityLog = mongoose.model('ActivityLog');
    
    // Use full name or email for user identification
    const userName = `${this.firstName} ${this.lastName}`.trim() || this.email;
    
    const activity = new ActivityLog({
      user: userName,
      action,
      type,
      ipAddress: metadata.ipAddress || 'N/A',
      userAgent: metadata.userAgent || 'N/A',
      metadata: {
        ...metadata,
        userId: this._id.toString(),
        userEmail: this.email
      }
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('User activity logging error:', error);
    // Don't throw - activity logging shouldn't break the main flow
  }
};

const User = mongoose.model("User", userSchema);

export default User;