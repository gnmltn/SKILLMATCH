import React, { useState, useEffect } from 'react';
import DashboardNav from '../components/dashboardNav';
import { 
  TrendingUp, 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Trash2,
  User,
  X,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import { getSkillIcon } from '../utils/skillIcons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get(`${API_BASE_URL}/settings/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUserData(userResponse.data);

        // Fetch profile data for skills
        const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch suggestions data
        const suggestionsResponse = await axios.get(`${API_BASE_URL}/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch career path data
        const careerPathResponse = await axios.get(`${API_BASE_URL}/career-path/recommendations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Transform the data for dashboard
        const userSkills = profileResponse.data.skills || [];
        const suggestions = suggestionsResponse.data.recommendations || [];
        const careerPaths = careerPathResponse.data.careerPaths || [];

        // Calculate summary stats
        const skillsMastered = userSkills.filter(skill => skill.level >= 80).length;
        const skillsInProgress = userSkills.filter(skill => skill.level >= 50 && skill.level < 80).length;
        const skillGaps = suggestions.length;
        const projects = profileResponse.data.projectHistory?.length || 0;

        // Get top 3 career matches (sorted by matchPercentage)
        const topCareerMatches = careerPaths
          .slice(0, 3)
          .map(career => ({
            id: career.id,
            title: career.title,
            emoji: career.icon || '💼',
            subtitle: getCareerSubtitle(career.matchPercentage),
            matchScore: career.matchPercentage,
            color: getMatchScoreColor(career.matchPercentage)
          }));

        // Get recent activity (mock for now, you can replace with real activity data)
        const recentActivity = [
          { 
            title: 'Profile Updated', 
            desc: 'Your skills profile has been updated', 
            time: 'Just now', 
            icon: TrendingUp 
          },
          { 
            title: 'Skills Added', 
            desc: `Added ${userSkills.length} skills to your profile`, 
            time: 'Recently', 
            icon: Users 
          },
          { 
            title: 'Career Matches', 
            desc: `Found ${topCareerMatches.length} career path matches`, 
            time: 'Today', 
            icon: Briefcase 
          },
        ];

        setDashboardData({
          summary: {
            skillsMastered,
            skillsInProgress,
            skillGaps,
            projects
          },
          skills: userSkills.slice(0, 8).map(skill => ({
            skillId: skill._id,
            skillName: skill.name,
            proficiency: skill.level,
            category: skill.category
          })),
          recommendations: suggestions.slice(0, 3), // Show only top 3 recommendations
          careerMatches: topCareerMatches,
          recentActivity
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Fallback to empty data structure
        setDashboardData({
          summary: {
            skillsMastered: 0,
            skillsInProgress: 0,
            skillGaps: 0,
            projects: 0
          },
          skills: [],
          recommendations: [],
          careerMatches: [],
          recentActivity: []
        });
        
        if (err.response?.status !== 401) {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Helper function to get career subtitle based on match percentage
  const getCareerSubtitle = (matchPercentage) => {
    if (matchPercentage >= 80) return 'Best match';
    if (matchPercentage >= 60) return 'Good match';
    if (matchPercentage >= 40) return 'Potential match';
    return 'Developing match';
  };

  const getProficiencyColor = (proficiency) => {
    if (proficiency >= 80) return 'bg-[#10B981]';
    if (proficiency >= 60) return 'bg-[#14B8A6]';
    if (proficiency >= 40) return 'bg-[#F59E0B]';
    return 'bg-[#64748B]';
  };

  const getProficiencyLabel = (proficiency) => {
    if (proficiency >= 80) return 'Expert';
    if (proficiency >= 60) return 'Advanced';
    if (proficiency >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-teal-600';
    return 'text-orange-600';
  };

  const getMatchScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-teal-500';
    return 'bg-orange-500';
  };

  const handleLearnMore = (recommendation) => {
    navigate('/suggestions');
  };

  const handleExploreCareers = () => {
    navigate('/career-paths');
  };

  const handleViewAllSkills = () => {
    navigate('/profile');
  };

  const handleViewAllRecommendations = () => {
    navigate('/suggestions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, skills, recommendations, careerMatches, recentActivity } = dashboardData;
  const { skillsMastered, skillsInProgress, skillGaps, projects } = summary;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        userName={userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
        user={userData}
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {userData?.firstName || 'User'}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's your skill development overview</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            label="Skills Mastered" 
            value={skillsMastered} 
            icon={TrendingUp} 
            color="text-success"
            bgColor="bg-success/10"
            onClick={() => navigate('/profile')}
          />
          <SummaryCard 
            label="In Progress" 
            value={skillsInProgress} 
            icon={Users} 
            color="text-warning"
            bgColor="bg-warning/10"
            onClick={() => navigate('/profile')}
          />
          <SummaryCard 
            label="Skill Gaps" 
            value={skillGaps} 
            icon={X} 
            color="text-primary"
            bgColor="bg-primary/10"
            onClick={() => navigate('/suggestions')}
          />
          <SummaryCard 
            label="Projects" 
            value={projects} 
            icon={Briefcase} 
            color="text-secondary"
            bgColor="bg-secondary/10"
            onClick={() => navigate('/roles')}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Skill Proficiency Map</h2>
                <p className="text-sm text-muted-foreground">Visual representation of your skill levels across different categories</p>
              </div>
            </div>

            {skills.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-4">
                  No skills added yet. Start building your skills profile!
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-[12px] hover:bg-success/20 border border-success/20 transition-colors"
                >
                  <Plus size={16} /> Add Your First Skill
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {skills.map((skill) => (
                    <div key={skill.skillId} className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getSkillIcon(skill.skillName) ? (
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                              <img 
                                src={getSkillIcon(skill.skillName)} 
                                alt={skill.skillName}
                                className="w-8 h-8"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : null}
                          <span className="text-sm text-card-foreground font-medium">{skill.skillName}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {skill.category || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="hidden sm:inline font-medium">{getProficiencyLabel(skill.proficiency)}</span>
                          <span className="font-semibold">{skill.proficiency}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProficiencyColor(skill.proficiency)}`} 
                          style={{ width: `${skill.proficiency}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button 
                    onClick={handleViewAllSkills}
                    className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-card-foreground border border-border rounded-[12px] hover:bg-muted transition-colors"
                  >
                    View All Skills <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">Your latest achievements</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {recentActivity.map((r, idx) => {
                const IconComponent = r.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center flex-shrink-0">
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-card-foreground">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <section className="mt-8 bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">Recommended for You</h3>
                <p className="text-sm text-muted-foreground">Personalized suggestions to enhance your skill set</p>
              </div>
            </div>
            <button 
              onClick={handleViewAllRecommendations}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm text-card-foreground border border-border rounded-[12px] hover:bg-muted transition-colors"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-4">
                Great job! No skill gaps detected. Keep building your expertise.
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-[12px] hover:bg-success/20 border border-success/20 transition-colors"
              >
                <Plus size={16} /> Add More Skills
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((recommendation, index) => (
                <div key={recommendation.skillName || index} className="bg-muted/30 rounded-xl border border-border p-6 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    {getSkillIcon(recommendation.skillName) ? (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2 border-primary/30 bg-card">
                        <img 
                          src={getSkillIcon(recommendation.skillName)} 
                          alt={recommendation.skillName}
                          className="w-10 h-10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className={`w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary hidden items-center justify-center`}
                        >
                          <TrendingUp size={20} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <TrendingUp size={20} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-card-foreground">{recommendation.skillName}</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {recommendation.priority || 'Skill Gap'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{recommendation.reason}</p>
                  
                  <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                    <p className="text-sm font-medium text-card-foreground mb-2">Suggested Action:</p>
                    <p className="text-sm text-muted-foreground">{recommendation.suggestedAction}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleLearnMore(recommendation)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-card-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Learn More <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 bg-[#1e293b] rounded-2xl border-2 border-primary/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">Your Career Path Match</h3>
                <p className="text-sm text-muted-foreground">Discover careers that align with your skills</p>
              </div>
            </div>
            <button 
              onClick={handleExploreCareers}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[12px] hover:bg-primary/90 transition-colors"
            >
              Explore Careers <ChevronRight size={16} />
            </button>
          </div>

          {careerMatches.length === 0 ? (
            <div className="text-center py-8 bg-card/50 rounded-xl border border-border">
              <div className="text-sm text-muted-foreground mb-4">
                Add more skills to discover your ideal career paths
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-[12px] hover:bg-success/20 border border-success/20 transition-colors"
              >
                <Plus size={16} /> Build Your Skills Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careerMatches.map((career) => (
                <div key={career.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{career.emoji}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-card-foreground">{career.title}</h4>
                      <p className="text-sm text-muted-foreground">{career.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">Match Score</span>
                      <span className={`text-lg font-bold ${getMatchScoreColor(career.matchScore)}`}>
                        {career.matchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getMatchScoreBg(career.matchScore)}`}
                        style={{ width: `${career.matchScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, bgColor, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-card rounded-xl border border-border p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 ${bgColor}`}
    >
      <div>
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
        <div className="text-3xl font-bold text-card-foreground">{value}</div>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} ${color} grid place-items-center`}>
        <Icon size={20} />
      </div>
    </div>
  );
}