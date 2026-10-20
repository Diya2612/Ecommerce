import * as z from "zod";

export const notificationSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    body: z.string().optional(),
    time: z.string(),
    unread: z.boolean(),
    type: z.enum(["system", "security", "user", "admin", "info"]).optional(),
});

export type NotificationSchema = z.infer<typeof notificationSchema>;
