import React from 'react';
import ThemeToggle from './ThemeToggle'; // Import ThemeToggle

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      {/* Left side - Maybe breadcrumbs or search bar later */}
      <div>
        <span className="text-gray-800 dark:text-white text-lg font-semibold">InvoiceMaster Pro</span>
      </div>

      {/* Right side - Theme toggle and User menu */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {/* Placeholder for User Menu/Profile Dropdown */}
        <div className="relative">
          <button className="flex items-center text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
            {/* Placeholder Avatar */}
            <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-medium">
              U
            </div>
          </button>
          {/* Dropdown menu (implement later) */}
          {/* <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Your Profile</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Settings</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Sign out</a>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

