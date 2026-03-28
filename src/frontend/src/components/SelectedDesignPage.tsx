import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, Info, Save, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSaveLayout } from "../hooks/useQueries";
import type { FormInputs, Layout, Room } from "../types/house";
import { HouseViewer3D } from "./HouseViewer3D";

interface Props {
  layout: Layout;
  inputs: FormInputs;
  onBack: () => void;
}

function getFloorLabel(f: number, layout: Layout) {
  if (f === -1) return "ALL";
  if (f === 0) return "G";
  if (layout.hasTerrace && f === layout.floorCount) return "T";
  return String(f);
}

const ROOM_INFO: Record<string, { color: string; bg: string; desc: string }> = {
  bedroom: {
    color: "#1a3a5c",
    bg: "#E8F4FF",
    desc: "Private sleeping space with natural ventilation.",
  },
  kitchen: {
    color: "#7a4400",
    bg: "#FFF5E8",
    desc: "Fully equipped modular kitchen with work triangle layout.",
  },
  hall: {
    color: "#1a4a1a",
    bg: "#E8F8E8",
    desc: "Spacious living and gathering area for the family.",
  },
  bathroom: {
    color: "#4a1a5c",
    bg: "#F8E8FF",
    desc: "Attached bathroom with modern fixtures.",
  },
  study: {
    color: "#5c5a00",
    bg: "#FFFDE8",
    desc: "Quiet study or guest room space.",
  },
  dining: {
    color: "#7a3a00",
    bg: "#FFF0E0",
    desc: "Dedicated dining area for family meals.",
  },
  parking: {
    color: "#2a3a44",
    bg: "#EEF2F5",
    desc: "Covered parking space for vehicles.",
  },
  garden: {
    color: "#1a4a1a",
    bg: "#E8F8E8",
    desc: "Open garden area for outdoor activities.",
  },
};

