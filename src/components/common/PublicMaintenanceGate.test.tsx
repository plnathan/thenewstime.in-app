// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import PublicMaintenanceGate from "./PublicMaintenanceGate";

let host: HTMLDivElement; let root: Root;
const originalFetch = globalThis.fetch;
beforeEach(() => { host = document.createElement("div"); document.body.appendChild(host); root = createRoot(host); vi.stubGlobal("fetch", vi.fn()); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.stubGlobal("fetch", originalFetch); vi.restoreAllMocks(); });
async function render(path = "/") {
    await act(async () => { root.render(<MemoryRouter initialEntries={[path]}><PublicMaintenanceGate><div>PUBLIC NEWS CONTENT</div></PublicMaintenanceGate></MemoryRouter>); });
}
describe("PublicMaintenanceGate", () => {
    it("never mounts public content while availability is unresolved", async () => {
        vi.mocked(fetch).mockReturnValue(new Promise(() => { }));
        await render();
        expect(host.textContent).not.toContain("PUBLIC NEWS CONTENT");
        expect(host.querySelector('[aria-label="Checking website availability"]')).not.toBeNull();
    });
    it("renders public content only after available response", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ maintenance: false }) } as Response);
        await render(); expect(host.textContent).toContain("PUBLIC NEWS CONTENT");
    });
    it("shows maintenance message and blocks public content", async () => {
        vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ maintenance: true, message: "திட்டமிட்ட பராமரிப்பு", expectedRestorationAt: "2026-11-12T04:30:00Z" }) } as Response);
        await render();
        expect(host.textContent).not.toContain("PUBLIC NEWS CONTENT");
        expect(host.textContent).toContain("திட்டமிட்ட பராமரிப்பு");
        expect(host.textContent).toContain("இந்திய நேரம்");
    });
    it("fails closed when the availability endpoint is unreachable", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("offline"));
        await render(); expect(host.textContent).not.toContain("PUBLIC NEWS CONTENT");
        expect(host.textContent).toContain("மீண்டும் முயற்சிக்கவும்");
    });
    it("does not block admin routes or call availability endpoint", async () => {
        await render("/admin/security/maintenance");
        expect(host.textContent).toContain("PUBLIC NEWS CONTENT");
        expect(fetch).not.toHaveBeenCalled();
    });
});
