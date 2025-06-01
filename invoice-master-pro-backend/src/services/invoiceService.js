const prisma = require("../config/prisma");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const path = require("path");
const fs = require("fs");

// Helper function to generate the next invoice number (simple sequential example)
// TODO: Make this more robust and configurable per organization (e.g., prefix, padding)
async function getNextInvoiceNumber(orgId) {
    const lastInvoice = await prisma.invoice.findFirst({
        where: { orgId },
        orderBy: { createdAt: 'desc' }, // Assuming createdAt approximates sequence
        select: { invoiceNumber: true }
    });

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        // Attempt to parse the number part, assuming a simple numeric or basic prefix format
        const numPart = lastInvoice.invoiceNumber.match(/\d+$/);
        if (numPart) {
            nextNumber = parseInt(numPart[0], 10) + 1;
        }
        // If no number found or parsing fails, default back to 1 or handle prefix logic
    }
    // Simple padding example
    return `INV-${String(nextNumber).padStart(5, '0')}`;
}

// Service to create a new invoice
const createInvoice = async (invoiceInput, orgId) => {
    const { clientId, items, issueDate, dueDate, notes, terms, status = 'DRAFT' } = invoiceInput;

    if (!orgId || !clientId || !items || !dueDate) {
        throw new Error("Organization ID, Client ID, items, and due date are required.");
    }

    // Verify client exists and belongs to the organization
    const client = await prisma.client.findFirst({
        where: { id: clientId, orgId: orgId }
    });
    if (!client) {
        throw new Error("Client not found or does not belong to this organization.");
    }

    // Calculate totals and prepare invoice items data
    let subtotal = 0;
    const invoiceItemsData = items.map(item => {
        if (!item.description || item.quantity == null || item.unitPrice == null) {
            throw new Error("Each item must have description, quantity, and unitPrice.");
        }
        const itemTotal = item.quantity * item.unitPrice * (1 + (item.tax || 0) / 100);
        subtotal += itemTotal;
        return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax || 0,
            total: itemTotal,
            // productId: item.productId // Optional: Link to product if provided
        };
    });

    // TODO: Add logic for overall discounts, shipping, taxes affecting the grand total
    const grandTotal = subtotal; // Placeholder

    // Generate invoice number
    const invoiceNumber = await getNextInvoiceNumber(orgId);

    // Create invoice and items in a transaction
    const newInvoice = await prisma.invoice.create({
        data: {
            orgId,
            clientId,
            invoiceNumber,
            status,
            total: grandTotal,
            issueDate: issueDate ? new Date(issueDate) : new Date(),
            dueDate: new Date(dueDate),
            notes,
            terms,
            items: {
                create: invoiceItemsData,
            },
        },
        include: { // Include items in the response
            items: true,
            client: true // Include client details
        },
    });

    return newInvoice;
};

// Service to get all invoices for an organization
const getInvoices = async (orgId, filters = {}) => {
    if (!orgId) {
        throw new Error("Organization ID is required.");
    }
    // TODO: Implement filtering (by client, status, date range) and pagination
    const whereClause = { orgId };
    if (filters.clientId) {
        whereClause.clientId = filters.clientId;
    }
    if (filters.status) {
        whereClause.status = filters.status;
    }
    // Add date range filters if needed

    const invoices = await prisma.invoice.findMany({
        where: whereClause,
        include: {
            client: { select: { id: true, name: true, email: true } }, // Include basic client info
            items: { select: { id: true, description: true, quantity: true, total: true } } // Include basic item info
        },
        orderBy: {
            issueDate: 'desc',
        },
        // TODO: Add pagination (skip, take)
    });
    return invoices;
};

// Service to get a single invoice by ID
const getInvoiceById = async (invoiceId, orgId) => {
    if (!orgId) {
        throw new Error("Organization ID is required.");
    }
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            orgId: orgId,
        },
        include: {
            client: true, // Include full client details
            items: true, // Include full item details
            organization: { select: { name: true, logoUrl: true } } // Include basic org details for PDF
        },
    });
    if (!invoice) {
        throw new Error("Invoice not found or access denied.");
    }
    return invoice;
};

