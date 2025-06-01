import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import { fetchClientById, updateClient } from '../services/api';

const ClientEditPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClientById(clientId);
        setInitialData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch client data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [clientId]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      // Remove fields that shouldn't be sent or are immutable if necessary
      const { id, orgId, createdAt, updatedAt, ...updatePayload } = formData;
      await updateClient(clientId, updatePayload);
      alert('Client updated successfully!'); // Simple feedback
      navigate('/clients'); // Redirect back to the list
    } catch (err) {
      setSubmitError(err.message || 'Failed to update client');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4 dark:text-white">Loading client data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  if (!initialData) {
    // This case might happen if loading finishes but data is still null (e.g., fetch failed silently)
    return <div className="text-center p-4 dark:text-white">Client data not available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Edit Client: {initialData.name}</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <ClientForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={submitLoading}
          error={submitError}
        />
      </div>
    </div>
  );
};

export default ClientEditPage;

