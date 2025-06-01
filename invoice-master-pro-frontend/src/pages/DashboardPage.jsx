import React from 'react';
// Placeholder icons (replace later)
const RevenueIcon = () => <span>💰</span>;
const PendingIcon = () => <span>⏳</span>;
const ClientsIcon = () => <span>👥</span>;
const RecentIcon = () => <span>🕒</span>;

// Example Widget Component
const DashboardWidget = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center space-x-4 transform transition duration-300 hover:scale-105 hover:shadow-lg`}>
    <div className={`p-3 rounded-full ${color} bg-opacity-20 text-${color}-600 dark:text-${color}-400`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  // Dummy data for widgets - replace with API data later
  const widgetData = [
    { title: 'Total Revenue', value: '$12,345', icon: <RevenueIcon />, color: 'green' },
    { title: 'Pending Payments', value: '$2,500', icon: <PendingIcon />, color: 'yellow' },
    { title: 'Active Clients', value: '42', icon: <ClientsIcon />, color: 'blue' },
    { title: 'Invoices Due Soon', value: '5', icon: <RecentIcon />, color: 'red' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {widgetData.map((widget, index) => (
          <DashboardWidget
            key={index}
            title={widget.title}
            value={widget.value}
            icon={widget.icon}
            color={widget.color} // Pass color name for styling
          />
        ))}
      </div>

      {/* Charts and Recent Activity Section (Placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Invoice Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            {/* Replace with actual chart component later (e.g., Chart.js or Recharts) */}
            Chart Placeholder
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {/* Replace with actual activity items later */}
            <li className="text-sm text-gray-600 dark:text-gray-400">Invoice #INV-00123 paid.</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">New client "Beta Corp" added.</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Estimate #EST-00045 approved.</li>
            <li className="text-sm text-gray-600 dark:text-gray-400">Invoice #INV-00120 sent.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

