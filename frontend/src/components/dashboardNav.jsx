import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    0% {
      opacity: 0;
      transform: translateX(20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

const baseLinkClass =
  'text-sm text-muted-foreground px-3 py-2 rounded-full transition-colors transition-bg hover:bg-secondary hover:text-secondary-foreground';

const activeLinkClass =
  'text-sm text-primary-foreground font-medium px-3 py-2 rounded-full bg-primary';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join('');
}

export default function DashboardNav({
  userName = 'Alex Rivera',
  user = {},
  links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/roles', label: 'Role History' },
    { to: '/suggestions', label: 'Suggestions' },
    { to: '/career-paths', label: 'Career Paths' },
  ],
  isMobileMenuOpen = false,
  setIsMobileMenuOpen = () => {},
}) {
  const initials = getInitials(userName);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const profilePopupRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    // Call logout API to log activity
    if (token) {
      try {
        await fetch('http://localhost:5000/api/users/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to call logout endpoint:', error);
        // Continue with logout even if API call fails
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/');
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <div className="w-full bg-card border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div>
              <img
                src={logo}
                alt="SkillMatch Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 mr-1 sm:mr-2 inline-block"
              />
            </div>
            <span className="text-base sm:text-xl font-semibold text-foreground">SkillMatch</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? activeLinkClass : baseLinkClass)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link to="/settings" className="text-muted-foreground hover:text-secondary transition-colors">
              <Settings size={18} />
            </Link>
            
            <div className="relative" ref={profilePopupRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-muted/50 p-1 rounded-lg transition duration-200"
                aria-label="Open profile menu"
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
                    {initials || 'U'}
                  </div>
                )}
                <span className="text-sm text-foreground">{userName}</span>
              </button>

              {isProfileOpen && (
                <div className="profile-popup absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-card-foreground">{userName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} className="text-muted-foreground" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-card-foreground hover:bg-muted transition duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-muted transition duration-200"
                  >
                    <LogOut size={16} className="text-destructive" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300 ease-in-out"
          >
            <div className="relative w-5 h-5">
              <span className={`absolute top-0 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'}`}></span>
              <span className={`absolute top-2 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute top-4 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black bg-opacity-75 animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="relative bg-card shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-4">
              <div className="flex flex-col space-y-3">
                {links.map((link, index) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => 
                      `text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideInFromRight 0.3s ease-out forwards'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                
                <div className="border-t border-border my-3 animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}></div>
                
                <div className="space-y-2">
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-foreground hover:bg-muted"
                    style={{
                      animationDelay: '250ms',
                      animation: 'slideInFromRight 0.3s ease-out forwards'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    Settings
                  </Link>
                  
                  <div 
                    className="flex items-center gap-3 py-3 px-4"
                    style={{
                      animationDelay: '300ms',
                      animation: 'slideInFromRight 0.3s ease-out forwards'
                    }}
                  >
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold grid place-items-center">
                        {initials || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{userName}</span>
                      <span className="text-xs text-muted-foreground">Account</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLogoutOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full mx-4 border border-border shadow-xl">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Are you sure you want to logout?</h3>
            <p className="text-sm text-muted-foreground mb-6">You will be redirected to the landing page and will need to log in again to access your account.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}