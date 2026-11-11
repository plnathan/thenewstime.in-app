// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ServiceUnavailablePage from "./ServiceUnavailablePage";

let host: HTMLDivElement;
let root: Root;
const originalFetch = globalThis.fetch;
beforeEach(() => {
    host = document.createElement("div"); document.body.appendChild(host);
    root = createRoot(host);
    vi.stubGlobal("fetch", vi.fn());
});
afterEach(async () => {
    await act(async () => root.unmount()); host.remove();
    vi.stubGlobal("fetch", originalFetch);
    vi.restoreAllMocks();
});
async function render(props: { message?: string; expectedRestorationAt?: string | null } = {}) {
    await act(async () => { root.render(<ServiceUnavailablePage {...props} />); });
}
async function retry() {
    const button = host.querySelector("button")!;
    await act(async () => { button.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
}

describe("ServiceUnavailablePage", () => {
    it("renders the Tamil fallback and retry button", async () => {
        await render();
        expect(host.textContent).toContain("பராமரிப்புப் பணிகள்");
        expect(host.textContent).toContain("மீண்டும் முயற்சிக்கவும்");
        expect(host.textContent).not.toContain("முகப்பு");
    });
    it("shows custom Tamil message and expected restoration in Indian time", async () => {
        await render({ message: "திட்டமிட்ட பராமரிப்பு", expectedRestorationAt: "2026-11-12T04:30:00.000Z" });
        expect(host.textContent).toContain("திட்டமிட்ட பராமரிப்பு");
        expect(host.textContent).toContain("இந்திய நேரம்");
        expect(host.textContent).toContain("எதிர்பார்க்கப்படும் சேவை தொடக்க நேரம்");
    });
    it("hides restoration when unset", async () => {
        await render({ expectedRestorationAt: null });
        expect(host.textContent).not.toContain("எதிர்பார்க்கப்படும் சேவை தொடக்க நேரம்");
    });
    it("stays on maintenance page when backend still reports maintenance", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ maintenance: true }) } as Response);
        await render(); await retry();
        expect(fetch).toHaveBeenCalledOnce();
        expect(host.textContent).toContain("இன்னும் நடைபெற்று வருகின்றன");
    });
    it("shows recovery message when network is unavailable", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("offline"));
        await render(); await retry();
        expect(host.textContent).toContain("சேவையை தற்போது அணுக முடியவில்லை");
    });
    it("does not navigate on malformed availability response", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ success: true }) } as Response);
        await render(); await retry();
        expect(host.textContent).toContain("இன்னும் நடைபெற்று வருகின்றன");
    });
});
