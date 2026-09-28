import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";

// The homepage map's promises: markers for the three mapped buildings that
// link to their building pages, availability counts that reflect live
// bookings, and tiles served by this app (range requests included) rather
// than a third-party tile service.
const baseUrl = inject("baseUrl");

interface MarkerData {
  id: string;
  lngLat: [number, number];
  total: number;
  available: number;
}

const loadHome = async () => {
  const res = await fetch(new URL("/", baseUrl));
  expect(res.status).toBe(200);
  const doc = new JSDOM(await res.text()).window.document;
  const map = doc.getElementById("campus-map");
  expect(map, "expected a #campus-map container on /").not.toBeNull();
  const markers = JSON.parse(map!.getAttribute("data-markers") ?? "[]") as MarkerData[];
  return { doc, markers };
};

const canberraToday = () => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
};

describe("campus map", () => {
  it("has a marker for Chifley, Hancock and Marie Reay, each with a building page", async () => {
    const { markers } = await loadHome();
    const ids = markers.map((m) => m.id).sort();
    expect(ids).toEqual(["chifley", "hancock", "marie-reay"]);
    for (const m of markers) {
      expect(m.lngLat).toHaveLength(2);
      const page = await fetch(new URL(`/building/${m.id}/`, baseUrl), { redirect: "manual" });
      expect(page.status, `/building/${m.id}/`).toBe(200);
    }
  });

  it("serves the map tiles itself, with range request support", async () => {
    const res = await fetch(new URL("/maps/anu.pmtiles", baseUrl), { headers: { range: "bytes=0-126" } });
    expect(res.status).toBe(206);
    const magic = new TextDecoder().decode((await res.arrayBuffer()).slice(0, 7));
    expect(magic).toBe("PMTiles");
  });

  it("loads no scripts, stylesheets or images from other origins", async () => {
    const { doc } = await loadHome();
    const urls = [
      ...[...doc.querySelectorAll("script[src]")].map((e) => e.getAttribute("src")!),
      ...[...doc.querySelectorAll('link[rel="stylesheet"][href]')].map((e) => e.getAttribute("href")!),
      ...[...doc.querySelectorAll("img[src]")].map((e) => e.getAttribute("src")!),
    ];
    for (const u of urls) {
      expect(new URL(u, baseUrl).origin, u).toBe(new URL(baseUrl).origin);
    }
  });

  it("drops a building's available count when one of its rooms is booked now", async () => {
    const before = (await loadHome()).markers.find((m) => m.id === "chifley")!;
    const res = await fetch(new URL("/api/bookings", baseUrl), {
      method: "POST",
      headers: { origin: baseUrl, "content-type": "application/json" },
      body: JSON.stringify({
        roomId: "chifley-101",
        buildingId: "chifley",
        bookedBy: "map spec probe",
        date: canberraToday(),
        start: "00:00",
        end: "24:00",
      }),
    });
    expect(res.status).toBe(200);
    const after = (await loadHome()).markers.find((m) => m.id === "chifley")!;
    expect(after.available).toBe(before.available - 1);
  });
});
