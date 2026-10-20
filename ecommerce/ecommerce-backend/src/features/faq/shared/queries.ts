/**
 * FAQ SQL Queries
 * Centralized database operations using Drizzle ORM.
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../../database';
import { faqs, type NewFaq } from './faq.schema';

/** Finds a specific FAQ by ID including deleted ones. */
export const findFaqById = async (id: string) => {
  const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return result[0] || null;
};

/** Inserts a new FAQ record. */
export const createFaq = async (data: NewFaq) => {
  const result = await db.insert(faqs).values(data).returning();
  return result[0];
};

/** Updates FAQ content or metadata by ID. */
export const updateFaqById = async (id: string, data: Partial<NewFaq>) => {
  const result = await db
    .update(faqs)
    .set({ ...data, updated_at: new Date() })
    .where(eq(faqs.id, id))
    .returning();
  return result[0];
};

/** Marks an FAQ as deleted (soft delete). */
export const softDeleteFaq = async (id: string, userId: string) => {
  await db
    .update(faqs)
    .set({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
      status: false,
    })
    .where(and(eq(faqs.id, id), eq(faqs.is_deleted, false)));
};
