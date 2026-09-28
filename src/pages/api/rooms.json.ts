import type { APIRoute } from "astro";
import { getBuilding } from "../../lib/campus";
import { canberraNow, roomStatusFor } from "../../lib/bookings";

// Live room status for a building at a given date/time. `date`/`time`
// default to "now" (computed server-side) so the map can poll this without
// having to know the current time itself.
export const GET: APIRoute = ({ url }) => {
  const buildingId = url.searchParams.get("building");
  if (!buildingId) {
    return new Response(JSON.stringify({ error: "building is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const building = getBuilding(buildingId);
  if (!building) {
    return new Response(JSON.stringify({ error: "building not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = canberraNow();
  const date = url.searchParams.get("date") ?? now.date;
  const time = url.searchParams.get("time") ?? now.time;

  const rooms = building.rooms.map((room) => ({
    ...room,
    status: roomStatusFor(room, date, time),
  }));

  return new Response(JSON.stringify({ rooms }), {
    headers: { "Content-Type": "application/json" },
  });
};
