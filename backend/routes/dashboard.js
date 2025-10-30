import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard data for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('firstName lastName skills projectHistory recommendations');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate dashboard metrics
    const skillsMastered = user.skills.filter(s => s.level >= 80).length;
    const skillsInProgress = user.skills.filter(s => s.level >= 50 && s.level < 80).length;
    const skillGaps = user.recommendations.length;
    const projects = user.projectHistory.length;

    // Format skills for frontend
    const formattedSkills = user.skills.map(skill => ({
      skillId: skill._id,
      skillName: skill.name,
      proficiency: skill.level,
      category: skill.category
    }));

    // Format recommendations for frontend
    const formattedRecommendations = user.recommendations.map(rec => ({
      id: rec._id,
      skillName: rec.skillName,
      reason: rec.reason,
      suggestedAction: rec.suggestedAction,
      resourceLinks: rec.resourceLinks
    }));

    // Generate career matches based on skills
    const careerMatches = generateCareerMatches(user.skills);

    // Get recent activity
    const recentActivity = getRecentActivity(user);

    res.json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName
        },
        summary: {
          skillsMastered,
          skillsInProgress,
          skillGaps,
          projects
        },
        skills: formattedSkills,
        recommendations: formattedRecommendations,
        careerMatches,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// Helper function to generate career matches based on skills
function generateCareerMatches(skills) {
  const skillLevels = {};
  skills.forEach(skill => {
    skillLevels[skill.name.toLowerCase()] = skill.level;
  });

  const careers = [
    {
      id: '1',
      title: 'Frontend Developer',
      emoji: '💻',
      subtitle: 'Best match',
      requiredSkills: ['javascript', 'react', 'css', 'html'],
      weight: 1.0
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      emoji: '🚀',
      subtitle: 'Good match',
      requiredSkills: ['javascript', 'react', 'node.js', 'database', 'git'],
      weight: 0.9
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      emoji: '🎨',
      subtitle: 'Potential match',
      requiredSkills: ['css', 'design', 'figma', 'prototyping'],
      weight: 0.7
    },
    {
      id: '4',
      title: 'Backend Developer',
      emoji: '⚙️',
      subtitle: 'Potential match',
      requiredSkills: ['node.js', 'database', 'api', 'server'],
      weight: 0.8
    }
  ];

  const careerResults = careers.map(career => {
    let totalScore = 0;
    let matchedSkills = 0;

    career.requiredSkills.forEach(skillName => {
      Object.keys(skillLevels).forEach(userSkill => {
        if (userSkill.includes(skillName) || skillName.includes(userSkill)) {
          totalScore += skillLevels[userSkill];
          matchedSkills++;
        }
      });
    });

    const averageScore = matchedSkills > 0 ? totalScore / matchedSkills : 0;
    const matchScore = Math.min(100, Math.round(averageScore * career.weight));

    return {
      id: career.id,
      title: career.title,
      emoji: career.emoji,
      subtitle: career.subtitle,
      matchScore: matchScore,
      color: getMatchScoreColor(matchScore)
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  // If no good matches, return default matches
  if (careerResults.length === 0 || careerResults[0].matchScore < 20) {
    return [
      {
        id: '1',
        title: 'Frontend Developer',
        emoji: '💻',
        subtitle: 'Best match',
        matchScore: 88,
        color: 'text-green-600'
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        emoji: '🚀',
        subtitle: 'Good match',
        matchScore: 72,
        color: 'text-teal-600'
      },
      {
        id: '3',
        title: 'UI/UX Designer',
        emoji: '🎨',
        subtitle: 'Potential match',
        matchScore: 45,
        color: 'text-orange-600'
      }
    ];
  }

  return careerResults;
}

// Helper function to get match score color
function getMatchScoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-teal-600';
  return 'text-orange-600';
}

// Helper function to generate recent activity
function getRecentActivity(user) {
  const activities = [];

  // Sort skills by level (highest first) to show most proficient skills
  const recentSkills = [...user.skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 2);

  recentSkills.forEach(skill => {
    let proficiencyLabel;
    if (skill.level >= 80) proficiencyLabel = 'Expert';
    else if (skill.level >= 60) proficiencyLabel = 'Advanced';
    else if (skill.level >= 40) proficiencyLabel = 'Intermediate';
    else proficiencyLabel = 'Beginner';

    activities.push({
      title: skill.name,
      desc: `${proficiencyLabel} level (${skill.level}%)`,
      time: getTimeAgo(skill.createdAt),
      icon: 'TrendingUp'
    });
  });

  // Add project activities if available
  if (user.projectHistory && user.projectHistory.length > 0) {
    const recentProject = user.projectHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    activities.push({
      title: recentProject.project,
      desc: `Role: ${recentProject.role} | Score: ${recentProject.score}%`,
      time: getTimeAgo(recentProject.createdAt),
      icon: 'Briefcase'
    });
  }

  // Add recommendation activities if available
  if (user.recommendations && user.recommendations.length > 0 && activities.length < 3) {
    activities.push({
      title: 'New Skill Suggestions',
      desc: `${user.recommendations.length} skills to explore`,
      time: 'Available',
      icon: 'Users'
    });
  }

  // Only add default activities if user has no activity at all
  if (activities.length === 0) {
    return [
      { title: 'Welcome to SkillMatch', desc: 'Start building your skills profile', time: 'Get started', icon: 'TrendingUp' },
      { title: 'Add Your First Skill', desc: 'Begin your learning journey', time: 'Available', icon: 'Users' },
      { title: 'Track Your Progress', desc: 'Monitor your skill development', time: 'Today', icon: 'Briefcase' },
    ];
  }

  // Fill remaining slots with defaults if needed
  if (activities.length === 1) {
    activities.push({
      title: 'Continue Learning',
      desc: 'Explore new skills and career paths',
      time: 'Now',
      icon: 'Users'
    });
  }

  if (activities.length === 2) {
    activities.push({
      title: 'Track Progress',
      desc: 'Monitor your skill development',
      time: 'Today',
      icon: 'Briefcase'
    });
  }

  return activities.slice(0, 3);
}

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

export default router;