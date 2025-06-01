const express = require("express");
const clientController = require("../controllers/clientController");
const { authenticateToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management for the organization
 */

// Apply authentication middleware to all client routes
router.use(authenticateToken);
// Optional: Apply role-based access if needed, e.g., only ADMIN/STAFF can manage clients
// router.use(authorizeRoles("ADMIN", "STAFF"));

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request (e.g., missing required fields, invalid org context)
 *       401:
 *         description: Unauthorized (Not authenticated)
 *       409:
 *         description: Conflict (Client with this email already exists)
 */
router.post("/", clientController.createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Retrieve a list of clients for the organization
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter clients by name (partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter clients by email
 *       # Add other potential query parameters for filtering/pagination here
 *     responses:
 *       200:
 *         description: A list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 */
router.get("/", clientController.getClients);

/**
 * @swagger
 * /clients/{clientId}:
 *   get:
 *     summary: Retrieve a single client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client to retrieve
 *     responses:
 *       200:
 *         description: Client details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found or access denied
 */
router.get("/:clientId", clientController.getClientById);

/**
 * @swagger
 * /clients/{clientId}:
 *   put:
 *     summary: Update an existing client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientUpdateInput'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Bad request (e.g., no update data, invalid org context, cannot change org)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found or access denied
 *       409:
 *         description: Conflict (Email already exists for another client)
 */
router.put("/:clientId", clientController.updateClient);

/**
 * @swagger
 * /clients/{clientId}:
 *   delete:
 *     summary: Delete a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the client to delete
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       # Or use 204 No Content
 *       # 204:
 *       #   description: Client deleted successfully
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found or access denied
 *       # Potentially 409 Conflict if deletion is blocked by constraints (e.g., existing invoices)
 */
router.delete("/:clientId", clientController.deleteClient);


/**
 * @swagger
 * components:
 *   schemas:
 *     ClientInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the client
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the client (must be unique within the organization)
 *         phone:
 *           type: string
 *           description: Phone number of the client
 *         address:
 *           type: string
 *           description: Physical address of the client
 *       example:
 *         name: "Acme Corporation"
 *         email: "contact@acme.com"
 *         phone: "123-456-7890"
 *         address: "123 Main St, Anytown, USA"
 *     ClientUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the client
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the client (must be unique within the organization)
 *         phone:
 *           type: string
 *           description: Phone number of the client
 *         address:
 *           type: string
 *           description: Physical address of the client
 *       example:
 *         name: "Acme Corp Updated"
 *         phone: "987-654-3210"
 *     Client:
 *       allOf:
 *         - $ref: '#/components/schemas/ClientInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Unique identifier for the client
 *             orgId:
 *               type: string
 *               description: ID of the organization this client belongs to
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the client was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the client was last updated
 *           example:
 *             id: "clxqzqk3h0002u1zkhq8v7e9f"
 *             orgId: "clxqzqk3g0001u1zkhq8v6d8q"
 *             name: "Acme Corporation"
 *             email: "contact@acme.com"
 *             phone: "123-456-7890"
 *             address: "123 Main St, Anytown, USA"
 *             createdAt: "2025-05-31T07:29:12.000Z"
 *             updatedAt: "2025-05-31T07:29:12.000Z"
 */

module.exports = router;

