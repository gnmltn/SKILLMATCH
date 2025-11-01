import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  TrendingUp, 
  BookOpen, 
  ExternalLink, 
  Video, 
  FileText,
  X,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/dashboardNav.jsx';
import { useTheme } from '../contexts/ThemeContext';
import { getSkillIcon } from '../utils/skillIcons';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const proTips = [
  {
    icon: TrendingUp,
    title: 'Practice Consistently',
    description: 'Dedicate 30 minutes daily to skill development for best results'
  },
  {
    icon: BookOpen,
    title: 'Apply in Real Projects',
    description: 'Join group projects to apply new skills in practical scenarios'
  },
  {
    icon: Lightbulb,
    title: 'Track Your Progress',
    description: 'Regular self-assessment helps identify areas for improvement'
  },
  {
    icon: Video,
    title: 'Learn From Experts',
    description: 'Follow industry leaders and join learning communities'
  }
];

export default function Suggestions() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [hiddenRecommendations, setHiddenRecommendations] = useState(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    const fetchUserDataAndRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/');
          return;
        }

        const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUserData(profileResponse.data.user);
        setUserSkills(profileResponse.data.skills || []);

        const suggestionsResponse = await axios.get(`${API_BASE_URL}/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (suggestionsResponse.data.success) {
          setRecommendations(suggestionsResponse.data.recommendations || []);
        } else {
          throw new Error('Failed to fetch recommendations');
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load recommendations');
        setRecommendations([]);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndRecommendations();
  }, [navigate]);

  const visibleRecommendations = recommendations.filter(
    rec => !hiddenRecommendations.has(rec.skillName)
  );

  const totalResources = visibleRecommendations.reduce(
    (total, rec) => total + (rec.resourceLinks?.length || 0), 0
  );

  const highPriorityCount = visibleRecommendations.filter(rec => rec.priority === 'HIGH').length;

  const handleNotInterested = (skillName) => {
    setHiddenRecommendations(prev => new Set([...prev, skillName]));
    toast.info(`Hidden recommendation for ${skillName}`, {
      description: 'You can adjust your preferences in Settings'
    });
  };

  const handleStartLearning = (skillName) => {
    toast.success(`Starting to learn ${skillName}`, {
      description: 'Great choice! We\'ll track your progress'
    });
    // Add logic to start learning tracking here
  };

  const handleAddToGoals = (skillName) => {
    toast.success(`Added ${skillName} to your goals`, {
      description: 'You can view your goals in the Dashboard'
    });
    // Add logic to add to goals here
  };

  const handleViewResource = (title, url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`Opening: ${title}`, {
      description: 'Resource opened in new tab'
    });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen size={16} className="text-primary" />;
      case 'video':
        return <Video size={16} className="text-secondary" />;
      case 'document':
        return <FileText size={16} className="text-success" />;
      default:
        return <BookOpen size={16} className="text-primary" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Target size={16} className="text-red-600" />;
      case 'MEDIUM':
        return <BarChart3 size={16} className="text-yellow-600" />;
      case 'LOW':
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return <Lightbulb size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        userName={userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
        user={userData}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Recommendations for You
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Based on your current skills and project roles, we've identified these growth opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Active Recommendations</p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{visibleRecommendations.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Lightbulb size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp size={16} className="mr-1" />
                <span>Based on your skill profile</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Priority Level</p>
                  <p className="text-4xl font-bold text-red-900 dark:text-red-100">High</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="mr-1" />
                <span>{highPriorityCount} high priority items</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Learning Resources</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">{totalResources}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                <FileText size={16} className="mr-1" />
                <span>Curated learning materials</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {visibleRecommendations.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Lightbulb size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add some skills to your profile to get personalized recommendations!
              </p>
            </div>
          ) : (
            visibleRecommendations.map((rec, index) => (
              <div key={`${rec.skillName}-${index}`} className=" bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="pt-6 px-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getSkillIcon(rec.skillName) ? (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg border-2 ${
                          isDarkMode ? 'border-primary/30 bg-card' : 'border-blue-200 bg-white'
                        }`}>
                          <img 
                            src={getSkillIcon(rec.skillName)} 
                            alt={rec.skillName}
                            className="w-10 h-10"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary hidden items-center justify-center"
                          >
                            <Lightbulb size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                          <Lightbulb size={24} className="text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">{rec.skillName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                            {getPriorityIcon(rec.priority)}
                            {rec.priority} Priority
                          </span>
                          {rec.currentLevel > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                              Current: {rec.currentLevel}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotInterested(rec.skillName)}
                      className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Not Interested
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h4 className="font-semibold text-card-foreground">Why This Matters</h4>
                      </div>
                      <p className="text-muted-foreground pl-3">{rec.reason}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-secondary rounded-full"></div>
                        <h4 className="font-semibold text-card-foreground">Suggested Action</h4>
                      </div>
                      <p className="text-muted-foreground pl-3">{rec.suggestedAction}</p>
                    </div>
                  </div>

                  {rec.resourceLinks && rec.resourceLinks.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-card-foreground mb-4">Recommended Learning Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rec.resourceLinks.map((resource, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border">
                            {getResourceIcon(resource.type)}
                            <div className="flex-1">
                              <p className="font-medium text-card-foreground">{resource.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                            </div>
                            <button
                              onClick={() => handleViewResource(resource.title, resource.url)}
                              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                              View
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Lightbulb size={20} className="text-warning" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">Pro Tips for Skill Development</h3>
          </div>
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <tip.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground mb-1">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}