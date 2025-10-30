import DashboardNav from '../components/dashboardNav';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, Moon, Sun, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = 'http://localhost:5000/api';

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/settings/user`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Failed to fetch user data');
      
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load user data');
      setUser({ 
        name: 'User', 
        email: 'user@example.com',
        settings: {
          appearance: { theme: 'system', darkMode: false },
          notifications: {
            skillAlerts: true,
            projectUpdates: true,
            weeklyReports: false,
            recommendations: true,
          },
          privacy: {
            profileVisible: true,
            skillsVisible: true,
            projectsVisible: true,
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Error loading user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        userName={user.name} 
        user={user}
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <section className="bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 w-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and application settings</p>
              </div>
            </div>
          </div>
          
          <div className="px-6 pt-6">
            <div className="grid grid-cols-4 bg-muted rounded-full p-1 w-full gap-1">
              <SettingsTab active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
                Account
              </SettingsTab>
              <SettingsTab active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
                Appearance
              </SettingsTab>
              <SettingsTab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
                Notifications
              </SettingsTab>
              <SettingsTab active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
                Privacy
              </SettingsTab>
            </div>
          </div>

          <div className="p-6 w-full">
            {activeTab === 'account' && (
              <AccountSettings 
                user={user} 
                setUser={setUser}
                showPasswords={showPasswords} 
                togglePasswordVisibility={togglePasswordVisibility}
                getAuthHeaders={getAuthHeaders}
              />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
                user={user}
                getAuthHeaders={getAuthHeaders}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings 
                user={user}
                setUser={setUser}
                getAuthHeaders={getAuthHeaders}
              />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings 
                user={user}
                setUser={setUser}
                getAuthHeaders={getAuthHeaders}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SettingsTab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-200 flex items-center justify-center text-xs font-medium px-1 py-2 rounded-full w-full hover:scale-105 ${
        active 
          ? 'bg-card text-card-foreground shadow-sm border border-border hover:shadow-md' 
          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </button>
  );
}

function AccountSettings({ user, setUser, showPasswords, togglePasswordVisibility, getAuthHeaders }) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    // Validate password changes
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if ((newEmail || newPassword) && !currentPassword) {
      toast.error('Current password is required to make email or password changes!');
      return;
    }

    try {
      setIsLoading(true);
      const body = {};

      // Add email/password changes if provided
      if (newEmail) body.email = newEmail;
      if (newPassword) body.newPassword = newPassword;
      if (currentPassword) body.currentPassword = currentPassword;

      const res = await fetch(`${API_BASE}/settings/user`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      toast.success('Security settings saved successfully!');
      
      // Reset form fields
      setNewEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation', {
      description: 'Please contact support to proceed with account deletion.'
    });
  };

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Palette size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Security Settings</h3>
            <p className="text-sm text-muted-foreground">Update your email address and password</p>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-5">
          {/* Current Email */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Current Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm"
            />
          </div>
          
          {/* New Email */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@university.edu"
              className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card text-card-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">Must be a valid email address</p>
          </div>
          
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card text-card-foreground"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded p-1 transition-all duration-200"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Required for email or password changes</p>
          </div>
          
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card text-card-foreground"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded p-1 transition-all duration-200"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-card text-card-foreground"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground hover:bg-muted/50 rounded p-1 transition-all duration-200"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="bg-primary text-primary-foreground py-2.5 px-6 rounded-lg hover:bg-primary/90 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="border border-destructive/20 rounded-xl p-6 bg-destructive/5 w-full">
        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-destructive/80 mb-4">Irreversible account actions</p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-destructive text-destructive-foreground py-2.5 px-4 rounded-lg hover:bg-destructive/90 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings({ isDarkMode, toggleDarkMode, user, getAuthHeaders }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/settings/appearance`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ darkMode: !isDarkMode }),
      });

      if (!res.ok) throw new Error('Failed to update theme');
      
      toggleDarkMode();
      toast.success('Theme updated successfully!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update theme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
          <Palette size={16} className="text-secondary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Appearance Settings</h3>
      </div>
      
      <div className="bg-muted/30 rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {isDarkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
          </div>
          <div>
            <h4 className="text-base font-semibold text-card-foreground">Theme</h4>
            <p className="text-sm text-muted-foreground">Customize how SkillMatch looks for you</p>
          </div>
        </div>
        
        <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Moon size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-sm font-semibold text-card-foreground">Dark Mode</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">Switch between light and dark theme for better viewing experience</p>
            </div>
          </div>
          
          <button
            onClick={handleThemeChange}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg disabled:opacity-50 ${
              isDarkMode ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-card-foreground mb-3">Theme Preview:</h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-lg border border-border p-3 text-center">
              <div className="w-full h-8 bg-card rounded mb-2"></div>
              <p className="text-xs font-medium text-card-foreground">Card</p>
              <p className="text-xs text-muted-foreground">Cards & Dialogs</p>
            </div>
            <div className="bg-primary rounded-lg border border-border p-3 text-center">
              <div className="w-full h-8 bg-primary rounded mb-2"></div>
              <p className="text-xs font-medium text-primary-foreground">Primary</p>
              <p className="text-xs text-primary-foreground/80">Primary Color</p>
            </div>
            <div className="bg-secondary rounded-lg border border-border p-3 text-center">
              <div className="w-full h-8 bg-secondary rounded mb-2"></div>
              <p className="text-xs font-medium text-secondary-foreground">Secondary</p>
              <p className="text-xs text-secondary-foreground/80">Secondary Color</p>
            </div>
            <div className="bg-muted rounded-lg border border-border p-3 text-center">
              <div className="w-full h-8 bg-muted rounded mb-2"></div>
              <p className="text-xs font-medium text-muted-foreground">Muted</p>
              <p className="text-xs text-muted-foreground">Muted Elements</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Palette size={14} className="text-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-sm font-semibold text-card-foreground mb-1">Pro Tip</h6>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you toggle dark mode, watch for a smooth loading animation! This provides visual feedback during the theme transition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ user, setUser, getAuthHeaders }) {
  const [notifications, setNotifications] = useState({
    skillAlerts: user.settings?.notifications?.skillAlerts ?? true,
    projectUpdates: user.settings?.notifications?.projectUpdates ?? true,
    weeklyReports: user.settings?.notifications?.weeklyReports ?? false,
    recommendations: user.settings?.notifications?.recommendations ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/settings/notifications`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(notifications),
      });

      if (!res.ok) throw new Error('Failed to update notifications');
      
      const updatedUser = { ...user, settings: { ...user.settings, notifications } };
      setUser(updatedUser);
      toast.success('Notification preferences saved!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
          <Palette size={16} className="text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Notification Preferences</h3>
      </div>
      
      <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-card-foreground">Skill Improvement Alerts</label>
            <p className="text-sm text-muted-foreground">Get notified when you reach new proficiency levels</p>
          </div>
          <button
            onClick={() => handleToggle('skillAlerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.skillAlerts ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.skillAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-border"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-card-foreground">Project Updates</label>
            <p className="text-sm text-muted-foreground">Receive updates about your collaborative projects</p>
          </div>
          <button
            onClick={() => handleToggle('projectUpdates')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.projectUpdates ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.projectUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-border"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-card-foreground">Weekly Progress Reports</label>
            <p className="text-sm text-muted-foreground">Get a weekly summary of your skill development</p>
          </div>
          <button
            onClick={() => handleToggle('weeklyReports')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.weeklyReports ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-border"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-card-foreground">AI Recommendations</label>
            <p className="text-sm text-muted-foreground">Receive personalized skill suggestions</p>
          </div>
          <button
            onClick={() => handleToggle('recommendations')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.recommendations ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.recommendations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground py-2.5 px-6 rounded-lg hover:bg-primary/90 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings({ user, setUser, getAuthHeaders }) {
  const [privacy, setPrivacy] = useState({
    profileVisible: user.settings?.privacy?.profileVisible ?? true,
    skillsVisible: user.settings?.privacy?.skillsVisible ?? true,
    projectsVisible: user.settings?.privacy?.projectsVisible ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/settings/privacy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(privacy),
      });

      if (!res.ok) throw new Error('Failed to update privacy settings');
      
      const updatedUser = { ...user, settings: { ...user.settings, privacy } };
      setUser(updatedUser);
      toast.success('Privacy settings saved!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to save privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = () => {
    toast.success('Preparing your data export...');
  };

  const handleRequestDeletion = () => {
    toast.info('Contact admin to request data deletion');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
          <Palette size={16} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Privacy Settings</h3>
      </div>
      
      <div className="bg-muted/30 rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Palette size={16} className="text-primary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-card-foreground">Privacy Controls</h4>
            <p className="text-sm text-muted-foreground">Manage what information is visible to others</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-card-foreground">Profile Visibility</label>
              <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
            </div>
            <button
              onClick={() => handleToggle('profileVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.profileVisible ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-border"></div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-card-foreground">Show Skills</label>
              <p className="text-sm text-muted-foreground">Display your skills on your public profile</p>
            </div>
            <button
              onClick={() => handleToggle('skillsVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.skillsVisible ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.skillsVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-border"></div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-card-foreground">Show Projects</label>
              <p className="text-sm text-muted-foreground">Display your project history publicly</p>
            </div>
            <button
              onClick={() => handleToggle('projectsVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.projectsVisible ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.projectsVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary text-primary-foreground py-2.5 px-6 rounded-lg hover:bg-primary/90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Palette size={16} className="text-secondary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-card-foreground">Data Management</h4>
            <p className="text-sm text-muted-foreground">Download or delete your personal data</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleDownloadData}
            className="w-full bg-card text-card-foreground border border-border py-2.5 px-4 rounded-lg hover:bg-secondary hover:text-secondary-foreground hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
          >
            Download My Data
          </button>
          
          <button 
            onClick={handleRequestDeletion}
            className="w-full text-destructive border border-destructive/20 py-2.5 px-4 rounded-lg hover:bg-destructive hover:text-destructive-foreground hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
          >
            Request Data Deletion
          </button>
        </div>
      </div>
    </div>
  );
}