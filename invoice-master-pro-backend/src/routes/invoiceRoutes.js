const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const { authenticateToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and generation
 */

// Apply authentication middleware to all invoice routes
router.use(authenticateToken);
// Optional: Apply role-based access if needed
// router.use(authorizeRoles("ADMIN", "STAFF", "ACCOUNTANT"));

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceInput'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request (e.g., missing required fields, invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Client not found
 */
router.post("/", invoiceController.createInvoice);

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Retrieve a list of invoices for the organization
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter invoices by client ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, VOID]
 *         description: Filter invoices by status
 *       # Add other potential query parameters for filtering/pagination here
 *     responses:
 *       200:
 *         description: A list of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InvoiceSummary'
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 */
router.get("/", invoiceController.getInvoices);

/**
 * @swagger
 * /invoices/{invoiceId}:
 *   get:
 *     summary: Retrieve a single invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to retrieve
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found or access denied
 */
router.get("/:invoiceId", invoiceController.getInvoiceById);

/**
 * @swagger
 * /invoices/{invoiceId}:
 *   put:
 *     summary: Update an existing invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceUpdateInput'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request (e.g., no update data, invalid org context, missing item fields)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found or access denied
 */
router.put("/:invoiceId", invoiceController.updateInvoice);

/**
 * @swagger
 * /invoices/{invoiceId}:
 *   delete:
 *     summary: Delete a draft invoice or void a non-draft invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to delete or void
 *     responses:
 *       200:
 *         description: Invoice deleted or voided successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice' # Included when voiding
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found or access denied
 */
router.delete("/:invoiceId", invoiceController.deleteInvoice);

/**
 * @swagger
 * /invoices/{invoiceId}/pdf:
 *   get:
 *     summary: Download the invoice as a PDF file
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to download
 *     responses:
 *       200:
 *         description: Invoice PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request (e.g., invalid org context)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found or access denied
 *       500:
 *         description: Failed to generate invoice PDF
 */
router.get("/:invoiceId/pdf", invoiceController.downloadInvoicePdf);


/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceItemInput:
 *       type: object
 *       required:
 *         - description
 *         - quantity
 *         - unitPrice
 *       properties:
 *         description:
 *           type: string
 *           description: Description of the invoice item
 *         quantity:
 *           type: integer
 *           format: int32
 *           description: Quantity of the item
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: Price per unit
 *         tax:
 *           type: number
 *           format: float
 *           description: Tax percentage for the item (e.g., 10 for 10%)
 *           default: 0
 *         productId:
 *           type: string
 *           description: Optional ID of the product/service from the catalog
 *       example:
 *         description: "Web Development Services"
 *         quantity: 10
 *         unitPrice: 75.00
 *         tax: 5
 *     InvoiceInput:
 *       type: object
 *       required:
 *         - clientId
 *         - items
 *         - dueDate
 *       properties:
 *         clientId:
 *           type: string
 *           description: ID of the client this invoice is for
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItemInput'
 *           description: List of items included in the invoice
 *         issueDate:
 *           type: string
 *           format: date
 *           description: Date the invoice was issued (defaults to today if not provided)
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Date the invoice payment is due
 *         notes:
 *           type: string
 *           description: Additional notes for the client
 *         terms:
 *           type: string
 *           description: Payment terms and conditions
 *         status:
 *           type: string
 *           enum: [DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, VOID]
 *           default: DRAFT
 *           description: Initial status of the invoice
 *       example:
 *         clientId: "clxqzqk3h0002u1zkhq8v7e9f"
 *         items:
 *           - description: "Web Design Mockups"
 *             quantity: 1
 *             unitPrice: 500
 *             tax: 0
 *           - description: "Frontend Development (hours)"
 *             quantity: 20
 *             unitPrice: 80
 *             tax: 10
 *         dueDate: "2025-06-30"
 *         notes: "Thank you for your business."
 *         terms: "Payment due within 30 days."
 *     InvoiceUpdateInput:
 *       type: object
 *       properties:
 *         clientId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItemInput'
 *         issueDate:
 *           type: string
 *           format: date
 *         dueDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 *         terms:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, VOID]
 *       example:
 *         status: "SENT"
 *         notes: "Updated notes: Payment reminder sent."
 *     InvoiceItem:
 *       allOf:
 *         - $ref: '#/components/schemas/InvoiceItemInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *             invoiceId:
 *               type: string
 *             total:
 *               type: number
 *               format: float
 *               description: Calculated total for the item line (quantity * unitPrice * (1 + tax/100))
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *           example:
 *             id: "clxqzqk3i0003u1zkhq8v8f0g"
 *             invoiceId: "clxqzqk3j0004u1zkhq8v9h1h"
 *             description: "Web Development Services"
 *             quantity: 10
 *             unitPrice: 75.00
 *             tax: 5
 *             total: 787.50
 *             createdAt: "2025-05-31T07:31:12.000Z"
 *             updatedAt: "2025-05-31T07:31:12.000Z"
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orgId:
 *           type: string
 *         clientId:
 *           type: string
 *         invoiceNumber:
 *           type: string
 *           description: Automatically generated unique invoice number
 *         status:
 *           type: string
 *           enum: [DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, VOID]
 *         total:
 *           type: number
 *           format: float
 *           description: The grand total amount of the invoice
 *         issueDate:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         terms:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *         client:
 *           $ref: '#/components/schemas/Client'
 *       example:
 *         id: "clxqzqk3j0004u1zkhq8v9h1h"
 *         orgId: "clxqzqk3g0001u1zkhq8v6d8q"
 *         clientId: "clxqzqk3h0002u1zkhq8v7e9f"
 *         invoiceNumber: "INV-00001"
 *         status: "DRAFT"
 *         total: 2287.50 # Example total (500 + 1600*1.1)
 *         issueDate: "2025-05-31T07:31:12.000Z"
 *         dueDate: "2025-06-30T00:00:00.000Z"
 *         notes: "Thank you for your business."
 *         terms: "Payment due within 30 days."
 *         createdAt: "2025-05-31T07:31:12.000Z"
 *         updatedAt: "2025-05-31T07:31:12.000Z"
 *         items: [] # Array of InvoiceItem objects
 *         client: {} # Client object
 *     InvoiceSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         invoiceNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, SENT, VIEWED, PARTIALLY_PAID, PAID, OVERDUE, VOID]
 *         total:
 *           type: number
 *           format: float
 *         issueDate:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 *         client:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *       example:
 *         id: "clxqzqk3j0004u1zkhq8v9h1h"
 *         invoiceNumber: "INV-00001"
 *         status: "DRAFT"
 *         total: 2287.50
 *         issueDate: "2025-05-31T07:31:12.000Z"
 *         dueDate: "2025-06-30T00:00:00.000Z"
 *         client:
 *           id: "clxqzqk3h0002u1zkhq8v7e9f"
 *           name: "Acme Corporation"
 *           email: "contact@acme.com"
 */

module.exports = router;

