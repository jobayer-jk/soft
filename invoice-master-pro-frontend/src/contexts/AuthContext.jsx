import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, fetchUserProfile, registerUser } from '../services/api'; // Assuming registerUser is added to api.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true); // Start loading until initial check is done
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          localStorage.setItem('authToken', token);
          // Fetch user profile using the token
          const profileData = await fetchUserProfile();
          setUser(profileData.user);
        } catch (err) {
          console.error("Token verification failed:", err);
          // Token is invalid or expired, clear it
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      } else {
        // No token, ensure user is null
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]); // Re-run effect if token changes

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
      setLoading(true);
      setError(null);
      try {
          // Assuming registerUser API exists and returns { message, user }
          // You might want to automatically log in the user after registration
          const data = await registerUser(userData);
          // Optionally login automatically after registration:
          // await login(userData.email, userData.password);
          setLoading(false);
          return data; // Return registration result
      } catch (err) {
          setError(err.message || 'Registration failed');
          setLoading(false);
          throw err;
      }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // Optionally redirect to login page via navigation hook if needed
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    register, // Add register function
    setError // Allow components to clear errors
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

