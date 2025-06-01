import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchInvoices, deleteInvoice, downloadInvoicePdf } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Placeholder icons
const AddIcon = () => <span>➕</span>;
const ViewIcon = () => <span>👁️</span>;
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const DownloadIcon = () => <span>💾</span>;

// Helper function to format currency
const formatCurrency = (amount) => {
  // Basic currency formatting, consider using Intl.NumberFormat for better localization
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

const InvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInvoices(); // Add filters later if needed
        setInvoices(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, [isAuthenticated]);

  const handleDelete = async (invoiceId, status) => {
    const action = status === 'DRAFT' ? 'delete' : 'void';
    if (window.confirm(`Are you sure you want to ${action} this invoice?`)) {
      try {
        const result = await deleteInvoice(invoiceId);
        alert(result.message || `Invoice ${action}ed successfully.`); // Simple feedback
        // Refresh list or update status locally
        setInvoices(prevInvoices =>
          prevInvoices.map(inv =>
            inv.id === invoiceId ? { ...inv, status: result.invoice?.status || 'VOID' } : inv
          ).filter(inv => !(action === 'delete' && inv.id === invoiceId))
        );
      } catch (err) {
        setError(err.message || `Failed to ${action} invoice`);
        alert(`Error: ${err.message || `Failed to ${action} invoice`}`);
        console.error(err);
      }
    }
  };

  const handleDownload = async (invoiceId, invoiceNumber) => {
    try {
        const response = await downloadInvoicePdf(invoiceId);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Invoice-${invoiceNumber || invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href); // Clean up blob URL
    } catch (error) {
        alert(`Error downloading PDF: ${error.message}`);
        console.error('Download PDF error:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-4 dark:text-white">Loading invoices...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoices</h1>
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
        >
          <AddIcon />
          <span className="ml-2">Create New Invoice</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.client?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Invoice"
                    >
                      <ViewIcon />
                    </Link>
                    <Link
                      to={`/invoices/${invoice.id}/edit`} // Link to edit page (to be created)
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit Invoice"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Download PDF"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id, invoice.status)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title={invoice.status === 'DRAFT' ? 'Delete Invoice' : 'Void Invoice'}
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesListPage;

