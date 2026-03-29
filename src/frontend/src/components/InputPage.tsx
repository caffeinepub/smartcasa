import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, ArrowRight, ChevronDown, Cpu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { FormInputs } from "../types/house";
import type { Layout } from "../types/house";
import { generateLayouts } from "../utils/layoutEngine";

interface Props {
  onGenerate: (inputs: FormInputs, layouts: Layout[]) => void;
}

const SLIDE_IMAGES = [
  "/assets/generated/home-slide-1.dim_1600x900.jpg",
  "/assets/generated/home-slide-2.dim_1600x900.jpg",
  "/assets/generated/home-slide-3.dim_1600x900.jpg",
  "/assets/generated/home-slide-4.dim_1600x900.jpg",
  "/assets/generated/home-slide-5.dim_1600x900.jpg",
];

const AMENITY_OPTIONS: {
  key: keyof FormInputs["amenities"];
  label: string;
  emoji: string;
}[] = [
  { key: "parking", label: "Parking", emoji: "🚗" },
  { key: "garden", label: "Garden", emoji: "🌳" },
  { key: "lawn", label: "Lawn", emoji: "🌿" },
  { key: "attachedBathrooms", label: "Attached Bathrooms", emoji: "🚿" },
  { key: "modularKitchen", label: "Modular Kitchen", emoji: "🍳" },
  { key: "duplex", label: "Duplex", emoji: "🏛️" },
  { key: "terraceRequired", label: "Terrace", emoji: "☀️" },
  { key: "internalStaircase", label: "Internal Staircase", emoji: "🪜" },
  { key: "hall", label: "Hall", emoji: "🏠" },
];

const FT_TO_M = 0.3048;
const M_TO_FT = 3.28084;

function convertValue(val: string, toUnit: "m" | "ft"): string {
  if (!val) return val;
  const n = Number.parseFloat(val);
  if (Number.isNaN(n)) return val;
  const converted = toUnit === "ft" ? n * M_TO_FT : n * FT_TO_M;
  return String(Math.round(converted * 100) / 100);
}

