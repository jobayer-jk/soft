import React, { useState, useEffect } from 'react';
import { fetchClients } from '../services/api'; // To fetch clients for dropdown

// Placeholder icons
const AddItemIcon = () => <span>➕</span>;
const DeleteItemIcon = () => <span>🗑️</span>;

const InvoiceForm = ({ initialData = {}, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '', // Consider generating this on backend or suggesting next number
    issueDate: new Date().toISOString().split('T')[0], // Default to today
    dueDate: '',
    notes: '',
    items: [{ description: '', quantity: 1, price: 0 }], // Start with one empty item
    status: 'DRAFT', // Default status
    ...initialData,
    // Ensure dates are formatted correctly for input type="date"
    issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    // Ensure items are present and have default values if not
    items: initialData.items && initialData.items.length > 0 ? initialData.items : [{ description: '', quantity: 1, price: 0 }],
  });

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  // Fetch clients for the dropdown
  useEffect(() => {
    const loadClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const clientData = await fetchClients();
        setClients(clientData);
        // If creating a new invoice and there's no clientId set, default to the first client if available
        if (!formData.clientId && clientData.length > 0 && !initialData.id) {
            // setFormData(prev => ({ ...prev, clientId: clientData[0].id }));
            // Decided against defaulting client - better to force user selection
        }
      } catch (err) {
        setClientsError('Failed to load clients');
        console.error(err);
      } finally {
        setClientsLoading(false);
      }
    };
    loadClients();
  }, [initialData.id]); // Reload clients only if it's a new invoice form potentially

  // Update form state if initialData changes (e.g., for editing)
  useEffect(() => {
    setFormData(prev => ({
      ...prev, // Keep existing state like potentially selected client
      ...initialData,
      issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : prev.issueDate,
      dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : prev.dueDate,
      items: initialData.items && initialData.items.length > 0 ? initialData.items : [{ description: '', quantity: 1, price: 0 }],
    }));
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    // Convert quantity and price to numbers
    const numericValue = (name === 'quantity' || name === 'price') ? parseFloat(value) || 0 : value;
    newItems[index] = { ...newItems[index], [name]: numericValue };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    // Add tax/discount logic here later if needed
    return calculateSubtotal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add total to the form data before submitting
    const submissionData = {
      ...formData,
      total: calculateTotal(),
      // Ensure clientId is a number if your backend expects it
      clientId: parseInt(formData.clientId, 10),
      // Ensure item quantities/prices are numbers
      items: formData.items.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
      }))
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Client and Invoice Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Selection */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          {clientsLoading ? (
            <p className="dark:text-gray-400">Loading clients...</p>
          ) : clientsError ? (
            <p className="text-red-500 dark:text-red-400">{clientsError}</p>
          ) : (
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Invoice Number */}
        <div>
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., INV-001 (Optional)"
          />
        </div>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issue Date */}
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Invoice Items Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Items</h3>
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
              <div className="flex-grow w-full md:w-auto">
                <label htmlFor={`item-desc-${index}`} className="sr-only">Description</label>
                <input
                  type="text"
                  id={`item-desc-${index}`}
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Item Description"
                />
              </div>
              <div className="w-full md:w-24">
                <label htmlFor={`item-qty-${index}`} className="sr-only">Quantity</label>
                <input
                  type="number"
                  id={`item-qty-${index}`}
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  min="0"
                  step="any" // Allow decimals if needed
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Qty"
                />
              </div>
              <div className="w-full md:w-32">
                <label htmlFor={`item-price-${index}`} className="sr-only">Price</label>
                <input
                  type="number"
                  id={`item-price-${index}`}
                  name="price"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  min="0"
                  step="0.01" // Allow cents
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Price"
                />
              </div>
              <div className="w-full md:w-auto text-right md:text-left pt-2 md:pt-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
              <div className="w-full md:w-auto flex justify-end md:justify-start pt-2 md:pt-0">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove Item"
                  >
                    <DeleteItemIcon />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
        >
          <AddItemIcon />
          <span className="ml-1">Add Item</span>
        </button>
      </div>

      {/* Totals Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          {/* Add Tax/Discount rows here later if needed */}
          <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-2">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Add any additional notes or terms here..."
          ></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={loading || clientsLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData.id ? 'Update Invoice' : 'Create Invoice')}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;

