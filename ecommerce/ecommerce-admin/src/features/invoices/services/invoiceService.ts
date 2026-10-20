import { httpClient } from "@/lib/api";
import type { InvoiceResponse } from "@/features/invoices/types/invoice.types";

const BASE_URL = "/admin/orders";

export const invoiceService = {
  /**
   * Get all invoices for a specific order
   */
  getInvoicesForOrder: async (orderId: string): Promise<InvoiceResponse[]> => {
    const response = await httpClient.get<{ data: InvoiceResponse[] }>(
      `${BASE_URL}/${orderId}/invoices`,
    );
    return response.data.data;
  },

  /**
   * Trigger generation of a new invoice
   */
  generateInvoice: async (
    orderId: string,
    params?: { force?: boolean; reason?: "CORRECTION" | "REFUND" },
  ): Promise<void> => {
    await httpClient.post(`${BASE_URL}/${orderId}/invoices`, params);
  },

  /**
   * Download specific invoice version PDF
   * Returns a Blob
   */
  downloadInvoice: async (
    versionId: string,
    invoiceNumber: string,
  ): Promise<void> => {
    const response = await httpClient.get(`/invoices/${versionId}/download`, {
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Send invoice via email
   */
  emailInvoice: async (versionId: string): Promise<void> => {
    await httpClient.post(`/admin/invoices/${versionId}/email`);
  },
};
