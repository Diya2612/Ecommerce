import * as z from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  permissions: z.array(z.string()),
});

export type RoleSchema = z.infer<typeof roleSchema>;
