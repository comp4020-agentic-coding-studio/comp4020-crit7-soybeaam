// Static campus + room data for the availability prototype. A real system
// would read this from the DB (see schema.ts / drizzle) and update on a
// schedule; for this layout crit it's fixed so the map and room views have
// something real to render against.

export type RoomStatus = "available" | "busy" | "closed";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: RoomStatus;
  note: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  // GeoJSON [lng, lat]; only buildings with one get a marker on the map.
  lngLat?: [number, number];
  rooms: Room[];
}

export const BUILDINGS: Building[] = [
  {
    id: "chifley",
    code: "Bldg 15",
    name: "Chifley Library",
    lngLat: [149.1203952, -35.2779988],
    rooms: [
      { id: "chifley-101", name: "Silent Study 101", capacity: 40, status: "available", note: "Open until 22:00" },
      { id: "chifley-b2", name: "Group Room B2", capacity: 8, status: "busy", note: "Booked until 15:00" },
      { id: "chifley-b3", name: "Group Room B3", capacity: 8, status: "available", note: "Free now" },
    ],
  },
  {
    id: "hancock",
    code: "Bldg 43",
    name: "Hancock Library",
    lngLat: [149.1177754, -35.2769518],
    rooms: [
      { id: "hancock-201", name: "Reading Room 201", capacity: 60, status: "available", note: "Open now" },
      { id: "hancock-tut1", name: "Tutorial Room 1", capacity: 20, status: "closed", note: "Closed for maintenance" },
    ],
  },
  {
    id: "csit",
    code: "Bldg 108",
    name: "CSIT Building",
    rooms: [
      { id: "csit-n101", name: "N101 Tutorial Room", capacity: 30, status: "busy", note: "Class until 16:00" },
      { id: "csit-lab2", name: "Lab 2.02", capacity: 24, status: "available", note: "Free now" },
      { id: "csit-lab3", name: "Lab 2.03", capacity: 24, status: "available", note: "Free now" },
    ],
  },
  {
    id: "union-court",
    code: "Union Ct",
    name: "Union Court",
    rooms: [
      { id: "uc-quiet", name: "Quiet Corner", capacity: 15, status: "available", note: "Free now" },
      { id: "uc-bookable", name: "Bookable Room 1", capacity: 10, status: "busy", note: "Booked until 14:30" },
    ],
  },
  {
    id: "coombs",
    code: "Bldg 9",
    name: "Coombs Building",
    rooms: [
      { id: "coombs-1120", name: "Seminar Room 1120", capacity: 25, status: "available", note: "Free now" },
      { id: "coombs-1130", name: "Seminar Room 1130", capacity: 25, status: "closed", note: "Not bookable" },
    ],
  },
  {
    id: "marie-reay",
    code: "Bldg 155",
    name: "Marie Reay Teaching Centre",
    lngLat: [149.1209577, -35.2776794],
    rooms: [
      { id: "mrtc-1", name: "Active Learning Room 1", capacity: 50, status: "available", note: "Free now" },
      { id: "mrtc-2", name: "Active Learning Room 2", capacity: 50, status: "busy", note: "Class until 16:00" },
      { id: "mrtc-3", name: "Seminar Room 3", capacity: 20, status: "available", note: "Free now" },
    ],
  },
  {
    id: "copland",
    code: "Bldg 24",
    name: "Copland Building",
    rooms: [
      { id: "copland-g30", name: "G30 Study Room", capacity: 12, status: "available", note: "Free now" },
      { id: "copland-g31", name: "G31 Study Room", capacity: 12, status: "busy", note: "Booked until 17:00" },
    ],
  },
];

export function getBuilding(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function statusLabel(status: RoomStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "busy":
      return "Busy";
    case "closed":
      return "Closed";
  }
}
