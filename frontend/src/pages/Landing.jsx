import { Users, Lightbulb, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/logo.png';
import container from '../assets/Container.png';
import girl from '../assets/girl.png';
import brain from '../assets/brain.png';
import up from '../assets/up.png';
import target from '../assets/target_icon.png';
import check from '../assets/check.png';

const Landing = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleScroll = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-2">
            <div>
              <img
                src={logo}
                alt="SkillMatch Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 mr-1 sm:mr-2 inline-block"
              />
            </div>
            <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">SkillMatch</span>
          </div>
          
          {/* Desktop Menu - Hidden on mobile */} 
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8">
            <a href="#features" onClick={handleScroll('features')} className="text-black dark:text-white hover:text-[#14B8A6] transition-colors">Features</a>
            <a href="#about-section" onClick={handleScroll('about-section')} className="text-black dark:text-white hover:text-[#14B8A6] transition-colors">About</a>
          </div>
          
          {/* Desktop Auth Buttons and Theme Toggle */}
          <div className="hidden sm:flex items-center gap-4 sm:gap-6">
            <ThemeToggle />
            <a href="/login" className="text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-300 text-sm sm:text-base transition-colors">Sign In</a>
            <a href="/signup" className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-2xl hover:bg-blue-700 transition text-sm sm:text-base">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={toggleMobileMenu}
              className="p-2"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 transition-colors duration-300">
            <div className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors" 
                onClick={(e) => { handleScroll('features')(e); toggleMobileMenu(); }}
              >
                Features
              </a>
              <a 
                href="#about-section" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors" 
                onClick={(e) => { handleScroll('about-section')(e); toggleMobileMenu(); }}
              >
                About
              </a>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <a href="/login" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors">Sign In</a>
                <a href="/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition text-center mt-2">Get Started</a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-3 sm:px-4 py-2 mb-6 sm:mb-10 rounded-full inline-block text-sm sm:text-base">
              Empowering Students Through Smart Skill Discovery
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Empower Your Skills with SkillMatch
            </h1>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-blue-50">
              Discover, develop, and showcase your strengths through intelligent skill mapping designed for IT students and educators.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a href="/signup" className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-gray-400 transition text-center text-sm sm:text-base shadow-lg">
                Get Started
              </a>
              <a href="#features" className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-gray-200 hover:text-blue-600 transition text-center text-sm sm:text-base shadow-lg">
                Learn More
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img 
              src={container}
              alt="Students collaborating" 
              className="rounded-2xl w-full h-auto max-w-xs mx-auto sm:max-w-none"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Your Success
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to map, track, and grow your skills throughout your academic journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img src={brain} alt="icon" className="w-6 h-6 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Skill Showcase</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">
                Visualize your strengths and gaps with interactive skill mapping.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img src={up} alt="icon" className="w-6 h-6 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Smart Suggestions</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">
                Get AI-powered recommendations tailored to your learning path.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img src={target} alt="icon" className="w-6 h-6 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Role Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base">
                Monitor your progress across projects and build your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IT Students Section */}
      <section id="about-section" className="py-12 sm:py-20 px-4 sm:px-6 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="mb-8 md:mb-0">
            <img 
              src={girl} 
              alt="Student studying" 
              className="w-full h-auto max-w-xs mx-auto md:max-w-none"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Designed for IT Students and Educators
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8">
              SkillMatch empowers students to take control of their learning journey while providing educators with powerful insights into student progress and skill development.
            </p>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <li className="flex items-start gap-3">
                <img src={check} alt="check" className="w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Track skills across multiple projects</span>
              </li>
              <li className="flex items-start gap-3">
                <img src={check} alt="check" className="w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Get personalized learning recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <img src={check} alt="check" className="w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Showcase your growth to employers</span>
              </li>
              <li className="flex items-start gap-3">
                <img src={check} alt="check" className="w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Collaborate with peers and instructors</span>
              </li>
            </ul>
            <a href="/signup" className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base shadow-lg">
              Sign Up Free
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 text-white px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-50">
            Join thousands of students already mapping their skills and achieving their goals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="/signup" className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition text-center text-sm sm:text-base shadow-lg">
              Get Started Free
            </a>
            <a href="#features" className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:bg-gray-300 hover:text-blue-600 transition text-center text-sm sm:text-base shadow-lg">
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm sm:text-base">© 2025 SkillMatch. Empowering students through smart skill discovery.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;