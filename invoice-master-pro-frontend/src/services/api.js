import axios from 'axios';

// Define the base URL for the backend API
// Use environment variable in a real application
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'; // Assuming backend runs on 3000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication API calls ---
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // Should contain { user, token }
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data; // Should contain { message, user }
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Registration failed');
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data; // Should contain { user }
  } catch (error) {
    console.error('Fetch profile API error:', error.response?.data || error.message);
    // If token is invalid/expired, this might fail
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Optionally handle token refresh or logout here
      localStorage.removeItem('authToken'); // Clear invalid token
    }
    throw error.response?.data || new Error('Failed to fetch profile');
  }
};

// --- Client API calls ---
export const fetchClients = async (filters = {}) => {
  try {
    // Pass filters as query parameters
    const response = await apiClient.get('/clients', { params: filters });
    return response.data; // Should be an array of clients
  } catch (error) {
    console.error('Fetch clients API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clients');
  }
};

export const fetchClientById = async (clientId) => {
  try {
    const response = await apiClient.get(`/clients/${clientId}`);
    return response.data; // Should be a single client object
  } catch (error) {
    console.error(`Fetch client ${clientId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch client details');
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await apiClient.post('/clients', clientData);
    return response.data; // Should be the newly created client object
  } catch (error) {
    console.error('Create client API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create client');
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const response = await apiClient.put(`/clients/${clientId}`, clientData);
    return response.data; // Should be the updated client object
  } catch (error) {
    console.error(`Update client ${clientId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update client');
  }
};

export const deleteClient = async (clientId) => {
  try {
    const response = await apiClient.delete(`/clients/${clientId}`);
    return response.data; // Should contain { message: "..." }
  } catch (error) {
    console.error(`Delete client ${clientId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete client');
  }
};

// --- Invoice API calls ---
export const fetchInvoices = async (filters = {}) => {
  try {
    const response = await apiClient.get('/invoices', { params: filters });
    return response.data; // Array of invoice summaries
  } catch (error) {
    console.error('Fetch invoices API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch invoices');
  }
};

export const fetchInvoiceById = async (invoiceId) => {
  try {
    const response = await apiClient.get(`/invoices/${invoiceId}`);
    return response.data; // Full invoice object with items and client
  } catch (error) {
    console.error(`Fetch invoice ${invoiceId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch invoice details');
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await apiClient.post('/invoices', invoiceData);
    return response.data; // Newly created invoice object
  } catch (error) {
    console.error('Create invoice API error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create invoice');
  }
};

export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await apiClient.put(`/invoices/${invoiceId}`, invoiceData);
    return response.data; // Updated invoice object
  } catch (error) {
    console.error(`Update invoice ${invoiceId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update invoice');
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await apiClient.delete(`/invoices/${invoiceId}`);
    return response.data; // Contains message and potentially the voided invoice
  } catch (error) {
    console.error(`Delete invoice ${invoiceId} API error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete or void invoice');
  }
};

// Function to trigger PDF download
export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const response = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob', // Important to handle binary data
    });
    return response; // Return the full response object to handle blob and headers
  } catch (error) {
    console.error(`Download invoice PDF ${invoiceId} API error:`, error.response?.data || error.message);
    // Try to parse error message from blob if possible
    let errorMessage = 'Failed to download invoice PDF';
    if (error.response?.data instanceof Blob && error.response?.data.type === 'application/json') {
        try {
            const errorJson = JSON.parse(await error.response.data.text());
            errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
            // Ignore if parsing fails
        }
    }
    throw new Error(errorMessage);
  }
};


export default apiClient;

