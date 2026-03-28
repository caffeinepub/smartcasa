import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useState } from "react";
import type { FormInputs, Layout } from "../types/house";
import { FloorPlan2D } from "./FloorPlan2D";

const ROOM_TYPE_COLORS: Record<string, string> = {
  bedroom: "oklch(0.55 0.09 240)",
  kitchen: "oklch(0.6 0.14 60)",
  hall: "oklch(0.5 0.1 150)",
  bathroom: "oklch(0.5 0.1 300)",
  study: "oklch(0.55 0.1 90)",
  parking: "oklch(0.5 0.05 220)",
  garden: "oklch(0.5 0.12 140)",
  terrace: "oklch(0.6 0.14 25)",
  dining: "oklch(0.55 0.12 50)",
};

interface Props {
  layout: Layout | null;
  inputs: FormInputs;
  open: boolean;
  onClose: () => void;
}

export function LayoutExpandModal({ layout, inputs, open, onClose }: Props) {
  const [selectedFloor, setSelectedFloor] = useState(0);

  if (!layout) return null;

  const totalFloors = layout.floorCount;
  const terraceFloor = layout.hasTerrace ? totalFloors : null;
  const floorTabs: { label: string; value: number }[] = [];
  for (let i = 0; i < totalFloors; i++) {
    floorTabs.push({ label: i === 0 ? "Ground" : `Floor ${i}`, value: i });
  }
  if (terraceFloor !== null) {
    floorTabs.push({ label: "Terrace", value: terraceFloor });
  }

  const roomsOnFloor = layout.rooms.filter((r) => r.floor === selectedFloor);
  // Filter parking out of the room list — shown separately in Site Areas
  const visibleRooms = roomsOnFloor.filter((r) => r.type !== "parking");
  const isTerrace = terraceFloor !== null && selectedFloor === terraceFloor;

  // Parking info for Site Areas section
  const parkingRoom = layout.rooms.find(
    (r) => r.type === "parking" && r.floor === 0,
  );
  const showSiteAreas = !isTerrace && selectedFloor === 0 && !!parkingRoom;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-full p-0 overflow-hidden"
        style={{
          background: "oklch(0.97 0.005 240)",
          border: "1px solid oklch(0.88 0.01 240)",
          borderRadius: "16px",
        }}
        data-ocid="layout.modal"
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: "oklch(0.13 0.03 237)",
            borderBottom: "1px solid oklch(0.22 0.03 237)",
          }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{
                color: "white",
                fontFamily: "'BricolageGrotesque', sans-serif",
              }}
            >
              {layout.name}
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.65 0.03 240)" }}
            >
              {layout.floorCount} floor{layout.floorCount > 1 ? "s" : ""} ·{" "}
              {layout.rooms.length} rooms
              {layout.hasTerrace ? " · Terrace included" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{
              color: "oklch(0.65 0.03 240)",
              background: "oklch(0.2 0.03 237)",
            }}
            data-ocid="layout.close_button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Floor tabs */}
        <div
          className="flex items-center gap-2 px-6 py-3 overflow-x-auto"
          style={{ borderBottom: "1px solid oklch(0.9 0.01 240)" }}
        >
          {floorTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedFloor(tab.value)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background:
                  selectedFloor === tab.value
                    ? "oklch(0.55 0.11 186)"
                    : "oklch(0.91 0.01 240)",
                color:
                  selectedFloor === tab.value
                    ? "white"
                    : "oklch(0.45 0.02 240)",
                border:
                  selectedFloor === tab.value
                    ? "1px solid oklch(0.45 0.11 186)"
                    : "1px solid oklch(0.86 0.01 240)",
              }}
              data-ocid="layout.floor.tab"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content split */}
        <div
          className="flex flex-col md:flex-row"
          style={{ minHeight: "420px" }}
        >
          {/* Left: floor plan */}
          <div
            className="flex-1 flex items-center justify-center p-4"
            style={{ background: "oklch(0.95 0.005 240)", minWidth: 0 }}
          >
            <FloorPlan2D
              layout={layout}
              floor={selectedFloor}
              width={460}
              height={340}
              plotLength={inputs.plotLength}
              plotBreadth={inputs.plotBreadth}
            />
          </div>

          {/* Right: room list */}
          <div
            className="w-full md:w-64 shrink-0 flex flex-col"
            style={{
              borderLeft: "1px solid oklch(0.9 0.01 240)",
              background: "white",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid oklch(0.92 0.01 240)" }}
            >
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.11 186)" }}
              >
                {isTerrace
                  ? "Terrace Details"
                  : `Rooms on ${selectedFloor === 0 ? "Ground" : `Floor ${selectedFloor}`}`}
              </span>
            </div>

            <ScrollArea className="flex-1">
              {isTerrace ? (
                <div className="p-4 space-y-3">
                  {[
                    {
                      icon: "🧱",
                      label: "Parapet walls",
                      desc: "Perimeter boundary walls for safety",
                    },
                    {
                      icon: "🪣",
                      label: "Water tank",
                      desc: "Overhead storage tank",
                    },
                    {
                      icon: "🌤️",
                      label: "Open sky access",
                      desc: "Natural light from above",
                    },
                    {
                      icon: "🪜",
                      label: "Staircase access",
                      desc: "Connected via internal stairs",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "oklch(0.96 0.01 30)" }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.25 0.05 30)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(0.5 0.04 30)" }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleRooms.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-32 text-center p-4"
                  data-ocid="layout.rooms.empty_state"
                >
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.6 0.02 240)" }}
                  >
                    No rooms on this floor.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {visibleRooms.map((room, idx) => {
                    const area = (
                      room.width *
                      inputs.plotLength *
                      room.depth *
                      inputs.plotBreadth
                    ).toFixed(1);
                    const dimW = (room.width * inputs.plotLength).toFixed(1);
                    const dimD = (room.depth * inputs.plotBreadth).toFixed(1);
                    const color =
                      ROOM_TYPE_COLORS[room.type] ?? "oklch(0.5 0.05 240)";
                    return (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-2.5 rounded-xl"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}40`,
                        }}
                        data-ocid={`layout.rooms.item.${idx + 1}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ background: color }}
                          />
                          <div className="min-w-0">
                            <span
                              className="text-xs font-semibold truncate block"
                              style={{ color: "oklch(0.22 0.03 237)" }}
                            >
                              {room.label}
                            </span>
                            <span
                              className="text-xs font-mono block"
                              style={{
                                color: "oklch(0.5 0.04 240)",
                                fontSize: "9px",
                              }}
                            >
                              {dimW}m × {dimD}m
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 capitalize"
                            style={{ fontSize: "9px" }}
                          >
                            {room.type}
                          </Badge>
                          <span
                            className="text-xs font-mono"
                            style={{
                              color: "oklch(0.52 0.02 244)",
                              fontSize: "10px",
                            }}
                          >
                            {area}m²
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Site Areas — Parking shown separately below room list */}
            {showSiteAreas && parkingRoom && (
              <div
                className="mx-3 mb-2 rounded-xl p-3"
                style={{
                  border: "1.5px solid oklch(0.65 0.12 186)",
                  background: "oklch(0.96 0.04 186)",
                }}
                data-ocid="layout.site_areas.panel"
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.38 0.12 186)" }}
                >
                  Site Areas
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none">🅿</span>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.25 0.08 220)" }}
                    >
                      Parking
                    </p>
                    <p
                      className="text-xs font-mono mt-0.5"
                      style={{ color: "oklch(0.4 0.06 220)" }}
                    >
                      {(parkingRoom.width * inputs.plotLength).toFixed(1)}m ×{" "}
                      {(parkingRoom.depth * inputs.plotBreadth).toFixed(1)}m
                    </p>
                    <p
                      className="text-xs font-mono font-semibold"
                      style={{ color: "oklch(0.32 0.1 186)" }}
                    >
                      ={" "}
                      {(
                        parkingRoom.width *
                        inputs.plotLength *
                        parkingRoom.depth *
                        inputs.plotBreadth
                      ).toFixed(1)}{" "}
                      m²
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isTerrace && visibleRooms.length > 0 && (
              <div
                className="px-4 py-3"
                style={{ borderTop: "1px solid oklch(0.92 0.01 240)" }}
              >
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.52 0.02 244)" }}
                >
                  Total floor area:{" "}
                  <strong style={{ color: "oklch(0.22 0.03 237)" }}>
                    {(inputs.plotLength * inputs.plotBreadth).toFixed(0)} m²
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
