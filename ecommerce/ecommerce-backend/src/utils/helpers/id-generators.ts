/**
 * Generates a unique customer ID.
 * Format: CUST-XXXXXX (where X is an alphanumeric character).
 */
export const generateCustomerId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CUST-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
