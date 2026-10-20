import { Faq } from './faq.schema';
import { z } from 'zod';
import {
  createFaqSchema,
  updateFaqSchema,
  faqQuerySchema,
  faqIdParamSchema,
  faqImportSchema,
  faqImportRequestSchema,
  faqExportSchema,
} from './validation';

/** FAQ domain and request interfaces. */

export type IFaq = Faq;

/** Input payloads (Zod-inferred). */

export type ICreateFaq = z.infer<typeof createFaqSchema>;
export type IUpdateFaq = z.infer<typeof updateFaqSchema>;
export type IFaqFilters = z.infer<typeof faqQuerySchema>;
export type IFaqIdParam = z.infer<typeof faqIdParamSchema>;
export type IFaqImport = z.infer<typeof faqImportSchema>;
export type IFaqImportRequest = z.infer<typeof faqImportRequestSchema>;
export type IFaqExportQuery = z.infer<typeof faqExportSchema>;
export type IFaqExportRequest = IFaqExportQuery;

/** Sanitized response types. */

/**
 * Standard FAQ Response (Public)
 * Omits internal audit fields
 */
export type IFaqResponse = Omit<
  IFaq,
  'created_by' | 'updated_by' | 'is_deleted' | 'deleted_at' | 'deleted_by'
>;

/**
 * Map database FAQ to sanitized response
 */
export function mapToFaqResponse(faq: IFaq): IFaqResponse {
  const {
    created_by: _created_by,
    updated_by: _updated_by,
    is_deleted: _is_deleted,
    deleted_at: _deleted_at,
    deleted_by: _deleted_by,
    ...publicFaq
  } = faq;
  return publicFaq;
}

/**
 * Context for service operations (RBAC)
 */
export interface IFaqServiceContext {
  isAdmin?: boolean;
  userId?: string;
}

/** Import/Export specific types. */

export interface IFaqExportOptions {
  scope: 'all' | 'selected' | 'filtered';
  selectedIds?: string[];
  startDate?: Date;
  endDate?: Date;
  status?: string | string[];
  section?: string | string[];
  search?: string;
}

export interface IFaqExportDataOptions {
  selectedColumns: string[];
}

export interface IFaqImportResult {
  success: boolean;
  error?: string;
  recordId?: string;
  skipped?: boolean;
}
