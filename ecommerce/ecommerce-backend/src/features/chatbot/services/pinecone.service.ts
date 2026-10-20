/**
 * Pinecone Service
 * Manages connection and low-level operations for the Pinecone vector database.
 */

import { Pinecone, Index } from '@pinecone-database/pinecone';
import { logger } from '../../../utils';
import { config } from '../../../utils/config/validate-env';
import { chatbotConfig } from '../config/chatbot.config';

let pineconeClient: Pinecone | null = null;
let pineconeIndexInstance: Index | null = null;
let niraNamespaceInstance: Index | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!config.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY is required');
    pineconeClient = new Pinecone({ apiKey: config.PINECONE_API_KEY });
  }
  return pineconeClient;
}

function getPineconeIndex(): Index {
  if (!pineconeIndexInstance) {
    const client = getPineconeClient();
    pineconeIndexInstance = client.index(config.PINECONE_INDEX_NAME);
  }
  return pineconeIndexInstance;
}

function getNiraNamespace(): Index {
  if (!niraNamespaceInstance) {
    const index = getPineconeIndex();
    niraNamespaceInstance = index.namespace(chatbotConfig.general.namespace);
  }
  return niraNamespaceInstance;
}

/** Proxy for the main Pinecone index, handles lazy initialization. */
export const pineconeIndex: Index = new Proxy({} as Index, {
  get(target, prop) {
    const index = getPineconeIndex();
    const value = (index as any)[prop];
    return typeof value === 'function' ? value.bind(index) : value;
  },
});

/** Proxy for the chatbot-specific namespace within the Pinecone index. */
export const niraNamespace: Index = new Proxy({} as Index, {
  get(target, prop) {
    const namespace = getNiraNamespace();
    const value = (namespace as any)[prop];
    return typeof value === 'function' ? value.bind(namespace) : value;
  },
});

/** Verifies connectivity and retrieves basic index statistics. */
export async function initializePinecone(): Promise<boolean> {
  try {
    const stats = await pineconeIndex.describeIndexStats();
    logger.info(
      `✅ Pinecone connected. Records: ${stats.totalRecordCount}, Dim: ${stats.dimension}`,
    );
    return true;
  } catch (error) {
    logger.error('❌ Pinecone connection failed:', error);
    return false;
  }
}

/** Fetches detailed availability and record metrics from the vector store. */
export async function getIndexStats() {
  try {
    const stats = await pineconeIndex.describeIndexStats();
    return {
      totalRecords: stats.totalRecordCount,
      dimension: stats.dimension,
      namespaces: stats.namespaces,
    };
  } catch (error) {
    logger.error('Error getting Pinecone index stats:', error);
    throw error;
  }
}

/** Performs a connectivity health check. */
export async function pineconeHealthCheck(): Promise<{
  healthy: boolean;
  message: string;
  stats?: object;
}> {
  try {
    const stats = await getIndexStats();
    return { healthy: true, message: 'Healthy', stats };
  } catch (error) {
    return {
      healthy: false,
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export default getPineconeClient;
