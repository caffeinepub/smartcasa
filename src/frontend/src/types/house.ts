export type RoomType =
  | "bedroom"
  | "kitchen"
  | "hall"
  | "bathroom"
  | "study"
  | "dining"
  | "parking"
  | "garden";

export interface Room {
  id: string;
  type: RoomType;
  x: number; // 0–1 normalized fraction of plot length
  z: number; // 0–1 normalized fraction of plot breadth
  width: number; // 0–1 fraction of plot length
  depth: number; // 0–1 fraction of plot breadth
  floor: number; // 0 = ground floor
  label: string;
}

export interface Staircase {
  x: number;
  z: number;
  width: number;
  depth: number;
  position: "corner" | "center" | "side";
}

export interface ExternalStaircase {
  side: "left" | "right"; // which side of building
  posZFraction: number; // 0-1 position along the side (Z axis)
  widthFraction: number; // width as fraction of plot width
  depthFraction: number; // depth as fraction of plot depth
}

export interface Balcony {
  floor: number;
  startFraction: number; // 0-1 where balcony starts along building front width
  widthFraction: number; // width as fraction of building width
  depthFraction: number; // depth of balcony as fraction of front lawn margin
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  rooms: Room[];
  staircase: Staircase;
  hasTerrace: boolean;
  floorCount: number;
  totalRooms: number;
  externalStaircase: ExternalStaircase;
  balconies: Balcony[];
  hasLawn: boolean;
  hasGate: boolean;
}

export interface Amenities {
  parking: boolean;
  garden: boolean;
  lawn: boolean;
  attachedBathrooms: boolean;
  modularKitchen: boolean;
  duplex: boolean;
  terraceRequired: boolean;
  internalStaircase: boolean;
  externalStaircase: boolean;
  hall: boolean;
}

export interface FormInputs {
  plotLength: number;
  plotBreadth: number;
  buildingHeight: number;
  numRooms: number;
  numFloors: number;
  amenities: Amenities;
  budgetRange: [number, number];
}
