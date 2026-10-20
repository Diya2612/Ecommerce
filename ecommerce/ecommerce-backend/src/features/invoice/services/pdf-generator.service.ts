import PDFKit from 'pdfkit';
import { invoiceConfig } from '../config/invoice.config';
import { numberToWords } from '../../../utils/helpers/number-to-words';
import { calculateGST } from '../../../utils/helpers/tax-calculator';

/**
 * PDF Generator Service
 * Low-level PDF creation using PDFKit.
 */
export class PdfGeneratorService {
  /** Generates a physical PDF document for an invoice version. */
  async generate(
    invoice: any,
    order: any,
    items: any[],
    billingAddress: any,
    shippingAddress: any,
    user: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const config = invoiceConfig;
      let yPos = 50;
      const leftMargin = 40;
      const contentWidth = 515;
      const rightMargin = 555;

      // Header Section
      doc
        .lineWidth(1)
        .rect(leftMargin, yPos - 10, contentWidth, 85)
        .stroke();
      let headerY = yPos + 5;

      doc
        .font('Helvetica-Bold')
        .fontSize(config.layout.fontSize.header)
        .text(config.company.name, leftMargin, headerY, { align: 'center', width: contentWidth });

      headerY += 20;
      doc.font('Helvetica').fontSize(config.layout.fontSize.body);

      if (config.company.showGSTIN && config.company.gstin) {
        doc.text(`GSTIN: ${config.company.gstin}`, leftMargin, headerY, {
          align: 'center',
          width: contentWidth,
        });
        headerY += 13;
      }

      doc.text(config.company.address, leftMargin, headerY, {
        align: 'center',
        width: contentWidth,
      });
      headerY += 13;
      doc.text(`Email: ${config.company.email}`, leftMargin, headerY, {
        align: 'center',
        width: contentWidth,
      });

      yPos += 95;

      // Title & Separator
      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .fontSize(config.layout.fontSize.subHeader)
        .text(config.header.title, leftMargin, yPos, { align: 'center', width: contentWidth });

      yPos += 20;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke();

      // Meta Data
      yPos += 10;
      doc.font('Helvetica-Bold').fontSize(config.layout.fontSize.body);

      const invoiceDate = new Date(invoice.created_at).toLocaleDateString('en-IN');
      const placeOfSupply = invoice.version?.place_of_supply || 'MH';

      doc.text(`Invoice No: ${invoice.invoice_number}`, leftMargin, yPos);
      doc.text(`Date: ${invoiceDate}`, 250, yPos);

      if (config.header.showPlaceOfSupply) doc.text(`Place: ${placeOfSupply}`, 450, yPos);
      if (config.header.showTimeOfSupply) {
        const invoiceTime = new Date(invoice.created_at).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        doc.text(`Time: ${invoiceTime}`, 250, yPos + 13);
      }

      yPos += 30;

      // Billing Details
      const addrLine1 = billingAddress?.address_line1 || order.billing_address_line1;
      const addrLine2 = billingAddress?.address_line2 || order.billing_address_line2;
      const city = billingAddress?.city || order.billing_city;
      const state = billingAddress?.state_province || order.billing_state;
      const zip = billingAddress?.postal_code || order.billing_pin_code;

      const addressLines = [
        addrLine1,
        addrLine2,
        city && state ? `${city}, ${state} ${zip || ''}` : null,
      ].filter((line) => line && line !== 'undefined' && line.trim() !== '');

      const customerName =
        billingAddress?.recipient_name ||
        order.billing_name ||
        order.shipping_name ||
        'Valued Customer';

      yPos += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(config.layout.fontSize.body)
        .text('BILL TO:', leftMargin, yPos);
      yPos += 15;
      doc
        .font('Helvetica')
        .fontSize(config.layout.fontSize.body)
        .text(customerName, leftMargin, yPos);
      yPos += 13;

      addressLines.forEach((line) => {
        doc.text(line, leftMargin, yPos);
        yPos += 13;
      });

      if (config.client.showEmail && user.email) {
        doc.text(`Email: ${user.email}`, leftMargin, yPos);
        yPos += 13;
      }
      if (config.client.showPhone && order.billing_phone) {
        doc.text(`Phone: ${order.billing_phone}`, leftMargin, yPos);
        yPos += 13;
      }
      if (config.client.showGSTIN && order.customer_gstin) {
        doc.text(`GSTIN: ${order.customer_gstin}`, leftMargin, yPos);
        yPos += 13;
      }

      // Items Table
      yPos += 15;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke();

      const cols = {
        sl: 40,
        desc: 70,
        hsn: 220,
        qty: 280,
        unit: 330,
        rate: 390,
        disc: 430,
        taxable: 490,
      };

      yPos += 10;
      doc.font('Helvetica-Bold').fontSize(config.layout.fontSize.small);
      if (config.table.showSlNo) doc.text('Sl', cols.sl, yPos).text('No', cols.sl, yPos + 10);
      doc.text('Item Description', cols.desc, yPos);
      if (config.table.showHSN) doc.text('HSN', cols.hsn, yPos).text('Code', cols.hsn, yPos + 10);
      doc.text('Qty', cols.qty, yPos);
      if (config.table.showUnit)
        doc.text('Unit', cols.unit, yPos).text('Price', cols.unit, yPos + 10);
      if (config.table.showRate)
        doc.text('Rate', cols.rate, yPos).text('%', cols.rate + 5, yPos + 10);
      if (config.table.showDiscount) doc.text('Discount', cols.disc, yPos);
      if (config.table.showTaxableValue)
        doc.text('Taxable', cols.taxable, yPos).text('Value', cols.taxable, yPos + 10);

      yPos += 25;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke();

      // Row Rendering
      yPos += 15;
      doc.font('Helvetica').fontSize(config.layout.fontSize.small);

      let subtotal = 0;
      items.forEach((item, index) => {
        const unitPrice = Number(item.unit_price);
        const qty = item.quantity;
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        const taxRate = Number(item.tax_rate || 18);
        const shippingState = (
          shippingAddress?.state_province ||
          order.shipping_state ||
          ''
        ).toLowerCase();
        const itemTaxDetails = calculateGST(
          lineTotal,
          billingAddress?.state_province || order.billing_state || '',
          shippingState,
          config.tax.rate,
          config.tax.isInclusive,
        );

        const isIntraState = ['maharashtra', 'mh', 'pune'].some((k) => shippingState.includes(k));
        const rowStartY = yPos;

        if (config.table.showSlNo) doc.text(String(index + 1), cols.sl, yPos);
        doc.text(item.product_name, cols.desc, yPos, { width: 140 });
        if (config.table.showHSN) doc.text(item.hsn_code || '8471', cols.hsn, yPos);
        doc.text(String(qty), cols.qty, yPos);
        if (config.table.showUnit) doc.text(unitPrice.toFixed(2), cols.unit, yPos);
        if (config.table.showRate) doc.text(`${taxRate}%`, cols.rate, yPos);
        if (config.table.showDiscount) doc.text('0.00', cols.disc, yPos);
        if (config.table.showTaxableValue)
          doc.text(itemTaxDetails.taxableValue.toFixed(2), cols.taxable, yPos, {
            align: 'right',
            width: 60,
          });

        let taxYPos = yPos + 12;
        const descHeight = doc.heightOfString(item.product_name, { width: 140 });
        doc.fontSize(8.5).fillColor(config.layout.colors.secondary);

        if (isIntraState) {
          if (config.summary.showCGSTSGST) {
            const halfTax = itemTaxDetails.taxAmount / 2;
            doc.text(`CGST (${taxRate / 2}%): ${halfTax.toFixed(2)}`, cols.taxable - 20, taxYPos, {
              align: 'right',
              width: 80,
            });
            taxYPos += 10;
            doc.text(`SGST (${taxRate / 2}%): ${halfTax.toFixed(2)}`, cols.taxable - 20, taxYPos, {
              align: 'right',
              width: 80,
            });
          }
        } else if (config.summary.showIGST) {
          doc.text(
            `IGST (${taxRate}%): ${itemTaxDetails.taxAmount.toFixed(2)}`,
            cols.taxable - 20,
            taxYPos,
            { align: 'right', width: 80 },
          );
        }

        yPos = Math.max(rowStartY + descHeight, taxYPos + 10) + 10;
        doc.fontSize(config.layout.fontSize.small).fillColor(config.layout.colors.primary);
      });

      // Summary
      yPos += 10;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke();
      yPos += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('SUMMARY', leftMargin, yPos, { align: 'center', width: contentWidth });
      yPos += 20;
      doc.moveTo(leftMargin, yPos).lineTo(rightMargin, yPos).stroke();

      yPos += 20;
      const taxBreakdown = calculateGST(
        subtotal,
        billingAddress?.state_province || order.billing_state || '',
        shippingAddress?.state_province || order.shipping_state || '',
        config.tax.rate,
        config.tax.isInclusive,
      );
      const shippingAmount = Number(order.shipping_amount || 0);
      const grandTotal = subtotal + taxBreakdown.taxAmount + shippingAmount;

      const summaryLabelX = 350;
      const summaryValueX = 480;
      doc.font('Helvetica').fontSize(10);

      if (config.summary.showSubtotal) {
        doc
          .text('Subtotal:', summaryLabelX, yPos)
          .text(subtotal.toFixed(2), summaryValueX, yPos, { align: 'right' });
        yPos += 15;
      }
      if (config.summary.showDiscount) {
        doc
          .text('Discount:', summaryLabelX, yPos)
          .text((Number(order.discount_amount || 0) * -1).toFixed(2), summaryValueX, yPos, {
            align: 'right',
          });
        yPos += 15;
      }
      if (config.summary.showTaxableValue) {
        doc
          .text('Taxable Value:', summaryLabelX, yPos)
          .text(subtotal.toFixed(2), summaryValueX, yPos, { align: 'right' });
        yPos += 20;
      }

      if (config.summary.showTaxBreakdown) {
        if (taxBreakdown.cgst > 0 && config.summary.showCGSTSGST) {
          doc
            .text('CGST:', summaryLabelX, yPos)
            .text(taxBreakdown.cgst.toFixed(2), summaryValueX, yPos, { align: 'right' });
          yPos += 15;
          doc
            .text('SGST:', summaryLabelX, yPos)
            .text(taxBreakdown.sgst.toFixed(2), summaryValueX, yPos, { align: 'right' });
          yPos += 15;
        } else if (taxBreakdown.igst > 0 && config.summary.showIGST) {
          doc
            .text('IGST:', summaryLabelX, yPos)
            .text(taxBreakdown.igst.toFixed(2), summaryValueX, yPos, { align: 'right' });
          yPos += 15;
        }
      }

      if (config.summary.showTotalTax) {
        doc
          .text('Total Tax:', summaryLabelX, yPos)
          .text(taxBreakdown.taxAmount.toFixed(2), summaryValueX, yPos, { align: 'right' });
        yPos += 15;
      }
      if (config.summary.showShipping && shippingAmount > 0) {
        doc
          .text('Shipping:', summaryLabelX, yPos)
          .text(shippingAmount.toFixed(2), summaryValueX, yPos, { align: 'right' });
        yPos += 15;
      }

      yPos += 10;
      doc.moveTo(summaryLabelX, yPos).lineTo(rightMargin, yPos).stroke();
      yPos += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('GRAND TOTAL:', summaryLabelX, yPos)
        .text(grandTotal.toFixed(2), summaryValueX, yPos, { align: 'right' });

      // Footer
      yPos += 30;
      if (config.footer.showAmountInWords) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(10)
          .text(`Amount in Words: ${numberToWords(Math.round(grandTotal))}`, leftMargin, yPos);
        yPos += 20;
      }

      if (config.footer.termsAndConditions?.length) {
        doc.font('Helvetica').fontSize(9).text('Terms & Conditions:', leftMargin, yPos);
        yPos += 12;
        config.footer.termsAndConditions.forEach((term: string) => {
          doc.text(term, leftMargin, yPos);
          yPos += 12;
        });
      }

      if (config.footer.greeting) {
        yPos += 30;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(config.footer.greeting, leftMargin, yPos, { align: 'center', width: contentWidth });
      }

      if (config.footer.showAuthorizedSignatory) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .text('For ANANT ENTERPRISES', 400, yPos, { align: 'right', width: 155 });
        doc.text('Authorized Signatory', 400, yPos + 35, { align: 'right', width: 155 });
      }

      doc.end();
    });
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
