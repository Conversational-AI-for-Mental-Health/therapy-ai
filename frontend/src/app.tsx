
import { useState, useRef, useEffect } from "react";
import React, { FC } from "react";
import { Screens, DashboardTab } from '@/util/types/index';





/**
 * App component serves as the main container and entry point for all application routes and UI.
 * This is where you will add your routing, state providers, and core layout.
 */
const App: FC= () => {

  //Navigation and UI state management
  const [currentScreen, setCurrentScreen] = useState<Screens>('landing');
  const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  //Dark Mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  

  return (
    <div>
      <header>

      </header>
    </div>
  );
};

export default App;
