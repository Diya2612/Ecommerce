/**
 * Chunker Service
 * Splits documents into meaningful chunks for AI embedding while preserving context.
 */

import { logger } from '../../../utils';
import { chatbotConfig } from '../config/chatbot.config';
import { IChunk, IChunkingResult } from '../shared/interface';

const { chunking: chunkingConfig } = chatbotConfig;

/** Split full text into semantic chunks with overlap. */
export function chunkText(text: string): IChunkingResult {
  try {
    if (!text?.trim()) {
      return { chunks: [], totalChunks: 0, originalLength: 0 };
    }

    const sentences = splitIntoSentences(text);
    const chunks = buildChunksFromSentences(sentences);

    return {
      chunks,
      totalChunks: chunks.length,
      originalLength: text.length,
    };
  } catch (error) {
    logger.error('❌ Text chunking failed:', error);
    throw error;
  }
}

/** Splits text into individual sentences based on punctuation and whitespace. */
function splitIntoSentences(text: string): string[] {
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])|(?<=\n\n)/g;
  return text
    .split(sentenceRegex)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Aggregates sentences into chunks, maintaining overlap for context preservation. */
function buildChunksFromSentences(sentences: string[]): IChunk[] {
  const chunks: IChunk[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  let startPosition = 0;
  let currentPosition = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.length;

    if (currentLength + sentenceLength > chunkingConfig.maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.join(' '),
        index: chunks.length,
        startPosition,
        endPosition: currentPosition,
      });

      const overlapSentences = calculateOverlapSentences(currentChunk);
      currentChunk = overlapSentences;
      currentLength = overlapSentences.join(' ').length;
      startPosition = currentPosition - currentLength;
    }

    currentChunk.push(sentence);
    currentLength += sentenceLength + 1;
    currentPosition += sentenceLength + 1;
  }

  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(' ');
    if (chunkText.length >= chunkingConfig.minChunkSize || chunks.length === 0) {
      chunks.push({
        text: chunkText,
        index: chunks.length,
        startPosition,
        endPosition: currentPosition,
      });
    } else if (chunks.length > 0) {
      const lastChunk = chunks[chunks.length - 1];
      chunks[chunks.length - 1] = {
        ...lastChunk,
        text: lastChunk.text + ' ' + chunkText,
        endPosition: currentPosition,
      };
    }
  }

  return chunks;
}

/** Selects trailing sentences from a chunk to be reused in the next chunk. */
function calculateOverlapSentences(sentences: string[]): string[] {
  const overlapRatio = chunkingConfig.overlapPercentage / 100;
  const targetOverlapLength = Math.floor(sentences.join(' ').length * overlapRatio);

  const overlapSentences: string[] = [];
  let overlapLength = 0;

  for (let i = sentences.length - 1; i >= 0 && overlapLength < targetOverlapLength; i--) {
    overlapSentences.unshift(sentences[i]);
    overlapLength += sentences[i].length + 1;
  }

  return overlapSentences;
}

/** Alternative simpler fixed-size chunking with boundary detection. */
export function chunkTextFixed(
  text: string,
  chunkSize?: number,
  overlap?: number,
): IChunkingResult {
  const size = chunkSize || chunkingConfig.targetChunkSize;
  const overlapSize = overlap || Math.floor(size * (chunkingConfig.overlapPercentage / 100));

  const chunks: IChunk[] = [];
  let position = 0;

  while (position < text.length) {
    let endPosition = position + size;

    if (endPosition < text.length) {
      const searchStart = Math.max(position + size - 100, position);
      const searchText = text.substring(searchStart, endPosition + 50);
      const boundaryMatch = searchText.match(/[.!?]\s+/);
      if (boundaryMatch?.index !== undefined) {
        endPosition = searchStart + boundaryMatch.index + boundaryMatch[0].length;
      }
    } else {
      endPosition = text.length;
    }

    const chunkText = text.substring(position, endPosition).trim();
    if (chunkText) {
      chunks.push({
        text: chunkText,
        index: chunks.length,
        startPosition: position,
        endPosition,
      });
    }

    position = endPosition - overlapSize;
    if (position <= (chunks[chunks.length - 1]?.startPosition ?? -1)) {
      position = endPosition;
    }
  }

  return {
    chunks,
    totalChunks: chunks.length,
    originalLength: text.length,
  };
}

/** Provides a rough estimate of how many chunks a text will produce. */
export function estimateChunkCount(textLength: number): number {
  const effectiveChunkSize =
    chunkingConfig.targetChunkSize * (1 - chunkingConfig.overlapPercentage / 100);
  return Math.ceil(textLength / effectiveChunkSize);
}