function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 5000);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetTimer is stable (refs only)
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setActiveIndex(index);
    resetTimer();
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "min(70vh, 640px)" }}
      data-ocid="hero.slideshow.panel"
    >
      {/* Slides */}
      {SLIDE_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 1 : 0,
          }}
        >
          <img
            src={src}
            alt={`Premium home ${i + 1}`}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        {/* Small label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-2 mb-6"
        >
          <span
            className="uppercase tracking-[0.25em] text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            AI-Powered Architecture
          </span>
          {/* animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
            className="h-px w-16 origin-left"
            style={{ background: "oklch(0.78 0.12 55)" }}
          />
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-bold text-white mb-4 leading-tight"
          style={{
            fontFamily: "'Playfair Display', 'BricolageGrotesque', serif",
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Design Your Dream Home
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-md text-sm md:text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          Generate intelligent multi-level layouts from your plot dimensions in
          seconds.
        </motion.p>
      </div>

      {/* Dot indicators */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
        data-ocid="hero.slideshow.panel"
      >
        {SLIDE_IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(i)}
            data-ocid={`hero.slideshow.item.${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? "24px" : "8px",
              height: "8px",
              background:
                i === activeIndex
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint arrow */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <ChevronDown size={22} style={{ color: "rgba(255,255,255,0.6)" }} />
      </motion.div>
    </div>
  );
}

export function InputPage({ onGenerate }: Props) {
  const [unit, setUnit] = useState<"m" | "ft">("m");
  const [plotLength, setPlotLength] = useState("");
  const [plotBreadth, setPlotBreadth] = useState("");
  const [buildingHeight, setBuildingHeight] = useState("");
  const [numRooms, setNumRooms] = useState([3]);
  const [numFloors, setNumFloors] = useState("2");
  const [amenities, setAmenities] = useState<FormInputs["amenities"]>({
    parking: false,
    garden: false,
    attachedBathrooms: false,
    modularKitchen: false,
    duplex: false,
    terraceRequired: false,
    internalStaircase: false,
    externalStaircase: false,
    hall: false,
    lawn: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.title = "SmartCasa – AI House Layout Designer";
  }, []);

  const toggleAmenity = (key: keyof FormInputs["amenities"]) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUnitToggle = (newUnit: "m" | "ft") => {
    if (newUnit === unit) return;
    setPlotLength((v) => convertValue(v, newUnit));
    setPlotBreadth((v) => convertValue(v, newUnit));
    setBuildingHeight((v) => convertValue(v, newUnit));
    setUnit(newUnit);
  };

  const validate = (): FormInputs | null => {
    const errs: string[] = [];
    const factor = unit === "ft" ? FT_TO_M : 1;
    const pl = Number.parseFloat(plotLength) * factor;
    const pb = Number.parseFloat(plotBreadth) * factor;
    const bh = Number.parseFloat(buildingHeight) * factor;
    const nf = Number.parseInt(numFloors);
    const nr = numRooms[0];

    if (!pl || pl < 3) errs.push("Plot length must be at least 3 meters.");
    if (!pb || pb < 3) errs.push("Plot breadth must be at least 3 meters.");
    if (!bh || bh < 2.5)
      errs.push("Building height must be at least 2.5 meters.");

    const totalArea = (pl || 0) * (pb || 0);
    const minAreaPerRoom = 9;
    const feasibleRooms = Math.floor((totalArea * 0.7) / minAreaPerRoom);
    if (nr > feasibleRooms && feasibleRooms > 0)
      errs.push(
        `Plot can fit ~${feasibleRooms} rooms. Reduce room count or increase plot size.`,
      );

    const feasibleFloors = Math.floor(bh / 2.5);
    if (nf > feasibleFloors)
      errs.push(
        `Building height allows max ${feasibleFloors} floor(s). Increase height or reduce floors.`,
      );

    setErrors(errs);
    if (errs.length > 0) return null;
    return {
      plotLength: pl,
      plotBreadth: pb,
      buildingHeight: bh,
      numRooms: nr,
      numFloors: nf,
      amenities,
      budgetRange: [0, 500],
    };
  };

  const handleGenerate = () => {
    const inputs = validate();
    if (!inputs) return;
    setIsGenerating(true);
    setTimeout(() => {
      const layouts = generateLayouts(inputs);
      setIsGenerating(false);
      onGenerate(inputs, layouts);
    }, 900);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
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
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "0.12em",
              }}
            >
              Smart<span style={{ color: "oklch(0.78 0.12 55)" }}>Casa</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Hero text strip */}
      <section className="hero-gradient hero-grid relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "oklch(0.35 0.07 186)",
                color: "oklch(0.8 0.1 186)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Architecture
            </div>
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight mb-3"
              style={{
                color: "white",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Configure Your
              <br />
              <span style={{ color: "oklch(0.78 0.12 55)" }}>Ideal Layout</span>
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.75 0.04 230)" }}
            >
              Enter your plot dimensions and preferences. SmartCasa generates
              multiple rule-based house layouts instantly — complete with
              floors, staircases, and terrace visualization.
            </p>
          </motion.div>

          {/* Blueprint illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <BlueprintSVG />
          </motion.div>
        </div>
      </section>

      {/* Input Card */}
      <section className="max-w-5xl mx-auto px-6 mt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.88 0.01 240)" }}
        >
          {/* Card header */}
          <div
            className="px-8 py-5"
            style={{
              borderBottom: "1px solid oklch(0.93 0.01 240)",
              background: "oklch(0.98 0.003 240)",
            }}
          >
            <h2
              className="text-xl font-bold tracking-tight"
              style={{
                color: "oklch(0.18 0.03 237)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Configure Your House Layout
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: "oklch(0.52 0.02 244)" }}
            >
              Fill in your requirements to generate AI-optimized 2D &amp; 3D
              designs
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Plot dimensions + height */}
            <div>
              <div className="flex items-center justify-between">
                <SectionLabel>Plot Dimensions &amp; Height</SectionLabel>
                {/* Unit toggle */}
                <div
                  className="flex rounded-full overflow-hidden"
                  style={{ border: "1px solid oklch(0.88 0.01 240)" }}
                  data-ocid="unit.toggle"
                >
                  {(["m", "ft"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitToggle(u)}
                      data-ocid={`unit.${u}.toggle`}
                      className="px-3 py-1 text-xs font-bold transition-all"
                      style={{
                        background:
                          unit === u ? "oklch(0.55 0.11 186)" : "transparent",
                        color: unit === u ? "white" : "oklch(0.52 0.02 244)",
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <FormField label={`Plot Length (${unit})`}>
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    value={plotLength}
                    onChange={(e) => setPlotLength(e.target.value)}
                    data-ocid="plot.length.input"
                    min={0}
                  />
                </FormField>
                <FormField label={`Plot Breadth (${unit})`}>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    value={plotBreadth}
                    onChange={(e) => setPlotBreadth(e.target.value)}
                    data-ocid="plot.breadth.input"
                    min={0}
                  />
                </FormField>
                <FormField label={`Building Height (${unit})`}>
                  <Input
                    type="number"
                    placeholder="e.g. 8"
                    value={buildingHeight}
                    onChange={(e) => setBuildingHeight(e.target.value)}
                    data-ocid="building.height.input"
                    min={0}
                  />
                </FormField>
              </div>
            </div>

            {/* Rooms + Floors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionLabel>Number of Bedrooms</SectionLabel>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className="text-sm"
                      style={{ color: "oklch(0.52 0.02 244)" }}
                    >
                      Bedrooms
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "oklch(0.55 0.11 186)" }}
                    >
                      {numRooms[0]}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={numRooms}
                    onValueChange={setNumRooms}
                    data-ocid="rooms.slider"
                  />
                  <div
                    className="flex justify-between text-xs mt-1"
                    style={{ color: "oklch(0.65 0.01 240)" }}
                  >
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Number of Floors</SectionLabel>
                <div className="mt-3">
                  <Select
                    value={numFloors}
                    onValueChange={setNumFloors}
                    data-ocid="floors.select"
                  >
                    <SelectTrigger className="w-full" data-ocid="floors.select">
                      <SelectValue placeholder="Select floors" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((f) => (
                        <SelectItem key={f} value={String(f)}>
                          {f} Floor{f > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <SectionLabel>Amenities &amp; Features</SectionLabel>
              <div className="flex flex-wrap gap-2 mt-3">
                {AMENITY_OPTIONS.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    data-ocid={`amenity.${key}.toggle`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background: amenities[key]
                        ? "oklch(0.93 0.05 186)"
                        : "oklch(0.96 0.003 240)",
                      color: amenities[key]
                        ? "oklch(0.44 0.09 192)"
                        : "oklch(0.52 0.02 244)",
                      border: amenities[key]
                        ? "1px solid oklch(0.7 0.09 186)"
                        : "1px solid oklch(0.88 0.01 240)",
                    }}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4"
                style={{
                  background: "oklch(0.97 0.02 30)",
                  border: "1px solid oklch(0.8 0.1 30)",
                }}
                data-ocid="form.error_state"
              >
                {errors.map((e) => (
                  <div key={e} className="flex items-start gap-2 text-sm">
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "oklch(0.55 0.2 30)" }}
                    />
                    <span style={{ color: "oklch(0.45 0.15 30)" }}>{e}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* CTA */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              data-ocid="generate.primary_button"
              className="w-full h-14 text-base font-bold tracking-wider uppercase rounded-xl teal-gradient text-white border-none transition-all"
              style={{ letterSpacing: "0.1em" }}
            >
              {isGenerating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Generating AI Layouts...
                </>
              ) : (
                <>
                  <Cpu size={18} className="mr-2" />
                  Generate My Layouts
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="nav-dark py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-sm tracking-widest"
              style={{
                color: "white",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Smart<span style={{ color: "oklch(0.78 0.12 55)" }}>Casa</span>
            </span>
            <span className="text-sm" style={{ color: "oklch(0.6 0.02 240)" }}>
              &nbsp;&mdash;&nbsp;© {new Date().getFullYear()}. Built with{" "}
              <span style={{ color: "oklch(0.7 0.15 10)" }}>♥</span> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline"
                style={{ color: "oklch(0.55 0.11 186)" }}
              >
                caffeine.ai
              </a>
            </span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <button
                key={l}
                type="button"
                className="text-sm bg-transparent border-none cursor-pointer"
                style={{ color: "oklch(0.6 0.02 240)" }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color: "oklch(0.52 0.02 244)", letterSpacing: "0.12em" }}
    >
      {children}
    </p>
  );
}

function FormField({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "oklch(0.52 0.02 244)" }}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function BlueprintSVG() {
  return (
    <svg
      width="320"
      height="240"
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Blueprint floor plan illustration"
    >
      <title>Blueprint floor plan</title>
      <rect
        x="10"
        y="10"
        width="300"
        height="220"
        stroke="#4A9EBF"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="6 3"
      />
      <rect
        x="20"
        y="20"
        width="120"
        height="90"
        stroke="#6BBCDE"
        strokeWidth="1"
        fill="rgba(107,188,222,0.08)"
      />
      <rect
        x="150"
        y="20"
        width="150"
        height="90"
        stroke="#6BBCDE"
        strokeWidth="1"
        fill="rgba(107,188,222,0.08)"
      />
      <rect
        x="20"
        y="120"
        width="80"
        height="100"
        stroke="#6BBCDE"
        strokeWidth="1"
        fill="rgba(107,188,222,0.08)"
      />
      <rect
        x="110"
        y="120"
        width="90"
        height="100"
        stroke="#6BBCDE"
        strokeWidth="1"
        fill="rgba(107,188,222,0.08)"
      />
      <rect
        x="210"
        y="120"
        width="90"
        height="100"
        stroke="#6BBCDE"
        strokeWidth="1"
        fill="rgba(107,188,222,0.08)"
      />
      <path
        d="M 20 110 A 15 15 0 0 1 35 95"
        stroke="#4A9EBF"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M 150 110 A 15 15 0 0 1 165 95"
        stroke="#4A9EBF"
        strokeWidth="0.8"
        fill="none"
      />
      <line
        x1="20"
        y1="230"
        x2="300"
        y2="230"
        stroke="#4A9EBF"
        strokeWidth="0.5"
      />
      <line
        x1="20"
        y1="225"
        x2="20"
        y2="235"
        stroke="#4A9EBF"
        strokeWidth="0.5"
      />
      <line
        x1="300"
        y1="225"
        x2="300"
        y2="235"
        stroke="#4A9EBF"
        strokeWidth="0.5"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={230 + i * 12}
          y1="130"
          x2={230 + i * 12}
          y2="220"
          stroke="#4A9EBF"
          strokeWidth="0.5"
        />
      ))}
      <text
        x="65"
        y="68"
        fill="#7EC8E3"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        BEDROOM
      </text>
      <text
        x="220"
        y="68"
        fill="#7EC8E3"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        HALL
      </text>
      <text
        x="55"
        y="174"
        fill="#7EC8E3"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        KITCHEN
      </text>
      <text
        x="152"
        y="174"
        fill="#7EC8E3"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        BATH
      </text>
      <text
        x="251"
        y="174"
        fill="#7EC8E3"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        STAIRS
      </text>
    </svg>
  );
}
