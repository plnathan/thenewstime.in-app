/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Core Library
 * File       : logger.ts
 * Description: Centralized application logger.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info("[INFO]", ...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn("[WARN]", ...args);
    }
  },

  error: (...args: unknown[]): void => {
    console.error("[ERROR]", ...args);
  },

  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug("[DEBUG]", ...args);
    }
  },
};
