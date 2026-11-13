import { describe, expect, it } from "vitest";
import {
  formatIstClock,
  formatIstTamilCalendarDate,
  formatIstInputDateTime,
  istInputToUtcIso,
} from "../businessTimeZone.helpers";

describe("Phase 3 batch 2: consistent IST displays", () => {
  it("renders IST midnight independent of machine timezone", () => {
    expect(formatIstClock(new Date("2026-11-12T18:30:00Z"))).toBe(
      "12:00:00 AM",
    );
  });
  it("renders IST date even when the UTC calendar date differs", () => {
    expect(formatIstTamilCalendarDate(new Date("2026-11-12T18:40:00Z"))).toBe(
      "வெள்ளி, 13 நவம்பர் 2026",
    );
  });
  it("formats datetime-local input as IST rather than browser local", () => {
    const input = "2026-11-13T00:10";
    expect(istInputToUtcIso(input)).toBe("2026-11-12T18:40:00.000Z");
    expect(formatIstInputDateTime(input)).toContain("IST");
  });
  it("handles empty and invalid schedule inputs safely", () => {
    expect(formatIstInputDateTime("")).toBe("—");
    expect(formatIstInputDateTime("2026-02-30T12:00")).toBe(
      "Invalid IST date/time",
    );
  });
});
