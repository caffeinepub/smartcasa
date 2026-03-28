import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Box,
  CheckCircle,
  Cpu,
  LayoutDashboard,
  Maximize2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { FormInputs, Layout } from "../types/house";
import { FloorPlan2D } from "./FloorPlan2D";
import { HouseViewer3D } from "./HouseViewer3D";
import { LayoutExpandModal } from "./LayoutExpandModal";

interface Props {
  inputs: FormInputs;
  layouts: Layout[];
  onSelect: (layout: Layout) => void;
  onBack: () => void;
}

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

function countRoomTypes(layout: Layout) {
  const counts: Record<string, number> = {};
  for (const r of layout.rooms) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }
  return counts;
}

export function ResultsPage({ inputs, layouts, onSelect, onBack }: Props) {
  const [expandedLayout, setExpandedLayout] = useState<Layout | null>(null);
  const [viewer3DLayout, setViewer3DLayout] = useState<Layout | null>(null);

  return (
    <div className="min-h-screen grid-bg">
      <header className="nav-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              SMARTCASA
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "oklch(0.75 0.02 240)" }}
            data-ocid="nav.back.button"
          >
            <ArrowLeft size={16} />
            Edit Inputs
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard
                size={18}
                style={{ color: "oklch(0.55 0.11 186)" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.11 186)" }}
              >
                Generated Layouts
              </span>
            </div>
            <h2
              className="text-3xl font-bold"
              style={{
                color: "oklch(0.18 0.03 237)",
                fontFamily: "'BricolageGrotesque', sans-serif",
              }}
            >
              5 AI-Optimized Designs
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "oklch(0.52 0.02 244)" }}
            >
              Based on {inputs.plotLength}m × {inputs.plotBreadth}m plot ·{" "}
              {inputs.numFloors} floor
              {inputs.numFloors > 1 ? "s" : ""} · {inputs.numRooms} bedrooms
            </p>
          </div>
          <div
            className="hidden md:flex flex-col items-end gap-1 text-xs"
            style={{ color: "oklch(0.52 0.02 244)" }}
          >
            <span>
              Total Area:{" "}
              <strong>
                {(inputs.plotLength * inputs.plotBreadth).toFixed(0)} m²
              </strong>
            </span>
            <span>
              Height: <strong>{inputs.buildingHeight}m</strong>
            </span>
          </div>
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-ocid="layouts.list"
        >
          {layouts.map((layout, i) => (
            <motion.div
              key={layout.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              data-ocid={`layouts.item.${i + 1}`}
            >
              <LayoutCard
                layout={layout}
                index={i + 1}
                inputs={inputs}
                onSelect={() => onSelect(layout)}
                onExpand={() => setExpandedLayout(layout)}
                onView3D={() => setViewer3DLayout(layout)}
              />
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="nav-dark py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-sm" style={{ color: "oklch(0.6 0.02 240)" }}>
            © {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.7 0.15 10)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              style={{ color: "oklch(0.55 0.11 186)" }}
              className="underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      <LayoutExpandModal
        layout={expandedLayout}
        inputs={inputs}
        open={!!expandedLayout}
        onClose={() => setExpandedLayout(null)}
      />

      {/* 3D Viewer Modal */}
      <AnimatePresence>
        {viewer3DLayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#0d1b2a" }}
            data-ocid="viewer3d.modal"
          >
            {/* 3D Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-3 shrink-0"
              style={{
                background: "rgba(10,20,35,0.95)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.55 0.11 186)" }}
                >
                  <Box size={14} color="white" />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "white",
                      fontFamily: "'BricolageGrotesque', sans-serif",
                    }}
                  >
                    {viewer3DLayout.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    3D View · Drag to rotate · Scroll to zoom
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewer3DLayout(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                }}
                data-ocid="viewer3d.close_button"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 relative" style={{ minHeight: 0 }}>
              <HouseViewer3D
                layout={viewer3DLayout}
                plotLength={inputs.plotLength}
                plotBreadth={inputs.plotBreadth}
                buildingHeight={inputs.buildingHeight}
                showInternalStaircase={inputs.amenities.internalStaircase}
                showExternalStaircase={inputs.amenities.externalStaircase}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LayoutCard({
  layout,
  index,
  inputs,
  onSelect,
  onExpand,
  onView3D,
}: {
  layout: Layout;
  index: number;
  inputs: FormInputs;
  onSelect: () => void;
  onExpand: () => void;
  onView3D: () => void;
}) {
  const roomCounts = countRoomTypes(layout);
  const firstBedroomFloor =
    layout.rooms.find((r) => r.type === "bedroom")?.floor ?? 0;
  const floorLabel =
    firstBedroomFloor === 0 ? "Ground" : `Floor ${firstBedroomFloor}`;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-xl"
      style={{ border: "1px solid oklch(0.88 0.01 240)" }}
    >
      {/* 2D Floor Plan Preview */}
      <div
        className="relative overflow-hidden"
        style={{ height: "280px", background: "oklch(0.96 0.005 240)" }}
      >
        <div className="w-full h-full">
          <FloorPlan2D
            layout={layout}
            floor={firstBedroomFloor}
            height={280}
            plotLength={inputs.plotLength}
            plotBreadth={inputs.plotBreadth}
          />
        </div>
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold"
          style={{ background: "rgba(15,35,58,0.85)", color: "white" }}
        >
          {floorLabel} · #{index}
        </div>
        {layout.hasTerrace && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: "rgba(255,204,188,0.9)", color: "#6a3020" }}
          >
            ☀️ Terrace
          </div>
        )}
        <button
          type="button"
          onClick={onExpand}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity opacity-70 hover:opacity-100"
          style={{ background: "rgba(15,35,58,0.82)", color: "white" }}
          data-ocid={`layout.open_modal_button.${index}`}
        >
          <Maximize2 size={11} />
          All Floors
        </button>
      </div>

      {/* Card content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3
              className="font-bold text-base"
              style={{ color: "oklch(0.18 0.03 237)" }}
            >
              {layout.name}
            </h3>
            <p
              className="text-xs mt-0.5 leading-relaxed"
              style={{ color: "oklch(0.52 0.02 244)" }}
            >
              {layout.description.slice(0, 80)}...
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 my-3">
          {Object.entries(roomCounts).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-0.5 rounded text-xs font-medium capitalize"
              style={{
                background: `${ROOM_TYPE_COLORS[type] ?? "oklch(0.6 0.05 240)"}22`,
                color: ROOM_TYPE_COLORS[type] ?? "oklch(0.5 0.05 240)",
              }}
            >
              {count}× {type}
            </span>
          ))}
        </div>

        <div
          className="flex items-center gap-3 text-xs mb-4"
          style={{ color: "oklch(0.6 0.02 244)" }}
        >
          <Badge variant="secondary">{layout.floorCount} Floors</Badge>
          <Badge variant="secondary">{layout.rooms.length} Rooms</Badge>
          <Badge variant="secondary">
            Staircase: {layout.staircase.position}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSelect}
            className="flex-1 teal-gradient text-white border-none font-semibold"
            data-ocid={`layout.primary_button.${index}`}
          >
            <CheckCircle size={15} className="mr-1.5" />
            Select Design
          </Button>
          <Button
            variant="outline"
            onClick={onExpand}
            className="px-3 flex items-center gap-1.5"
            data-ocid={`layout.secondary_button.${index}`}
          >
            <Maximize2 size={13} />
            View Floors
          </Button>
          <Button
            variant="outline"
            onClick={onView3D}
            className="px-3 flex items-center gap-1.5"
            style={{
              borderColor: "oklch(0.55 0.11 186)",
              color: "oklch(0.45 0.11 186)",
            }}
            data-ocid={`layout.view3d.button.${index}`}
          >
            <Box size={13} />
            3D
          </Button>
        </div>
      </div>
    </div>
  );
}
