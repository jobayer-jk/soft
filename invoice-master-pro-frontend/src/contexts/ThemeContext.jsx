import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const defaultPrimaryColor = '#4f46e5'; // Default: Indigo-600

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState(() => {
    return localStorage.getItem('themePrimaryColor') || defaultPrimaryColor;
  });

  // Apply theme mode (dark class)
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  // Apply primary color (CSS variable)
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary-500', primaryColor);
    // You might want to generate other shades (e.g., 100, 600, 700) based on the primary color
    // This requires a color manipulation library or more complex logic
    // For simplicity, we'll just set the 500 shade for now.
    localStorage.setItem('themePrimaryColor', primaryColor);
  }, [primaryColor]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const setPrimaryColor = useCallback((color) => {
    setPrimaryColorState(color);
  }, []);

  const value = {
    themeMode,
    primaryColor,
    toggleThemeMode,
    setThemeMode, // Allow direct setting from Settings page
    setPrimaryColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

