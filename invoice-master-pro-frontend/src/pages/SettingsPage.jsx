import React, { useState } from 'react';
// Import useTheme hook later when ThemeContext is created
// import { useTheme } from '../contexts/ThemeContext';

// Placeholder component for color picker (replace with a real one if needed)
const ColorInput = ({ value, onChange }) => (
  <input
    type="color"
    value={value}
    onChange={onChange}
    className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
  />
);

const SettingsPage = () => {
  // Placeholder state - replace with context later
  const [currentThemeMode, setCurrentThemeMode] = useState(localStorage.getItem('theme') || 'light');
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('themePrimaryColor') || '#4f46e5'); // Default to indigo-600

  // Placeholder theme palettes
  const themePalettes = [
    { name: 'Indigo', color: '#4f46e5' },
    { name: 'Violet', color: '#7c3aed' },
    { name: 'Green', color: '#10b981' },
    { name: 'Blue', color: '#2563eb' },
  ];

  // Placeholder handlers - replace with context functions later
  const handleThemeModeChange = (mode) => {
    console.log(`Setting theme mode to: ${mode}`);
    setCurrentThemeMode(mode);
    localStorage.setItem('theme', mode);
    // Apply theme mode change (e.g., add/remove 'dark' class)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // TODO: Call context function: setThemeMode(mode);
  };

  const handlePrimaryColorChange = (color) => {
    console.log(`Setting primary color to: ${color}`);
    setPrimaryColor(color);
    localStorage.setItem('themePrimaryColor', color);
    // Apply primary color change (e.g., update CSS variables)
    document.documentElement.style.setProperty('--color-primary-500', color);
    // TODO: Call context function: setPrimaryColor(color);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 space-y-8">
        {/* Theme Mode Selection */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Mode:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeModeChange('light')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${currentThemeMode === 'light' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                Light ☀️
              </button>
              <button
                onClick={() => handleThemeModeChange('dark')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${currentThemeMode === 'dark' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                Dark 🌙
              </button>
            </div>
          </div>
        </section>

        {/* Primary Color Selection */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Primary Color</h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Palette:</span>
            {themePalettes.map((palette) => (
              <button
                key={palette.name}
                onClick={() => handlePrimaryColorChange(palette.color)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-150
                            ${primaryColor === palette.color ? 'border-indigo-500 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'}`}
                style={{ backgroundColor: palette.color }}
                title={palette.name}
              />
            ))}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom:</span>
              <ColorInput
                value={primaryColor}
                onChange={(e) => handlePrimaryColorChange(e.target.value)}
              />
            </div>
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Selected Color: {primaryColor}</p>
        </section>

        {/* Other Settings Sections (e.g., Profile, Company Info) can be added here */}
        {/* <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
          {/* Profile form fields */}
        {/* </section> */}
      </div>
    </div>
  );
};

export default SettingsPage;

