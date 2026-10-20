/**
 * Vector Service
 * Manages high-level document vectorization and Pinecone CRUD operations.
 */

import { logger } from '../../../utils';
import { HttpException } from '../../../utils';
import { niraNamespace } from './pinecone.service';
import { embedTexts } from './embedding.service';
import { IVectorRecord, IChunk } from '../shared/interface';
import { chatbotConfig } from '../config/chatbot.config';

/** Converts document chunks into vectors and stores them in Pinecone. */
export async function upsertDocumentVectors(
  chunks: IChunk[],
  documentId: number,
  documentName: string,
  mimeType: string,
): Promise<string[]> {
  try {
    if (chunks.length === 0) return [];

    logger.info(`🔄 Vectorizing ${chunks.length} chunks for document ${documentId}`);
    const texts = chunks.map((chunk) => chunk.text);
    const embeddings = await embedTexts(texts);

    const vectorRecords: IVectorRecord[] = chunks.map((chunk, index) => ({
      id: generateVectorId(documentId, chunk.index),
      values: embeddings[index],
      metadata: {
        documentId,
        documentName,
        chunkIndex: chunk.index,
        totalChunks: chunks.length,
        text: chunk.text,
        mimeType,
      },
    }));

    const batchSize = 100;
    const vectorIds: string[] = [];

    for (let i = 0; i < vectorRecords.length; i += batchSize) {
      const batch = vectorRecords.slice(i, i + batchSize);
      await niraNamespace.upsert(
        batch.map((record) => ({
          id: record.id,
          values: record.values,
          metadata: record.metadata as any,
        })),
      );
      vectorIds.push(...batch.map((r) => r.id));
    }

    return vectorIds;
  } catch (error) {
    logger.error('❌ Vector upsert failed:', error);
    throw new HttpException(
      500,
      `Vector upsert failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Removes all vector records associated with a specific document. */
export async function deleteDocumentVectors(
  documentId: number,
  vectorIds?: string[],
): Promise<void> {
  try {
    if (vectorIds?.length) {
      const batchSize = 1000;
      for (let i = 0; i < vectorIds.length; i += batchSize) {
        await niraNamespace.deleteMany(vectorIds.slice(i, i + batchSize));
      }
    } else {
      try {
        await niraNamespace.deleteMany({ filter: { documentId: { $eq: documentId } } });
      } catch {
        const estimatedIds = generateEstimatedVectorIds(documentId, 1000);
        if (estimatedIds.length > 0) await niraNamespace.deleteMany(estimatedIds);
      }
    }
  } catch (error) {
    logger.error('❌ Vector deletion failed:', error);
    throw new HttpException(
      500,
      `Vector deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Retrieves raw vector data and metadata for a set of IDs. */
export async function fetchVectors(vectorIds: string[]): Promise<IVectorRecord[]> {
  try {
    if (vectorIds.length === 0) return [];
    const response = await niraNamespace.fetch(vectorIds);
    const records: IVectorRecord[] = [];

    if (response.records) {
      for (const [id, record] of Object.entries(response.records)) {
        if (record) {
          records.push({
            id,
            values: record.values || [],
            metadata: record.metadata as any,
          });
        }
      }
    }

    return records;
  } catch (error) {
    logger.error('❌ Vector fetch failed:', error);
    throw new HttpException(
      500,
      `Vector fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Provides current record counts and dimensionality of the vector index. */
export async function getVectorStats(): Promise<{
  totalVectors: number;
  dimension: number;
}> {
  try {
    const { pineconeIndex } = await import('./pinecone.service');
    const stats = await pineconeIndex.describeIndexStats();
    const namespaceStats = stats.namespaces?.[chatbotConfig.general.namespace];

    return {
      totalVectors: namespaceStats?.recordCount || 0,
      dimension: stats.dimension || 0,
    };
  } catch (error) {
    logger.error('Error getting vector stats:', error);
    throw error;
  }
}

function generateVectorId(documentId: number, chunkIndex: number): string {
  return `doc_${documentId}_chunk_${chunkIndex}`;
}

function generateEstimatedVectorIds(documentId: number, maxChunks: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < maxChunks; i++) ids.push(generateVectorId(documentId, i));
  return ids;
}

/** Decodes a vector ID into its constituent document and chunk identifiers. */
export function parseVectorId(vectorId: string): { documentId: number; chunkIndex: number } | null {
  const match = vectorId.match(/^doc_(\d+)_chunk_(\d+)$/);
  if (match) {
    return {
      documentId: parseInt(match[1], 10),
      chunkIndex: parseInt(match[2], 10),
    };
  }
  return null;
}
