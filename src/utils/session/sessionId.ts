const NEWS_READ_SESSION_KEY = "thenewstime_news_read_session_id";

/**
 * Get the current browser session ID.
 *
 * sessionStorage is intentionally used because this identifier
 * represents the current browser session rather than a permanent
 * visitor identity.
 */
export function getNewsReadSessionId(): string {
  const existingSessionId = sessionStorage.getItem(NEWS_READ_SESSION_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();

  sessionStorage.setItem(NEWS_READ_SESSION_KEY, sessionId);

  return sessionId;
}
