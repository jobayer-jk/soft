import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import { createClient } from '../services/api';

const ClientCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await createClient(formData);
      alert('Client created successfully!'); // Simple feedback
      navigate('/clients'); // Redirect to the clients list page
    } catch (err) {
      setError(err.message || 'Failed to create client');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Add New Client</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <ClientForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default ClientCreatePage;

