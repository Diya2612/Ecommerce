/**
 * File Hash Utility
 *
 * Provides file content hashing for deduplication and integrity verification.
 * Uses crypto module for MD5 (fast deduplication) and SHA-256 (integrity).
 */

import crypto from 'crypto';
import { logger } from '../logging/logger';

/**
 * Generate MD5 hash of file buffer for deduplication
 * MD5 is fast and sufficient for deduplication checks
 *
 * @param buffer File buffer to hash
 * @returns MD5 hash as hexadecimal string
 */
export function generateFileHash(buffer: Buffer): string {
  try {
    return crypto.createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    logger.error('Failed to generate file hash', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to generate file hash');
  }
}

/**
 * Generate SHA-256 hash for file integrity verification
 * More secure than MD5, suitable for integrity checks
 *
 * @param buffer File buffer to hash
 * @returns SHA-256 hash as hexadecimal string
 */
export function generateSHA256(buffer: Buffer): string {
  try {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (error) {
    logger.error('Failed to generate SHA-256 hash', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to generate SHA-256 hash');
  }
}

/**
 * Verify file buffer matches expected hash
 *
 * @param buffer File buffer to verify
 * @param expectedHash Expected MD5 hash
 * @returns True if hash matches
 */
export function verifyFileHash(buffer: Buffer, expectedHash: string): boolean {
  try {
    const actualHash = generateFileHash(buffer);
    return actualHash === expectedHash;
  } catch (error) {
    logger.error('Failed to verify file hash', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
