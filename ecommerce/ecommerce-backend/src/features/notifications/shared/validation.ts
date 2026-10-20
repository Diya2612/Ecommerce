import { z } from 'zod';
import { uuidSchema } from '../../../utils';

/** Input validation for broadcasting notifications to multiple users. */
export const broadcastNotificationSchema = z.object({
  user_ids: z.array(uuidSchema).min(1, 'At least one user ID is required'),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
  type: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  action_url: z.string().url().optional().nullable(),
  action_text: z.string().max(100).optional().nullable(),
  channels: z.array(z.enum(['in_app', 'email', 'sms', 'push'])).optional(),
});

/** Input validation for manual notification creation. */
export const createNotificationSchema = z.object({
  user_id: uuidSchema,
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
  type: z.string(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  action_url: z.string().url().optional().nullable(),
  action_text: z.string().max(100).optional().nullable(),
  channels: z
    .array(z.enum(['in_app', 'email', 'sms', 'push']))
    .optional()
    .default(['in_app']),
  data: z.record(z.string(), z.any()).optional(),
});

/** Parameter validation for single notification lookups. */
export const notificationIdParamsSchema = z.object({
  id: uuidSchema,
});

/** Query validation for paginated notification lists. */
export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unread_only: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  category: z.enum(['all', 'unread', 'orders', 'payments', 'system']).optional(),
});

/** Validation for updating user notification preferences. */
export const updatePreferenceSchema = z.object({
  notification_type: z.string().min(1),
  channel_email: z.boolean().optional(),
  channel_sms: z.boolean().optional(),
  channel_in_app: z.boolean().optional(),
  channel_push: z.boolean().optional(),
  frequency: z.enum(['immediate', 'never']).optional(),
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
  quiet_hours_end: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
});

/** Validation for updating global user notification settings. */
export const updateNotificationSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
});

/** Creation schema for notification templates. */
export const createTemplateSchema = z.object({
  code: z.string().min(1).max(100).toUpperCase(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  body_text: z.string().optional().nullable(),
  body_html: z.string().optional().nullable(),
  sms_template: z.string().optional().nullable(),
  in_app_title: z.string().max(255).optional().nullable(),
  in_app_message: z.string().optional().nullable(),
  variables: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
});

/** Patch schema for existing templates. */
export const updateTemplateSchema = createTemplateSchema.partial().omit({ code: true });

/** Lookup schema for template operations using unique code. */
export const templateCodeParamsSchema = z.object({
  code: z.string().min(1).toUpperCase(),
});

/** Query validation for admin notification statistics. */
export const statsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  user_id: uuidSchema.optional(),
});

export type BroadcastNotificationDto = z.infer<typeof broadcastNotificationSchema>;
export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type UpdatePreferenceDto = z.infer<typeof updatePreferenceSchema>;
export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;
export type TemplateCodeParams = z.infer<typeof templateCodeParamsSchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
