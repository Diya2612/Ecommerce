/**
 * Search Service
 * Provides semantic search capabilities against the vectorized document knowledge base.
 */

import { logger } from '../../../utils';
import { HttpException } from '../../../utils';
import { niraNamespace } from './pinecone.service';
import { embedText } from './embedding.service';
import { ISearchResult } from '../shared/interface';
import { chatbotConfig } from '../config/chatbot.config';

const { search: searchConfig } = chatbotConfig;

/** Finds relevant document segments matching the user's semantic query. */
export async function searchDocuments(
  query: string,
  topK: number = searchConfig.defaultTopK,
): Promise<ISearchResult[]> {
  try {
    if (!query?.trim()) throw new HttpException(400, 'Search query cannot be empty');

    logger.info(`🔍 Searching: "${query.substring(0, 50)}..."`);
    const queryEmbedding = await embedText(query);

    const searchResponse = await niraNamespace.query({
      vector: queryEmbedding,
      topK: Math.min(topK, searchConfig.maxTopK),
      includeMetadata: true,
    });

    const results: ISearchResult[] = (searchResponse.matches || [])
      .filter((match) => (match.score ?? 0) >= searchConfig.minSimilarityThreshold)
      .map((match) => ({
        id: match.id,
        score: match.score || 0,
        text: (match.metadata?.text as string) || '',
        metadata: match.metadata as any,
      }));

    logger.info(`✅ Found ${results.length} relevant results`);
    return results;
  } catch (error) {
    logger.error('❌ Search failed:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      500,
      `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Formats retrieved document chunks into a single unified context string for the LLM. */
export function buildContextFromResults(
  results: ISearchResult[],
  maxChars: number = chatbotConfig.chat.maxContextChars,
): string {
  if (results.length === 0) return '';

  const contextParts: string[] = [];
  let totalLength = 0;

  for (const result of results) {
    const part = `[Document: ${result.metadata.documentName}]\n${result.text}`;

    if (totalLength + part.length > maxChars) {
      const remaining = maxChars - totalLength;
      if (remaining > 100) contextParts.push(part.substring(0, remaining) + '...');
      break;
    }

    contextParts.push(part);
    totalLength += part.length + 2;
  }

  return contextParts.join('\n\n---\n\n');
}

/** Identifies unique documents referenced in a search result set for attribution. */
export function extractSourceReferences(
  results: ISearchResult[],
): Array<{ documentId: number; documentName: string; relevance: number }> {
  const sourceMap = new Map<number, { documentName: string; maxScore: number }>();

  for (const result of results) {
    const existing = sourceMap.get(result.metadata.documentId);
    if (!existing || result.score > existing.maxScore) {
      sourceMap.set(result.metadata.documentId, {
        documentName: result.metadata.documentName,
        maxScore: result.score,
      });
    }
  }

  return Array.from(sourceMap.entries())
    .map(([documentId, { documentName, maxScore }]) => ({
      documentId,
      documentName,
      relevance: Math.round(maxScore * 100) / 100,
    }))
    .sort((a, b) => b.relevance - a.relevance);
}

/** Checks if the vector store contains any valid document records in the active namespace. */
export async function hasDocuments(): Promise<boolean> {
  try {
    const { pineconeIndex } = await import('./pinecone.service');
    const stats = await pineconeIndex.describeIndexStats();
    const namespaceStats = stats.namespaces?.[chatbotConfig.general.namespace];
    return (namespaceStats?.recordCount || 0) > 0;
  } catch (error) {
    logger.error('Error checking for documents:', error);
    return false;
  }
}

/** Advanced search allowing filtering by specific documents or file types. */
export async function searchWithFilters(
  query: string,
  filters?: {
    documentIds?: number[];
    mimeTypes?: string[];
  },
  topK: number = searchConfig.defaultTopK,
): Promise<ISearchResult[]> {
  try {
    const queryEmbedding = await embedText(query);
    const filter: Record<string, any> = {};

    if (filters?.documentIds?.length) filter.documentId = { $in: filters.documentIds };
    if (filters?.mimeTypes?.length) filter.mimeType = { $in: filters.mimeTypes };

    const searchResponse = await niraNamespace.query({
      vector: queryEmbedding,
      topK: Math.min(topK, searchConfig.maxTopK),
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    return (searchResponse.matches || [])
      .filter((match) => (match.score ?? 0) >= searchConfig.minSimilarityThreshold)
      .map((match) => ({
        id: match.id,
        score: match.score || 0,
        text: (match.metadata?.text as string) || '',
        metadata: match.metadata as any,
      }));
  } catch (error) {
    logger.error('❌ Filtered search failed:', error);
    throw new HttpException(
      500,
      `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
