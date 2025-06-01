import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchInvoiceById, downloadInvoicePdf, deleteInvoice } from '../services/api';

// Placeholder icons
const EditIcon = () => <span>✏️</span>;
const DownloadIcon = () => <span>💾</span>;
const DeleteIcon = () => <span>🗑️</span>;
const BackIcon = () => <span>⬅️</span>;

// Helper function to format currency
const formatCurrency = (amount) => {
  return `$${Number(amount).toFixed(2)}`;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Invalid Date';
  }
};

// Helper function to determine status color
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'PENDING':
    case 'SENT':
    case 'VIEWED': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
    case 'OVERDUE': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    case 'DRAFT': return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    case 'VOID': return 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
  }
};

const InvoiceViewPage = () => {
  const { id: invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvoiceById(invoiceId);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch invoice details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoice();
  }, [invoiceId]);

  const handleDownload = async () => {
    try {
      const response = await downloadInvoicePdf(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${invoice?.invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert(`Error downloading PDF: ${err.message}`);
      console.error('Download PDF error:', err);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    const action = invoice.status === 'DRAFT' ? 'delete' : 'void';
    if (window.confirm(`Are you sure you want to ${action} this invoice?`)) {
      try {
        await deleteInvoice(invoiceId);
        alert(`Invoice ${action}ed successfully.`);
        navigate('/invoices'); // Redirect to list after action
      } catch (err) {
        alert(`Error: ${err.message || `Failed to ${action} invoice`}`);
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4 dark:text-white">Loading invoice details...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  if (!invoice) {
    return <div className="text-center p-4 dark:text-white">Invoice not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link to="/invoices" className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2">
            <BackIcon />
            <span className="ml-1">Back to Invoices</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoice {invoice.invoiceNumber}</h1>
          <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status || 'UNKNOWN'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <DownloadIcon />
            <span className="ml-2">Download PDF</span>
          </button>
          <Link
            to={`/invoices/${invoiceId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-600 active:bg-yellow-700 focus:outline-none focus:border-yellow-700 focus:ring ring-yellow-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <EditIcon />
            <span className="ml-2">Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            <DeleteIcon />
            <span className="ml-2">{invoice.status === 'DRAFT' ? 'Delete' : 'Void'}</span>
          </button>
        </div>
      </div>

      {/* Invoice Details Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        {/* Invoice Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">From:</h2>
            {/* Add Your Company Details Here - fetch from settings or hardcode */}
            <p className="text-gray-600 dark:text-gray-400">Your Company Name</p>
            <p className="text-gray-600 dark:text-gray-400">123 Your Street</p>
            <p className="text-gray-600 dark:text-gray-400">Your City, ST 12345</p>
            <p className="text-gray-600 dark:text-gray-400">your.email@example.com</p>
          </div>
          <div className="md:text-right">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">To:</h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium">{invoice.client?.name}</p>
            <p className="text-gray-600 dark:text-gray-400">{invoice.client?.email}</p>
            {invoice.client?.address && <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{invoice.client.address}</p>}
            {invoice.client?.phone && <p className="text-gray-600 dark:text-gray-400">{invoice.client.phone}</p>}
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Number</p>
            <p className="text-gray-900 dark:text-white font-semibold">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</p>
            <p className="text-gray-900 dark:text-white">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items?.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-white">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              {/* Calculate subtotal from items if not present on invoice object */}
              <span>{formatCurrency(invoice.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0)}</span>
            </div>
            {/* Add Tax/Discount rows here if applicable */}
            <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceViewPage;

