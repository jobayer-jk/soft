import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder Pages (Create these later)
import DashboardPage from './pages/DashboardPage';
import InvoicesListPage from './pages/InvoicesListPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import InvoiceViewPage from './pages/InvoiceViewPage';
import ClientsListPage from './pages/ClientsListPage';
import ClientCreatePage from './pages/ClientCreatePage';
const SettingsPage = () => <div className="text-gray-900 dark:text-white">Settings Page Content</div>;
const ProfilePage = () => <div className="text-gray-900 dark:text-white">Profile Edit Page Content</div>; // Placeholder for profile edit

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    // Optional: Show a global loading indicator while auth state is being determined
    return <div className="flex justify-center items-center h-screen">Loading Application...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes inside MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/invoices" element={<InvoicesListPage />} />
          <Route path="/invoices/new" element={<InvoiceCreatePage />} />
          <Route path="/invoices/:id" element={<InvoiceViewPage />} />
          {/* Add edit route later */}
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/clients/new" element={<ClientCreatePage />} />
          <Route path="/clients/:clientId/edit" element={<ClientEditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* Profile Edit Route */}
          {/* Redirect root path to dashboard if authenticated */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback for unknown routes - could redirect to dashboard or a 404 page */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

