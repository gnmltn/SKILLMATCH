import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


const skillResources = {
  'JavaScript': [
    { title: 'JavaScript Modern Tutorial', url: 'https://javascript.info', type: 'document' },
    { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/javascript', type: 'document' },
    { title: 'JavaScript Practice Projects', url: 'https://github.com/javascript-projects', type: 'course' },
    { title: 'JavaScript 30 Challenge', url: 'https://javascript30.com', type: 'course' }
  ],
  'Git': [
    { title: 'Git Handbook', url: 'https://git-scm.com/book', type: 'document' },
    { title: 'Git Exercises', url: 'https://gitexercises.fracz.com', type: 'course' },
    { title: 'Advanced Git', url: 'https://github.com/git-advanced', type: 'course' },
    { title: 'Git Branching Tutorial', url: 'https://learngitbranching.js.org', type: 'course' }
  ],
  'React': [
    { title: 'React Official Tutorial', url: 'https://reactjs.org/tutorial', type: 'document' },
    { title: 'React Practice Projects', url: 'https://github.com/react-projects', type: 'course' },
    { title: 'Advanced React Patterns', url: 'https://reactpatterns.com', type: 'document' },
    { title: 'React Documentation', url: 'https://beta.reactjs.org', type: 'document' }
  ],
  'Node.js': [
    { title: 'Node.js Documentation', url: 'https://nodejs.org/docs', type: 'document' },
    { title: 'Express.js Guide', url: 'https://expressjs.com', type: 'document' },
    { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'document' },
    { title: 'Node.js Design Patterns', url: 'https://nodejsdesignpatterns.com', type: 'document' }
  ],
  'CSS': [
    { title: 'CSS Tricks', url: 'https://css-tricks.com', type: 'document' },
    { title: 'Flexbox Guide', url: 'https://flexboxfroggy.com', type: 'course' },
    { title: 'Grid Guide', url: 'https://cssgridgarden.com', type: 'course' },
    { title: 'Modern CSS Solutions', url: 'https://moderncss.dev', type: 'document' }
  ],
  'HTML': [
    { title: 'HTML Reference', url: 'https://developer.mozilla.org/HTML', type: 'document' },
    { title: 'HTML Best Practices', url: 'https://htmlbestpractices.com', type: 'document' },
    { title: 'Accessibility Guide', url: 'https://webaim.org', type: 'document' },
    { title: 'Semantic HTML', url: 'https://web.dev/learn/html/semantic-html', type: 'document' }
  ],
  'Python': [
    { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'document' },
    { title: 'Real Python Courses', url: 'https://realpython.com', type: 'course' },
    { title: 'Python Exercises', url: 'https://exercism.org/tracks/python', type: 'course' },
    { title: 'Python Projects', url: 'https://github.com/topics/python-projects', type: 'course' }
  ],
  'TypeScript': [
    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'document' },
    { title: 'TypeScript Exercises', url: 'https://typescript-exercises.github.io', type: 'course' },
    { title: 'TypeScript with React', url: 'https://react-typescript-cheatsheet.netlify.app', type: 'document' }
  ],
  'SQL': [
    { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'document' },
    { title: 'SQL Practice', url: 'https://sqlbolt.com', type: 'course' },
    { title: 'Advanced SQL', url: 'https://mode.com/sql-tutorial', type: 'document' }
  ],
  'Team Leadership': [
    { title: 'Leadership Fundamentals', url: 'https://www.coursera.org/learn/leadership', type: 'course' },
    { title: 'Effective Team Management', url: 'https://www.mindtools.com/pages/article/newLDR_86.htm', type: 'document' }
  ],
  'Agile/Scrum': [
    { title: 'Agile Methodology Guide', url: 'https://www.agilealliance.org/agile101/', type: 'document' },
    { title: 'Scrum Master Certification Prep', url: 'https://www.scrum.org/resources', type: 'course' }
  ],
  'Communication': [
    { title: 'Effective Communication Skills', url: 'https://www.coursera.org/learn/communication-skills', type: 'course' },
    { title: 'Professional Communication', url: 'https://www.mindtools.com/page8.html', type: 'document' }
  ],
  'Problem Solving': [
    { title: 'Problem Solving Techniques', url: 'https://www.mindtools.com/pages/article/newTMC_00.htm', type: 'document' },
    { title: 'Critical Thinking', url: 'https://www.coursera.org/learn/critical-thinking-skills', type: 'course' }
  ]
};


router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    
    const recommendations = [];
    
    
    user.skills.forEach(skill => {
      
      if (skill.level <= 75) {
        const recommendation = generateSkillRecommendation(skill);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    });

    
    recommendations.sort((a, b) => a.currentLevel - b.currentLevel);

    return res.status(200).json({
      success: true,
      recommendations: recommendations,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        skills: user.skills || []
      }
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error generating suggestions" 
    });
  }
});


function generateSkillRecommendation(skill) {
  const currentLevel = skill.level;
  
 
  if (currentLevel > 75) {
    return null;
  }

 
  let priority;
  let reason;
  let suggestedAction;

  if (currentLevel <= 30) {
    priority = "HIGH";
    reason = `Your ${skill.name} skills are at a beginner level (${currentLevel}%). Building strong fundamentals is crucial for career growth.`;
    suggestedAction = "Focus on learning core concepts and building basic projects to establish a solid foundation.";
  } else if (currentLevel <= 50) {
    priority = "HIGH";
    reason = `Your ${skill.name} proficiency is developing (${currentLevel}%). With focused effort, you can reach intermediate level quickly.`;
    suggestedAction = "Practice regularly and work on more complex projects to bridge the gap to intermediate level.";
  } else if (currentLevel <= 75) {
    priority = "MEDIUM";
    reason = `You have good ${skill.name} knowledge (${currentLevel}%), but there's room for improvement to reach advanced levels.`;
    suggestedAction = "Tackle advanced concepts and real-world projects to push your skills to the next level.";
  }

  
  const resourceLinks = skillResources[skill.name] || getDefaultResources(skill.name);

  return {
    skillName: skill.name,
    currentLevel: currentLevel,
    reason: reason,
    suggestedAction: suggestedAction,
    resourceLinks: resourceLinks,
    priority: priority
  };
}


function getDefaultResources(skillName) {
  return [
    { 
      title: `${skillName} Documentation`, 
      url: `https://google.com/search?q=${encodeURIComponent(skillName)}+tutorial`, 
      type: 'document' 
    },
    { 
      title: `${skillName} Practice Exercises`, 
      url: `https://github.com/topics/${encodeURIComponent(skillName)}-practice`, 
      type: 'course' 
    },
    { 
      title: `${skillName} Community & Forums`, 
      url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(skillName.toLowerCase())}`, 
      type: 'document' 
    }
  ];
}

export default router;