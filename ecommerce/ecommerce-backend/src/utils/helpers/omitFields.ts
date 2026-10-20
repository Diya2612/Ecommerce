/**
 * Type-safe field omission utility.
 * Creates a new object with the specified keys removed.
 * Useful for stripping sensitive data before returning responses.
 */
export function omitFields<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const keySet = new Set<string>(keys as string[]);
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keySet.has(key))) as Omit<T, K>;
}
