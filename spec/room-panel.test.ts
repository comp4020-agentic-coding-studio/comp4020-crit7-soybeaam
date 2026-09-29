import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";

// The room availability panel's promises: the home page ships a hidden,
// labelled dialog with a real booking link, the building list keeps working
// as plain links without scripts, and the rooms API the panel reads returns
// a known status for every room. Clicking and focus need a real browser, so
// they're left to manual checks.
const baseUrl = inject("baseUrl");

const STATUSES = ["available", "busy", "closed"];

const loadHome = async () => {
  const res = await fetch(new URL("/", baseUrl));
  expect(res.status).toBe(200);
  return new JSDOM(await res.text()).window.document;
};

describe("room availability panel", () => {
  it("ships a hidden dialog with an accessible name on /", async () => {
    const doc = await loadHome();
    const panel = doc.getElementById("room-panel");
    expect(panel, "expected a #room-panel on /").not.toBeNull();
    expect(panel!.hasAttribute("hidden")).toBe(true);
    expect(panel!.getAttribute("role")).toBe("dialog");
    const labelId = panel!.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(doc.getElementById(labelId!)?.textContent?.trim()).toBeTruthy();
  });

  it("has a Schedule booking link to a building page", async () => {
    const doc = await loadHome();
    const book = [...doc.querySelectorAll("#room-panel a")].find((a) => a.textContent?.includes("Schedule booking"));
    expect(book, "expected a Schedule booking link in the panel").toBeDefined();
    expect(book!.getAttribute("href")).toMatch(/^\/building\/[a-z-]+\/$/);
  });

  it("keeps the building list as real links carrying data-building-id", async () => {
    const doc = await loadHome();
    const links = [...doc.querySelectorAll<HTMLAnchorElement>(".card-list a")];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      const id = a.getAttribute("data-building-id");
      expect(id, a.outerHTML).toBeTruthy();
      expect(a.getAttribute("href")).toBe(`/building/${id}/`);
    }
  });

  it("returns every room in a building with a known status", async () => {
    const res = await fetch(new URL("/api/rooms.json?building=chifley", baseUrl));
    expect(res.status).toBe(200);
    const { rooms } = (await res.json()) as { rooms: { id: string; status: string }[] };
    expect(rooms.length).toBeGreaterThan(0);
    for (const r of rooms) expect(STATUSES, r.id).toContain(r.status);
  });

  it("refuses a missing building with 400 and an unknown one with 404", async () => {
    expect((await fetch(new URL("/api/rooms.json", baseUrl))).status).toBe(400);
    expect((await fetch(new URL("/api/rooms.json?building=nowhere", baseUrl))).status).toBe(404);
  });
});
