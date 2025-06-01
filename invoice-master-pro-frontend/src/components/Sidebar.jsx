import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Placeholder icons (replace with actual icons later, e.g., from react-icons)
const DashboardIcon = () => <span>📊</span>;
const InvoicesIcon = () => <span>📄</span>;
const ClientsIcon = () => <span>👥</span>;
const SettingsIcon = () => <span>⚙️</span>;

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { path: '/invoices', icon: InvoicesIcon, label: 'Invoices' },
    { path: '/clients', icon: ClientsIcon, label: 'Clients' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Logo Placeholder */}
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">InvoiceMaster</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path} className="px-4 py-2">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-150 ease-in-out 
                            ${isActive
                              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Add other sidebar elements like user profile link or logout button later */}
    </aside>
  );
};

export default Sidebar;

