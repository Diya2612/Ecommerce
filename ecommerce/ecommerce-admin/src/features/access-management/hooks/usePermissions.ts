import { useState } from "react";
import { MOCK_PERMISSIONS } from "../data/mockPermissions";

export const usePermissions = () => {
  const [permissions] = useState<string[]>(MOCK_PERMISSIONS);
  return { permissions };
};
