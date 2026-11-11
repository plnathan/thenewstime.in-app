import apiClient from "@/api/axios";

export interface PublicAdvertisementTrackingEvent {
  clientEventId?: string;
  advertisementId: number;
  placementId: number;
  placementRuleId: number;
  scheduleId: number;
  creativeId: number;
  pageType: "HOME" | "NEWS_LIST" | "NEWS_DETAIL";
  placementType: string;
  visitorId?: string;
  pageUrl?: string;
  referrerUrl?: string;
  context?: { newsId?: number };
}

const VISITOR_STORAGE_KEY = "thenewstime.advertisement.visitor-id";

function getAnonymousVisitorId(): string | undefined {
  if (
    typeof window === "undefined" ||
    typeof crypto === "undefined" ||
    typeof crypto.randomUUID !== "function"
  )
    return undefined;
  try {
    const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (
      stored &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        stored,
      )
    ) {
      return stored;
    }
    const visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    // Storage can be blocked by privacy settings; tracking remains optional.
    return crypto.randomUUID();
  }
}

export async function recordPublicAdvertisementEvent(
  type: "impression" | "click",
  event: PublicAdvertisementTrackingEvent,
): Promise<void> {
  const visitorId = getAnonymousVisitorId();
  await apiClient.post(`/advertisements/tracking/${type}`, {
    ...event,
    ...(visitorId ? { visitorId } : {}),
  });
}

/** Shared across placements: one request per batch instead of one per creative. */
const MAX_BATCH_SIZE = 25;
const FLUSH_DELAY_MS = 5000;
const pendingImpressions: PublicAdvertisementTrackingEvent[] = [];

// One qualifying impression per advertisement and placement per page visit.
// Kept at module scope so React rerenders/remounts and scroll-away/return
// cannot create new event IDs for the same exposure.
const seenImpressions = new Set<string>();
let activePageUrl: string | undefined;

function getPageVisitUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}

/** Reset the exposure ledger on a new SPA page visit. */
export function resetAdvertisementImpressionVisit(): void {
  seenImpressions.clear();
  activePageUrl = getPageVisitUrl();
}

function exposureKey(event: PublicAdvertisementTrackingEvent): string {
  return `${event.placementId}:${event.advertisementId}`;
}

let flushTimer: ReturnType<typeof setTimeout> | undefined;
let sending = false;
let consecutiveFailures = 0;
let lifecycleRegistered = false;

function clearFlushTimer(): void {
  if (flushTimer !== undefined) clearTimeout(flushTimer);
  flushTimer = undefined;
}

function scheduleFlush(): void {
  if (flushTimer !== undefined || sending || pendingImpressions.length === 0)
    return;
  flushTimer = setTimeout(() => {
    flushTimer = undefined;
    void flushAdvertisementImpressions();
  }, FLUSH_DELAY_MS);
}

export async function flushAdvertisementImpressions(): Promise<void> {
  if (sending || pendingImpressions.length === 0) return;
  clearFlushTimer();
  sending = true;
  const events = pendingImpressions.splice(0, MAX_BATCH_SIZE);
  const visitorId = getAnonymousVisitorId();
  try {
    await apiClient.post("/advertisements/tracking/impressions/batch", {
      events: events.map((event) => ({
        ...event,
        ...(visitorId ? { visitorId } : {}),
      })),
    });
    consecutiveFailures = 0;
  } catch (error) {
    consecutiveFailures += 1;
    // Bound retries and memory use. A failed batch is retried on the next flush.
    if (consecutiveFailures <= 3) pendingImpressions.unshift(...events);
    if (pendingImpressions.length > 100) pendingImpressions.length = 100;
    console.warn("Advertisement impression batch failed", error);
  } finally {
    sending = false;
    scheduleFlush();
  }
}

function registerLifecycleFlush(): void {
  if (lifecycleRegistered || typeof window === "undefined") return;
  lifecycleRegistered = true;
  // Flush while the page is still active; a pending request may be cancelled
  // during hard navigation, so we use keepalive on pagehide below.
  window.addEventListener("pagehide", () => {
    if (pendingImpressions.length === 0) return;
    clearFlushTimer();
    const events = pendingImpressions.splice(0, MAX_BATCH_SIZE);
    const visitorId = getAnonymousVisitorId();
    const url = `${import.meta.env.VITE_API_BASE_URL}/advertisements/tracking/impressions/batch`;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: events.map((event) => ({
          ...event,
          ...(visitorId ? { visitorId } : {}),
        })),
      }),
      keepalive: true,
    }).catch(() => {
      /* Browser shutdown is best-effort. */
    });
  });
}

export function queueAdvertisementImpression(
  event: PublicAdvertisementTrackingEvent,
): void {
  registerLifecycleFlush();
  const currentUrl = getPageVisitUrl();
  if (currentUrl !== activePageUrl) {
    resetAdvertisementImpressionVisit();
  }
  const key = exposureKey(event);
  if (seenImpressions.has(key)) return;
  // Mark before enqueueing so simultaneous placements and remounts are safe.
  // Retry uses the original queued event ID rather than creating a new one.
  seenImpressions.add(key);
  pendingImpressions.push({
    ...event,
    clientEventId: event.clientEventId ?? crypto.randomUUID(),
  });
  if (pendingImpressions.length >= MAX_BATCH_SIZE) {
    void flushAdvertisementImpressions();
  } else {
    scheduleFlush();
  }
}
