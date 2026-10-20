/**
 * UUID v7 Generator Utility
 *
 * Generates and validates time-ordered UUIDs (v7).
 * UUID v7 combines a 48-bit Unix timestamp with random data, providing:
 * - Natural chronological sorting
 * - Better database index performance
 * - Extractable creation timestamps
 */

import { uuidv7 } from 'uuidv7';

/**
 * Generates a standard UUID v7 string.
 * Format: 8-4-4-4-12 (e.g., 018d3f6c-7a2b-7f3c-8d9e-1a2b3c4d5e6f)
 *
 * @returns UUID v7 string
 */
export function generateUUID(): string {
  return uuidv7();
}

/**
 * Explicit alias for `generateUUID` to signify v7 usage.
 */
export const generateUuidV7 = generateUUID;

/**
 * Extracts the original creation timestamp embedded within a UUID v7.
 *
 * @param uuid UUID v7 string
 * @returns Parsed Date object, or null if the UUID is invalid or not v7
 */
export function extractTimestampFromUuidV7(uuid: string): Date | null {
  try {
    // Validate UUID format
    if (!uuid || typeof uuid !== 'string') {
      return null;
    }

    // Remove hyphens and validate length
    const hex = uuid.replace(/-/g, '');
    if (hex.length !== 32) {
      return null;
    }

    // Check if it's UUID v7 (14th character should be '7')
    if (uuid.charAt(14) !== '7') {
      return null;
    }

    // Extract first 48 bits (12 hex characters = 48 bits)
    const timestampHex = hex.substring(0, 12);
    const timestamp = parseInt(timestampHex, 16);

    // Validate timestamp is reasonable (between 2020 and 2100)
    const MIN_TIMESTAMP = new Date('2020-01-01').getTime();
    const MAX_TIMESTAMP = new Date('2100-01-01').getTime();

    if (timestamp < MIN_TIMESTAMP || timestamp > MAX_TIMESTAMP) {
      return null;
    }

    return new Date(timestamp);
  } catch {
    return null;
  }
}

/**
 * Validates whether a given string is a correctly formatted UUID v7.
 *
 * @param uuid UUID string to check
 * @returns true if it's a valid v7 UUID
 */
export function isUuidV7(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
    return false;
  }

  // UUID v7 has '7' at position 14 (version field)
  return uuid.charAt(14) === '7';
}

/**
 * Parses the version number out of a generic UUID string.
 *
 * @param uuid UUID string
 * @returns The version integer, or null if invalid
 */
export function getUuidVersion(uuid: string): number | null {
  if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
    return null;
  }

  const version = uuid.charAt(14);
  const versionNum = parseInt(version, 10);

  return isNaN(versionNum) ? null : versionNum;
}

/**
 * Compares two UUID v7 strings chronologically based on their embedded timestamps.
 *
 * @param uuid1 First UUID v7
 * @param uuid2 Second UUID v7
 * @returns Negative if uuid1 < uuid2, 0 if equal, positive if uuid1 > uuid2
 * @throws Error if either string is not a valid UUID v7
 */
export function compareUuidV7Timestamps(uuid1: string, uuid2: string): number {
  if (!isUuidV7(uuid1) || !isUuidV7(uuid2)) {
    throw new Error('Both UUIDs must be version 7');
  }

  const ts1 = extractTimestampFromUuidV7(uuid1);
  const ts2 = extractTimestampFromUuidV7(uuid2);

  if (!ts1 || !ts2) {
    throw new Error('Failed to extract timestamps');
  }

  return ts1.getTime() - ts2.getTime();
}

/**
 * Generates a batch array of consecutive UUID v7s.
 *
 * @param count Number of UUIDs to generate
 * @returns Array of sorted UUID v7 strings
 */
export function generateMultipleUuidV7(count: number): string[] {
  if (count <= 0 || !Number.isInteger(count)) {
    throw new Error('Count must be a positive integer');
  }

  return Array.from({ length: count }, () => generateUuidV7());
}
