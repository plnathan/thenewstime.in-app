import { describe, expect, it } from "vitest";
import {
  BUSINESS_TIME_ZONE,
  formatIstDate,
  formatIstDateTime,
} from "../businessTimeZone.helpers";

describe("Phase 3 fixed IST display", () => {
  it("uses Asia/Kolkata explicitly", () => {
    expect(BUSINESS_TIME_ZONE).toBe("Asia/Kolkata");
  });
  it("formats a UTC instant at the next IST calendar day", () => {
    expect(formatIstDate("2026-11-12T18:40:00.000Z")).toContain("13");
    expect(formatIstDateTime("2026-11-12T18:40:00.000Z")).toContain("IST");
  });
  it("returns a stable placeholder for missing instants", () => {
    expect(formatIstDate(null)).toBe("—");
    expect(formatIstDateTime(null)).toBe("—");
  });
});
