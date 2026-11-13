/** The News Time: all business/editorial wall-clock input is Asia/Kolkata. */
export const BUSINESS_TIME_ZONE = "Asia/Kolkata" as const;
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60_000;

/** Converts a UTC instant into YYYY-MM-DDTHH:mm in Indian Standard Time. */
export function utcIsoToIstInput(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const instant = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(instant.getTime())) return "";
  return new Date(instant.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
}

/** Converts an IST datetime-local wall-clock value to a timezone-aware UTC ISO instant. */
export function istInputToUtcIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value,
  );
  if (!match) throw new RangeError("Expected YYYY-MM-DDTHH:mm in IST");
  const [, ys, ms, ds, hs, mins, ss] = match;
  const year = Number(ys),
    month = Number(ms),
    day = Number(ds);
  const hour = Number(hs),
    minute = Number(mins),
    second = Number(ss ?? "0");
  const wallClockUtc = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second),
  );
  if (
    year < 100 ||
    wallClockUtc.getUTCFullYear() !== year ||
    wallClockUtc.getUTCMonth() !== month - 1 ||
    wallClockUtc.getUTCDate() !== day ||
    wallClockUtc.getUTCHours() !== hour ||
    wallClockUtc.getUTCMinutes() !== minute ||
    wallClockUtc.getUTCSeconds() !== second
  ) {
    throw new RangeError("Invalid IST calendar date/time");
  }
  return new Date(wallClockUtc.getTime() - IST_OFFSET_MS).toISOString();
}

/** Today's date in IST, suitable for date-only payment and refund inputs. */
export function getIstCalendarDate(now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime())) throw new RangeError("Invalid date");
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** An IST business date at 00:00 IST, serialized as a UTC timestamp for legacy APIs. */
export function istCalendarDateToUtcIso(date: string): string {
  return istInputToUtcIso(`${date}T00:00`);
}

export function formatIstDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const instant = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(instant.getTime())) return "Invalid date/time";
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: BUSINESS_TIME_ZONE,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(instant) + " IST"
  );
}

export function formatIstDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const instant = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(instant.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: BUSINESS_TIME_ZONE,
    dateStyle: "medium",
  }).format(instant);
}

/** Format an IST datetime-local field without interpreting it as browser-local time. */
export function formatIstInputDateTime(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  try {
    return formatIstDateTime(istInputToUtcIso(value));
  } catch {
    return "Invalid IST date/time";
  }
}

/** IST clock (HH:mm:ss AM/PM), independent of the browser timezone. */
export function formatIstClock(now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
}

/** Tamil weekday/month labels for the current date in India. */
export function formatIstTamilCalendarDate(now: Date = new Date()): string {
  if (!Number.isFinite(now.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  const tamilDays: Record<string, string> = {
    Sun: "ஞாயிறு",
    Mon: "திங்கள்",
    Tue: "செவ்வாய்",
    Wed: "புதன்",
    Thu: "வியாழன்",
    Fri: "வெள்ளி",
    Sat: "சனி",
  };
  const tamilMonths = [
    "ஜனவரி",
    "பிப்ரவரி",
    "மார்ச்",
    "ஏப்ரல்",
    "மே",
    "ஜூன்",
    "ஜூலை",
    "ஆகஸ்ட்",
    "செப்டம்பர்",
    "அக்டோபர்",
    "நவம்பர்",
    "டிசம்பர்",
  ];
  const month = Number(part("month"));
  return `${tamilDays[part("weekday")] ?? part("weekday")}, ${part("day")} ${tamilMonths[month - 1] ?? ""} ${part("year")}`;
}

/** IST calendar date of an absolute instant, regardless of the browser timezone. */
export function getIstDateOfInstant(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return getIstCalendarDate(date);
}

/** Inclusive number of IST calendar days spanned by two absolute instants. */
export function getInclusiveIstCalendarDays(
  start: string | Date,
  end: string | Date,
): number | null {
  const startDay = getIstDateOfInstant(start);
  const endDay = getIstDateOfInstant(end);
  const startMs = Date.parse(`${startDay}T00:00:00Z`);
  const endMs = Date.parse(`${endDay}T00:00:00Z`);
  if (endMs < startMs) return null;
  return Math.round((endMs - startMs) / 86_400_000) + 1;
}


/**
 * Shifts an ISO date-only value by whole calendar days.
 *
 * Uses UTC calendar arithmetic to avoid browser-local timezone
 * and daylight-saving-time differences.
 */
export function shiftIsoCalendarDate(
  value: string,
  days: number,
): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isInteger(days)
  ) {
    throw new RangeError(
      "Expected ISO calendar date and integer day offset",
    );
  }

  const ms = Date.parse(`${value}T00:00:00Z`);

  if (
    !Number.isFinite(ms) ||
    new Date(ms).toISOString().slice(0, 10) !== value
  ) {
    throw new RangeError("Invalid ISO calendar date");
  }

  const shifted = new Date(ms + days * 86_400_000);

  return shifted.toISOString().slice(0, 10);
}


/** A date-only rate-card boundary at the end of the selected IST day. */
export function istCalendarDateEndUtcIso(value: string): string {
  const nextDay = shiftIsoCalendarDate(value, 1);
  return new Date(
    Date.parse(istCalendarDateToUtcIso(nextDay)) - 1,
  ).toISOString();
}
