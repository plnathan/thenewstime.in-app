import { describe, expect, it } from "vitest";
import {
  getIstDateOfInstant,
  getInclusiveIstCalendarDays,
  istCalendarDateEndUtcIso,
  istCalendarDateToUtcIso,
  shiftIsoCalendarDate,
  utcIsoToIstInput,
  istInputToUtcIso,
} from "../businessTimeZone.helpers";

describe("IST final audit: calendar boundaries and business forms", () => {
  it("uses IST calendar day at UTC midnight", () => {
    expect(getIstDateOfInstant("2026-11-12T20:00:00Z")).toBe("2026-11-13");
  });
  it("uses IST calendar day even when UTC is on the previous date", () => {
    expect(getIstDateOfInstant("2026-11-12T18:31:00Z")).toBe("2026-11-13");
  });
  it("calculates inclusive IST days across UTC date boundaries", () => {
    expect(
      getInclusiveIstCalendarDays(
        "2026-11-12T18:31:00Z",
        "2026-11-13T18:29:00Z",
      ),
    ).toBe(1);
    expect(
      getInclusiveIstCalendarDays(
        "2026-11-12T18:31:00Z",
        "2026-11-13T18:31:00Z",
      ),
    ).toBe(2);
  });
  it("moves date-only values without browser-local DST", () => {
    expect(shiftIsoCalendarDate("2026-03-08", -29)).toBe("2026-02-07");
  });
  it("rejects invalid date-only input", () => {
    expect(() => shiftIsoCalendarDate("2026-02-30", 1)).toThrow(RangeError);
  });
  it("converts inclusive rate-card end-of-day to UTC", () => {
    expect(istCalendarDateEndUtcIso("2026-11-13")).toBe(
      "2026-11-13T18:29:59.999Z",
    );
    expect(istCalendarDateToUtcIso("2026-11-13")).toBe(
      "2026-11-12T18:30:00.000Z",
    );
  });
  it("keeps security and maintenance datetime-local input in IST", () => {
    expect(utcIsoToIstInput("2026-11-12T18:40:00Z")).toBe("2026-11-13T00:10");
    expect(istInputToUtcIso("2026-11-13T00:10")).toBe(
      "2026-11-12T18:40:00.000Z",
    );
  });
});
