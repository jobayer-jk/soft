const invoiceService = require("../services/invoiceService");
const fs = require("fs");

// Controller to create a new invoice
const createInvoice = async (req, res, next) => {
    const invoiceInput = req.body;
    const orgId = req.user?.orgId;

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }
    // Add more validation for invoiceInput fields if necessary
    if (!invoiceInput.clientId || !invoiceInput.items || !invoiceInput.dueDate) {
        return res.status(400).json({ message: "Client ID, items, and due date are required." });
    }

    try {
        const invoice = await invoiceService.createInvoice(invoiceInput, orgId);
        res.status(201).json(invoice);
    } catch (error) {
        if (error.message.includes("Client not found")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("required")) {
             return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

// Controller to get all invoices
const getInvoices = async (req, res, next) => {
    const orgId = req.user?.orgId;
    const filters = req.query; // e.g., ?clientId=...&status=...

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }

    try {
        const invoices = await invoiceService.getInvoices(orgId, filters);
        res.status(200).json(invoices);
    } catch (error) {
        next(error);
    }
};

// Controller to get a single invoice by ID
const getInvoiceById = async (req, res, next) => {
    const { invoiceId } = req.params;
    const orgId = req.user?.orgId;

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }

    try {
        const invoice = await invoiceService.getInvoiceById(invoiceId, orgId);
        res.status(200).json(invoice);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// Controller to update an invoice
const updateInvoice = async (req, res, next) => {
    const { invoiceId } = req.params;
    const updateData = req.body;
    const orgId = req.user?.orgId;

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }

    try {
        const updatedInvoice = await invoiceService.updateInvoice(invoiceId, updateData, orgId);
        res.status(200).json(updatedInvoice);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
         if (error.message.includes("required")) {
             return res.status(400).json({ message: error.message });
        }
        // Handle other specific errors like trying to update PAID/VOID invoices if needed
        next(error);
    }
};

// Controller to delete an invoice (or mark as VOID)
const deleteInvoice = async (req, res, next) => {
    const { invoiceId } = req.params;
    const orgId = req.user?.orgId;

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }

    try {
        const result = await invoiceService.deleteInvoice(invoiceId, orgId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// Controller to download an invoice PDF
const downloadInvoicePdf = async (req, res, next) => {
    const { invoiceId } = req.params;
    const orgId = req.user?.orgId;

    if (!orgId) {
        return res.status(400).json({ message: "Organization context is missing." });
    }

    try {
        const pdfPath = await invoiceService.generateInvoicePdfService(invoiceId, orgId);

        // Send the file
        res.download(pdfPath, (err) => {
            if (err) {
                console.error("Error sending PDF file:", err);
                // Avoid sending error response if headers already sent
                if (!res.headersSent) {
                    next(err); // Pass error to handler
                }
            }
            // Clean up the temporary file after sending
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting temporary PDF file:", unlinkErr);
                }
            });
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: "Invoice not found or access denied." });
        }
        if (error.message.includes("Failed to generate")) {
            return res.status(500).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    downloadInvoicePdf,
};

