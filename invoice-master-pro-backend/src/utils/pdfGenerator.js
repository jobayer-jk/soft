const PDFDocument = require("pdfkit");
const fs = require("fs");

// Basic function to generate a simple invoice PDF
// This needs to be significantly expanded for customization and data integration
function generateInvoicePDF(invoiceData, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);

        doc.pipe(writeStream);

        // --- Header ---
        doc.fontSize(20).text("INVOICE", { align: "center" });
        doc.moveDown();

        // --- Company & Client Info ---
        // TODO: Replace with actual data from invoiceData.organization and invoiceData.client
        doc.fontSize(10);
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber || 'N/A'}`, { align: "right" });
        doc.text(`Issue Date: ${invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString() : 'N/A'}`, { align: "right" });
        doc.text(`Due Date: ${invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A'}`, { align: "right" });
        doc.moveDown();

        doc.text("From:", { continued: true }).text(" ", { continued: true }).text("To:"); // Placeholder alignment
        doc.text(invoiceData.organization?.name || "Your Company Name");
        doc.text(invoiceData.client?.name || "Client Name", { align: "right" });
        // Add more address details here...
        doc.moveDown(2);

        // --- Invoice Items Table ---
        doc.fontSize(12).text("Items");
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator line
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text("Description", 50, tableTop, { width: 250 });
        doc.text("Qty", 300, tableTop, { width: 50, align: "right" });
        doc.text("Unit Price", 350, tableTop, { width: 80, align: "right" });
        doc.text("Tax", 430, tableTop, { width: 50, align: "right" });
        doc.text("Total", 480, tableTop, { width: 70, align: "right" });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator line
        doc.moveDown();

        // Table Rows
        let itemsTotal = 0;
        invoiceData.items?.forEach(item => {
            const itemY = doc.y;
            const itemTotal = item.quantity * item.unitPrice * (1 + (item.tax || 0) / 100);
            itemsTotal += itemTotal;
            doc.text(item.description, 50, itemY, { width: 250 });
            doc.text(item.quantity.toString(), 300, itemY, { width: 50, align: "right" });
            doc.text(item.unitPrice.toFixed(2), 350, itemY, { width: 80, align: "right" });
            doc.text((item.tax || 0).toFixed(2) + "%", 430, itemY, { width: 50, align: "right" });
            doc.text(itemTotal.toFixed(2), 480, itemY, { width: 70, align: "right" });
            doc.moveDown();
        });

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator line
        doc.moveDown();

        // --- Totals ---
        doc.fontSize(10);
        doc.text(`Subtotal: ${itemsTotal.toFixed(2)}`, { align: "right" });
        // TODO: Add logic for overall taxes, discounts, shipping
        doc.moveDown();
        doc.fontSize(12).text(`Total Amount: ${invoiceData.total?.toFixed(2) || itemsTotal.toFixed(2)}`, { align: "right" });
        doc.moveDown(2);

        // --- Notes & Terms ---
        doc.fontSize(10);
        if (invoiceData.notes) {
            doc.text("Notes:", { underline: true });
            doc.text(invoiceData.notes);
            doc.moveDown();
        }
        if (invoiceData.terms) {
            doc.text("Terms & Conditions:", { underline: true });
            doc.text(invoiceData.terms);
        }

        // --- Footer ---
        // Example: Add page numbers or company contact info
        doc.fontSize(8).text("Thank you for your business!", 50, 750, { align: "center", width: 500 });

        // Finalize PDF file
        doc.end();

        writeStream.on('finish', () => {
            console.log(`PDF generated successfully at ${outputPath}`);
            resolve(outputPath);
        });

        writeStream.on('error', (err) => {
            console.error(`Error generating PDF: ${err}`);
            reject(err);
        });
    });
}

module.exports = { generateInvoicePDF };

