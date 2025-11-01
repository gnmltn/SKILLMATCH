import DashboardNav from '../components/dashboardNav';
import {
  Edit3,
  Plus,
  ChevronRight,
  Target,
  Briefcase,
  TrendingUp,
  Award,
  Camera,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { skillAssessmentData } from '../utils/skillAssessmentData';
import { getSkillIcon } from '../utils/skillIcons';

const API_BASE_URL = 'http://localhost:5000/api';
const SUGGESTIONS_URL = `${API_BASE_URL}/suggestions`;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default function Profile() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('skills');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projectHistory, setProjectHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('PROGRAMMING');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [assessmentData, setAssessmentData] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No authentication token found');
          navigate('/');
          return;
        }

        // Fetch profile data
        const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(profileResponse.data.user || {});
        setSkills(profileResponse.data.skills || []);
        setProjectHistory(profileResponse.data.projectHistory || []);

        // Fetch suggestions data
        const suggestionsResponse = await axios.get(SUGGESTIONS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(suggestionsResponse.data.recommendations || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message ||
            'Failed to load profile or suggestions data'
        );
        toast.error('Failed to load data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleEditProfile = async (editedData) => {
  try {
    const token = localStorage.getItem('token');

    // Create a single object with all the data
    const updateData = {
      firstName: editedData.firstName,
      lastName: editedData.lastName,
      email: editedData.email,
      course: editedData.course,
      yearLevel: editedData.yearLevel,
    };

    // If there's a new profile picture, include it in the same request
    if (editedData.profilePicture && editedData.profilePicture !== userData?.profilePicture) {
      updateData.profilePicture = editedData.profilePicture;
    }

    // Make a single API call to update everything
    const response = await axios.patch(
      `${API_BASE_URL}/profile/user`,
      updateData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update local state with the response
    setUserData(response.data.user || {});

    // Refresh the entire profile data
    const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setUserData(profileResponse.data.user || {});
    setSkills(profileResponse.data.skills || []);
    setProjectHistory(profileResponse.data.projectHistory || []);

    toast.success('Profile updated successfully');
    setShowEditProfile(false);
  } catch (err) {
    console.error('Error updating profile:', err);
    
    // More specific error messages
    if (err.response?.data?.details) {
      // Validation errors from backend
      toast.error(`Validation error: ${err.response.data.details.join(', ')}`);
    } else {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  }
};

  const handleInitiateSkillAssessment = () => {
    if (!selectedSkill) {
      toast.error('Please select a skill');
      return;
    }

    const skillActivities = skillAssessmentData[selectedCategory]?.[selectedSkill];
    if (!skillActivities) {
      toast.error('No assessment data found for this skill');
      return;
    }

    setAssessmentData({
      category: selectedCategory,
      skill: selectedSkill,
      activities: {
        BEGINNER: skillActivities.BEGINNER.map((activity) => ({ text: activity, checked: false })),
        INTERMEDIATE: skillActivities.INTERMEDIATE.map((activity) => ({ text: activity, checked: false })),
        EXPERT: skillActivities.EXPERT.map((activity) => ({ text: activity, checked: false })),
      },
    });
    setShowSkillAssessment(true);
  };

  const handleEditSkill = (skill) => {
    // Set the category and skill name for the assessment
    setSelectedCategory(skill.category);
    setSelectedSkill(skill.name);
    setEditingSkillId(skill._id);

    // Get the assessment data for this skill
    const skillActivities = skillAssessmentData[skill.category]?.[skill.name];
    if (!skillActivities) {
      toast.error('No assessment data found for this skill');
      return;
    }

    // Initialize assessment with all activities unchecked (user will redo the assessment)
    setAssessmentData({
      category: skill.category,
      skill: skill.name,
      activities: {
        BEGINNER: skillActivities.BEGINNER.map((activity) => ({ text: activity, checked: false })),
        INTERMEDIATE: skillActivities.INTERMEDIATE.map((activity) => ({ text: activity, checked: false })),
        EXPERT: skillActivities.EXPERT.map((activity) => ({ text: activity, checked: false })),
      },
    });
    setShowSkillAssessment(true);
  };

  const handleCompleteAssessment = async (proficiencyLevel) => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingSkillId) {
        // Update existing skill
        const response = await axios.patch(
          `${API_BASE_URL}/profile/skills/${editingSkillId}`,
          { level: proficiencyLevel },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update the skill in local state
        setSkills(prevSkills => 
          prevSkills.map(skill => 
            skill._id === editingSkillId 
              ? { ...skill, level: proficiencyLevel }
              : skill
          )
        );

        const suggestionsResponse = await axios.get(SUGGESTIONS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(suggestionsResponse.data.recommendations || []);

        toast.success(`${selectedSkill} updated to ${proficiencyLevel}% proficiency!`);
        setEditingSkillId(null);
      } else {
        // Add new skill
        const response = await axios.post(
          `${API_BASE_URL}/profile/skills`,
          { name: selectedSkill, level: proficiencyLevel, category: selectedCategory },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSkills([...skills, response.data.skill]);

        const suggestionsResponse = await axios.get(SUGGESTIONS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(suggestionsResponse.data.recommendations || []);

        toast.success(`${selectedSkill} added at ${proficiencyLevel}% proficiency!`);
      }

      setShowSkillAssessment(false);
      setShowAddSkill(false);
      setSelectedSkill('');
      setAssessmentData(null);
    } catch (err) {
      console.error('Error saving skill:', err);
      toast.error(err.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log("🗑️ Frontend: Attempting to delete skill with ID:", skillId);
      console.log("🗑️ Full URL:", `${API_BASE_URL}/profile/skills/${skillId}`);

      const response = await axios.delete(`${API_BASE_URL}/profile/skills/${skillId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("✅ Frontend: Delete response received:", response.data);

      // Update local state
      setSkills(prevSkills => prevSkills.filter((s) => s._id !== skillId));

      // Refresh recommendations
      try {
        const suggestionsResponse = await axios.get(SUGGESTIONS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(suggestionsResponse.data.recommendations || []);
      } catch (suggestionsError) {
        console.error("Error fetching suggestions:", suggestionsError);
        // Don't fail the entire operation if suggestions fail
      }

      toast.success('Skill deleted successfully');
    } catch (err) {
      console.error('❌ Frontend: Error deleting skill:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      // More specific error handling
      if (err.response?.status === 404) {
        if (err.response?.data?.message === 'Skill not found') {
          toast.error('Skill not found or already deleted');
          // Refresh the skills list to sync with server
          try {
            const token = localStorage.getItem('token');
            const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setSkills(profileResponse.data.skills || []);
          } catch (refreshError) {
            console.error('Error refreshing skills:', refreshError);
          }
        } else {
          toast.error('Endpoint not found - check server routing');
        }
      } else if (err.response?.status === 401) {
        toast.error('Please log in again');
        localStorage.removeItem('token');
        navigate('/');
      } else if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Invalid request');
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete skill');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/profile/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjectHistory(projectHistory.filter((p) => p._id !== projectId));

      const suggestionsResponse = await axios.get(SUGGESTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(suggestionsResponse.data.recommendations || []);

      toast.success('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        userName={userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
        user={userData}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <section className="bg-card rounded-xl border border-border p-6 mb-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground font-semibold grid place-items-center text-xl">
                    {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-card-foreground">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <div className="text-sm text-muted-foreground">{userData?.email}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData?.course && <Badge>{userData.course}</Badge>}
                  {userData?.yearLevel && <Badge>{userData.yearLevel}</Badge>}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-card-foreground border border-border rounded-[12px] hover:bg-muted transition-colors"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="inline-flex bg-muted rounded-full p-1">
              <Tab active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>
                Skills
              </Tab>
              <Tab active={activeTab === 'roleHistory'} onClick={() => setActiveTab('roleHistory')}>
                Role History
              </Tab>
              <Tab active={activeTab === 'growthPlan'} onClick={() => setActiveTab('growthPlan')}>
                Growth Plan
              </Tab>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200">
          {activeTab === 'skills' && (
            <>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">My Skills</h2>
                    <p className="text-sm text-muted-foreground">
                      Click on any skill to update proficiency or log practice time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-[12px] hover:bg-success/20 border border-success/20 transition-colors"
                >
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              <div className="p-6">
                {Object.keys(skillsByCategory).length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground">
                      No skills added yet. Start by adding your first skill!
                    </div>
                  </div>
                ) : (
                  Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category} className="mb-8">
                      <div className="text-xs font-semibold tracking-wide text-muted-foreground mb-4 uppercase">
                        {category}
                      </div>
                      <div className="space-y-4">
                        {categorySkills.map((skill) => (
                          <SkillRow 
                            key={skill._id} 
                            skill={skill} 
                            onDelete={() => handleDeleteSkill(skill._id)}
                            onEdit={() => handleEditSkill(skill)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'roleHistory' && (
            <>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                    {userData?.profilePicture ? (
                      <img 
                        src={userData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {userData?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Project Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      Your journey through different roles and projects
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/roles')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-lg hover:bg-success/20 border border-success/20 transition-colors"
                >
                  <ChevronRight size={16} /> Go to Role History
                </button>
              </div>

              <div className="p-6">
                {projectHistory.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground">
                      No projects yet. Add your first project to get started!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projectHistory.map((project, index) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        isLast={index === projectHistory.length - 1}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'growthPlan' && (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-warning" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">
                      Personalized Growth Recommendations
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Strategic advice to advance your skills and career
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground mb-4">
                      No recommendations yet. Keep building your profile!
                    </div>
                    <button
                      onClick={() => setShowAddSkill(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-success bg-success/10 rounded-[12px] hover:bg-success/20 border border-success/20 transition-colors"
                    >
                      <Plus size={16} /> Add Your First Skill
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {recommendations.map((recommendation, index) => (
                      <GrowthPlanCard
                        key={recommendation.skillName || index}
                        recommendation={recommendation}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* Footer action */}
        <div className="flex justify-end mt-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors">
            View Full History <ChevronRight size={16} />
          </button>
        </div>
      </main>

      {showEditProfile && (
        <EditProfileModal userData={userData} onClose={() => setShowEditProfile(false)} onSave={handleEditProfile} />
      )}

      {showAddSkill && !showSkillAssessment && (
        <AddSkillModal
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          onClose={() => {
            setShowAddSkill(false);
            setSelectedSkill('');
          }}
          onStartAssessment={handleInitiateSkillAssessment}
        />
      )}

      {showSkillAssessment && assessmentData && (
        <SkillAssessmentModal
          assessmentData={assessmentData}
          setAssessmentData={setAssessmentData}
          onClose={() => {
            setShowSkillAssessment(false);
            setAssessmentData(null);
            setSelectedSkill('');
            setShowAddSkill(false);
            setEditingSkillId(null);
          }}
          onComplete={handleCompleteAssessment}
        />
      )}

    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {children}
    </span>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        `px-3 py-1.5 text-sm rounded-full transition ` +
        (active ? 'bg-card text-card-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-card-foreground')
      }
    >
      {children}
    </button>
  );
}

function SkillRow({ skill, onDelete, onEdit }) {
  const getProgressColor = (level) => {
    if (level <= 25) return 'bg-red-500';
    if (level <= 50) return 'bg-orange-500';
    if (level <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="group bg-muted/30 rounded-lg p-4 border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getSkillIcon(skill.name) && (
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <img 
                src={getSkillIcon(skill.name)} 
                alt={skill.name}
                className="w-6 h-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="text-sm font-medium text-card-foreground">{skill.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-muted-foreground">{skill.level}%</div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Edit
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={onDelete}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getProgressColor(skill.level)}`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project, isLast, onDelete }) {
  const navigate = useNavigate();
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-success/10 text-success border-success/20';
    if (score >= 80) return 'bg-primary/10 text-primary border-primary/20';
    if (score >= 70) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 bg-muted/30 rounded-xl p-6 border border-border hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground text-lg">{project.project}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">Role:</span> {project.role} •
              <span className="font-medium ml-1">Date:</span> {project.date} •
              <span className="font-medium ml-1">Team:</span> {project.team}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(project.score)}`}>
              {project.score}
            </div>
            <button
              onClick={() => navigate('/roles')}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              View Project
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-card text-card-foreground text-sm rounded-lg border border-border"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GrowthPlanCard({ recommendation }) {
  const handleResourceClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const { isDarkMode } = useTheme();

  return (
    <div className={`relative border rounded-xl overflow-hidden transition-all duration-300 ${
      isDarkMode 
        ? 'border-border bg-gradient-to-br from-primary/5 via-card to-secondary/5 hover:shadow-lg hover:shadow-primary/10' 
        : 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 hover:shadow-lg hover:shadow-blue-200'
    }`}>
      <div className="p-6">
        {/* Skill Header with colored badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {getSkillIcon(recommendation.skillName) ? (
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg border-2 ${
                  isDarkMode ? 'border-primary/30 bg-card' : 'border-blue-200 bg-white'
                }`}>
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
                    className={`w-12 h-12 rounded-xl hidden items-center justify-center shadow-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-primary to-secondary' 
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}
                  >
                    <TrendingUp className="text-white" size={24} />
                  </div>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-primary to-secondary' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  <TrendingUp className="text-white" size={24} />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-card-foreground">{recommendation.skillName}</h3>
                {recommendation.currentLevel > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-24 h-2 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-muted' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-500 ${
                          recommendation.currentLevel >= 70 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : recommendation.currentLevel >= 40 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${recommendation.currentLevel}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${
                      isDarkMode ? 'text-primary' : 'text-blue-600'
                    }`}>
                      {recommendation.currentLevel}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Why this matters section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDarkMode 
                ? 'bg-primary/20' 
                : 'bg-blue-100'
            }`}>
              <Target className={isDarkMode ? 'text-primary' : 'text-blue-600'} size={18} />
            </div>
            <h4 className={`font-bold text-base ${
              isDarkMode ? 'text-primary' : 'text-blue-600'
            }`}>Why this matters:</h4>
          </div>
          <div className={`rounded-xl p-4 border-2 ${
            isDarkMode 
              ? 'bg-primary/10 border-primary/30' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`leading-relaxed ${
              isDarkMode ? 'text-primary-foreground' : 'text-gray-700'
            }`}>
              {recommendation.reason}
            </p>
          </div>
        </div>

        {/* Suggested action section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDarkMode 
                ? 'bg-secondary/20' 
                : 'bg-indigo-100'
            }`}>
              <Award className={isDarkMode ? 'text-secondary' : 'text-indigo-600'} size={18} />
            </div>
            <h4 className={`font-bold text-base ${
              isDarkMode ? 'text-secondary' : 'text-indigo-600'
            }`}>Suggested action:</h4>
          </div>
          <div className={`rounded-xl p-4 border-2 ${
            isDarkMode 
              ? 'bg-secondary/10 border-secondary/30' 
              : 'bg-indigo-50 border-indigo-200'
          }`}>
            <p className={`leading-relaxed ${
              isDarkMode ? 'text-primary-foreground' : 'text-gray-700'
            }`}>
              {recommendation.suggestedAction}
            </p>
          </div>
        </div>

        {/* Resources section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDarkMode 
                ? 'bg-success/20' 
                : 'bg-green-100'
            }`}>
              <Plus className={isDarkMode ? 'text-success' : 'text-green-600'} size={18} />
            </div>
            <h4 className={`font-bold text-base ${
              isDarkMode ? 'text-success' : 'text-green-600'
            }`}>Resources:</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {recommendation.resourceLinks &&
              recommendation.resourceLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleResourceClick(link.url)}
                  className={`inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    isDarkMode
                      ? 'text-success-foreground bg-success/20 border-2 border-success/50 hover:bg-success/30'
                      : 'text-green-700 bg-green-50 border-2 border-green-200 hover:bg-green-100'
                  }`}
                >
                  {link.title}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className={`h-1 bg-gradient-to-r ${
        isDarkMode 
          ? 'from-primary via-secondary to-success' 
          : 'from-blue-500 via-indigo-500 to-green-500'
      }`} />
    </div>
  );
}

function EditProfileModal({ userData, onClose, onSave }) {
  const { isDarkMode } = useTheme();
  const [firstName, setFirstName] = useState(userData?.firstName || '');
  const [lastName, setLastName] = useState(userData?.lastName || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [course, setCourse] = useState(userData?.course || '');
  const [yearLevel, setYearLevel] = useState(userData?.yearLevel || '');
  const [profilePicture, setProfilePicture] = useState(userData?.profilePicture || null);
  const [previewPicture, setPreviewPicture] = useState(userData?.profilePicture || null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Fixed: Changed from 1GB to 10MB to match backend validation
      if (file.size > 1024 * 1024 * 10) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF, WEBP, SVG)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target.result);
        setPreviewPicture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    // Enhanced validation
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      // Send all data in one call to onSave
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        course: course?.trim() || '',
        yearLevel: yearLevel || '',
        profilePicture: profilePicture,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      // Error is already handled in the parent component
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose}></div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto ${
          isDarkMode 
            ? 'bg-card border border-border' 
            : 'bg-white'
        }`}>
          <div className={`flex items-start justify-between p-6 border-b ${
            isDarkMode 
              ? 'border-border' 
              : 'border-gray-100'
          }`}>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode 
                  ? 'text-card-foreground' 
                  : 'text-gray-900'
              }`}>
                Edit Profile
              </h3>
              <p className={`text-sm ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-500'
              }`}>
                Update your profile information
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`text-xl ${
                isDarkMode 
                  ? 'text-muted-foreground hover:text-card-foreground' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center">
              <label className={`block text-sm font-medium mb-4 text-center ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                Profile Picture
              </label>

              <label className="cursor-pointer group relative">
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="relative">
                  {previewPicture ? (
                    <img
                      src={previewPicture}
                      alt="Preview"
                      className={`w-24 h-24 rounded-full object-cover border-4 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-border group-hover:border-primary' 
                          : 'border-gray-200 group-hover:border-blue-500'
                      }`}
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold grid place-items-center border-4 transition-colors duration-200 ${
                        isDarkMode 
                          ? 'border-border group-hover:border-primary' 
                          : 'border-gray-200 group-hover:border-blue-500'
                      }`}>
                      {firstName?.charAt(0)}{lastName?.charAt(0)}
                    </div>
                  )}

                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="text-white text-center">
                      <Camera size={24} className="mx-auto mb-1" />
                      <span className="text-xs font-medium">Change Photo</span>
                    </div>
                  </div>
                </div>
              </label>

              <p className={`text-xs mt-3 text-center ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-500'
              }`}>
                Tap the image to change. Max size: 10MB. JPG, PNG, GIF, WEBP, SVG supported.
              </p>
            </div>

            <hr className={`my-4 ${
              isDarkMode ? 'border-border' : 'border-gray-200'
            }`} />

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDarkMode 
                      ? 'border border-border bg-card text-card-foreground' 
                      : 'border border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                  required
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDarkMode 
                      ? 'border border-border bg-card text-card-foreground' 
                      : 'border border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode 
                    ? 'border border-border bg-card text-card-foreground' 
                    : 'border border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                Course
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. BS Information Technology"
                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode 
                    ? 'border border-border bg-card text-card-foreground' 
                    : 'border border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode 
                    ? 'border border-border bg-card text-card-foreground' 
                    : 'border border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
            </div>
          </div>

          <div className={`flex items-center justify-end gap-3 p-6 border-t ${
            isDarkMode ? 'border-border' : 'border-gray-100'
          }`}>
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-50 ${
                isDarkMode 
                  ? 'text-muted-foreground border-border hover:bg-muted' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSkillModal({
  selectedCategory,
  setSelectedCategory,
  selectedSkill,
  setSelectedSkill,
  onClose,
  onStartAssessment,
}) {
  const { isDarkMode } = useTheme();
  const availableSkills = Object.keys(skillAssessmentData[selectedCategory] || {});

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose}></div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full max-w-lg rounded-xl shadow-xl ${
          isDarkMode 
            ? 'bg-card border border-border' 
            : 'bg-white'
        }`}>
          <div className={`flex items-start justify-between p-5 border-b ${
            isDarkMode 
              ? 'border-border' 
              : 'border-gray-100'
          }`}>
            <div>
              <h3 className={`text-[15px] font-semibold ${
                isDarkMode 
                  ? 'text-card-foreground' 
                  : 'text-gray-900'
              }`}>
                Add New Skill
              </h3>
              <p className={`text-sm ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-500'
              }`}>
                Select a skill and start your assessment
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`text-xl ${
                isDarkMode 
                  ? 'text-muted-foreground hover:text-card-foreground' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-700'
              }`}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSkill('');
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode 
                    ? 'border-border bg-card text-card-foreground' 
                    : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                }`}
              >
                <option value="PROGRAMMING">Programming</option>
                <option value="WEB DEVELOPMENT">Web Development</option>
                <option value="UI/UX DESIGN">UI/UX Design</option>
                <option value="FRONTEND">Frontend Development</option>
                <option value="BACKEND">Backend Development</option>
                <option value="TOOLS">Programming Tools</option>
                <option value="MOBILE DEVELOPMENT">Mobile Development</option>
                <option value="DATA SCIENCE">Data Science</option>
                <option value="DEVOPS & CLOUD">DevOps & Cloud</option>
                <option value="PROJECT MANAGEMENT">Project Management</option>
                <option value="CYBERSECURITY">Cyber Security</option>
                <option value="SOFTWARE ARCHITECTURE">Software Architecture</option>
                <option value="QUALITY ASSURANCE">Quality Assurance</option>
                <option value="BUSINESS & PRODUCT">Business & Products</option>
                <option value="IT & INFRASTRUCTURE">IT & Infrastructure</option>
                
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-700'
              }`}>
                Skill
              </label>
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className={`w-full appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDarkMode 
                      ? 'border-border bg-card text-card-foreground' 
                      : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                  disabled={!selectedCategory || availableSkills.length === 0}
                >
                  <option value="">Select a skill</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-gray-400'
                }`}>
                  ▾
                </div>
              </div>
              {selectedCategory && availableSkills.length === 0 && (
                <p className="text-xs text-destructive mt-1">No skills available in this category</p>
              )}
            </div>

            {selectedSkill && (
              <div className={`border rounded-lg p-4 ${
                isDarkMode 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs ${
                  isDarkMode 
                    ? 'text-primary' 
                    : 'text-blue-900'
                }`}>
                  <strong>Next Step:</strong> You'll complete a skill assessment based on practical
                  activities to determine your proficiency level accurately.
                </p>
              </div>
            )}

            {!selectedSkill && selectedCategory && (
              <div className={`border rounded-lg p-4 ${
                isDarkMode 
                  ? 'bg-muted border-border' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs ${
                  isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-gray-700'
                }`}>
                  <strong>Note:</strong> Please select a skill from the dropdown above to continue.
                </p>
              </div>
            )}
          </div>

          <div className={`flex items-center justify-end gap-3 p-5 border-t ${
            isDarkMode 
              ? 'border-border' 
              : 'border-gray-100'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                isDarkMode 
                  ? 'text-muted-foreground border-border hover:bg-muted' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onStartAssessment}
              disabled={!selectedSkill}
              className="px-4 py-2 rounded-lg text-sm text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillAssessmentModal({ assessmentData, setAssessmentData, onClose, onComplete }) {
  const { isDarkMode } = useTheme();
  const [saving, setSaving] = useState(false);

  const calculateProficiency = () => {
    let score = 0;
    const beginnerChecked = assessmentData.activities.BEGINNER.filter((a) => a.checked).length;
    const intermediateChecked = assessmentData.activities.INTERMEDIATE.filter((a) => a.checked)
      .length;
    const expertChecked = assessmentData.activities.EXPERT.filter((a) => a.checked).length;

    score = beginnerChecked * 8 + intermediateChecked * 6 + expertChecked * 6;
    return Math.min(100, score);
  };

  const toggleActivity = (level, index) => {
    setAssessmentData((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [level]: prev.activities[level].map((activity, i) =>
          i === index ? { ...activity, checked: !activity.checked } : activity
        ),
      },
    }));
  };

  const handleCompleteAssessment = async () => {
    const proficiency = calculateProficiency();
    setSaving(true);
    try {
      await onComplete(proficiency);
    } finally {
      setSaving(false);
    }
  };

  const proficiency = calculateProficiency();
  const totalActivities =
    assessmentData.activities.BEGINNER.length +
    assessmentData.activities.INTERMEDIATE.length +
    assessmentData.activities.EXPERT.length;
  const checkedActivities =
    assessmentData.activities.BEGINNER.filter((a) => a.checked).length +
    assessmentData.activities.INTERMEDIATE.filter((a) => a.checked).length +
    assessmentData.activities.EXPERT.filter((a) => a.checked).length;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose}></div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto ${
          isDarkMode 
            ? 'bg-card border border-border' 
            : 'bg-white'
        }`}>
          <div className={`sticky top-0 flex items-start justify-between p-6 border-b ${
            isDarkMode 
              ? 'bg-card border-border' 
              : 'bg-white border-gray-100'
          }`}>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode 
                  ? 'text-card-foreground' 
                  : 'text-gray-900'
              }`}>
                Skill Assessment: {assessmentData.skill}
              </h3>
              <p className={`text-sm ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-500'
              }`}>
                Check the activities you can confidently perform
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`text-xl ${
                isDarkMode 
                  ? 'text-muted-foreground hover:text-card-foreground' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode 
                ? 'bg-primary/10 border-primary/20' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isDarkMode 
                    ? 'text-card-foreground' 
                    : 'text-gray-700'
                }`}>
                  Assessment Progress
                </span>
                <span className={`text-sm font-semibold ${
                  isDarkMode 
                    ? 'text-primary' 
                    : 'text-blue-600'
                }`}>
                  {checkedActivities} / {totalActivities}
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                isDarkMode 
                  ? 'bg-muted' 
                  : 'bg-gray-200'
              }`}>
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-primary' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${(checkedActivities / totalActivities) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Beginner Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-5 h-5 text-red-500" fill="currentColor" />
                <h4 className={`font-semibold ${
                  isDarkMode 
                    ? 'text-card-foreground' 
                    : 'text-gray-900'
                }`}>
                  Beginner (0-40%)
                </h4>
                <span className={`text-xs font-medium ${
                  isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-gray-500'
                }`}>
                  {assessmentData.activities.BEGINNER.filter((a) => a.checked).length}/
                  {assessmentData.activities.BEGINNER.length}
                </span>
              </div>
              <div className="space-y-2 ml-7">
                {assessmentData.activities.BEGINNER.map((activity, index) => (
                  <label key={index} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activity.checked}
                      onChange={() => toggleActivity('BEGINNER', index)}
                      className={`mt-1 w-4 h-4 rounded focus:ring-2 focus:ring-primary ${
                        isDarkMode 
                          ? 'border-border bg-card text-primary' 
                          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                      }`}
                    />
                    <span className={`text-sm group-hover:opacity-80 ${
                      isDarkMode 
                        ? 'text-muted-foreground group-hover:text-card-foreground' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {activity.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Intermediate Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-5 h-5 text-yellow-500" fill="currentColor" />
                <h4 className={`font-semibold ${
                  isDarkMode 
                    ? 'text-card-foreground' 
                    : 'text-gray-900'
                }`}>
                  Intermediate (41-70%)
                </h4>
                <span className={`text-xs font-medium ${
                  isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-gray-500'
                }`}>
                  {assessmentData.activities.INTERMEDIATE.filter((a) => a.checked).length}/
                  {assessmentData.activities.INTERMEDIATE.length}
                </span>
              </div>
              <div className="space-y-2 ml-7">
                {assessmentData.activities.INTERMEDIATE.map((activity, index) => (
                  <label key={index} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activity.checked}
                      onChange={() => toggleActivity('INTERMEDIATE', index)}
                      className={`mt-1 w-4 h-4 rounded focus:ring-2 focus:ring-primary ${
                        isDarkMode 
                          ? 'border-border bg-card text-primary' 
                          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                      }`}
                    />
                    <span className={`text-sm group-hover:opacity-80 ${
                      isDarkMode 
                        ? 'text-muted-foreground group-hover:text-card-foreground' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {activity.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Expert Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-5 h-5 text-green-500" fill="currentColor" />
                <h4 className={`font-semibold ${
                  isDarkMode 
                    ? 'text-card-foreground' 
                    : 'text-gray-900'
                }`}>
                  Expert (71-100%)
                </h4>
                <span className={`text-xs font-medium ${
                  isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-gray-500'
                }`}>
                  {assessmentData.activities.EXPERT.filter((a) => a.checked).length}/
                  {assessmentData.activities.EXPERT.length}
                </span>
              </div>
              <div className="space-y-2 ml-7">
                {assessmentData.activities.EXPERT.map((activity, index) => (
                  <label key={index} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activity.checked}
                      onChange={() => toggleActivity('EXPERT', index)}
                      className={`mt-1 w-4 h-4 rounded focus:ring-2 focus:ring-primary ${
                        isDarkMode 
                          ? 'border-border bg-card text-primary' 
                          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                      }`}
                    />
                    <span className={`text-sm group-hover:opacity-80 ${
                      isDarkMode 
                        ? 'text-muted-foreground group-hover:text-card-foreground' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {activity.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated Proficiency */}
            <div className={`rounded-lg p-4 border ${
              isDarkMode 
                ? 'bg-success/10 border-success/20' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            }`}>
              <p className={`text-xs mb-2 ${
                isDarkMode 
                  ? 'text-muted-foreground' 
                  : 'text-gray-600'
              }`}>
                Estimated Proficiency Level
              </p>
              <div className="flex items-end gap-3">
                <div>
                  <div className={`text-3xl font-bold ${
                    isDarkMode 
                      ? 'text-success' 
                      : 'text-green-600'
                  }`}>
                    {proficiency}%
                  </div>
                  <p className={`text-xs mt-1 ${
                    isDarkMode 
                      ? 'text-muted-foreground' 
                      : 'text-gray-600'
                  }`}>
                    {proficiency <= 40 ? 'Beginner' : proficiency <= 70 ? 'Intermediate' : 'Expert'}
                  </p>
                </div>
                <div className={`flex-1 h-1 rounded-full ${
                  isDarkMode 
                    ? 'bg-success/20' 
                    : 'bg-green-200'
                }`}>
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-success' 
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${proficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t ${
            isDarkMode 
              ? 'bg-card border-border' 
              : 'bg-white border-gray-100'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                isDarkMode 
                  ? 'text-muted-foreground border-border hover:bg-muted' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteAssessment}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm text-success-foreground bg-success hover:bg-success/90 disabled:bg-muted disabled:text-muted-foreground flex items-center gap-2 transition-colors"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Complete Assessment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}