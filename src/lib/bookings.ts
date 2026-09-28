import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { type Booking, bookings } from "./schema";
import { type Room, type RoomStatus } from "./campus";

export type { Booking };

export function listBookingsForRoom(roomId: string, date: string): Booking[] {
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.roomId, roomId), eq(bookings.date, date)))
    .orderBy(bookings.startTime)
    .all();
}

export function isOverlapping(roomId: string, date: string, start: string, end: string): boolean {
  return listBookingsForRoom(roomId, date).some(
    (b) => start < b.endTime && b.startTime < end,
  );
}

export interface NewBooking {
  roomId: string;
  buildingId: string;
  bookedBy: string;
  date: string;
  start: string;
  end: string;
}

export function createBooking(input: NewBooking): { ok: true; booking: Booking } | { ok: false; error: string } {
  if (isOverlapping(input.roomId, input.date, input.start, input.end)) {
    return { ok: false, error: "That room is already booked for part of this time slot." };
  }
  const booking = db
    .insert(bookings)
    .values({
      roomId: input.roomId,
      buildingId: input.buildingId,
      bookedBy: input.bookedBy,
      date: input.date,
      startTime: input.start,
      endTime: input.end,
    })
    .returning()
    .get();
  return { ok: true, booking };
}

// Servers run in UTC, but "now" for a booking means Canberra wall-clock time.
export function canberraNow(at: Date = new Date()): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Sydney",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

// A room's live status for a given date/time instant: a booking covering
// that instant makes it busy; otherwise it falls back to its static base
// status from campus.ts (which only ever says "available" or "closed").
export function roomStatusFor(room: Room, date: string, time: string): RoomStatus {
  if (room.status === "closed") return "closed";
  const busy = listBookingsForRoom(room.id, date).some((b) => b.startTime <= time && time < b.endTime);
  return busy ? "busy" : "available";
}
