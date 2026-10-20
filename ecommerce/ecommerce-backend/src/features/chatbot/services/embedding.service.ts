/**
 * Embedding Service
 * Generates vector embeddings using the HuggingFace BGE-M3 model.
 */

import { HfInference } from '@huggingface/inference';
import { logger } from '../../../utils';
import { config } from '../../../utils/config/validate-env';
import { chatbotConfig } from '../config/chatbot.config';
import { HttpException } from '../../../utils';

const hf = new HfInference(config.HUGGINGFACE_TOKEN);
const { embedding: embeddingConfig } = chatbotConfig;

/** Generates a 1024-dimensional embedding vector for a single string. */
export async function embedText(text: string): Promise<number[]> {
  try {
    if (!text?.trim()) {
      throw new HttpException(400, 'Text input cannot be empty');
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim();
    const truncatedText = cleanedText.substring(0, embeddingConfig.maxTextLength);

    return await generateEmbeddingWithRetry(truncatedText);
  } catch (error) {
    logger.error('❌ BGE-M3 embedding generation failed:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      500,
      `Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Batches multiple text strings for embedding generation. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  try {
    if (!texts?.length) return [];

    logger.info(`🔄 Generating BGE-M3 embeddings for ${texts.length} texts`);
    const results: number[][] = [];
    const batches = createBatches(texts, embeddingConfig.maxBatchSize);

    for (let i = 0; i < batches.length; i++) {
      const batchResults = await Promise.all(batches[i].map((text) => embedText(text)));
      results.push(...batchResults);

      if (i < batches.length - 1) {
        await delay(embeddingConfig.retryDelay);
      }
    }

    return results;
  } catch (error) {
    logger.error('❌ BGE-M3 batch embedding failed:', error);
    throw new HttpException(
      500,
      `Batch embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Handles potential temporary network or API failures with exponential backoff. */
async function generateEmbeddingWithRetry(text: string, attempt: number = 1): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: embeddingConfig.modelName,
      inputs: text,
    });

    let embedding: number[];
    if (Array.isArray(response)) {
      embedding = Array.isArray(response[0]) ? (response[0] as number[]) : (response as number[]);
    } else {
      embedding = response as number[];
    }

    if (embedding.length !== embeddingConfig.dimensions) {
      logger.warn(`⚠️ Unexpected embedding dimensions: ${embedding.length}`);
    }

    return embedding;
  } catch (error) {
    if (attempt < embeddingConfig.retryAttempts) {
      await delay(embeddingConfig.retryDelay * attempt);
      return generateEmbeddingWithRetry(text, attempt + 1);
    }
    throw error;
  }
}

function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns configuration metadata for the active embedding model. */
export function getModelInfo() {
  return {
    name: embeddingConfig.modelName,
    dimensions: embeddingConfig.dimensions,
    maxTextLength: embeddingConfig.maxTextLength,
    provider: 'HuggingFace',
  };
}
