/**
 * Document Utilities
 * Pure validation and formatting functions for document processing.
 */

import { chatbotConfig } from '../config/chatbot.config';

export const ALLOWED_MIME_TYPES = chatbotConfig.general.allowedMimeTypes;
export const MAX_FILE_SIZE = chatbotConfig.general.maxFileSize;

/** Validates if the provided MIME type is supported. */
export function isValidFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/** Checks if the file size is within supported limits (e.g. 20MB). */
export function isValidFileSize(sizeInBytes: number): boolean {
  return sizeInBytes >= 0 && sizeInBytes <= MAX_FILE_SIZE;
}

/** Maps MIME types to their corresponding file extensions. */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExtension: Record<string, string> = {
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };

  return mimeToExtension[mimeType] || '.bin';
}

/** Performs comprehensive validation on document metadata before processing. */
export function validateDocument(mimeType: string, sizeInBytes: number): void {
  if (!isValidFileType(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    );
  }

  if (!isValidFileSize(sizeInBytes)) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
  }
}
