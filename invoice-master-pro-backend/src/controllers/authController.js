const authService = require("../services/authService");

const register = async (req, res, next) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await authService.registerUser(email, password, name, role);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    // Handle specific errors like 'User already exists'
    if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
    // Forward other errors to a generic error handler (to be implemented)
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
     // Handle specific errors like 'Invalid credentials'
    if (error.message.includes("Invalid credentials")) {
        return res.status(401).json({ message: error.message });
    }
    // Forward other errors to a generic error handler
    next(error);
  }
};

// Placeholder for fetching current user profile (requires authentication middleware)
const getMe = async (req, res) => {
    // The user object should be attached by the auth middleware
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    // We might want a service function to fetch full, fresh user data
    res.status(200).json({ user: req.user });
};


module.exports = {
  register,
  login,
  getMe
};

