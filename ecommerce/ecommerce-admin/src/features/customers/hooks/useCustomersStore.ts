/**
 * @deprecated This hook is deprecated.
 * Use React Query hooks (useCustomers, useCustomer) instead.
 * See useCustomers.ts for the recommended approach.
 */
import { useEffect, useState } from "react";
import type { Customer } from "../types/customer.types";
import { getCustomers, subscribe, addCustomer as storeAdd, updateCustomer as storeUpdate, deleteCustomer as storeDelete } from "../store/customersStore";

export function useCustomersStore() {
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());

  useEffect(() => {
    const unsub = subscribe((items) => setCustomers(items));
    return () => unsub();
  }, []);

  const addCustomer = (customer: Customer) => storeAdd(customer);
  const updateCustomer = (id: string, updates: Partial<Customer>) => storeUpdate(id, updates);
  const deleteCustomer = (id: string) => storeDelete(id);

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}
