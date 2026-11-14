// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
    stream: vi.fn(),
    invalidate: vi.fn(),
}));

vi.mock("@/api/news.api", () => ({
    getPublishedNewsStream: mocks.stream,
    invalidatePublicNewsStreamCache: mocks.invalidate,
}));
vi.mock("@/hooks/usePageTitle", () => ({ usePageTitle: () => undefined }));
vi.mock("@/hooks/useCategories", () => ({
    useCategories: () => ({
        loading: false,
        error: null,
        categories: [
            { id: 101, urlName: "politics", displayName: "அரசியல்" },
            { id: 102, urlName: "business", displayName: "வணிகம்" },
            { id: 103, urlName: "sports", displayName: "விளையாட்டு" },
            { id: 104, urlName: "technology", displayName: "தொழில்நுட்பம்" },
            { id: 105, urlName: "cinema", displayName: "சினிமா" },
        ],
    }),
}));
vi.mock("@/utils/news", () => ({ toNewsViewList: (items: unknown[]) => items }));
vi.mock("@/layouts/MainLayout", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/container/AppContainer", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/container/MainContent", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/ui/PageLoader/PageLoader", () => ({ default: () => <div data-testid="loading">Loading</div> }));
vi.mock("@/components/news/NewsCard", () => ({ default: ({ news }: { news: { id: number } }) => <div data-testid="article" data-id={news.id}>Article {news.id}</div> }));
vi.mock("@/components/advertisements/Advertisement/DynamicNewsListSidebar", () => ({
    default: ({ importantNews, additionalNews }: { importantNews: unknown[]; additionalNews: unknown[] }) =>
        <aside data-testid="sidebar" data-important={importantNews.length} data-additional={additionalNews.length} />,
}));
vi.mock("@/components/advertisements/Advertisement/LiveAdvertisementSlot", () => ({
    default: ({ configuredCode, placementCode }: { configuredCode?: string; placementCode: string }) =>
        <div data-testid="ad" data-placement={configuredCode ?? placementCode} />,
}));
vi.mock("@/components/advertisements/Advertisement/PublicAdvertisementModal", () => ({ default: () => null }));

import NewsPage from "../NewsPage";

const articles = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({ id: start + i, publishedAt: "2026-11-14T08:00:00.000Z" }));
const firstResponse = () => ({
    data: articles(1, 20),
    hero: articles(101, 5),
    meta: { hasNext: true, nextCursor: "cursor-20" },
});
const nextResponse = () => ({
    data: articles(21, 5),
    hero: [],
    meta: { hasNext: true, nextCursor: "cursor-25" },
});
function mount(url: string) {
    return render(<MemoryRouter initialEntries={[url]}><Routes><Route path="/news" element={<NewsPage />} /></Routes></MemoryRouter>);
}
const articleIds = () => screen.queryAllByTestId("article").map((node) => Number(node.getAttribute("data-id")));
const adCodes = () => screen.queryAllByTestId("ad").map((node) => node.getAttribute("data-placement"));

const routes = [
    { label: "தமிழ்நாடு", url: "/news?scope=STATE&state=tamil-nadu", expected: { scope: "STATE", state: "tamil-nadu" } },
    { label: "இந்தியா", url: "/news?scope=INDIA", expected: { scope: "INDIA" } },
    { label: "உலகம்", url: "/news?scope=WORLD", expected: { scope: "WORLD" } },
    { label: "அரசியல்", url: "/news?category=politics", expected: { categoryId: 101 } },
    { label: "வணிகம்", url: "/news?category=business", expected: { categoryId: 102 } },
    { label: "விளையாட்டு", url: "/news?category=sports", expected: { categoryId: 103 } },
    { label: "தொழில்நுட்பம்", url: "/news?category=technology", expected: { categoryId: 104 } },
    { label: "சினிமா", url: "/news?category=cinema", expected: { categoryId: 105 } },
    { label: "அனைத்துச் செய்திகள்", url: "/news", expected: { excludeHomepageHero: true } },
] as const;

