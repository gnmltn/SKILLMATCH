import express from 'express';
import { protect as authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Enhanced career paths data with ALL skills integrated
const careerPathsData = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'Build user interfaces and interactive web experiences',
    icon: '💻',
    requiredSkills: [
      { name: 'JavaScript', importance: 'critical', minProficiency: 75, category: 'PROGRAMMING' },
      { name: 'React', importance: 'critical', minProficiency: 75, category: 'WEB DEVELOPMENT' },
      { name: 'CSS', importance: 'critical', minProficiency: 75, category: 'WEB DEVELOPMENT' },
      { name: 'HTML', importance: 'critical', minProficiency: 75, category: 'WEB DEVELOPMENT' },
      { name: 'TypeScript', importance: 'important', minProficiency: 60, category: 'PROGRAMMING' },
      { name: 'Git', importance: 'important', minProficiency: 60, category: 'TOOLS' },
      { name: 'Next.js', importance: 'important', minProficiency: 65, category: 'FRONTEND' },
      { name: 'Vite', importance: 'nice-to-have', minProficiency: 50, category: 'FRONTEND' },
      { name: 'Webpack', importance: 'nice-to-have', minProficiency: 50, category: 'FRONTEND' },
      { name: 'CSS-in-JS', importance: 'nice-to-have', minProficiency: 50, category: 'FRONTEND' },
      { name: 'Storybook', importance: 'nice-to-have', minProficiency: 45, category: 'FRONTEND' },
      { name: 'UI/UX Design', importance: 'nice-to-have', minProficiency: 50, category: 'UI/UX DESIGN' },
      { name: 'Figma', importance: 'nice-to-have', minProficiency: 45, category: 'UI/UX DESIGN' },
    ],
    averageSalary: '₱75,000 - ₱120,000',
    demandLevel: 'high',
    growthRate: '+15% annually',
    experienceLevel: 'Mid-level',
    industries: ['Tech', 'E-commerce', 'Finance', 'Healthcare']
  },
  {
    id: '2',
    title: 'Backend Developer',
    description: 'Build server-side logic and database systems',
    icon: '⚙️',
    requiredSkills: [
      { name: 'Node.js', importance: 'critical', minProficiency: 80, category: 'BACKEND' },
      { name: 'Python', importance: 'critical', minProficiency: 80, category: 'PROGRAMMING' },
      { name: 'SQL', importance: 'critical', minProficiency: 80, category: 'BACKEND' },
      { name: 'Database Design', importance: 'critical', minProficiency: 75, category: 'BACKEND' },
      { name: 'MongoDB', importance: 'critical', minProficiency: 75, category: 'BACKEND' },
      { name: 'Express', importance: 'critical', minProficiency: 75, category: 'BACKEND' },
      { name: 'PostgreSQL', importance: 'important', minProficiency: 70, category: 'BACKEND' },
      { name: 'API Design', importance: 'important', minProficiency: 70, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Git', importance: 'important', minProficiency: 70, category: 'TOOLS' },
      { name: 'Docker', importance: 'important', minProficiency: 65, category: 'TOOLS' },
      { name: 'System Architecture', importance: 'important', minProficiency: 70, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Firebase/Firestore', importance: 'nice-to-have', minProficiency: 60, category: 'BACKEND' },
      { name: 'GraphQL', importance: 'nice-to-have', minProficiency: 60, category: 'FRONTEND' },
    ],
    averageSalary: '₱80,000 - ₱130,000',
    demandLevel: 'high',
    growthRate: '+17% annually',
    experienceLevel: 'Mid-level',
    industries: ['Tech', 'Finance', 'Healthcare', 'IoT']
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    description: 'Master both frontend and backend development',
    icon: '🚀',
    requiredSkills: [
      { name: 'JavaScript', importance: 'critical', minProficiency: 75, category: 'PROGRAMMING' },
      { name: 'React', importance: 'critical', minProficiency: 75, category: 'WEB DEVELOPMENT' },
      { name: 'Node.js', importance: 'critical', minProficiency: 75, category: 'BACKEND' },
      { name: 'SQL', importance: 'critical', minProficiency: 70, category: 'BACKEND' },
      { name: 'CSS', importance: 'important', minProficiency: 70, category: 'WEB DEVELOPMENT' },
      { name: 'HTML', importance: 'important', minProficiency: 70, category: 'WEB DEVELOPMENT' },
      { name: 'Git', importance: 'important', minProficiency: 70, category: 'TOOLS' },
      { name: 'API Design', importance: 'important', minProficiency: 70, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Express', importance: 'important', minProficiency: 70, category: 'BACKEND' },
      { name: 'Next.js', importance: 'important', minProficiency: 65, category: 'FRONTEND' },
      { name: 'TypeScript', importance: 'nice-to-have', minProficiency: 60, category: 'PROGRAMMING' },
      { name: 'MongoDB', importance: 'nice-to-have', minProficiency: 60, category: 'BACKEND' },
      { name: 'Docker', importance: 'nice-to-have', minProficiency: 55, category: 'TOOLS' },
    ],
    averageSalary: '₱85,000 - ₱140,000',
    demandLevel: 'high',
    growthRate: '+18% annually',
    experienceLevel: 'Mid-level',
    industries: ['Startups', 'Tech', 'Agency', 'Consulting']
  },
  {
    id: '4',
    title: 'Data Analyst',
    description: 'Transform data into actionable insights',
    icon: '📊',
    requiredSkills: [
      { name: 'Python', importance: 'critical', minProficiency: 80, category: 'PROGRAMMING' },
      { name: 'SQL', importance: 'critical', minProficiency: 80, category: 'BACKEND' },
      { name: 'Data Analysis', importance: 'critical', minProficiency: 75, category: 'DATA SCIENCE' },
      { name: 'Data Visualization', importance: 'critical', minProficiency: 75, category: 'DATA SCIENCE' },
      { name: 'Statistics', importance: 'important', minProficiency: 70, category: 'DATA SCIENCE' },
      { name: 'Machine Learning', importance: 'important', minProficiency: 65, category: 'DATA SCIENCE' },
      { name: 'Excel', importance: 'important', minProficiency: 70, category: 'TOOLS' },
      { name: 'Pandas', importance: 'important', minProficiency: 70, category: 'PROGRAMMING' },
      { name: 'Matplotlib/Seaborn', importance: 'important', minProficiency: 65, category: 'DATA SCIENCE' },
      { name: 'Git', importance: 'nice-to-have', minProficiency: 60, category: 'TOOLS' },
      { name: 'Jupyter Notebooks', importance: 'nice-to-have', minProficiency: 60, category: 'DATA SCIENCE' },
    ],
    averageSalary: '₱65,000 - ₱105,000',
    demandLevel: 'high',
    growthRate: '+20% annually',
    experienceLevel: 'Entry to Mid-level',
    industries: ['Finance', 'Healthcare', 'Marketing', 'E-commerce']
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    description: 'Bridge development and operations for efficient software delivery',
    icon: '🔧',
    requiredSkills: [
      { name: 'Docker', importance: 'critical', minProficiency: 80, category: 'TOOLS' },
      { name: 'Kubernetes', importance: 'critical', minProficiency: 75, category: 'DEVOPS & CLOUD' },
      { name: 'AWS', importance: 'critical', minProficiency: 75, category: 'DEVOPS & CLOUD' },
      { name: 'CI/CD', importance: 'critical', minProficiency: 80, category: 'DEVOPS & CLOUD' },
      { name: 'Linux/Unix', importance: 'important', minProficiency: 75, category: 'IT & INFRASTRUCTURE' },
      { name: 'Git', importance: 'important', minProficiency: 75, category: 'TOOLS' },
      { name: 'Python', importance: 'important', minProficiency: 70, category: 'PROGRAMMING' },
      { name: 'System Administration', importance: 'important', minProficiency: 70, category: 'IT & INFRASTRUCTURE' },
      { name: 'Bash Scripting', importance: 'important', minProficiency: 65, category: 'IT & INFRASTRUCTURE' },
      { name: 'Network Engineering', importance: 'important', minProficiency: 60, category: 'IT & INFRASTRUCTURE' },
      { name: 'Terraform', importance: 'nice-to-have', minProficiency: 60, category: 'DEVOPS & CLOUD' },
      { name: 'Jenkins', importance: 'nice-to-have', minProficiency: 60, category: 'DEVOPS & CLOUD' },
      { name: 'Prometheus/Grafana', importance: 'nice-to-have', minProficiency: 55, category: 'DEVOPS & CLOUD' },
    ],
    averageSalary: '₱95,000 - ₱155,000',
    demandLevel: 'high',
    growthRate: '+22% annually',
    experienceLevel: 'Mid to Senior-level',
    industries: ['Tech', 'Finance', 'Enterprise', 'Cloud Services']
  },
  {
    id: '6',
    title: 'Cybersecurity Analyst',
    description: 'Protect systems and networks from cyber threats',
    icon: '🛡️',
    requiredSkills: [
      { name: 'Network Security', importance: 'critical', minProficiency: 75, category: 'CYBERSECURITY' },
      { name: 'Application Security', importance: 'critical', minProficiency: 70, category: 'CYBERSECURITY' },
      { name: 'Kali Linux/Unix', importance: 'critical', minProficiency: 70, category: 'CYBERSECURITY' },
      { name: 'Python', importance: 'important', minProficiency: 65, category: 'PROGRAMMING' },
      { name: 'System Administration', importance: 'important', minProficiency: 65, category: 'IT & INFRASTRUCTURE' },
      { name: 'Network Engineering', importance: 'important', minProficiency: 60, category: 'IT & INFRASTRUCTURE' },
      { name: 'Git', importance: 'important', minProficiency: 60, category: 'TOOLS' },
      { name: 'Problem Solving', importance: 'important', minProficiency: 70, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Bash Scripting', importance: 'important', minProficiency: 65, category: 'IT & INFRASTRUCTURE' },
      { name: 'Wireshark', importance: 'nice-to-have', minProficiency: 60, category: 'CYBERSECURITY' },
      { name: 'Metasploit', importance: 'nice-to-have', minProficiency: 55, category: 'CYBERSECURITY' },
      { name: 'Nmap', importance: 'nice-to-have', minProficiency: 55, category: 'CYBERSECURITY' },
    ],
    averageSalary: '₱85,000 - ₱130,000',
    demandLevel: 'very high',
    growthRate: '+25% annually',
    experienceLevel: 'Entry to Mid-level',
    industries: ['Finance', 'Government', 'Healthcare', 'Tech', 'Defense']
  },
  {
    id: '7',
    title: 'Mobile Developer',
    description: 'Build native and cross-platform mobile applications',
    icon: '📱',
    requiredSkills: [
      { name: 'React Native', importance: 'critical', minProficiency: 75, category: 'MOBILE DEVELOPMENT' },
      { name: 'JavaScript', importance: 'critical', minProficiency: 75, category: 'PROGRAMMING' },
      { name: 'Flutter', importance: 'important', minProficiency: 70, category: 'MOBILE DEVELOPMENT' },
      { name: 'iOS Development', importance: 'important', minProficiency: 70, category: 'MOBILE DEVELOPMENT' },
      { name: 'Android Development', importance: 'important', minProficiency: 70, category: 'MOBILE DEVELOPMENT' },
      { name: 'Git', importance: 'important', minProficiency: 65, category: 'TOOLS' },
      { name: 'REST APIs', importance: 'important', minProficiency: 65, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'TypeScript', importance: 'nice-to-have', minProficiency: 60, category: 'PROGRAMMING' },
      { name: 'Firebase', importance: 'nice-to-have', minProficiency: 60, category: 'BACKEND' },
      { name: 'UI/UX Design', importance: 'nice-to-have', minProficiency: 55, category: 'UI/UX DESIGN' },
    ],
    averageSalary: '₱80,000 - ₱130,000',
    demandLevel: 'high',
    growthRate: '+18% annually',
    experienceLevel: 'Mid-level',
    industries: ['Tech', 'Startups', 'E-commerce', 'Healthcare']
  },
  {
    id: '8',
    title: 'UI/UX Designer',
    description: 'Design intuitive and engaging user experiences',
    icon: '🎨',
    requiredSkills: [
      { name: 'Figma', importance: 'critical', minProficiency: 80, category: 'UI/UX DESIGN' },
      { name: 'UI/UX Design', importance: 'critical', minProficiency: 75, category: 'UI/UX DESIGN' },
      { name: 'Wireframing & Prototyping', importance: 'critical', minProficiency: 75, category: 'UI/UX DESIGN' },
      { name: 'User Research', importance: 'important', minProficiency: 70, category: 'UI/UX DESIGN' },
      { name: 'Adobe Creative Suite', importance: 'important', minProficiency: 70, category: 'UI/UX DESIGN' },
      { name: 'Sketch', importance: 'important', minProficiency: 65, category: 'UI/UX DESIGN' },
      { name: 'AdobeXD', importance: 'nice-to-have', minProficiency: 60, category: 'UI/UX DESIGN' },
      { name: 'Canva', importance: 'nice-to-have', minProficiency: 60, category: 'UI/UX DESIGN' },
      { name: 'HTML/CSS Basics', importance: 'nice-to-have', minProficiency: 50, category: 'WEB DEVELOPMENT' },
    ],
    averageSalary: '₱70,000 - ₱110,000',
    demandLevel: 'high',
    growthRate: '+16% annually',
    experienceLevel: 'Entry to Mid-level',
    industries: ['Tech', 'E-commerce', 'Agency', 'Finance']
  },
  {
    id: '9',
    title: 'Software Architect',
    description: 'Design and oversee complex software systems',
    icon: '🏛️',
    requiredSkills: [
      { name: 'System Architecture', importance: 'critical', minProficiency: 85, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'System Design', importance: 'critical', minProficiency: 85, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Microservices', importance: 'critical', minProficiency: 80, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'API Design', importance: 'critical', minProficiency: 80, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Problem Solving', importance: 'important', minProficiency: 80, category: 'SOFTWARE ARCHITECTURE' },
      { name: 'Cloud Architecture', importance: 'important', minProficiency: 75, category: 'DEVOPS & CLOUD' },
      { name: 'Database Design', importance: 'important', minProficiency: 75, category: 'BACKEND' },
      { name: 'Security Principles', importance: 'important', minProficiency: 70, category: 'CYBERSECURITY' },
      { name: 'Git', importance: 'important', minProficiency: 70, category: 'TOOLS' },
      { name: 'Multiple Programming Languages', importance: 'nice-to-have', minProficiency: 70, category: 'PROGRAMMING' },
    ],
    averageSalary: '₱120,000 - ₱180,000',
    demandLevel: 'high',
    growthRate: '+20% annually',
    experienceLevel: 'Senior-level',
    industries: ['Tech', 'Finance', 'Enterprise', 'Consulting']
  },
  {
    id: '10',
    title: 'QA Engineer',
    description: 'Ensure software quality through testing and automation',
    icon: '🧪',
    requiredSkills: [
      { name: 'Test Automation', importance: 'critical', minProficiency: 75, category: 'QUALITY ASSURANCE' },
      { name: 'Performance Testing', importance: 'critical', minProficiency: 70, category: 'QUALITY ASSURANCE' },
      { name: 'JavaScript', importance: 'important', minProficiency: 70, category: 'PROGRAMMING' },
      { name: 'Python', importance: 'important', minProficiency: 65, category: 'PROGRAMMING' },
      { name: 'Git', importance: 'important', minProficiency: 65, category: 'TOOLS' },
      { name: 'Selenium', importance: 'important', minProficiency: 70, category: 'QUALITY ASSURANCE' },
      { name: 'Jest', importance: 'important', minProficiency: 65, category: 'QUALITY ASSURANCE' },
      { name: 'CI/CD Integration', importance: 'nice-to-have', minProficiency: 60, category: 'DEVOPS & CLOUD' },
      { name: 'SQL', importance: 'nice-to-have', minProficiency: 60, category: 'BACKEND' },
      { name: 'API Testing', importance: 'nice-to-have', minProficiency: 65, category: 'SOFTWARE ARCHITECTURE' },
    ],
    averageSalary: '₱70,000 - ₱115,000',
    demandLevel: 'medium',
    growthRate: '+14% annually',
    experienceLevel: 'Entry to Mid-level',
    industries: ['Tech', 'Finance', 'Healthcare', 'E-commerce']
  }
];

// Enhanced skill matching with better aliases
const skillVariations = {
  // Programming Languages
  'javascript': ['js', 'ecmascript', 'es6', 'vanilla javascript'],
  'python': ['py', 'python3', 'python programming'],
  'typescript': ['ts', 'typescript programming'],
  'java': ['java programming', 'java se', 'java ee'],
  'c++': ['cpp', 'c plus plus'],
  
  // Web Development
  'html': ['html5', 'hypertext markup language'],
  'css': ['css3', 'cascading style sheets'],
  'tailwind css': ['tailwind', 'tailwindcss'],
  'bootstrap': ['bootstrap css', 'bootstrap framework'],
  'react': ['react.js', 'reactjs', 'react development'],
  'vue.js': ['vue', 'vuejs', 'vue development'],
  'angular': ['angular.js', 'angularjs', 'angular development'],
  
  // Backend & Databases
  'node.js': ['node', 'nodejs', 'node development'],
  'express': ['express.js', 'expressjs', 'express framework'],
  'mongodb': ['mongo', 'mongo db', 'mongodb database'],
  'sql': ['mysql', 'postgresql', 'postgres', 'database', 'sql database', 'structured query language'],
  'postgresql': ['postgres', 'postgres database'],
  'firebase/firestore': ['firebase', 'firestore', 'google firebase'],
  
  // Frontend Frameworks & Tools
  'next.js': ['next', 'nextjs'],
  'webpack': ['webpack bundler', 'webpack build tool'],
  'vite': ['vitejs', 'vite build tool'],
  'css-in-js': ['styled components', 'emotion', 'styled-components', 'css in js'],
  'graphql': ['graph ql', 'graphql api'],
  'storybook': ['storybook.js', 'component storybook'],
  
  // UI/UX Design
  'figma': ['figma design', 'figma prototyping'],
  'adobexd': ['adobe xd', 'xd'],
  'sketch': ['sketch app', 'sketch design'],
  'adobe creative suite': ['photoshop', 'illustrator', 'indesign', 'after effects', 'adobe suite'],
  'canva': ['canva design', 'canva platform'],
  'ui/ux design': ['ui design', 'ux design', 'user interface', 'user experience', 'design'],
  'user research': ['research', 'user interviews', 'usability research'],
  'wireframing & prototyping': ['wireframing', 'prototyping', 'mockups'],
  
  // Tools & DevOps
  'git': ['github', 'gitlab', 'version control'],
  'docker': ['docker container', 'docker platform'],
  'vs code': ['visual studio code', 'vscode'],
  'github': ['github platform', 'git hub'],
  'aws': ['amazon web services', 'amazon aws'],
  'kubernetes': ['k8s', 'kubernetes platform'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'jenkins', 'gitlab ci'],
  'terraform': ['terraform iac', 'terraform infrastructure'],
  'jenkins': ['jenkins ci/cd'],
  'prometheus/grafana': ['prometheus', 'grafana', 'monitoring'],
  
  // Mobile Development
  'react native': ['react native development'],
  'flutter': ['flutter development'],
  'ios development': ['swift', 'swiftui', 'uikit', 'ios dev'],
  'android development': ['kotlin', 'java android', 'jetpack compose', 'android dev'],
  'rest apis': ['rest', 'api', 'restful api'],
  
  // Data Science & Analytics
  'machine learning': ['ml', 'ai', 'artificial intelligence'],
  'data analysis': ['data analytics', 'analytics', 'data'],
  'data visualization': ['data viz', 'visualization', 'charts', 'graphs'],
  'statistics': ['statistical analysis', 'stats'],
  'excel': ['microsoft excel', 'spreadsheets'],
  'pandas': ['pandas library', 'python pandas'],
  'matplotlib/seaborn': ['matplotlib', 'seaborn', 'python plotting'],
  'jupyter notebooks': ['jupyter', 'notebooks'],
  
  // Project Management
  'agile methodology': ['agile', 'scrum', 'kanban'],
  'scrum': ['scrum master', 'scrum framework'],
  'jira': ['atlassian jira', 'jira software'],
  
  // Cybersecurity
  'network security': ['cybersecurity', 'security', 'network protection'],
  'application security': ['appsec', 'web security', 'software security'],
  'kali linux/unix': ['linux', 'unix', 'ubuntu', 'centos', 'kali'],
  'wireshark': ['wireshark analysis'],
  'metasploit': ['metasploit framework'],
  'nmap': ['nmap scanning'],
  'security principles': ['security fundamentals', 'infosec'],
  
  // Software Architecture
  'system architecture': ['software architecture', 'system design', 'architecture'],
  'system design': ['system architecture design'],
  'microservices': ['microservices architecture'],
  'api design': ['rest api', 'api development', 'apis'],
  'problem solving': ['analytical thinking', 'critical thinking', 'troubleshooting'],
  'cloud architecture': ['cloud design', 'cloud infrastructure'],
  'multiple programming languages': ['polyglot programming', 'multi-language'],
  
  // IT & Infrastructure
  'linux/unix': ['linux administration', 'unix administration'],
  'system administration': ['sysadmin', 'system admin', 'server administration'],
  'bash scripting': ['bash', 'shell scripting'],
  'network engineering': ['networking', 'network admin', 'network architecture'],
  
  // Quality Assurance
  'test automation': ['automated testing', 'qa automation'],
  'performance testing': ['load testing', 'stress testing'],
  'selenium': ['selenium webdriver'],
  'jest': ['jest testing'],
  'ci/cd integration': ['continuous integration testing'],
  'api testing': ['api validation', 'rest api testing'],
  
  // Database & Specialized Skills
  'database design': ['database management', 'db design', 'database architecture', 'schema design'],
  
  // NEW: Add any skills that might be missing from career paths
  'ui/ux': ['user interface', 'user experience', 'design thinking'],
  'data science': ['data analytics', 'machine learning engineering'],
  'cloud computing': ['cloud services', 'cloud platform'],
  'mobile development': ['mobile apps', 'app development'],
  'web development': ['frontend development', 'backend development'],
  'software development': ['programming', 'coding', 'development'],
  'devops': ['development operations', 'ci/cd pipelines'],
  'quality assurance': ['qa', 'testing', 'software testing']
};

// Improved helper function to find skill match
const findMatchingSkill = (requiredSkill, userSkills) => {
  const requiredName = requiredSkill.name.toLowerCase().trim();
  
  // First try exact match
  let userSkill = userSkills.find(us => 
    us.name.toLowerCase().trim() === requiredName
  );
  
  if (userSkill) return userSkill;
  
  // Try common aliases and variations
  if (skillVariations[requiredName]) {
    for (const variation of skillVariations[requiredName]) {
      userSkill = userSkills.find(us => 
        us.name.toLowerCase().trim() === variation
      );
      if (userSkill) return userSkill;
    }
  }
  
  // Check if any user skill matches a variation of the required skill
  for (const [baseSkill, variations] of Object.entries(skillVariations)) {
    if (variations.includes(requiredName)) {
      userSkill = userSkills.find(us => 
        us.name.toLowerCase().trim() === baseSkill
      );
      if (userSkill) return userSkill;
    }
  }
  
  // Try partial matching for skills that might have similar names
  userSkill = userSkills.find(us => {
    const userName = us.name.toLowerCase();
    const reqName = requiredName.toLowerCase();
    
    // Check for partial matches (e.g., "React" matches "React.js")
    return userName.includes(reqName) || reqName.includes(userName);
  });
  
  // Try fuzzy matching for common skill patterns
  if (!userSkill) {
    userSkill = userSkills.find(us => {
      const userName = us.name.toLowerCase().replace(/[\.\-\s]/g, '');
      const reqName = requiredName.toLowerCase().replace(/[\.\-\s]/g, '');
      return userName === reqName;
    });
  }
  
  return userSkill || null;
};

// Enhanced match calculation with better weighting
const calculateMatch = (careerPath, userSkills) => {
  let totalPossibleScore = 0;
  let userScore = 0;
  
  const skillDetails = careerPath.requiredSkills.map(requiredSkill => {
    const userSkill = findMatchingSkill(requiredSkill, userSkills);
    const userProficiency = userSkill ? userSkill.level : 0;
    const meetsRequirement = userProficiency >= requiredSkill.minProficiency;
    
    // Calculate weight based on importance
    let weight;
    let skillScore = 0;
    
    switch (requiredSkill.importance) {
      case 'critical':
        weight = 10; // Increased weight for critical skills
        skillScore = meetsRequirement ? weight : (userProficiency > 0 ? weight * 0.1 : 0);
        break;
      case 'important':
        weight = 5;
        skillScore = meetsRequirement ? weight : (userProficiency / requiredSkill.minProficiency) * weight;
        break;
      case 'nice-to-have':
        weight = 2;
        skillScore = (userProficiency / 100) * weight;
        break;
      default:
        weight = 1;
        skillScore = (userProficiency / 100) * weight;
    }
    
    totalPossibleScore += weight;
    userScore += Math.min(skillScore, weight);
    
    return {
      name: requiredSkill.name,
      importance: requiredSkill.importance,
      minProficiency: requiredSkill.minProficiency,
      userProficiency: userProficiency,
      meetsRequirement: meetsRequirement,
      gap: Math.max(0, requiredSkill.minProficiency - userProficiency),
      userSkillName: userSkill ? userSkill.name : null,
      category: requiredSkill.category,
      weight: weight,
      score: skillScore,
    };
  });

  // Calculate base match percentage
  let matchPercentage = totalPossibleScore > 0 
    ? Math.round((userScore / totalPossibleScore) * 100) 
    : 0;

  // Enhanced critical skill penalty system
  const criticalSkills = skillDetails.filter(s => s.importance === 'critical');
  const metCriticalSkills = criticalSkills.filter(s => s.meetsRequirement).length;
  const criticalSkillRatio = criticalSkills.length > 0 ? metCriticalSkills / criticalSkills.length : 1;
  
  // Apply progressive penalties for missing critical skills
  if (criticalSkillRatio < 1) {
    const penaltyMultiplier = criticalSkillRatio * 0.6; // Up to 40% penalty
    matchPercentage = Math.round(matchPercentage * penaltyMultiplier);
  }
  
  // Enhanced bonus system
  if (criticalSkillRatio === 1) {
    // Bonus based on overall proficiency
    const bonus = matchPercentage >= 80 ? 15 : matchPercentage >= 70 ? 10 : 5;
    matchPercentage = Math.min(matchPercentage + bonus, 100);
  }

  return {
    matchPercentage: matchPercentage,
    skillDetails: skillDetails,
    criticalSkillsMet: metCriticalSkills,
    totalCriticalSkills: criticalSkills.length,
    criticalSkillRatio: criticalSkillRatio,
  };
};

// Enhanced recommendations with more specific guidance
const generateRecommendations = (careerPath, skillDetails, matchPercentage, criticalSkillsMet, totalCriticalSkills) => {
  const recommendations = [];

  // Categorize skill gaps
  const criticalGaps = skillDetails.filter(skill => skill.importance === 'critical' && !skill.meetsRequirement);
  const importantGaps = skillDetails.filter(skill => skill.importance === 'important' && !skill.meetsRequirement);
  const niceToHaveGaps = skillDetails.filter(skill => skill.importance === 'nice-to-have' && !skill.meetsRequirement);

  // Career readiness assessment
  if (matchPercentage >= 90 && criticalSkillsMet === totalCriticalSkills) {
    recommendations.push({
      type: 'success',
      message: `🎯 Excellent match! You're well-prepared for ${careerPath.title} roles. Consider senior positions.`,
      priority: 'high',
      action: 'apply'
    });
  } else if (matchPercentage >= 80 && criticalSkillsMet === totalCriticalSkills) {
    recommendations.push({
      type: 'success',
      message: `🌟 Great match! You meet all critical requirements for ${careerPath.title}. Ready for mid-level positions.`,
      priority: 'high',
      action: 'apply'
    });
  } else if (matchPercentage >= 75 && criticalSkillsMet >= totalCriticalSkills * 0.8) {
    recommendations.push({
      type: 'info',
      message: `📈 Good potential for ${careerPath.title}. Focus on the remaining critical skills to unlock better opportunities.`,
      priority: 'medium',
      action: 'learn'
    });
  } else if (matchPercentage >= 60) {
    recommendations.push({
      type: 'warning',
      message: `🛠️ Developing match for ${careerPath.title}. Build your foundational skills first.`,
      priority: 'medium',
      action: 'learn'
    });
  } else {
    recommendations.push({
      type: 'info',
      message: `🌱 ${careerPath.title} requires significant skill development. Start with core fundamentals.`,
      priority: 'low',
      action: 'foundation'
    });
  }

  // Critical skill recommendations
  if (criticalGaps.length > 0) {
    const topCriticalGaps = criticalGaps.slice(0, 3).sort((a, b) => b.gap - a.gap);
    recommendations.push({
      type: 'critical',
      message: `🚨 PRIORITY: Master these critical skills - ${topCriticalGaps.map(s => `${s.name} (gap: ${s.gap}%)`).join(', ')}`,
      skills: topCriticalGaps.map(s => s.name),
      priority: 'critical',
      action: 'master'
    });
  }

  // Important skill recommendations
  if (importantGaps.length > 0 && criticalGaps.length === 0) {
    const topImportantGaps = importantGaps.slice(0, 2);
    recommendations.push({
      type: 'action',
      message: `💪 Strengthen these important skills - ${topImportantGaps.map(s => s.name).join(', ')}`,
      skills: topImportantGaps.map(s => s.name),
      priority: 'important',
      action: 'improve'
    });
  }

  // Learning path recommendation
  if (criticalGaps.length > 0) {
    recommendations.push({
      type: 'guidance',
      message: `📚 Learning Path: Focus on ${criticalGaps[0].name} first, then ${criticalGaps.length > 1 ? criticalGaps[1].name : 'the remaining skills'}`,
      priority: 'medium',
      action: 'plan'
    });
  }

  return recommendations;
};

// GET /api/career-path/recommendations - MAIN ENDPOINT
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    
    if (!req.user || !req.user._id) {
      console.error('User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user._id;

    const user = await User.findById(userId).select('skills firstName lastName email').lean();
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      skillsCount: user.skills ? user.skills.length : 0
    });

    // Handle case where skills might not exist or is empty
    const userSkills = user.skills && Array.isArray(user.skills) 
      ? user.skills.map(skill => ({
          name: skill.name || 'Unknown',
          level: skill.level || 0,
          category: skill.category || 'OTHER'
        }))
      : [];


    if (userSkills.length === 0) {
      return res.json({
        message: 'No skills found. Please add your skills to get career recommendations.',
        careerPaths: [],
        topMatch: null,
        userSkillsCount: 0,
        qualifiedPathsCount: 0,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
      });
    }

    const rankedPaths = careerPathsData.map(path => {
      const matchResult = calculateMatch(path, userSkills);
      const recommendations = generateRecommendations(
        path, 
        matchResult.skillDetails, 
        matchResult.matchPercentage,
        matchResult.criticalSkillsMet,
        matchResult.totalCriticalSkills
      );

      // Determine if user qualifies (75%+ match AND all critical skills met)
      const qualifies = matchResult.matchPercentage >= 75 && matchResult.criticalSkillsMet === matchResult.totalCriticalSkills;

      return {
        ...path,
        matchPercentage: matchResult.matchPercentage,
        skillDetails: matchResult.skillDetails,
        recommendations,
        criticalSkillsMet: matchResult.criticalSkillsMet,
        totalCriticalSkills: matchResult.totalCriticalSkills,
        criticalSkillRatio: matchResult.criticalSkillRatio,
        qualifies: qualifies,
        meetsThreshold: qualifies,
        readinessLevel: matchResult.matchPercentage >= 90 && matchResult.criticalSkillsMet === matchResult.totalCriticalSkills ? 'excellent'
                       : matchResult.matchPercentage >= 80 && matchResult.criticalSkillsMet === matchResult.totalCriticalSkills ? 'ready'
                       : matchResult.matchPercentage >= 75 ? 'qualified'
                       : matchResult.matchPercentage >= 60 ? 'developing'
                       : 'beginner',
      };
    })
    // Sort by match percentage (highest first)
    .sort((a, b) => {
      // First sort by match percentage (highest first)
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // If same match percentage, prioritize paths where all critical skills are met
      if (a.criticalSkillsMet === a.totalCriticalSkills && b.criticalSkillsMet !== b.totalCriticalSkills) {
        return -1;
      }
      if (b.criticalSkillsMet === b.totalCriticalSkills && a.criticalSkillsMet !== a.totalCriticalSkills) {
        return 1;
      }
      return b.criticalSkillsMet - a.criticalSkillsMet;
    });

    const topMatch = rankedPaths.length > 0 ? rankedPaths[0] : null;
    const qualifiedPathsCount = rankedPaths.filter(path => path.qualifies).length;

    rankedPaths.forEach((path, index) => {
      const status = path.qualifies ? 'QUALIFIED' : 'NEEDS WORK';
    });


    const response = {
      message: qualifiedPathsCount > 0 
        ? `Found ${qualifiedPathsCount} career paths where you meet all critical requirements!` 
        : `Found ${rankedPaths.length} potential career paths. Focus on critical skills to unlock more opportunities.`,
      careerPaths: rankedPaths,
      topMatch: topMatch,
      userSkillsCount: userSkills.length,
      qualifiedPathsCount: qualifiedPathsCount,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      threshold: 75,
      summary: {
        totalPaths: careerPathsData.length,
        userSkills: userSkills.length,
        bestMatch: topMatch ? `${topMatch.title} (${topMatch.matchPercentage}%)` : 'None',
        readiness: topMatch ? topMatch.readinessLevel : 'unknown',
        qualifiedPaths: qualifiedPathsCount
      }
    };

    console.log('Successfully generated career recommendations');
    res.json(response);

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate career recommendations',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/all-paths', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching all career paths');
    res.json({
      success: true,
      careerPaths: careerPathsData.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description,
        icon: path.icon,
        averageSalary: path.averageSalary,
        demandLevel: path.demandLevel,
        growthRate: path.growthRate,
        experienceLevel: path.experienceLevel,
        industries: path.industries,
        requiredSkillsCount: path.requiredSkills.length,
        criticalSkillsCount: path.requiredSkills.filter(s => s.importance === 'critical').length
      })),
      count: careerPathsData.length
    });
  } catch (error) {
    console.error('Error fetching career paths:', error);
    res.status(500).json({ 
      error: 'Failed to fetch career paths',
      details: error.message 
    });
  }
});

// GET /api/career-path/debug-user - Debug endpoint to check user data
router.get('/debug-user', authMiddleware, async (req, res) => {
  try {    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user._id;
    console.log('Debugging user ID:', userId);

    const user = await User.findById(userId)
      .select('skills firstName lastName email createdAt updatedAt')
      .lean();
    
    if (!user) {
      console.error('User not found during debug');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Debug user data retrieved successfully');

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        skills: user.skills || [],
        skillsCount: user.skills ? user.skills.length : 0,
        skillCategories: user.skills ? [...new Set(user.skills.map(s => s.category || 'UNCATEGORIZED'))] : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      database: {
        connected: true,
        userFound: true
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// GET /api/career-path/test-db - Test database connection
router.get('/test-db', authMiddleware, async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test database connection by counting users
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      database: {
        connected: true,
        userCount: userCount,
        status: 'healthy'
      },
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      database: {
        connected: false,
        error: error.message
      },
      message: 'Database connection failed'
    });
  }
});

export default router;