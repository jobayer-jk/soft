import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { createInvoice } from '../services/api';

const InvoiceCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure status is set if not provided by form (should default to DRAFT)
      const payload = { ...formData, status: formData.status || 'DRAFT' };
      const newInvoice = await createInvoice(payload);
      alert('Invoice created successfully!'); // Simple feedback
      navigate(`/invoices/${newInvoice.id}`); // Redirect to the view page of the new invoice
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Create New Invoice</h1>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <InvoiceForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default InvoiceCreatePage;

