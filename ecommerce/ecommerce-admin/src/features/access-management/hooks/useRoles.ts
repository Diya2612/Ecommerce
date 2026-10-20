import { useState } from "react";
import type { Role } from "../types/role.types";
import { MOCK_ROLES } from "../data/mockRoles";

export const useRoles = () => {
  const [roles] = useState<Role[]>(MOCK_ROLES);
  return { roles };
};