export function SelectedDesignPage({ layout, inputs, onBack }: Props) {
  const [selectedFloor, setSelectedFloor] = useState<number>(-1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { mutate: saveLayout, isPending: isSaving } = useSaveLayout();

  const handleRoomClick = (room: Room | null) => {
    setSelectedRoom(room);
  };

  const resetView = () => {
    setSelectedRoom(null);
  };

  // Escape key to deselect room
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedRoom(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Build floor list
  const floors: number[] = [
    -1,
    ...Array.from({ length: layout.floorCount }, (_, i) => i),
  ];
  if (layout.hasTerrace) floors.push(layout.floorCount);

  const handleSave = () => {
    saveLayout(
      { layout, inputs },
      {
        onSuccess: () => toast.success("Design saved successfully!"),
        onError: () => toast.error("Failed to save design."),
      },
    );
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Header */}
      <header className="nav-dark z-50">
        <div className="max-w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium transition-colors mr-4"
              style={{ color: "oklch(0.75 0.02 240)" }}
              data-ocid="nav.back.button"
            >
              <ArrowLeft size={16} />
              Back to Layouts
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.55 0.11 186)" }}
            >
              <Cpu size={16} color="white" />
            </div>
            <span
              className="font-bold text-lg tracking-widest"
              style={{
                color: "white",
                fontFamily: "'BricolageGrotesque', sans-serif",
              }}
            >
              ARKITEX AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden md:flex items-center gap-2 text-sm"
              style={{ color: "oklch(0.75 0.02 240)" }}
            >
              <span style={{ color: "oklch(0.55 0.11 186)" }}>●</span>
              {layout.name}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="teal-gradient text-white border-none text-sm font-semibold"
              data-ocid="design.save_button"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save size={14} className="mr-1.5" />
              )}
              Save & Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main 3D viewer */}
        <div
          className="flex-1 relative"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <HouseViewer3D
            layout={layout}
            plotLength={inputs.plotLength}
            plotBreadth={inputs.plotBreadth}
            buildingHeight={inputs.buildingHeight}
            miniMode={false}
            selectedFloor={selectedFloor}
            onRoomClick={handleRoomClick}
            showInternalStaircase={inputs.amenities.internalStaircase}
            showExternalStaircase={inputs.amenities.externalStaircase}
          />

          {/* Floor label overlay */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: "rgba(15,35,58,0.85)", color: "white" }}
          >
            {selectedFloor === -1
              ? "All Floors"
              : selectedFloor === 0
                ? "Ground Floor"
                : selectedFloor === layout.floorCount && layout.hasTerrace
                  ? "Terrace"
                  : `Floor ${selectedFloor}`}
          </div>

          {/* Reset View button (shown when a room is selected) */}
          {selectedRoom && (
            <button
              type="button"
              onClick={resetView}
              className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(15,35,58,0.85)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <X size={12} />
              Reset View
            </button>
          )}

          {/* Room info panel */}
          <AnimatePresence>
            {selectedRoom && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-16 left-5 rounded-xl p-4 min-w-48 shadow-lg"
                style={{
                  background: ROOM_INFO[selectedRoom.type]?.bg ?? "white",
                  border: "1px solid oklch(0.88 0.01 240)",
                }}
                data-ocid="room.info.panel"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color: ROOM_INFO[selectedRoom.type]?.color ?? "#333",
                      }}
                    >
                      {selectedRoom.label}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.45 0.02 244)" }}
                    >
                      {ROOM_INFO[selectedRoom.type]?.desc ?? "Room space."}
                    </p>
                    <p
                      className="text-xs mt-1.5 font-medium"
                      style={{ color: "oklch(0.52 0.02 244)" }}
                    >
                      Floor{" "}
                      {selectedRoom.floor === 0 ? "G" : selectedRoom.floor} ·{" "}
                      {(selectedRoom.width * inputs.plotLength).toFixed(1)}m ×{" "}
                      {(selectedRoom.depth * inputs.plotBreadth).toFixed(1)}m
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    className="opacity-50 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel: floor nav + info */}
        <div
          className="w-72 flex flex-col"
          style={{
            borderLeft: "1px solid oklch(0.88 0.01 240)",
            background: "white",
            height: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {/* Floor navigation */}
          <div
            className="p-5"
            style={{ borderBottom: "1px solid oklch(0.93 0.005 240)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.02 244)" }}
            >
              Floor Navigation
            </p>
            <div className="flex flex-col gap-2" data-ocid="floor.nav.panel">
              {floors.map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`floor-nav-btn w-full justify-start gap-3 px-3 text-left ${
                    selectedFloor === f ? "active" : ""
                  }`}
                  onClick={() => setSelectedFloor(f)}
                  data-ocid={`floor.nav.${f === -1 ? "all" : f}.button`}
                  style={{ width: "100%", height: "40px" }}
                >
                  <span
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background:
                        selectedFloor === f
                          ? "oklch(0.7 0.1 186)"
                          : "oklch(0.94 0.008 240)",
                      color:
                        selectedFloor === f ? "white" : "oklch(0.52 0.02 244)",
                    }}
                  >
                    {getFloorLabel(f, layout)}
                  </span>
                  <span className="text-sm font-medium">
                    {f === -1
                      ? "All Floors"
                      : f === 0
                        ? "Ground Floor"
                        : f === layout.floorCount && layout.hasTerrace
                          ? "Terrace"
                          : `Floor ${f}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout info */}
          <div className="p-5 flex-1">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.02 244)" }}
            >
              Design Details
            </p>
            <div className="space-y-3">
              <InfoRow label="Layout" value={layout.name} />
              <InfoRow
                label="Plot"
                value={`${inputs.plotLength}m × ${inputs.plotBreadth}m`}
              />
              <InfoRow
                label="Floors"
                value={`${layout.floorCount} level${layout.floorCount > 1 ? "s" : ""}`}
              />
              <InfoRow label="Bedrooms" value={String(inputs.numRooms)} />
              <InfoRow
                label="Total Rooms"
                value={String(layout.rooms.length)}
              />
              <InfoRow label="Staircase" value={layout.staircase.position} />
              {layout.hasTerrace && (
                <InfoRow label="Terrace" value="Included ☀️" />
              )}
            </div>

            {/* Active amenities */}
            <div className="mt-5">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.52 0.02 244)" }}
              >
                Active Features
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(inputs.amenities)
                  .filter(([, v]) => v)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{
                        background: "oklch(0.93 0.05 186)",
                        color: "oklch(0.44 0.09 192)",
                      }}
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* Click to inspect hint */}
            <div
              className="mt-5 p-3 rounded-xl flex items-start gap-2"
              style={{
                background: "oklch(0.97 0.005 186)",
                border: "1px solid oklch(0.88 0.05 186)",
              }}
            >
              <Info
                size={14}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "oklch(0.55 0.11 186)" }}
              />
              <p className="text-xs" style={{ color: "oklch(0.45 0.04 186)" }}>
                Click any room in the 3D view to see its details and dimensions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "oklch(0.6 0.02 244)" }}>
        {label}
      </span>
      <span
        className="text-xs font-semibold"
        style={{ color: "oklch(0.25 0.03 237)" }}
      >
        {value}
      </span>
    </div>
  );
}
