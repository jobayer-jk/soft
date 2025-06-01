const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: Fetch fresh user data from DB to ensure user still exists/is active
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, orgId: true } // Select only necessary fields
    });

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user info to the request object
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: "Invalid token" });
    }
    // Handle other potential errors during verification
    console.error("JWT Verification Error:", err);
    return res.status(500).json({ message: "Token verification failed" });
  }
};

// Middleware factory for role-based authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // This should technically be caught by authenticateToken first
      return res.status(401).json({ message: "Not authenticated" });
    }

    const rolesArray = [...allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user.role}' is not authorized for this resource`,
      });
    }

    next(); // Role is allowed, proceed to the next middleware/handler
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};

