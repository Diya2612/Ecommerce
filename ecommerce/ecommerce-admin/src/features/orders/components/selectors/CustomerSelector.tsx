import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  User,
  // Mail,
  // Phone,
  // FileText,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import type { Customer } from "../../types";
import type { CustomerSelectorProps } from "../../types";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { type Customer as ApiCustomer } from "@/features/customers/types/customer.types";

export function CustomerSelector({
  selectedCustomer,
  onSelect,
  variant = "dialog",
}: CustomerSelectorProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch customers
  const { data: customersData, isLoading } = useCustomers({
    page: 1,
    limit: 10,
    search: debouncedQuery,
  });

  // Map API customers to Order Customer type
  const mapApiCustomerToOrderCustomer = (apiCustomer: ApiCustomer): Customer => {
    const isB2B = apiCustomer.type === "Distributor" || apiCustomer.type === "Wholesale";
    const raw = apiCustomer as any;
    const firstName = raw.first_name || raw.firstName || "";
    const lastName = raw.last_name || raw.lastName || "";

    // Construct name from firstName + lastName
    let name = [firstName, lastName].filter(Boolean).join(" ");
    // Fallback to displayName if firstName+lastName not available
    if (!name) {
      name = apiCustomer.displayName || raw.display_name || raw.username || "";
    }
    if (!name) name = "Unknown Customer";

    return {
      id: apiCustomer.id,
      customerId: raw.display_id || apiCustomer.customerId,
      name: name,
      email: apiCustomer.email,
      phone: apiCustomer.phone,
      gstin: apiCustomer.gstin,
      type: isB2B ? "B2B" : "B2C",
    };
  };

  const filteredCustomers: Customer[] = ((customersData?.data as any)?.users || customersData?.data || []).map(mapApiCustomerToOrderCustomer);

  const handleSelectCustomer = (customer: Customer) => {
    onSelect(customer);
    setShowModal(false);
    setSearchQuery("");
  };

  const Content = (
    <>
      {!showNewCustomerForm ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, phone, or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-slate-50 border-slate-200 focus:border-[var(--sidebar-bg)] focus:ring-1 focus:ring-[var(--sidebar-bg)]/20 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto relative min-h-[100px]">
            {isLoading ? (
              // Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4 rounded-xl border-slate-100 shadow-none">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl border-slate-100 shadow-none"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--sidebar-bg)]/10 flex items-center justify-center shrink-0">
                      {customer.type === "B2B" ? (
                        <Building2 className="size-5 text-[var(--sidebar-bg)]" />
                      ) : (
                        <User className="size-5 text-[var(--sidebar-bg)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">
                          {customer.name}
                        </h4>
                        {customer.type === "B2B" ? (
                          <Badge variant="default" className="shrink-0">
                            B2B
                          </Badge>
                        ) : customer.customerId ? (
                          <span className="text-xs text-slate-500">
                            {customer.customerId}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-sm text-slate-600 space-y-0.5">
                        <div>{customer.email}</div>
                        <div>{customer.phone}</div>
                        {customer.gstin && (
                          <div className="text-xs">GSTIN: {customer.gstin}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <User className="size-12 mx-auto mb-3 opacity-30" />
                <p>No customers found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Add New Customer</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewCustomerForm(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="space-y-4 text-center py-8">
            <User className="size-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600">Please add new customers via the Customers page.</p>
            <Button
              className="mt-4 rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-white"
              onClick={() => navigate(ROUTES.CUSTOMERS.CREATE)}
            >
              Go to Customers
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (variant === "embedded") {
    return Content;
  }

  return (
    <>
      {/* Selected Customer Display */}
      {selectedCustomer ? (
        <Card className="p-4 rounded-xl border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--sidebar-bg)]/10 flex items-center justify-center shrink-0">
                {selectedCustomer.type === "B2B" ? (
                  <Building2 className="size-6 text-[var(--sidebar-bg)]" />
                ) : (
                  <User className="size-6 text-[var(--sidebar-bg)]" />
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {selectedCustomer.name}
                  </h4>
                  {selectedCustomer.type === "B2B" ? (
                    <Badge variant="default" className="shrink-0">
                      B2B
                    </Badge>
                  ) : selectedCustomer.customerId ? (
                    <span className="text-xs text-slate-500">
                      {selectedCustomer.customerId}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-0.5 text-sm text-slate-600 truncate">
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.gstin && (
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">GSTIN: {selectedCustomer.gstin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="sm:ml-4 shrink-0 rounded-xl border-slate-200 text-slate-700 h-9 w-full sm:w-auto"
            >
              Change Customer
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-xl border-slate-200 h-10 text-slate-600 hover:bg-slate-50"
          onClick={() => setShowModal(true)}
        >
          <User className="mr-2 size-4" />
          Select Customer
        </Button>
      )}

      {/* Customer Selection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Choose an existing customer or create a new one
            </DialogDescription>
          </DialogHeader>
          {Content}
        </DialogContent>
      </Dialog>
    </>
  );
}
