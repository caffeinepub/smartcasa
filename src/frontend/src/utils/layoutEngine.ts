import type { FormInputs, Layout, Room } from "../types/house";

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${++idCounter}`;

function bed(
  floor: number,
  idx: number,
  x: number,
  z: number,
  w: number,
  d: number,
): Room {
  return {
    id: uid("bed"),
    type: "bedroom",
    x,
    z,
    width: w,
    depth: d,
    floor,
    label: `Bedroom ${idx}`,
  };
}

function makeRoom(
  type: Room["type"],
  floor: number,
  label: string,
  x: number,
  z: number,
  w: number,
  d: number,
): Room {
  return { id: uid(type), type, x, z, width: w, depth: d, floor, label };
}

/**
 * Distribute bedrooms in a non-overlapping grid within a zone.
 * cols capped at 3, rows computed from count.
 */
function distributeBedroomsInZone(
  count: number,
  zoneX: number,
  zoneZ: number,
  zoneW: number,
  zoneD: number,
  floor: number,
  startIdx: number,
): Room[] {
  const rooms: Room[] = [];
  if (count <= 0) return rooms;
  const cols = Math.min(count, 3);
  const rows = Math.ceil(count / cols);
  const bw = zoneW / cols;
  const bd = zoneD / rows;
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    rooms.push(
      bed(
        floor,
        startIdx + i,
        zoneX + col * bw,
        zoneZ + row * bd,
        bw - 0.008,
        bd - 0.008,
      ),
    );
  }
  return rooms;
}

export function generateLayouts(inputs: FormInputs): Layout[] {
  idCounter = 0;
  const { numFloors, numRooms, amenities } = inputs;
  const hasTerrace = amenities.terraceRequired;
  const hasParking = amenities.parking;
  const hasGarden = amenities.garden;
  const hasLawn = amenities.lawn ?? false;
  const hasAttachedBaths = amenities.attachedBathrooms;

  const upperFloors = Math.max(1, numFloors - 1);
  const bedsPerFloor = Math.max(1, Math.ceil(numRooms / upperFloors));

  return [
    layout1(
      numFloors,
      numRooms,
      bedsPerFloor,
      hasTerrace,
      hasParking,
      hasGarden,
      hasLawn,
      hasAttachedBaths,
    ),
    layout2(
      numFloors,
      numRooms,
      bedsPerFloor,
      hasTerrace,
      hasParking,
      hasGarden,
      hasLawn,
      hasAttachedBaths,
    ),
    layout3(
      numFloors,
      numRooms,
      bedsPerFloor,
      hasTerrace,
      hasParking,
      hasGarden,
      hasLawn,
      hasAttachedBaths,
    ),
    layout4(
      numFloors,
      numRooms,
      bedsPerFloor,
      hasTerrace,
      hasParking,
      hasGarden,
      hasLawn,
      hasAttachedBaths,
    ),
    layout5(
      numFloors,
      numRooms,
      bedsPerFloor,
      hasTerrace,
      hasParking,
      hasGarden,
      hasLawn,
      hasAttachedBaths,
    ),
  ];
}

// ---------------------------------------------------------------------------
// Coordinate convention:
//   x: 0=left edge, 1=right edge of building
//   z: 0=back wall, 1=front wall (facing gate/street)
// Entrance doorway is on the FRONT wall (z=1.0)
// So Hall must be placed at high-z (front) for the doorway to lead into it.
// ---------------------------------------------------------------------------

// Layout 1 — Transverse Hall (full-width hall across front)
function layout1(
  nFloors: number,
  nRooms: number,
  bpf: number,
  hasTerrace: boolean,
  _hasParking: boolean,
  _hasGarden: boolean,
  hasLawn: boolean,
  hasBaths: boolean,
): Layout {
  const rooms: Room[] = [];

  // Ground floor: Hall spans full width at front
  if (nFloors === 1) {
    // Single floor: compress to top third, add bedrooms at bottom
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.68, 1.0, 0.3));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.38, 0.5, 0.28));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.38, 0.48, 0.28));
    rooms.push(...distributeBedroomsInZone(nRooms, 0.0, 0.0, 1.0, 0.36, 0, 1));
  } else {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.5, 1.0, 0.5));
    // Kitchen back-left, Dining back-right
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.0, 0.5, 0.48));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.0, 0.48, 0.48));
  }

  // Upper floors:
  // Bedrooms zone: x=0–0.55, z=0–bedD (clear of staircase)
  // Staircase: x=0.58–0.78, z=0.62–1.0 (back-right, clear)
  // Bathroom: x=0–0.36, z=0.68–1.0 (front-left corner, clear of beds)
  // Study: x=0.58–1.0, z=0–0.58 (back-right)
  let bedIdx = 1;
  for (let f = 1; f < nFloors; f++) {
    const count = Math.min(bpf, nRooms - (f - 1) * bpf);
    if (count <= 0) break;
    const bedD = hasBaths ? 0.65 : 1.0;
    const beds = distributeBedroomsInZone(
      count,
      0.0,
      0.0,
      0.55,
      bedD,
      f,
      bedIdx,
    );
    rooms.push(...beds);
    bedIdx += count;
    if (hasBaths)
      rooms.push(makeRoom("bathroom", f, "Bathroom", 0.0, 0.68, 0.36, 0.3));
    if (f === nFloors - 1 && nFloors > 2)
      rooms.push(makeRoom("study", f, "Study / Guest", 0.58, 0.0, 0.42, 0.58));
  }

  return {
    id: "layout-1",
    name: "Transverse Hall",
    description:
      "Full-width hall across the front provides a welcoming entry directly from the gate. Kitchen and dining placed at the rear for privacy.",
    rooms,
    staircase: {
      x: 0.58,
      z: 0.62,
      width: 0.2,
      depth: 0.38,
      position: "corner",
    },
    hasTerrace,
    floorCount: nFloors,
    totalRooms: nRooms,
    externalStaircase: {
      side: "left",
      posZFraction: 0.0,
      widthFraction: 0.12,
      depthFraction: 0.85,
    },
    balconies: [
      { floor: 1, startFraction: 0.2, widthFraction: 0.6, depthFraction: 0.5 },
    ],
    hasLawn,
    hasGate: true,
  };
}

// Layout 2 — Side Hall (hall left-front, kitchen right-back)
function layout2(
  nFloors: number,
  nRooms: number,
  bpf: number,
  hasTerrace: boolean,
  _hasParking: boolean,
  _hasGarden: boolean,
  hasLawn: boolean,
  hasBaths: boolean,
): Layout {
  const rooms: Room[] = [];

  // Ground floor: Hall on left-front, Kitchen right-back, Dining left-back
  if (nFloors === 1) {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.68, 0.6, 0.3));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.62, 0.68, 0.38, 0.3));
    rooms.push(makeRoom("dining", 0, "Dining", 0.0, 0.38, 0.58, 0.28));
    rooms.push(makeRoom("bathroom", 0, "Utility", 0.62, 0.38, 0.38, 0.28));
    rooms.push(...distributeBedroomsInZone(nRooms, 0.0, 0.0, 1.0, 0.36, 0, 1));
  } else {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.5, 0.6, 0.5));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.62, 0.5, 0.38, 0.5));
    rooms.push(makeRoom("dining", 0, "Dining", 0.0, 0.0, 0.58, 0.48));
    rooms.push(makeRoom("bathroom", 0, "Utility", 0.62, 0.0, 0.38, 0.48));
  }

  // Upper: bedrooms right zone (0.57–1.0), staircase left bottom, bath right bottom
  let bedIdx = 1;
  for (let f = 1; f < nFloors; f++) {
    const count = Math.min(bpf, nRooms - (f - 1) * bpf);
    if (count <= 0) break;
    const bedD = hasBaths ? 0.65 : 1.0;
    const beds = distributeBedroomsInZone(
      count,
      0.57,
      0.0,
      0.43,
      bedD,
      f,
      bedIdx,
    );
    rooms.push(...beds);
    bedIdx += count;
    if (hasBaths)
      rooms.push(makeRoom("bathroom", f, "Bathroom", 0.57, 0.67, 0.43, 0.31));
    if (f === nFloors - 1 && nFloors > 2)
      rooms.push(makeRoom("study", f, "Study / Guest", 0.0, 0.0, 0.55, 0.55));
  }

  return {
    id: "layout-2",
    name: "Side Hall",
    description:
      "Hall positioned at the left-front corner. Kitchen placed to the right and rear, separating cooking aromas from the main entry.",
    rooms,
    staircase: { x: 0.0, z: 0.68, width: 0.2, depth: 0.32, position: "corner" },
    hasTerrace,
    floorCount: nFloors,
    totalRooms: nRooms,
    externalStaircase: {
      side: "right",
      posZFraction: 0.0,
      widthFraction: 0.12,
      depthFraction: 0.85,
    },
    balconies: [
      { floor: 1, startFraction: 0.2, widthFraction: 0.6, depthFraction: 0.5 },
    ],
    hasLawn,
    hasGate: true,
  };
}

// Layout 3 — Central Core (central corridor with bedrooms split)
function layout3(
  nFloors: number,
  nRooms: number,
  bpf: number,
  hasTerrace: boolean,
  _hasParking: boolean,
  _hasGarden: boolean,
  hasLawn: boolean,
  hasBaths: boolean,
): Layout {
  const rooms: Room[] = [];

  // Ground: hall full front, kitchen back-left, dining back-right
  if (nFloors === 1) {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.68, 1.0, 0.3));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.38, 0.48, 0.28));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.38, 0.48, 0.28));
    const half = Math.ceil(nRooms / 2);
    rooms.push(...distributeBedroomsInZone(half, 0.0, 0.0, 0.42, 0.36, 0, 1));
    rooms.push(
      ...distributeBedroomsInZone(
        nRooms - half,
        0.58,
        0.0,
        0.42,
        0.36,
        0,
        1 + half,
      ),
    );
  } else {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.52, 1.0, 0.48));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.0, 0.48, 0.5));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.0, 0.48, 0.5));
  }

  // Upper: split left (0–0.42) and right (0.58–1.0), staircase center (0.43–0.57)
  // Bathroom in center between staircase and front wall
  let bedIdx = 1;
  for (let f = 1; f < nFloors; f++) {
    const count = Math.min(bpf, nRooms - (f - 1) * bpf);
    if (count <= 0) break;
    const half = Math.ceil(count / 2);
    const bedD = hasBaths ? 0.65 : 1.0;
    const beds1 = distributeBedroomsInZone(
      half,
      0.0,
      0.0,
      0.42,
      bedD,
      f,
      bedIdx,
    );
    const beds2 = distributeBedroomsInZone(
      count - half,
      0.58,
      0.0,
      0.42,
      bedD,
      f,
      bedIdx + half,
    );
    rooms.push(...beds1, ...beds2);
    bedIdx += count;
    if (hasBaths)
      rooms.push(makeRoom("bathroom", f, "Bathroom", 0.43, 0.68, 0.14, 0.3));
  }

  return {
    id: "layout-3",
    name: "Central Core",
    description:
      "Staircase at the center spine divides bedrooms into two equal wings. Full-width hall greets visitors directly from the gate.",
    rooms,
    staircase: {
      x: 0.43,
      z: 0.68,
      width: 0.14,
      depth: 0.32,
      position: "center",
    },
    hasTerrace,
    floorCount: nFloors,
    totalRooms: nRooms,
    externalStaircase: {
      side: "right",
      posZFraction: 0.0,
      widthFraction: 0.12,
      depthFraction: 0.85,
    },
    balconies: [
      { floor: 1, startFraction: 0.15, widthFraction: 0.7, depthFraction: 0.5 },
    ],
    hasLawn,
    hasGate: true,
  };
}

// Layout 4 — Corner Distribution
function layout4(
  nFloors: number,
  nRooms: number,
  bpf: number,
  hasTerrace: boolean,
  _hasParking: boolean,
  _hasGarden: boolean,
  hasLawn: boolean,
  hasBaths: boolean,
): Layout {
  const rooms: Room[] = [];

  // Ground: hall front-left, kitchen front-right, dining back-left, utility back-right
  if (nFloors === 1) {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.68, 0.55, 0.3));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.57, 0.68, 0.43, 0.3));
    rooms.push(makeRoom("dining", 0, "Dining", 0.0, 0.38, 0.55, 0.28));
    rooms.push(makeRoom("bathroom", 0, "Utility", 0.57, 0.38, 0.43, 0.28));
    const q1 = Math.ceil(nRooms / 2);
    rooms.push(...distributeBedroomsInZone(q1, 0.0, 0.0, 0.52, 0.36, 0, 1));
    rooms.push(
      ...distributeBedroomsInZone(
        nRooms - q1,
        0.57,
        0.0,
        0.43,
        0.36,
        0,
        1 + q1,
      ),
    );
  } else {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.52, 0.55, 0.48));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.57, 0.52, 0.43, 0.48));
    rooms.push(makeRoom("dining", 0, "Dining", 0.0, 0.0, 0.55, 0.5));
    rooms.push(makeRoom("bathroom", 0, "Utility", 0.57, 0.0, 0.43, 0.5));
  }

  // Upper: left zone (0–0.52) and right zone (0.57–1.0) for beds
  // Staircase front-right corner (0.80, 0.68)
  let bedIdx = 1;
  for (let f = 1; f < nFloors; f++) {
    const count = Math.min(bpf, nRooms - (f - 1) * bpf);
    if (count <= 0) break;
    const q1Count = Math.ceil(count / 2);
    const q2Count = count - q1Count;
    const bedD = hasBaths ? 0.65 : 1.0;
    const beds1 = distributeBedroomsInZone(
      q1Count,
      0.0,
      0.0,
      0.52,
      bedD,
      f,
      bedIdx,
    );
    const beds2 = distributeBedroomsInZone(
      q2Count,
      0.57,
      0.0,
      0.43,
      bedD,
      f,
      bedIdx + q1Count,
    );
    rooms.push(...beds1, ...beds2);
    bedIdx += count;
    if (hasBaths)
      rooms.push(makeRoom("bathroom", f, "Bathroom", 0.0, 0.68, 0.3, 0.3));
  }

  return {
    id: "layout-4",
    name: "Four-Quadrant",
    description:
      "Four distinct zones on each floor. Hall and kitchen share the front facing the street; dining and utility anchor the rear.",
    rooms,
    staircase: {
      x: 0.78,
      z: 0.68,
      width: 0.22,
      depth: 0.32,
      position: "corner",
    },
    hasTerrace,
    floorCount: nFloors,
    totalRooms: nRooms,
    externalStaircase: {
      side: "left",
      posZFraction: 0.0,
      widthFraction: 0.12,
      depthFraction: 0.85,
    },
    balconies: [
      {
        floor: 1,
        startFraction: 0.15,
        widthFraction: 0.65,
        depthFraction: 0.5,
      },
    ],
    hasLawn,
    hasGate: true,
  };
}

// Layout 5 — Compact Vertical (side staircase)
function layout5(
  nFloors: number,
  nRooms: number,
  bpf: number,
  hasTerrace: boolean,
  _hasParking: boolean,
  _hasGarden: boolean,
  hasLawn: boolean,
  hasBaths: boolean,
): Layout {
  const rooms: Room[] = [];

  // Ground: Hall front (left 84%), Kitchen back-left, utility back-right
  if (nFloors === 1) {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.68, 0.82, 0.3));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.38, 0.5, 0.28));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.38, 0.48, 0.28));
    rooms.push(...distributeBedroomsInZone(nRooms, 0.0, 0.0, 0.8, 0.36, 0, 1));
  } else {
    rooms.push(makeRoom("hall", 0, "Hall / Living", 0.0, 0.52, 0.82, 0.48));
    rooms.push(makeRoom("kitchen", 0, "Kitchen", 0.0, 0.0, 0.5, 0.5));
    rooms.push(makeRoom("dining", 0, "Dining", 0.52, 0.0, 0.48, 0.5));
  }

  // Upper: bedrooms left zone (0–0.80), staircase right side (0.83–1.0)
  // Bathroom front-left corner (0–0.36, 0.68–1.0)
  let bedIdx = 1;
  for (let f = 1; f < nFloors; f++) {
    const count = Math.min(bpf, nRooms - (f - 1) * bpf);
    if (count <= 0) break;
    const bedD = hasBaths ? 0.65 : 1.0;
    const beds = distributeBedroomsInZone(
      count,
      0.0,
      0.0,
      0.8,
      bedD,
      f,
      bedIdx,
    );
    rooms.push(...beds);
    bedIdx += count;
    if (hasBaths)
      rooms.push(makeRoom("bathroom", f, "Bathroom", 0.0, 0.68, 0.36, 0.3));
    if (f === nFloors - 1 && nFloors > 2)
      rooms.push(makeRoom("study", f, "Study", 0.82, 0.0, 0.18, 0.62));
  }

  return {
    id: "layout-5",
    name: "Compact Vertical",
    description:
      "Right-side staircase frees the entire floor plate for rooms. Wide hall spans the front; compact kitchen and dining tucked at the rear.",
    rooms,
    staircase: { x: 0.82, z: 0.0, width: 0.18, depth: 0.65, position: "side" },
    hasTerrace,
    floorCount: nFloors,
    totalRooms: nRooms,
    externalStaircase: {
      side: "right",
      posZFraction: 0.0,
      widthFraction: 0.1,
      depthFraction: 0.85,
    },
    balconies: [
      { floor: 1, startFraction: 0.1, widthFraction: 0.7, depthFraction: 0.5 },
    ],
    hasLawn,
    hasGate: true,
  };
}
