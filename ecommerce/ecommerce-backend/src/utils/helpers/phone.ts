/**
 * Address Feature Utilities
 */

/** Default country code when none is provided */
const DEFAULT_COUNTRY_CODE = '+91';

/**
 * Parse a raw phone string into E.164 format.
 *
 * Handles common input variations:
 * - Already E.164: "+919876543210" → "+919876543210"
 * - With spaces/dashes: "+91 98765 43210" → "+919876543210"
 * - Local number: "9876543210" → "+919876543210" (defaults to India)
 * - With parens: "(+91) 98765-43210" → "+919876543210"
 *
 * @param phone - Raw phone string from user input
 * @param defaultCountryCode - Country code to prepend if missing (default: +91)
 * @returns E.164 formatted phone string
 */
export function parseE164(
  phone: string,
  defaultCountryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  // Strip whitespace, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If it already starts with +, return as-is (cleaned)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Otherwise, prepend default country code
  return `${defaultCountryCode}${cleaned}`;
}
