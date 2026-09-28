import { describe, expect, inject, it } from "vitest";

// Drives the running app over HTTP to prove the booking feature's two core
// claims hold in this repo: a booking made through the no-JS form path
// persists and flips the room's live status to busy, and the API refuses a
// second booking that overlaps an existing one for the same room, while
// still allowing a genuinely non-overlapping booking straight after it. A
// red run here means the booking feature itself is broken.
const baseUrl = inject("baseUrl");

// Fixed far-future date so this never collides with "today" logic; each test
// run boots a fresh throwaway db, so no cross-run collision risk either.
const DATE = "2030-06-15";
const BUILDING = "chifley";
const ROOM = "chifley-b3"; // status "available" in static campus data

// Astro checks form POSTs carry a same-origin Origin header (CSRF
// protection); browsers send it automatically, a bare fetch doesn't.
const postForm = (path: string, body: URLSearchParams) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });

const postJson = (path: string, body: unknown) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl, "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("booking", () => {
  it("accepts a form booking, redirects, and the room shows busy on reload", async () => {
    const res = await postForm(
      "/api/bookings",
      new URLSearchParams({
        roomId: ROOM,
        buildingId: BUILDING,
        bookedBy: "spec probe",
        date: DATE,
        start: "09:00",
        end: "10:00",
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/building/${BUILDING}/`);

    // A time strictly inside the booked window should now show busy.
    const roomsRes = await fetch(
      new URL(`/api/rooms.json?building=${BUILDING}&date=${DATE}&time=09:30`, baseUrl),
    );
    expect(roomsRes.status).toBe(200);
    const { rooms } = (await roomsRes.json()) as { rooms: { id: string; status: string }[] };
    const room = rooms.find((r) => r.id === ROOM);
    expect(room, `expected ${ROOM} in the rooms response`).toBeDefined();
    expect(room?.status).toBe("busy");
  });

  it("accepts a JSON booking, then rejects an overlapping one, then accepts a non-overlapping one", async () => {
    const first = await postJson("/api/bookings", {
      roomId: ROOM,
      buildingId: BUILDING,
      bookedBy: "spec probe",
      date: DATE,
      start: "13:00",
      end: "14:00",
    });
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as { ok: boolean };
    expect(firstBody.ok).toBe(true);

    // Overlapping window: starts before the first ends, ends after it starts.
    const overlapping = await postJson("/api/bookings", {
      roomId: ROOM,
      buildingId: BUILDING,
      bookedBy: "spec probe",
      date: DATE,
      start: "13:30",
      end: "14:30",
    });
    expect(overlapping.status).toBe(409);
    const overlapBody = (await overlapping.json()) as { ok: boolean; error?: string };
    expect(overlapBody.ok).toBe(false);
    expect(typeof overlapBody.error).toBe("string");
    expect(overlapBody.error?.length).toBeGreaterThan(0);

    // Non-overlapping window immediately after the first booking's end.
    const after = await postJson("/api/bookings", {
      roomId: ROOM,
      buildingId: BUILDING,
      bookedBy: "spec probe",
      date: DATE,
      start: "14:00",
      end: "15:00",
    });
    expect(after.status).toBe(200);
    const afterBody = (await after.json()) as { ok: boolean };
    expect(afterBody.ok).toBe(true);
  });
});
