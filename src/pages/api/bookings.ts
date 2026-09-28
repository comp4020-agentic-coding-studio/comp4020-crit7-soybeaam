import type { APIRoute } from "astro";
import { createBooking } from "../../lib/bookings";

interface BookingFields {
  roomId: string;
  buildingId: string;
  bookedBy: string;
  date: string;
  start: string;
  end: string;
}

function validate(fields: Partial<BookingFields>): string | null {
  const { roomId, buildingId, bookedBy, date, start, end } = fields;
  if (!roomId || !buildingId || !bookedBy || !date || !start || !end) {
    return "All fields are required.";
  }
  if (!(start < end)) {
    return "Start time must be before end time.";
  }
  return null;
}

// Accepts either a plain HTML form POST (the no-JS path, mirroring
// messages.ts's redirect idiom) or a JSON POST (for client-side callers) —
// which one is in play is decided by the Content-Type header. Both paths
// validate the same fields and call the same createBooking(); they only
// differ in how success/failure is reported back.
export const POST: APIRoute = async ({ request, redirect }) => {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let fields: Partial<BookingFields>;
  if (isJson) {
    fields = (await request.json()) as Partial<BookingFields>;
  } else {
    const form = await request.formData();
    fields = {
      roomId: String(form.get("roomId") ?? "").trim(),
      buildingId: String(form.get("buildingId") ?? "").trim(),
      bookedBy: String(form.get("bookedBy") ?? "").trim(),
      date: String(form.get("date") ?? "").trim(),
      start: String(form.get("start") ?? "").trim(),
      end: String(form.get("end") ?? "").trim(),
    };
  }

  const buildingId = fields.buildingId;
  const error = validate(fields);
  if (error) {
    if (isJson) {
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const destination = buildingId ? `/building/${buildingId}/` : "/";
    return redirect(`${destination}?error=${encodeURIComponent(error)}`, 303);
  }

  const { roomId, bookedBy, date, start, end } = fields as BookingFields;
  const result = createBooking({ roomId, buildingId: buildingId!, bookedBy, date, start, end });

  if (!result.ok) {
    if (isJson) {
      return new Response(JSON.stringify({ ok: false, error: result.error }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    return redirect(`/building/${buildingId}/?error=${encodeURIComponent(result.error)}`, 303);
  }

  if (isJson) {
    return new Response(JSON.stringify({ ok: true, booking: result.booking }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return redirect(`/building/${buildingId}/`, 303);
};
