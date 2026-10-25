import { db } from '../../../database';
import {
  invoices,
  invoiceVersions,
  invoiceLineItems,
  type NewInvoice,
  type NewInvoiceVersion,
  invoiceQueries,
} from '../shared';
import { eq } from 'drizzle-orm';
import { HttpException, logger } from '../../../utils';
import { pdfGeneratorService } from './pdf-generator.service';
import { invoiceCalculatorService } from './invoice-calculator.service';
import { uploadToStorage, downloadFromStorageAsBuffer } from '../../../utils/supabase/storage';

/**
 * Invoice Service
 * Orchestrates invoice generation, versioning, and storage.
 */
export class InvoiceService {
  /** Generates a formatted invoice number: INV-YYYY-MM-XXXXXX */
  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}-${month}-`;

    const count = await invoiceQueries.getInvoiceCountForMonth(prefix);
    const sequence = String(count + 1).padStart(6, '0');

    return `${prefix}${sequence}`;
  }

  /**
   * Generates or increments an invoice for a specific order.
   * Atomic operation including tax calculation, versioning, and PDF upload.
   */
  async generateInvoice(orderId: string, options?: { forceNewVersion?: boolean }): Promise<any> {
    logger.info('Generating invoice for order', { orderId });

    const order = await invoiceQueries.getOrderDetailsWithAddresses(orderId);
    if (!order) throw new HttpException(404, 'Order not found');

    const existingInvoice = await invoiceQueries.getInvoiceByOrderId(orderId);
    if (existingInvoice && !options?.forceNewVersion) {
      return this.getLatestInvoiceForOrder(orderId);
    }

    const orderItemsResult = await invoiceQueries.getOrderItemsWithHsn(orderId);
    const user = await invoiceQueries.getUserById(order.user_id || '');
    const billingAddress = order.billing_address_id
      ? await invoiceQueries.getAddressById(order.billing_address_id)
      : null;
    const shippingAddress = order.shipping_address_id
      ? await invoiceQueries.getAddressById(order.shipping_address_id)
      : null;

    await db.transaction(async (tx) => {
      let invoiceId = '';
      let versionNumber = 1;
      let invoiceNumber = '';
      let currentInvoice;

      if (existingInvoice) {
        invoiceId = existingInvoice.id;
        invoiceNumber = existingInvoice.invoice_number;
        versionNumber = (existingInvoice.latest_version || 1) + 1;
        currentInvoice = existingInvoice;

        await tx
          .update(invoices)
          .set({ latest_version: versionNumber, updated_at: new Date() })
          .where(eq(invoices.id, invoiceId));
      } else {
        invoiceNumber = await this.generateInvoiceNumber();

        const newInvoice: NewInvoice = {
          id: crypto.randomUUID(),
          order_id: orderId,
          invoice_number: invoiceNumber,
          latest_version: 1,
          status: 'generated',
          created_at: new Date(),
          updated_at: new Date(),
        };

        const [invoice] = await tx.insert(invoices).values(newInvoice).returning();
        invoiceId = invoice.id;
        currentInvoice = invoice;
      }

      const totals = invoiceCalculatorService.calculateTotals(
        orderItemsResult,
        billingAddress,
        shippingAddress,
        order.shipping_amount,
      );

      const newInvoiceVersion: NewInvoiceVersion = {
        id: crypto.randomUUID(),
        invoice_id: invoiceId,
        version_number: versionNumber,
        customer_name: billingAddress?.recipient_name || shippingAddress?.recipient_name || 'Guest',
        customer_email: user?.email || '',
        billing_address: billingAddress
          ? `${billingAddress.address_line1}, ${billingAddress.address_line2 || ''}, ${billingAddress.city}, ${billingAddress.state_province} ${billingAddress.postal_code}`
          : '',
        shipping_address: shippingAddress
          ? `${shippingAddress.address_line1}, ${shippingAddress.address_line2 || ''}, ${shippingAddress.city}, ${shippingAddress.state_province} ${shippingAddress.postal_code}`
          : '',
        place_of_supply: billingAddress?.state_province || '',
        subtotal: totals.taxableValue.toString(),
        discount: order.discount_amount,
        shipping: order.shipping_amount,
        tax_amount: totals.taxAmount.toString(),
        grand_total: totals.grandTotal.toString(),
        cgst: totals.cgst.toString(),
        sgst: totals.sgst.toString(),
        igst: totals.igst.toString(),
        tax_type: totals.igst > 0 ? 'igst' : 'cgst_sgst',
        reason: options?.forceNewVersion ? 'CORRECTION' : 'INITIAL',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [invoiceVersion] = await tx
        .insert(invoiceVersions)
        .values(newInvoiceVersion)
        .returning();

      const invoiceLineItemsData = invoiceCalculatorService.mapOrderItemsToLineItems(
        invoiceVersion.id,
        orderItemsResult,
        totals.cgst,
        totals.sgst,
        totals.igst,
      );

      await tx.insert(invoiceLineItems).values(invoiceLineItemsData);

      const pdfBuffer: Buffer = await pdfGeneratorService.generate(
        currentInvoice,
        order,
        orderItemsResult,
        billingAddress,
        shippingAddress,
        user,
      );

      const folderPath = `invoices/${order.order_number || 'anonymous'}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const fileName = `${invoiceNumber}.pdf`;

      const uploadResult = await uploadToStorage(
        pdfBuffer,
        fileName,
        'application/pdf',
        order.user_id || 'anonymous',
        { folder: folderPath },
      );

      await tx
        .update(invoiceVersions)
        .set({
          pdf_url: uploadResult.url,
          pdf_path: uploadResult.key,
          pdf_generated_at: new Date(),
        })
        .where(eq(invoiceVersions.id, invoiceVersion.id));
    });

    return this.getLatestInvoiceForOrder(orderId);
  }

  /** Retrieves full invoice hierarchy for the latest version of an order. */
  async getLatestInvoiceForOrder(orderId: string): Promise<any> {
    try {
      const invoice = await invoiceQueries.getInvoiceByOrderId(orderId);
      if (!invoice) throw new HttpException(404, 'Invoice not found');

      const latestVersion = await invoiceQueries.getLatestInvoiceVersion(
        invoice.id,
        invoice.latest_version || 1,
      );
      if (!latestVersion) throw new HttpException(404, 'Invoice version not found');

      const lineItems = await invoiceQueries.getInvoiceLineItemsByVersionId(latestVersion.id);
      return { ...invoice, version: latestVersion, line_items: lineItems };
    } catch (error) {
      logger.error('Error getting latest invoice for order', { orderId, error });
      throw error;
    }
  }

  /** Retrieves full invoice data for a specific version. */
  async getInvoiceByVersionId(versionId: string): Promise<any> {
    try {
      const version = await invoiceQueries.getInvoiceVersionById(versionId);
      if (!version) throw new HttpException(404, 'Invoice version not found');

      const invoice = await invoiceQueries.getInvoiceById(version.invoice_id);
      const lineItems = await invoiceQueries.getInvoiceLineItemsByVersionId(versionId);

      return { ...invoice, version, line_items: lineItems };
    } catch (error) {
      logger.error('Error getting invoice by version ID', { versionId, error });
      throw error;
    }
  }

  /** Validates that an invoice version exists and returns its full data. */
  async getValidatedVersion(versionId: string) {
    const invoiceData = await this.getInvoiceByVersionId(versionId);
    if (!invoiceData?.version) throw new HttpException(404, 'Invoice version not found');
    return invoiceData;
  }

  /** Downloads a generated invoice PDF as a buffer. */
  async downloadInvoice(versionId: string): Promise<{ buffer: Buffer; filename: string }> {
    try {
      const version = await invoiceQueries.getInvoiceVersionById(versionId);
      if (!version?.pdf_url || !version.pdf_path) {
        throw new HttpException(404, 'Invoice PDF not found or path missing');
      }

      const invoice = await invoiceQueries.getInvoiceById(version.invoice_id);
      const filename = `${invoice?.invoice_number || 'invoice'}.pdf`;
      const buffer = await downloadFromStorageAsBuffer(version.pdf_path);

      return { buffer, filename };
    } catch (error) {
      logger.error('Error downloading invoice', { versionId, error });
      throw error;
    }
  }

  /** Retrieves list of all versions for an order's invoice. */
  async getInvoicesForOrder(orderId: string): Promise<any[]> {
    try {
      const invoice = await invoiceQueries.getInvoiceByOrderId(orderId);
      if (!invoice) return [];

      const versions = await invoiceQueries.getAllInvoiceVersionsByInvoiceId(invoice.id);
      return versions.map((version) => ({ ...invoice, version }));
    } catch (error) {
      logger.error('Error getting invoices for order', { orderId, error });
      throw error;
    }
  }

  /** Manually updates the lifecycle status of an invoice. */
  async updateInvoiceStatus(
    invoiceId: string,
    status: 'draft' | 'generated' | 'sent' | 'cancelled',
  ): Promise<void> {
    try {
      await invoiceQueries.updateInvoiceStatus(invoiceId, status);
    } catch (error) {
      logger.error('Error updating invoice status', { invoiceId, status, error });
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
