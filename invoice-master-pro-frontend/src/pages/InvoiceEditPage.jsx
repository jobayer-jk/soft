import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { fetchInvoiceById, updateInvoice } from '../services/api';

const InvoiceEditPage = () => {
  const { id: invoiceId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const loadInvoiceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvoiceById(invoiceId);
        setInitialData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch invoice data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoiceData();
  }, [invoiceId]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      // Remove fields that shouldn't be sent or are immutable if necessary
      // Keep status if you allow editing status, otherwise remove it
      const { id, orgId, createdAt, updatedAt, client, ...updatePayload } = formData;

      // Ensure clientId is an integer
      updatePayload.clientId = parseInt(updatePayload.clientId, 10);
      // Ensure item quantities/prices are numbers
      updatePayload.items = updatePayload.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          // Include item ID if backend needs it for updates, otherwise remove
          // id: item.id 
      }));

      await updateInvoice(invoiceId, updatePayload);
      alert('Invoice updated successfully!'); // Simple feedback
      navigate(`/invoices/${invoiceId}`); // Redirect back to the view page
    } catch (err) {
      setSubmitError(err.message || 'Failed to update invoice');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4 dark:text-white">Loading invoice data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  if (!initialData) {
    return <div className="text-center p-4 dark:text-white">Invoice data not available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Edit Invoice: {initialData.invoiceNumber}</h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <InvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={submitLoading}
          error={submitError}
        />
      </div>
    </div>
  );
};

export default InvoiceEditPage;

