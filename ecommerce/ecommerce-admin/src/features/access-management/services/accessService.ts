import type { Role } from "../types/role.types";
import { MOCK_ROLES } from "../data/mockRoles";

export const fetchRoles = async (): Promise<Role[]> => {
  // placeholder – returns mock data
  return Promise.resolve(MOCK_ROLES);
};

export const fetchPermissions = async (): Promise<string[]> => {
  return Promise.resolve(["products.view", "orders.view"]);
};
