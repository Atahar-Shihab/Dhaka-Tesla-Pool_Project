/**
 * ThemeContext.jsx
 * Global Theme management supporting Light & Dark themes.
 * Persists user choice in localStorage.
 * Updates <html> class and DaisyUI data-theme attribute.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default to light theme as preferred by user
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dhaka_tesla_theme') || 'light';
  });

  const applyThemeToDOM = (newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
      }
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.remove('dark');
        body.setAttribute('data-theme', 'light');
      }
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('dhaka_tesla_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyThemeToDOM(newTheme);
    setTheme(newTheme);
    localStorage.setItem('dhaka_tesla_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
