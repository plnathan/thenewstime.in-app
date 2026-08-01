/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : News Utilities
 * File       : readingTime.ts
 * Description: Estimate article reading duration.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

const WORDS_PER_MINUTE = 200;

export interface ReadingTime {
  minutes: number;
  words: number;
}

export function calculateReadingTime(content: string): ReadingTime {
  if (!content.trim()) {
    return {
      minutes: 0,
      words: 0,
    };
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    words,
    minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}
