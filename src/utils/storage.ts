/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Utilities
 * File       : storage.ts
 * Description: Local storage helper.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return defaultValue;
      }

      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};
