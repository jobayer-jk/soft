import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
// import { useTheme } from '../contexts/ThemeContext'; // Import later when context is ready

const MainLayout = () => {
  // const { theme } = useTheme(); // Use theme later

  // Placeholder theme logic for now
  const theme = 'light'; // or 'dark'

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${theme}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {/* Outlet renders the matched child route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