describe("NewsPage shared cursor and cached pagination regression", () => {
    beforeEach(() => {
        mocks.stream.mockReset();
        mocks.invalidate.mockReset();
        mocks.stream.mockImplementation(async ({ cursor }: { cursor?: string }) => cursor ? nextResponse() : firstResponse());
    });
    afterEach(() => cleanup());

    it.each(routes)("$label: initial request uses 20 and preserves URL filters", async ({ url, expected }) => {
        mount(url);
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        expect(mocks.stream).toHaveBeenCalledTimes(1);
        expect(mocks.stream).toHaveBeenCalledWith(expect.objectContaining({ limit: 20, ...expected }));
        expect(screen.getByTestId("sidebar").getAttribute("data-additional")).toBe("5");
        expect(adCodes()).toEqual([
            "NEWS_LIST_BETWEEN_SLOT_1", "NEWS_LIST_BETWEEN_SLOT_2", "NEWS_LIST_BETWEEN_SLOT_3", "NEWS_LIST_BOTTOM",
        ]);
    });

    it("மேலும் requests five with cursor, avoids duplicates and preserves slot sequence", async () => {
        mount("/news?categoryId=991");
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        fireEvent.click(screen.getByRole("button", { name: "மேலும்" }));
        await waitFor(() => expect(articleIds()).toHaveLength(20));
        expect(mocks.stream).toHaveBeenNthCalledWith(2, expect.objectContaining({ limit: 5, cursor: "cursor-20", categoryId: 991 }));
        expect(new Set(articleIds()).size).toBe(20);
        expect(adCodes()).toContain("NEWS_LIST_BETWEEN_SLOT_4");
        expect(screen.getByTestId("sidebar").getAttribute("data-additional")).toBe("5");
    });

    it("restores cached pagination on remount without another API call", async () => {
        const first = mount("/news?categoryId=992");
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        fireEvent.click(screen.getByRole("button", { name: "மேலும்" }));
        await waitFor(() => expect(articleIds()).toHaveLength(20));
        first.unmount();
        mount("/news?categoryId=992");
        expect(articleIds()).toHaveLength(20);
        expect(mocks.stream).toHaveBeenCalledTimes(2);
    });

    it("keeps different category cache entries isolated", async () => {
        const first = mount("/news?categoryId=993");
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        first.unmount();
        mount("/news?categoryId=994");
        await waitFor(() => expect(mocks.stream).toHaveBeenCalledTimes(2));
        expect(mocks.stream).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: 994, limit: 20 }));
    });

    it("Retry invalidates stream cache and refetches after initial failure", async () => {
        mocks.stream.mockRejectedValueOnce(new Error("network unavailable"));
        mount("/news?categoryId=995");
        await screen.findByRole("button", { name: "Retry" });
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        expect(mocks.invalidate).toHaveBeenCalledTimes(1);
        expect(mocks.stream).toHaveBeenCalledTimes(2);
    });

    it("never renders more than five between-article slots", async () => {
        mocks.stream.mockImplementation(async ({ cursor }: { cursor?: string }) => {
            if (!cursor) return firstResponse();
            const start = cursor === "cursor-20" ? 21 : cursor === "cursor-25" ? 26 : 31;
            return { data: articles(start, 5), hero: [], meta: { hasNext: start < 31, nextCursor: start < 31 ? `cursor-${start + 4}` : null } };
        });
        mount("/news?categoryId=996");
        await waitFor(() => expect(articleIds()).toHaveLength(15));
        for (const count of [20, 25, 30]) {
            fireEvent.click(screen.getByRole("button", { name: "மேலும்" }));
            await waitFor(() => expect(articleIds()).toHaveLength(count));
        }
        expect(adCodes().filter((code) => code?.startsWith("NEWS_LIST_BETWEEN_SLOT_"))).toEqual([
            "NEWS_LIST_BETWEEN_SLOT_1", "NEWS_LIST_BETWEEN_SLOT_2", "NEWS_LIST_BETWEEN_SLOT_3",
            "NEWS_LIST_BETWEEN_SLOT_4", "NEWS_LIST_BETWEEN_SLOT_5",
        ]);
    });
});
