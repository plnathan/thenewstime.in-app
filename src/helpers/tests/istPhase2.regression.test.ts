/*
$env:TZ = "Asia/Kolkata"
npx vitest run src/helpers/tests/businessTimeZone.regression.test.ts src/helpers/tests/istPhase2.regression.test.ts

$env:TZ = "America/New_York"
npx vitest run src/helpers/tests/businessTimeZone.regression.test.ts src/helpers/tests/istPhase2.regression.test.ts

Remove-Item Env:TZ -ErrorAction SilentlyContinue

*/
import { describe, expect, it } from "vitest";
import {
  formatIstDateTime,
  istInputToUtcIso,
  utcIsoToIstInput,
} from "../businessTimeZone.helpers";

describe("Phase 2 shared IST schedule contract", () => {
  it("maps a midnight campaign schedule to the same UTC instant", () => {
    expect(istInputToUtcIso("2026-11-13T00:10")).toBe(
      "2026-11-12T18:40:00.000Z",
    );
  });
  it("round-trips an existing placement schedule into an IST input", () => {
    const stored = "2026-11-12T18:40:00.000Z";
    expect(istInputToUtcIso(utcIsoToIstInput(stored))).toBe(stored);
  });
  it("orders campaign windows by their UTC instants", () => {
    expect(Date.parse(istInputToUtcIso("2026-11-13T00:11"))).toBeGreaterThan(
      Date.parse(istInputToUtcIso("2026-11-13T00:10")),
    );
  });
  it("enforces campaign boundaries using absolute instants", () => {
    const campaignStart = "2026-11-12T18:40:00.000Z";
    expect(Date.parse(istInputToUtcIso("2026-11-13T00:09"))).toBeLessThan(
      Date.parse(campaignStart),
    );
  });
  it("rejects invalid rate-card effective dates", () => {
    expect(() => istInputToUtcIso("2026-02-30T10:00")).toThrow(RangeError);
  });
  it("renders dates in IST regardless of host timezone", () => {
    expect(formatIstDateTime("2026-11-12T18:40:00.000Z")).toContain("12:10");
  });
});
