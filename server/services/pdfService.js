const PDFDocument = require("pdfkit");
const { cloudinary } = require("../config/cloudinary");

const generateInvoice = (billing) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Grand Paradise", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Invoice", { align: "center" });
    doc.moveDown();

    // Invoice info
    doc.fontSize(10);
    doc.text(`Invoice ID: ${billing._id}`);
    doc.text(`Date: ${new Date(billing.createdAt).toLocaleDateString()}`);
    doc.text(`Type: ${billing.type}`);
    if (billing.customer?.name) doc.text(`Customer: ${billing.customer.name}`);
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Items header
    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Item", 50, tableTop, { width: 200 });
    doc.text("Qty", 260, tableTop, { width: 60, align: "center" });
    doc.text("Price", 330, tableTop, { width: 80, align: "right" });
    doc.text("Total", 420, tableTop, { width: 80, align: "right" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    doc.font("Helvetica");
    if (billing.items && billing.items.length > 0) {
      billing.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.name || "Item", 50, y, { width: 200 });
        doc.text(String(item.quantity || 1), 260, y, { width: 60, align: "center" });
        doc.text(`₹${(item.unitPrice || 0).toFixed(2)}`, 330, y, { width: 80, align: "right" });
        doc.text(`₹${(item.total || 0).toFixed(2)}`, 420, y, { width: 80, align: "right" });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totals
    const rightAlign = 420;
    doc.text(`Subtotal: ₹${(billing.subtotal || 0).toFixed(2)}`, rightAlign, doc.y, { width: 130, align: "right" });
    doc.text(`GST (${billing.gstRate || 0}%): ₹${(billing.gstAmount || 0).toFixed(2)}`, rightAlign, doc.y, { width: 130, align: "right" });
    if (billing.discount > 0) {
      doc.text(`Discount: -₹${billing.discount.toFixed(2)}`, rightAlign, doc.y, { width: 130, align: "right" });
    }
    if (billing.loyaltyPointsUsed > 0) {
      doc.text(`Loyalty: -₹${billing.loyaltyPointsUsed.toFixed(2)}`, rightAlign, doc.y, { width: 130, align: "right" });
    }
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(14);
    doc.text(`Total: ₹${(billing.total || 0).toFixed(2)}`, rightAlign, doc.y, { width: 130, align: "right" });

    // Footer
    doc.moveDown(2);
    doc.font("Helvetica").fontSize(9).fillColor("#666");
    doc.text("Thank you for choosing Grand Paradise!", { align: "center" });

    doc.end();
  });
};

const uploadInvoiceToCloudinary = (buffer, billingId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "invoices",
        resource_type: "raw",
        format: "pdf",
        public_id: `invoice_${billingId}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

module.exports = { generateInvoice, uploadInvoiceToCloudinary };
