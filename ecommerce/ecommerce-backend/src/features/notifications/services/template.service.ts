import { eq } from 'drizzle-orm';
import { db } from '../../../database';
import { notificationTemplates } from '../shared/notification-templates.schema';
import { logger } from '../../../utils';
import type { RenderTemplateResult } from '../shared/interface';

class TemplateService {
  /**
   * Fetches and renders a template with provided variables.
   * @throws Error if template is missing or inactive.
   */
  async renderTemplate(
    templateCode: string,
    variables: Record<string, any>,
  ): Promise<RenderTemplateResult> {
    try {
      const [template] = await db
        .select()
        .from(notificationTemplates)
        .where(eq(notificationTemplates.code, templateCode))
        .limit(1);

      if (!template) throw new Error(`Template not found: ${templateCode}`);
      if (!template.is_active) throw new Error(`Template is inactive: ${templateCode}`);

      return {
        type: templateCode,
        title: this.replaceVariables(template.in_app_title || '', variables),
        message: this.replaceVariables(template.in_app_message || '', variables),
        emailSubject: template.subject
          ? this.replaceVariables(template.subject, variables)
          : undefined,
        emailHtml: template.body_html
          ? this.replaceVariables(template.body_html, variables)
          : undefined,
        emailText: template.body_text
          ? this.replaceVariables(template.body_text, variables)
          : undefined,
        smsMessage: template.sms_template
          ? this.replaceVariables(template.sms_template, variables)
          : undefined,
      };
    } catch (error) {
      logger.error('Template rendering failed', { templateCode, error });
      throw error;
    }
  }

  /** Replaces {{key.path}} placeholders in a string using provided variable map. */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
      const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], variables);
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /** Lists templates with optional category/status filters. */
  async getAllTemplates(filters?: { category?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(notificationTemplates.category, filters.category));
    if (filters?.isActive !== undefined)
      conditions.push(eq(notificationTemplates.is_active, filters.isActive));

    return await db
      .select()
      .from(notificationTemplates)
      .where(conditions.length > 0 ? conditions[0] : undefined);
  }

  /** Retrieves a single template by its unique code. */
  async getTemplateByCode(code: string) {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.code, code))
      .limit(1);
    return template || null;
  }

  /** Creates or updates a template record. */
  async upsertTemplate(data: {
    code: string;
    name: string;
    description?: string;
    category?: string;
    subject?: string;
    body_text?: string;
    body_html?: string;
    sms_template?: string;
    in_app_title?: string;
    in_app_message?: string;
    variables?: string[];
    is_active?: boolean;
  }) {
    const [result] = await db
      .insert(notificationTemplates)
      .values({ ...data, variables: data.variables || [] })
      .onConflictDoUpdate({
        target: notificationTemplates.code,
        set: { ...data, variables: data.variables || [], updated_at: new Date() },
      })
      .returning();

    logger.info('Template upserted', { code: data.code });
    return result;
  }

  /** Verifies if all required variables for a template are present in the provided map. */
  validateVariables(
    template: { variables: string[] | null },
    providedVariables: Record<string, any>,
  ): { valid: boolean; missing: string[] } {
    const required = template.variables || [];
    const provided = Object.keys(providedVariables);
    const missing = required.filter((v) => !provided.includes(v));

    return { valid: missing.length === 0, missing };
  }
}

export const templateService = new TemplateService();
