import type { Role } from "../types/role.types";

export const MOCK_ROLES: Role[] = [
  { id: "role_1", name: "Admin", permissions: ["*"] },
  { id: "role_2", name: "Editor", permissions: ["products.view", "products.edit"] },
];
