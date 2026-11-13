/*
```powershell
$env:TZ = 'Asia/Kolkata'
npx vitest run src/helpers/tests/timezone.regression.test.ts

$env:TZ = 'America/New_York'
npx vitest run src/helpers/tests/timezone.regression.test.ts

Remove-Item Env:TZ
*/

import { describe, expect, it } from "vitest";
import { scheduleIsoToLocal, scheduleLocalToIso } from "../schedule.helpers";
import {
  getLocalCalendarDate,
  localCalendarDateToUtcIso,
} from "../localCalendarDate.helpers";

// Run this file in separate processes with TZ=Asia/Kolkata and TZ=America/New_York.
// Tests assert against the process timezone, not a mocked browser timezone.
describe("timezone regression: advertisement schedule", () => {
  it("converts datetime-local to UTC and back without changing the selected wall clock", () => {
    const local = "2026-11-13T00:10";
    const utc = scheduleLocalToIso(local);
    expect(utc).toMatch(/Z$/);
    expect(scheduleIsoToLocal(utc)).toBe(local);
  });

  it("does not interpret a local datetime as UTC in India", () => {
    if (process.env.TZ !== "Asia/Kolkata") return;
    expect(scheduleLocalToIso("2026-11-13T00:10")).toBe(
      "2026-11-12T18:40:00.000Z",
    );
    expect(scheduleIsoToLocal("2026-11-12T18:40:00.000Z")).toBe(
      "2026-11-13T00:10",
    );
  });

  it("handles New York daylight saving offsets on both sides of transition", () => {
    if (process.env.TZ !== "America/New_York") return;
    expect(scheduleLocalToIso("2026-01-15T12:00")).toBe(
      "2026-01-15T17:00:00.000Z",
    );
    expect(scheduleLocalToIso("2026-07-15T12:00")).toBe(
      "2026-07-15T16:00:00.000Z",
    );
  });

  it("rejects malformed schedule dates", () => {
    expect(() => scheduleLocalToIso("not-a-date")).toThrow();
    expect(scheduleIsoToLocal("not-a-date")).toBe("");
    expect(scheduleIsoToLocal(null)).toBe("");
  });
});

describe("timezone regression: payment and refund business dates", () => {
  it("uses the local date rather than UTC date near midnight", () => {
    if (process.env.TZ !== "Asia/Kolkata") return;
    const instant = new Date("2026-11-12T19:00:00.000Z"); // Nov 13 00:30 IST
    expect(instant.toISOString().slice(0, 10)).toBe("2026-11-12");
    expect(getLocalCalendarDate(instant)).toBe("2026-11-13");
  });

  it("converts the selected business date at local midnight", () => {
    const date = "2026-11-13";
    const utc = localCalendarDateToUtcIso(date);
    expect(getLocalCalendarDate(new Date(utc))).toBe(date);
    if (process.env.TZ === "Asia/Kolkata") {
      expect(utc).toBe("2026-11-12T18:30:00.000Z");
    }
  });

  it("validates calendar dates, including leap days", () => {
    expect(() => localCalendarDateToUtcIso("2026-02-29")).toThrow();
    expect(() => localCalendarDateToUtcIso("2026-13-01")).toThrow();
    expect(() => localCalendarDateToUtcIso("2026-1-01")).toThrow();
    expect(() => localCalendarDateToUtcIso("2024-02-29")).not.toThrow();
    expect(() => getLocalCalendarDate(new Date(NaN))).toThrow();
  });
});