// Service to update an invoice
const updateInvoice = async (invoiceId, updateData, orgId) => {
    if (!orgId) {
        throw new Error("Organization ID is required.");
    }

    // Verify invoice exists and belongs to the organization
    const existingInvoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, orgId: orgId },
        include: { items: true }
    });

    if (!existingInvoice) {
        throw new Error("Invoice not found or access denied.");
    }

    // TODO: Add checks - e.g., cannot update certain fields if invoice is PAID or VOID?
    if (existingInvoice.status === 'PAID' || existingInvoice.status === 'VOID') {
        // Potentially restrict updates on paid/void invoices
        // throw new Error(`Cannot update invoice with status ${existingInvoice.status}`);
    }

    // Handle updates to items (more complex: need to identify new, updated, deleted items)
    // For simplicity now, we assume `updateData.items` replaces all existing items if provided.
    // A more robust implementation would handle item-level updates.
    let newTotal = existingInvoice.total;
    let itemsToUpdate = {};

    if (updateData.items) {
        let subtotal = 0;
        const invoiceItemsData = updateData.items.map(item => {
            if (!item.description || item.quantity == null || item.unitPrice == null) {
                throw new Error("Each item must have description, quantity, and unitPrice.");
            }
            const itemTotal = item.quantity * item.unitPrice * (1 + (item.tax || 0) / 100);
            subtotal += itemTotal;
            return {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tax: item.tax || 0,
                total: itemTotal,
            };
        });
        newTotal = subtotal; // Recalculate total based on new items

        // Strategy: Delete existing items and create new ones
        itemsToUpdate = {
            items: {
                deleteMany: {},
                create: invoiceItemsData,
            }
        };
        // Update total in main update payload
        updateData.total = newTotal;
    }

    // Remove 'items' from updateData as it's handled separately via nested write
    const { items, ...invoiceDetailsToUpdate } = updateData;

    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            ...invoiceDetailsToUpdate,
            ...itemsToUpdate, // Apply item changes if any
            // Ensure dates are handled correctly if updated
            issueDate: invoiceDetailsToUpdate.issueDate ? new Date(invoiceDetailsToUpdate.issueDate) : undefined,
            dueDate: invoiceDetailsToUpdate.dueDate ? new Date(invoiceDetailsToUpdate.dueDate) : undefined,
        },
        include: { items: true, client: true },
    });

    return updatedInvoice;
};

// Service to delete an invoice (or mark as VOID)
const deleteInvoice = async (invoiceId, orgId) => {
    if (!orgId) {
        throw new Error("Organization ID is required.");
    }
    const existingInvoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, orgId: orgId }
    });

    if (!existingInvoice) {
        throw new Error("Invoice not found or access denied.");
    }

    // Business Rule: Instead of deleting, mark as VOID if it's not a DRAFT
    if (existingInvoice.status !== 'DRAFT') {
        const voidedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'VOID' }
        });
        return { message: "Invoice marked as VOID.", invoice: voidedInvoice };
    } else {
        // Only allow deletion for DRAFT invoices
        // Need to delete related items first due to relation
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoiceId } });
        await prisma.invoice.delete({ where: { id: invoiceId } });
        return { message: "Draft invoice deleted successfully." };
    }
};

// Service to generate and retrieve the path to an invoice PDF
const generateInvoicePdfService = async (invoiceId, orgId) => {
    const invoiceData = await getInvoiceById(invoiceId, orgId);
    // Include organization data if needed by the PDF template
    // const organization = await prisma.organization.findUnique({ where: { id: orgId } });
    // invoiceData.organization = organization; // Already included in getInvoiceById

    // Define output path (e.g., in a temporary directory)
    const tempDir = path.join(__dirname, '..', '..', 'tmp'); // Create /tmp if it doesn't exist
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const outputPath = path.join(tempDir, `invoice-${invoiceData.invoiceNumber || invoiceId}.pdf`);

    try {
        await generateInvoicePDF(invoiceData, outputPath);
        return outputPath; // Return the path to the generated PDF
    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw new Error("Failed to generate invoice PDF.");
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    generateInvoicePdfService,
};

