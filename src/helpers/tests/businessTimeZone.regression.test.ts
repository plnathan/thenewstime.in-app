import { describe, expect, it } from "vitest";
import {
  getIstCalendarDate,
  istCalendarDateToUtcIso,
  istInputToUtcIso,
  utcIsoToIstInput,
  formatIstDateTime,
} from "../businessTimeZone.helpers";

describe("fixed IST business timezone", () => {
  it("maps original advertisement midnight incident to correct UTC", () => {
    expect(istInputToUtcIso("2026-11-13T00:10")).toBe(
      "2026-11-12T18:40:00.000Z",
    );
    expect(utcIsoToIstInput("2026-11-12T18:40:00.000Z")).toBe(
      "2026-11-13T00:10",
    );
  });
  it("uses IST for today's business date even when UTC is previous day", () => {
    expect(getIstCalendarDate(new Date("2026-11-12T19:22:36Z"))).toBe(
      "2026-11-13",
    );
  });
  it("converts payment date midnight to UTC", () => {
    expect(istCalendarDateToUtcIso("2026-11-13")).toBe(
      "2026-11-12T18:30:00.000Z",
    );
  });
  it("rejects invalid calendar dates", () => {
    expect(() => istInputToUtcIso("2026-02-30T12:00")).toThrow();
    expect(() => istInputToUtcIso("2026-11-13T25:00")).toThrow();
  });
  it("supports leap dates", () => {
    expect(istInputToUtcIso("2028-02-29T00:00")).toBe(
      "2028-02-28T18:30:00.000Z",
    );
  });
  it("formats publication time as IST independently of browser TZ", () => {
    expect(formatIstDateTime("2026-11-12T18:40:00.000Z")).toContain("12:10");
  });
});
