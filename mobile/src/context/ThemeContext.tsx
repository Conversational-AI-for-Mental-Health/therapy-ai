import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors as lightColors } from '../constants/theme';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeColors: typeof lightColors & {
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const themeColors = isDarkMode
    ? { ...lightColors, bg: '#121212', surface: '#1E1E1E', text: '#fff', textMuted: '#aaa', primary: '#BB86FC' }
    : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};