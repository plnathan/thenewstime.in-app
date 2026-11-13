/**
 * Calendar-date helpers for date-only form fields (payments, refunds, etc.).
 *
 * A YYYY-MM-DD input represents the user's local calendar date, not a UTC date.
 * Do not use new Date().toISOString().slice(0, 10) for its default value.
 */
export const getLocalCalendarDate = (date: Date = new Date()): string => {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid date");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convert a local calendar date to an unambiguous UTC instant at local midnight.
 * The backend currently accepts ISO timestamps for payment/refund dates.
 * Using local midnight preserves the date displayed to the user across timezones.
 */
export const localCalendarDateToUtcIso = (calendarDate: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calendarDate)) {
    throw new RangeError("Expected a YYYY-MM-DD calendar date");
  }

  const [year, month, day] = calendarDate.split("-").map(Number);
  const localMidnight = new Date(year, month - 1, day);

  if (
    localMidnight.getFullYear() !== year ||
    localMidnight.getMonth() !== month - 1 ||
    localMidnight.getDate() !== day
  ) {
    throw new RangeError("Invalid calendar date");
  }

  return localMidnight.toISOString();
};
