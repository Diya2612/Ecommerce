import { z } from 'zod';

export const generateInvoiceBodySchema = z.object({
  force: z.boolean().optional(),
});

export const invoiceVersionParamsSchema = z.object({
  versionId: z.string().min(1, 'Version ID is required'),
});

export const orderInvoiceParamsSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
});

