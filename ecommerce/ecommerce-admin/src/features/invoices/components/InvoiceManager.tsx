import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { invoiceService } from "../services/invoiceService";
import type { InvoiceResponse } from "../types/invoice.types";

interface InvoiceManagerProps {
  orderId: string;
  lastModified?: string;
  variant?: "card" | "embedded";
}

export function InvoiceManager({
  orderId,
  lastModified,
  variant = "card",
}: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoiceService.getInvoicesForOrder(orderId);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
      toast.error("Could not load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchInvoices();
    }
  }, [orderId]);

  const handleGenerateInvoice = async (force = false) => {
    try {
      setIsGenerating(true);
      await invoiceService.generateInvoice(orderId, {
        force,
        reason: force ? "CORRECTION" : undefined,
      });
      toast.success("Invoice generated successfully");
      await fetchInvoices(); // Refresh immediately after success
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (
    pdfUrl: string | null | undefined,
    versionId: string,
    number: string,
  ) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
      return;
    }

    try {
      toast.loading("Downloading invoice...");
      await invoiceService.downloadInvoice(versionId, number);
      toast.dismiss();
      toast.success("Download started");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download invoice");
    }
  };

  const handleEmailInvoice = async (versionId: string) => {
    try {
      setIsEmailing(versionId);
      toast.loading("Sending invoice email...");
      await invoiceService.emailInvoice(versionId);
      toast.dismiss();
      toast.success("Invoice sent via email");
    } catch (error) {
      toast.dismiss();
      console.error("Failed to email invoice:", error);
      toast.error("Failed to send email");
    } finally {
      setIsEmailing(null);
    }
  };

  // Logic:
  // 1. If no invoices, CAN GENERATE.
  // 2. If invoices exist:
  //    - Find the LATEST generated invoice (by created_at).
  //    - Compare its created_at with order's lastModified.
  //    - If Order.lastModified > LatestInvoice.created_at -> CAN REGENERATE (Order changed).
  //    - Else -> DISABLE REGENERATE (Order is same as invoice state).

  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const sortedInvoices = [...safeInvoices].sort(
    (a, b) =>
      new Date(b.version?.created_at || 0).getTime() -
      new Date(a.version?.created_at || 0).getTime(),
  );
  const latestInvoice = sortedInvoices[0];

  const hasInvoices = safeInvoices.length > 0;

  let canRegenerate = false;
  if (hasInvoices && lastModified && latestInvoice?.version?.created_at) {
    const orderTime = new Date(lastModified).getTime();
    const invoiceTime = new Date(latestInvoice.version.created_at).getTime();
    // Allow some buffer (e.g. 1 sec) or precise comparison
    canRegenerate = orderTime > invoiceTime;
  }

  // If there are no invoices, we can always generate
  const isGenerateEnabled = !hasInvoices || canRegenerate;

  const HeaderActions = () => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchInvoices}
        disabled={isLoading}
        className={cn(
          "rounded-lg",
          variant === "embedded" ? "h-8 w-8 p-0" : ""
        )}
      >
        <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        <span className="sr-only">Refresh</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleGenerateInvoice(hasInvoices)}
        disabled={!isGenerateEnabled || isGenerating || isLoading}
        className={cn(
          "rounded-lg gap-2",
          variant === "embedded" ? "h-8 text-xs px-3" : ""
        )}
      >
        {isGenerating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Plus className="size-3.5 text-icon-muted" />
        )}
        {hasInvoices ? "Regenerate" : "Invoice"}
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div
      className={`text-center py-6 text-slate-500 ${variant === "embedded" ? "bg-slate-50/50 rounded-lg border border-dashed border-slate-200" : ""}`}
    >
      <FileText className="size-8 mx-auto mb-2 text-slate-300" />
      <p className="text-sm">No invoices generated yet</p>
      {variant === "embedded" && (
        <Button
          variant="link"
          size="sm"
          onClick={() => handleGenerateInvoice(false)}
          className="mt-1 text-indigo-600 h-auto p-0"
        >
          Generate now
        </Button>
      )}
    </div>
  );

  const EmbeddedListView = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="space-y-0 divide-y divide-slate-100">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-icon-muted" />
            <h3 className="text-sm font-semibold text-slate-900">Invoices</h3>
          </div>
          <HeaderActions />
        </div>

        {isLoading && invoices.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Loading...
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2 pt-2">
            {sortedInvoices.map((inv) => {
              const isLatest = inv.version.version_number === inv.latest_version;

              return (
                <div
                  key={inv.version.id}
                  className="group flex items-start justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 size-8 rounded-full flex items-center justify-center shrink-0 ${isLatest ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 text-sm">
                          {inv.invoice_number}
                        </span>
                        {inv.latest_version > 1 && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            v{inv.version.version_number}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-x-3 gap-y-1 mt-1 flex-wrap text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {format(
                            new Date(inv.version.created_at),
                            "MMM d, h:mm a",
                          )}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          ₹{inv.version.grand_total}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {isLatest ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5 px-1.5 font-medium gap-1 hover:bg-green-100"
                          >
                            <CheckCircle2 className="size-3" />
                            Latest
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-500 border-slate-200 text-[10px] h-5 px-1.5 font-normal gap-1"
                          >
                            <AlertCircle className="size-3" />
                            Outdated
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-200 text-[10px] h-5 px-1.5 font-normal"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handleEmailInvoice(inv.version.id)}
                      disabled={!!isEmailing}
                      title="Email Invoice"
                    >
                      <Mail
                        className={`size-4 ${isEmailing === inv.version.id ? "animate-pulse" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() =>
                        handleDownload(
                          inv.version.pdf_url,
                          inv.version.id,
                          inv.invoice_number || "invoice",
                        )
                      }
                      title="Download PDF"
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div >
  );

  if (variant === "embedded") {
    return <EmbeddedListView />;
  }

  // Default 'card' view (Legacy / Full Page)
  return (
    <Card className="rounded-card border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-slate-900">
            Invoices
          </CardTitle>
          <CardDescription>
            Manage and download invoices for this order
          </CardDescription>
        </div>
        <HeaderActions />
      </CardHeader>
      <CardContent>
        {isLoading && invoices.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((inv) => (
                  <TableRow key={inv.version.id}>
                    <TableCell className="font-medium">
                      {inv.invoice_number}
                      {inv.latest_version > 1 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          v{inv.version.version_number}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(inv.version.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>₹{inv.version.grand_total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "generated" ? "default" : "secondary"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmailInvoice(inv.version.id)}
                          disabled={!!isEmailing}
                        >
                          <Mail className="size-4" />
                          <span className="sr-only">Email</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              inv.version.pdf_url,
                              inv.version.id,
                              inv.invoice_number || "invoice",
                            )
                          }
                        >
                          <Download className="size-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
