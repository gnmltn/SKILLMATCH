import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/dashboardNav.jsx';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Color helpers with dark mode support
const getMatchColor = (percentage, isDarkMode) => {
  if (percentage >= 80) return isDarkMode ? 'text-green-400' : 'text-green-600';
  if (percentage >= 60) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
  if (percentage >= 40) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
  return isDarkMode ? 'text-gray-400' : 'text-gray-500';
};

const getMatchBgColor = (percentage, isDarkMode) => {
  if (percentage >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-500';
  if (percentage >= 60) return isDarkMode ? 'bg-blue-500' : 'bg-blue-500';
  if (percentage >= 40) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
  return isDarkMode ? 'bg-gray-600' : 'bg-gray-300';
};

const getImportanceBadgeColor = (importance, isDarkMode) => {
  switch (importance) {
    case 'critical':
      return isDarkMode 
        ? 'bg-red-900/30 text-red-300 border border-red-800' 
        : 'bg-red-100 text-red-800 border border-red-200';
    case 'important':
      return isDarkMode 
        ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
        : 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'nice-to-have':
      return isDarkMode 
        ? 'bg-gray-800 text-gray-300 border border-gray-700' 
        : 'bg-gray-100 text-gray-800 border border-gray-200';
    default:
      return isDarkMode 
        ? 'bg-gray-800 text-gray-300' 
        : 'bg-gray-100 text-gray-800';
  }
};

const getImportanceLabel = (importance) => {
  switch (importance) {
    case 'critical':
      return 'Critical';
    case 'important':
      return 'Important';
    case 'nice-to-have':
      return 'Nice to have';
    default:
      return importance;
  }
};

const getDemandBadge = (demandLevel, isDarkMode) => {
  switch (demandLevel) {
    case 'high':
      return isDarkMode 
        ? 'bg-green-900/30 text-green-300 border border-green-800' 
        : 'bg-green-100 text-green-800 border border-green-200';
    case 'medium':
      return isDarkMode 
        ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
        : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'low':
      return isDarkMode 
        ? 'bg-red-900/30 text-red-300 border border-red-800' 
        : 'bg-red-100 text-red-800 border border-red-200';
    default:
      return isDarkMode 
        ? 'bg-gray-800 text-gray-300' 
        : 'bg-gray-100 text-gray-800';
  }
};

const getQualifiedBadge = (qualifies, isDarkMode) => {
  return qualifies 
    ? isDarkMode 
      ? 'bg-green-900/30 text-green-300 border border-green-800' 
      : 'bg-green-100 text-green-800 border border-green-200'
    : isDarkMode 
      ? 'bg-gray-800 text-gray-300 border border-gray-700' 
      : 'bg-gray-100 text-gray-800 border border-gray-200';
};

// NEW: Color coding for skill proficiency
const getProficiencyColor = (userProficiency, isDarkMode) => {
  if (userProficiency >= 75) return isDarkMode ? 'text-green-400' : 'text-green-600';
  if (userProficiency >= 50) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
  if (userProficiency >= 25) return isDarkMode ? 'text-orange-400' : 'text-orange-600';
  return isDarkMode ? 'text-red-400' : 'text-red-600';
};

const getProficiencyBgColor = (userProficiency, isDarkMode) => {
  if (userProficiency >= 75) return isDarkMode ? 'bg-green-500' : 'bg-green-500';
  if (userProficiency >= 50) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
  if (userProficiency >= 25) return isDarkMode ? 'bg-orange-500' : 'bg-orange-500';
  return isDarkMode ? 'bg-red-500' : 'bg-red-500';
};

const getProficiencyBadgeColor = (userProficiency, isDarkMode) => {
  if (userProficiency >= 75) return isDarkMode 
    ? 'bg-green-900/30 text-green-300 border border-green-800' 
    : 'bg-green-100 text-green-800 border border-green-200';
  if (userProficiency >= 50) return isDarkMode 
    ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
    : 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  if (userProficiency >= 25) return isDarkMode 
    ? 'bg-orange-900/30 text-orange-300 border border-orange-800' 
    : 'bg-orange-100 text-orange-800 border border-orange-200';
  return isDarkMode 
    ? 'bg-red-900/30 text-red-300 border border-red-800' 
    : 'bg-red-100 text-red-800 border border-red-200';
};

const getProficiencyLabel = (userProficiency) => {
  if (userProficiency >= 75) return 'Proficient';
  if (userProficiency >= 50) return 'Intermediate';
  if (userProficiency >= 25) return 'Developing';
  return 'Beginner';
};

export default function CareerPath() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [rankedPaths, setRankedPaths] = useState([]);
  const [topMatch, setTopMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Dark mode class names
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-background';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-foreground';
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-muted-foreground';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const successBgClass = isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
  const successTextClass = isDarkMode ? 'text-green-300' : 'text-green-800';
  const infoBgClass = isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200';
  const infoTextClass = isDarkMode ? 'text-blue-300' : 'text-blue-800';
  const highlightBgClass = isDarkMode 
    ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
    : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200';

  // Fetch user profile data for navbar
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/settings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch user data and career recommendations
  useEffect(() => {
    const fetchUserDataAndRecommendations = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/');
          return;
        }

        // Fetch user profile first for navbar
        await fetchUserProfile();

        // Fetch career recommendations from API - FIXED ENDPOINT
        try {
          const careerResponse = await axios.get(`${API_BASE_URL}/career-path/recommendations`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          });

          console.log('Career response:', careerResponse.data); // Debug log

          if (careerResponse.data.careerPaths && careerResponse.data.careerPaths.length > 0) {
            setRankedPaths(careerResponse.data.careerPaths);
            setTopMatch(careerResponse.data.topMatch);
            setUserSkills(careerResponse.data.userSkillsCount || 0);
          } else {
            setApiError('No career recommendations available');
            toast.info('Add more skills to get better career recommendations');
          }

        } catch (careerError) {
          console.error('Career API error:', careerError);
          setApiError(careerError.response?.data?.error || careerError.message);
          
          if (careerError.response?.status === 401) {
            toast.error('Authentication failed. Please login again.');
            navigate('/');
            return;
          }
          
          if (careerError.response?.status === 404) {
            toast.info('No skills found. Please add your skills first.');
          } else {
            toast.error('Failed to load career recommendations');
          }
        }
      } catch (err) {
        console.error('General error:', err);
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndRecommendations();
  }, [navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={mutedTextClass}>Analyzing your skills and career matches...</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Checking your skills database</p>
        </div>
      </div>
    );
  }

  // Show error state or no data state
  if (apiError || !topMatch) {
    const isNetworkError = apiError?.includes('Network Error') || apiError?.includes('ERR_NETWORK') || apiError?.includes('Connection refused');
    
    return (
      <div className={`min-h-screen ${bgClass}`}>
        <DashboardNav 
          userName={userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
          user={userData}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Briefcase className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h2 className={`text-2xl font-bold ${textClass} mb-2`}>
              {isNetworkError ? 'Server Connection Issue' : 'Career Recommendations'}
            </h2>
            <p className={`${mutedTextClass} mb-6 max-w-md mx-auto`}>
              {isNetworkError 
                ? "Unable to connect to the server. Please make sure your backend server is running on port 5000."
                : apiError === 'No skills found. Please add your skills to get career recommendations.' 
                  ? "You haven't added any skills yet. Add your skills to discover career paths that match your expertise."
                  : apiError || "We found some career paths, but none meet the 75% threshold yet. Keep improving your skills!"
              }
            </p>
            
            <div className="space-y-4">
              {isNetworkError ? (
                <>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors block mx-auto"
                  >
                    Retry Connection
                  </button>
                  <p className={`text-sm ${mutedTextClass}`}>
                    Make sure your backend server is running with: <code>npm run server</code>
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors block mx-auto"
                  >
                    {userSkills.length === 0 ? 'Add Your First Skill' : 'Manage Your Skills'}
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white px-6 py-3 rounded-lg transition-colors block mx-auto`}
                  >
                    Refresh Recommendations
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <DashboardNav 
        userName={userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
        user={userData}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-primary'}`} />
            <h1 className={`text-3xl font-bold ${textClass}`}>Career Path Recommendations</h1>
          </div>
          <p className={mutedTextClass}>
            Personalized career opportunities based on your {userSkills.length} skills
          </p>
          
          {/* Success Message */}
          <div className={`mt-4 p-4 border rounded-lg ${
            topMatch.qualifies ? successBgClass : infoBgClass
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${
                topMatch.qualifies 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  topMatch.qualifies ? successTextClass : infoTextClass
                }`}>
                  {topMatch.qualifies 
                    ? `✅ You qualify for ${topMatch.title}! You have all required skills at 75%+ proficiency.`
                    : `📊 Found ${rankedPaths.length} career paths. ${rankedPaths.filter(p => p.qualifies).length} meet the 75% proficiency requirement.`
                  }
                </p>
                <p className={`text-xs ${
                  topMatch.qualifies 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                    : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                } mt-1`}>
                  Using your {userSkills.length} skills for personalized recommendations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Match Highlight Card */}
        <section className={`mb-8 rounded-2xl border-2 p-6 ${
          topMatch.qualifies 
            ? isDarkMode ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : highlightBgClass
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className={`h-6 w-6 ${
                topMatch.qualifies 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h2 className={`text-xl font-semibold ${textClass}`}>
                  {topMatch.qualifies ? 'Best Match - Qualified!' : 'Top Potential Career'}
                </h2>
                <p className={mutedTextClass}>
                  {topMatch.qualifies 
                    ? 'You meet all the proficiency requirements for this role'
                    : 'Based on your current skill set and proficiency levels'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getMatchColor(topMatch.matchPercentage, isDarkMode)}`}>
                {topMatch.matchPercentage}%
              </div>
              <p className={mutedTextClass}>Match Score</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getQualifiedBadge(topMatch.qualifies, isDarkMode)}`}>
                {topMatch.qualifies ? 'Qualified ✓' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Career Overview */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">{topMatch.icon}</div>
            <div className="flex-1">
              <h3 className={`text-2xl font-bold ${textClass}`}>{topMatch.title}</h3>
              <p className={`${mutedTextClass} mb-3`}>{topMatch.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <TrendingUp size={14} />
                  {topMatch.growthRate}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                } border`}>
                  {topMatch.averageSalary}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getDemandBadge(topMatch.demandLevel, isDarkMode)}`}>
                  {topMatch.demandLevel === 'high' ? 'High Demand' : 'Medium Demand'}
                </span>
              </div>
            </div>
          </div>

          {/* Skill Match Summary */}
          {topMatch.criticalSkillsMet !== undefined && (
            <div className={`rounded-lg border p-4 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold ${textClass} mb-2`}>Skill Proficiency Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${textClass}`}>{topMatch.criticalSkillsMet}/{topMatch.totalCriticalSkills}</div>
                  <div className={mutedTextClass}>Critical Skills at 75%+</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textClass}`}>{topMatch.matchPercentage}%</div>
                  <div className={mutedTextClass}>Overall Match</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    topMatch.qualifies 
                      ? isDarkMode ? 'text-green-400' : 'text-green-600'
                      : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {topMatch.qualifies ? 'Qualified' : 'Progress'}
                  </div>
                  <div className={mutedTextClass}>Status</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textClass} capitalize`}>{topMatch.readinessLevel}</div>
                  <div className={mutedTextClass}>Readiness</div>
                </div>
              </div>
            </div>
          )}

          {/* Skill Analysis Grid */}
          <div>
            <h4 className={`text-lg font-semibold ${textClass} mb-4`}>Skill Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMatch.skillDetails && topMatch.skillDetails.map((skill, index) => (
                <div key={index} className={`rounded-lg border p-4 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${textClass}`}>{skill.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getImportanceBadgeColor(skill.importance, isDarkMode)}`}>
                        {getImportanceLabel(skill.importance)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getProficiencyBadgeColor(skill.userProficiency, isDarkMode)}`}>
                        {getProficiencyLabel(skill.userProficiency)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={mutedTextClass}>
                        Your Level: <span className={`font-medium ${getProficiencyColor(skill.userProficiency, isDarkMode)}`}>
                          {skill.userProficiency}%
                        </span>
                      </span>
                      {skill.minProficiency && (
                        <span className={mutedTextClass}>
                          Required: {skill.minProficiency}%
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-3 rounded-full ${getProficiencyBgColor(skill.userProficiency, isDarkMode)}`}
                        style={{ width: `${Math.min(skill.userProficiency, 100)}%` }}
                      />
                    </div>

                    {/* Status indicator */}
                    <div className="flex justify-between text-xs">
                      <span className={mutedTextClass}>0%</span>
                      <span className={`font-medium ${
                        skill.userProficiency >= skill.minProficiency 
                          ? isDarkMode ? 'text-green-400' : 'text-green-600'
                          : isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {skill.userProficiency >= skill.minProficiency ? (
                          '✓ Meets requirement'
                        ) : (
                          `Requires ${skill.minProficiency - skill.userProficiency}% more`
                        )}
                      </span>
                      <span className={mutedTextClass}>100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Career Paths Grid */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>
              {rankedPaths.filter(p => p.qualifies).length > 0 ? 'Qualified Career Paths' : 'All Career Paths'}
            </h2>
            <p className={mutedTextClass}>
              {rankedPaths.filter(p => p.qualifies).length > 0 
                ? `You qualify for ${rankedPaths.filter(p => p.qualifies).length} career paths based on your 75%+ proficient skills`
                : 'Explore potential career opportunities and see how your skills align'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rankedPaths.map((career) => (
              <div key={career.id} className={`rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${
                isDarkMode 
                  ? career.qualifies 
                    ? 'bg-gray-800 border-green-700 hover:shadow-green-900/20' 
                    : 'bg-gray-800 border-gray-700 hover:shadow-gray-900'
                  : career.qualifies
                    ? 'bg-white border-green-200 hover:shadow-green-200'
                    : 'bg-white border-gray-200 hover:shadow-gray-200'
              }`}>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{career.icon}</div>
                    <div>
                      <h3 className={`text-lg font-semibold ${textClass}`}>{career.title}</h3>
                      <p className={mutedTextClass}>{career.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getMatchColor(career.matchPercentage, isDarkMode)}`}>
                      {career.matchPercentage}%
                    </div>
                    <p className={mutedTextClass}>Match</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getQualifiedBadge(career.qualifies, isDarkMode)}`}>
                      {career.qualifies ? 'Qualified ✓' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Market Data Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <TrendingUp size={12} />
                    {career.growthRate}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  } border`}>
                    {career.averageSalary}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDemandBadge(career.demandLevel, isDarkMode)}`}>
                    {career.demandLevel === 'high' ? 'High Demand' : 'Medium Demand'}
                  </span>
                </div>

                {/* Overall Match Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${textClass}`}>Overall Match</span>
                    <span className={mutedTextClass}>{career.matchPercentage}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full ${getMatchBgColor(career.matchPercentage, isDarkMode)}`}
                      style={{ width: `${career.matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Critical Skills Progress */}
                {career.criticalSkillsMet !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${textClass}`}>
                        Critical Skills at 75%+: {career.criticalSkillsMet}/{career.totalCriticalSkills}
                      </span>
                      <span className={mutedTextClass}>
                        {Math.round((career.criticalSkillsMet / career.totalCriticalSkills) * 100)}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${
                          career.qualifies 
                            ? isDarkMode ? 'bg-green-500' : 'bg-green-500'
                            : isDarkMode ? 'bg-red-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(career.criticalSkillsMet / career.totalCriticalSkills) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Required Skills Preview */}
                <div className="mb-4">
                  <p className={`text-sm font-medium ${textClass} mb-2`}>Key Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {career.skillDetails && career.skillDetails.slice(0, 6).map((skill, index) => (
                      <span 
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          skill.userProficiency >= 75
                            ? isDarkMode 
                              ? 'bg-green-900/30 text-green-300 border border-green-800' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                            : isDarkMode
                              ? 'border-gray-600 text-gray-400 bg-gray-800/50'
                              : 'border-gray-300 text-gray-700 bg-gray-50'
                        } border`}
                      >
                        {skill.name} {skill.userProficiency >= 75 ? '✓' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Improvement Suggestion */}
                {!career.qualifies && career.skillDetails && (
                  <div className={`rounded-lg border p-3 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        Focus on: {career.skillDetails
                          .filter(s => s.userProficiency < 75 && s.importance === 'critical')
                          .slice(0, 2)
                          .map(s => s.name)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps Card */}
        <section className={`rounded-2xl border p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${textClass}`}>Next Steps</h2>
          </div>
          <p className={`${mutedTextClass} mb-6`}>
            Ready to advance your career? Here's what you can do
          </p>

          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1</span>
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>Master 75% Proficiency</h4>
                <p className={mutedTextClass}>
                  Focus on reaching 75% proficiency in critical skills for your target roles to qualify for more career paths.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2</span>
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>Build Your Portfolio</h4>
                <p className={mutedTextClass}>
                  Create projects that showcase your skills in real-world scenarios, especially for roles you qualify for.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>3</span>
              </div>
              <div>
                <h4 className={`font-semibold ${textClass}`}>Apply for Qualified Roles</h4>
                <p className={mutedTextClass}>
                  Start applying for roles where you meet the 75% proficiency requirements and continue improving other skills.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}