/**
 * FAQ Service
 * Handles business logic, RBAC, and audit logging for frequently asked questions.
 */

import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../../database';
import { faqs, type NewFaq, type Faq } from '../shared/faq.schema';
import { ICreateFaq, IUpdateFaq, IFaqFilters, IFaqServiceContext } from '../shared/interface';
import { HttpException, buildSearchConditions } from '../../../utils';
import { findFaqById, createFaq, updateFaqById, softDeleteFaq } from '../shared/queries';

/** Retrieves FAQs with filtering, search, and pagination. */
export const getFaqs = async (
  filters: IFaqFilters,
  context: IFaqServiceContext = {},
): Promise<{ faqs: Faq[]; total: number }> => {
  const conditions = [eq(faqs.is_deleted, false)];

  // Enforce visibility based on user role
  if (!context.isAdmin) {
    conditions.push(eq(faqs.status, true));
  } else if (filters.status && filters.status !== 'all') {
    conditions.push(eq(faqs.status, filters.status === 'active'));
  }

  if (filters.section) {
    conditions.push(eq(faqs.section, filters.section as any));
  }

  if (filters.search) {
    const searchConditions = buildSearchConditions(filters.search, {
      fuzzyColumns: [faqs.question, faqs.answer],
    });
    if (searchConditions) conditions.push(searchConditions);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(faqs)
    .where(and(...conditions));

  const data = await db
    .select()
    .from(faqs)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(faqs.position), desc(faqs.created_at));

  return { faqs: data, total: totalResult.count };
};

/** Retrieves a specific FAQ by ID, respecting visibility rules. */
export const getFaqById = async (id: string, context: IFaqServiceContext = {}) => {
  const faq = await findFaqById(id);
  if (!faq || (!context.isAdmin && !faq.status)) return null;
  return faq;
};

/** Creates a new FAQ and logs the activity. */
export const createFaqAction = async (data: ICreateFaq, userId: string): Promise<Faq> => {
  const newFaq = await createFaq({
    ...data,
    created_by: userId,
    updated_by: userId,
    is_deleted: false,
  });


  return newFaq;
};

/** Updates FAQ content/metadata and logs changes. */
export const updateFaqAction = async (
  id: string,
  data: IUpdateFaq,
  userId: string,
): Promise<Faq> => {
  const existing = await findFaqById(id);
  if (!existing) throw new HttpException(404, 'FAQ not found');

  const updates: Partial<NewFaq> = { ...data, updated_by: userId };
  const updated = await updateFaqById(id, updates);


  return updated;
};

/** Soft-deletes an FAQ and logs the action. */
export const deleteFaqAction = async (id: string, userId: string): Promise<void> => {
  const existing = await findFaqById(id);
  if (!existing) throw new HttpException(404, 'FAQ not found');

  await softDeleteFaq(id, userId);


};
