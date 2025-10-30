import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsThemeTransitioning(true);
    
    // Small delay to show animation
    setTimeout(() => {
      setIsDarkMode(prev => !prev);
    }, 100);
    
    // Hide animation after theme transition completes
    setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 600);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    isThemeTransitioning,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};