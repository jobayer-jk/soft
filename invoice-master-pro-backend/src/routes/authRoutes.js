const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min length 6 recommended)
 *               name:
 *                 type: string
 *                 description: User's full name
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF, ACCOUNTANT]
 *                 default: STAFF
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (e.g., missing email or password)
 *       409:
 *         description: Conflict (e.g., email already exists)
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Bad request (e.g., missing email or password)
 *       401:
 *         description: Unauthorized (Invalid credentials)
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (Not authenticated or token expired)
 *       403:
 *         description: Forbidden (Invalid token)
 */
router.get("/me", authenticateToken, authController.getMe);

// Example of a route requiring a specific role (e.g., ADMIN)
// router.get("/admin-only", authenticateToken, authorizeRoles("ADMIN"), (req, res) => {
//   res.json({ message: "Welcome Admin!" });
// });

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         role:
 *           type: string
 *           enum: [ADMIN, STAFF, ACCOUNTANT]
 *           description: User's role
 *         orgId:
 *           type: string
 *           description: ID of the organization the user belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 *       example:
 *         id: "clxqzqk3f0000u1zkhq8v5c7p"
 *         email: "staff@example.com"
 *         name: "Staff Member"
 *         role: "STAFF"
 *         orgId: "clxqzqk3g0001u1zkhq8v6d8q"
 *         createdAt: "2025-05-31T07:26:44.000Z"
 *         updatedAt: "2025-05-31T07:26:44.000Z"
 */

module.exports = router;

