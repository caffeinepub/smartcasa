import type { Layout } from "../types/house";

// ──────────────────────────────────────────────────
// Architectural colour palette
// ──────────────────────────────────────────────────
const ROOM_FILL: Record<string, string> = {
  bedroom: "#BBDEFB",
  kitchen: "#FFF9C4",
  hall: "#C8E6C9",
  bathroom: "#E1BEE7",
  study: "#B2EBF2",
  dining: "#FFE0B2",
  parking: "#CFD8DC",
  garden: "#A5D6A7",
  terrace: "#fdf0e4",
};

const ROOM_STROKE: Record<string, string> = {
  bedroom: "#5578a8",
  kitchen: "#b87d30",
  hall: "#3a7a52",
  bathroom: "#7a4a9a",
  study: "#a06030",
  dining: "#9a8030",
  parking: "#406080",
  garden: "#3a8040",
  terrace: "#b05020",
};

const ROOM_TEXT: Record<string, string> = {
  bedroom: "#1a2a4a",
  kitchen: "#3a2800",
  hall: "#0a3020",
  bathroom: "#2a0a3a",
  study: "#3a1a00",
  dining: "#3a2a00",
  parking: "#0a2030",
  garden: "#0a2a0a",
  terrace: "#3a1000",
};

interface Props {
  layout: Layout;
  floor: number;
  width?: number;
  height?: number;
  plotLength?: number;
  plotBreadth?: number;
}

function fitText(
  label: string,
  rectW: number,
  rectH: number,
): { text: string; fontSize: number } {
  const maxFontSize = 11;
  const minFontSize = 7;
  const charWidth = 0.55;
  let fontSize = maxFontSize;
  let text = label;
  while (fontSize >= minFontSize) {
    const textWidth = text.length * fontSize * charWidth;
    if (textWidth <= rectW - 6 && fontSize <= rectH - 4) break;
    fontSize -= 0.5;
  }
  if (fontSize < minFontSize) {
    const maxChars = Math.floor((rectW - 6) / (minFontSize * charWidth));
    text =
      label.length > maxChars
        ? `${label.slice(0, Math.max(1, maxChars - 1))}…`
        : label;
    fontSize = minFontSize;
  }
  return { text, fontSize };
}

export function FloorPlan2D({
  layout,
  floor,
  width = 400,
  height = 300,
  plotLength,
  plotBreadth,
}: Props) {
  const pad = 18;
  const drawW = width - pad * 2;
  const drawH = height - pad * 2;

  const floorRooms = layout.rooms.filter((r) => r.floor === floor);
  const isTerrace = layout.hasTerrace && floor === layout.floorCount;
  const showStaircase = floor > 0 && !isTerrace;

  const presentTypes = Array.from(new Set(floorRooms.map((r) => r.type)));
  const legendH = presentTypes.length > 0 ? 20 : 0;
  const planH = drawH - legendH;

  // ── Site margins (outside building footprint) ──
  // Front (bottom): larger margin for gate + parking + driveway
  // Sides: small margin for lawn / ext staircase
  const marginLeft = drawW * 0.1;
  const marginRight = drawW * 0.1;
  const marginTop = planH * 0.07;
  const marginBottom = planH * 0.32; // gate zone lives here

  // Building rectangle
  const bX = pad + marginLeft;
  const bY = pad + marginTop;
  const bW = drawW - marginLeft - marginRight;
  const bH = planH - marginTop - marginBottom;

  // Architectural wall thickness (px)
  const wallT = 4;

  const patternId = `hatch-${layout.id}-${floor}`;
  const dotPatternId = `dots-${layout.id}-${floor}`;
  const extStairPatternId = `hatch-ext-${layout.id}-${floor}`;
  const wallHatchId = `wall-hatch-${layout.id}-${floor}`;

  const floorLabel = floor === 0 ? "Ground Floor" : `Floor ${floor}`;

  // ── Front-of-plot geometry (from bottom of building down) ──
  const frontZoneTop = bY + bH; // bottom wall of building
  const frontZoneBot = pad + planH; // bottom of plot
  const frontZoneH = frontZoneBot - frontZoneTop;

  // Gate zone: bottom strip (12px tall)
  const gateH = 14;
  const gateW = drawW * 0.26;
  const gateX = pad + (drawW - gateW) / 2;
  const gateY = frontZoneBot - gateH;

  // Driveway: center strip between building and gate
  const drivewayW = drawW * 0.2;
  const drivewayX = pad + (drawW - drivewayW) / 2;
  const drivewayTop = frontZoneTop + 2;
  const drivewayBot = gateY - 2;
  const drivewayH = Math.max(drivewayBot - drivewayTop, 4);

  // Parking zone: left of driveway, inside gate line (between building and gate)
  const parkingRight = drivewayX - 4;
  const parkingLeft = pad + marginLeft * 0.1;
  const parkW = parkingRight - parkingLeft;
  const parkH = drivewayH + 4;
  const parkX = parkingLeft;
  const parkY = frontZoneTop + (frontZoneH - gateH - parkH) / 2 + 2;

  // Dim line position (above gate, clear of everything)
  const dimLineY = gateY - 8;

  // ── Entrance doorway: aligned to hall room on floor 0 ──
  const hallRoom = floorRooms.find((r) => r.type === "hall");
  const doorCenterX = hallRoom
    ? bX + (hallRoom.x + hallRoom.width / 2) * bW
    : bX + bW / 2;
  const doorW = Math.min(bW * 0.12, 28);
  const doorX = doorCenterX - doorW / 2;
  const doorArcR = doorW;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${layout.name} – ${floorLabel} floor plan`}
      style={{
        display: "block",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <title>{`${layout.name} – ${floorLabel} floor plan`}</title>

      <defs>
        {/* Staircase hatch */}
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#6080a0"
            strokeWidth="1.2"
          />
        </pattern>
        {/* Ext staircase hatch */}
        <pattern
          id={extStairPatternId}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="#4060a0" strokeWidth="1" />
        </pattern>
        {/* Upper-floor dot fill */}
        <pattern
          id={dotPatternId}
          patternUnits="userSpaceOnUse"
          width="18"
          height="18"
        >
          <circle cx="9" cy="9" r="0.8" fill="#c0c8d8" />
        </pattern>
        {/* Wall hatch (solid) */}
        <pattern
          id={wallHatchId}
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            stroke="#8090a8"
            strokeWidth="1.5"
          />
        </pattern>
        {/* Lawn gradient */}
        <linearGradient
          id={`lawn-g-${layout.id}-${floor}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#c8e8cc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a8d8ac" stopOpacity="0.5" />
        </linearGradient>
        {/* Driveway gradient */}
        <linearGradient
          id={`drv-g-${layout.id}-${floor}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#d4d8e0" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c0c4cc" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* ── Paper background ── */}
      <rect x="0" y="0" width={width} height={height} fill="#f8f7f4" rx="6" />

      {/* ── Plot boundary ── */}
      <rect
        x={pad}
        y={pad}
        width={drawW}
        height={planH}
        fill={
          floor === 0
            ? layout.hasLawn
              ? `url(#lawn-g-${layout.id}-${floor})`
              : "#f0f0ec"
            : `url(#${dotPatternId})`
        }
        stroke="#4a5a6a"
        strokeWidth="2"
        strokeDasharray={floor === 0 ? "0" : "5 3"}
        rx="2"
      />

      {/* ── Plot dimension annotations ── */}
      {plotLength != null && plotBreadth != null && (
        <g opacity="0.70" fontSize="7.5" fill="#304050" fontWeight="700">
          {/* Width (bottom) */}
          <line
            x1={pad + 4}
            y1={dimLineY}
            x2={pad + drawW - 4}
            y2={dimLineY}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <line
            x1={pad + 4}
            y1={dimLineY - 3}
            x2={pad + 4}
            y2={dimLineY + 3}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <line
            x1={pad + drawW - 4}
            y1={dimLineY - 3}
            x2={pad + drawW - 4}
            y2={dimLineY + 3}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <text x={pad + drawW / 2} y={dimLineY - 2} textAnchor="middle">
            {plotLength.toFixed(1)}m
          </text>
          {/* Depth (right) */}
          <line
            x1={pad + drawW - 10}
            y1={pad + 4}
            x2={pad + drawW - 10}
            y2={dimLineY - 4}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <line
            x1={pad + drawW - 14}
            y1={pad + 4}
            x2={pad + drawW - 6}
            y2={pad + 4}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <line
            x1={pad + drawW - 14}
            y1={dimLineY - 4}
            x2={pad + drawW - 6}
            y2={dimLineY - 4}
            stroke="#304050"
            strokeWidth="0.8"
          />
          <text
            x={pad + drawW - 4}
            y={pad + planH / 2}
            textAnchor="middle"
            transform={`rotate(-90,${pad + drawW - 4},${pad + planH / 2})`}
          >
            {plotBreadth.toFixed(1)}m
          </text>
        </g>
      )}

      {/* ── Lawn labels (only when lawn selected) ── */}
      {floor === 0 && layout.hasLawn && (
        <g opacity="0.75" fontSize="7" fill="#285030" fontWeight="600">
          <text
            x={pad + drawW / 2}
            y={bY + bH + drivewayH * 0.35 + 10}
            textAnchor="middle"
          >
            Lawn
          </text>
          <text
            x={pad + marginLeft / 2}
            y={pad + planH / 2}
            textAnchor="middle"
            transform={`rotate(-90,${pad + marginLeft / 2},${pad + planH / 2})`}
          >
            Lawn
          </text>
          <text
            x={pad + drawW - marginRight / 2}
            y={pad + planH / 2}
            textAnchor="middle"
            transform={`rotate(90,${pad + drawW - marginRight / 2},${pad + planH / 2})`}
          >
            Lawn
          </text>
          <text x={pad + drawW / 2} y={pad + 10} textAnchor="middle">
            Lawn
          </text>
        </g>
      )}

      {/* ── Front site zones: Driveway + Gate (ground floor) ── */}
      {floor === 0 && layout.hasGate && (
        <g>
          {/* Driveway */}
          <rect
            x={drivewayX}
            y={drivewayTop}
            width={drivewayW}
            height={drivewayH}
            fill={`url(#drv-g-${layout.id}-${floor})`}
            stroke="#8090a0"
            strokeWidth="0.8"
            strokeDasharray="4 2"
            rx="2"
          />
          {drivewayH > 10 && (
            <text
              x={drivewayX + drivewayW / 2}
              y={drivewayTop + drivewayH / 2 + 3}
              textAnchor="middle"
              fontSize="6"
              fill="#506070"
              fontWeight="600"
            >
              Driveway
            </text>
          )}

          {/* Gate zone */}
          <rect
            x={gateX}
            y={gateY}
            width={gateW}
            height={gateH}
            fill="#c8a060"
            stroke="#8a6020"
            strokeWidth="1.5"
            rx="2"
          />
          {/* Gate posts */}
          <rect
            x={gateX + 2}
            y={gateY + 2}
            width={4}
            height={gateH - 4}
            fill="#6a4010"
            rx="1"
          />
          <rect
            x={gateX + gateW - 6}
            y={gateY + 2}
            width={4}
            height={gateH - 4}
            fill="#6a4010"
            rx="1"
          />
          <text
            x={gateX + gateW / 2}
            y={gateY + gateH / 2 + 3.5}
            textAnchor="middle"
            fontSize="7"
            fill="#2a1000"
            fontWeight="700"
          >
            Gate
          </text>
          {/* Gate dimension below */}
          <text
            x={gateX + gateW / 2}
            y={gateY + gateH + 8}
            textAnchor="middle"
            fontSize="5.5"
            fill="#7a5010"
            fontWeight="600"
          >
            {plotLength != null
              ? `${(plotLength * 0.26).toFixed(1)}m × 1m`
              : "3m × 1m"}
          </text>
        </g>
      )}

      {/* ── Parking zone: inside gate line, left of driveway (ground floor) ── */}
      {floor === 0 && (
        <g>
          <rect
            x={parkX}
            y={parkY}
            width={Math.max(parkW, 2)}
            height={Math.max(parkH, 2)}
            fill="#dce4ee"
            stroke="#5070a0"
            strokeWidth="1.2"
            rx="2"
          />
          {/* Bay divider lines */}
          {[0.33, 0.66].map((frac) => (
            <line
              key={frac}
              x1={parkX + parkW * frac}
              y1={parkY + 3}
              x2={parkX + parkW * frac}
              y2={parkY + parkH - 3}
              stroke="#4060a0"
              strokeWidth="0.7"
              opacity="0.5"
            />
          ))}
          {parkH > 14 && parkW > 20 && (
            <text
              x={parkX + parkW / 2}
              y={parkY + parkH / 2 + 3}
              textAnchor="middle"
              fontSize="6.5"
              fill="#1a2a3a"
              fontWeight="700"
            >
              Parking
            </text>
          )}
          {parkH > 22 && parkW > 22 && (
            <text
              x={parkX + parkW / 2}
              y={parkY + parkH / 2 + 12}
              textAnchor="middle"
              fontSize="5.5"
              fill="#3a5070"
              fontWeight="600"
            >
              {plotLength != null
                ? `${(plotLength * 0.22).toFixed(1)}m×${(plotLength * 0.45).toFixed(1)}m`
                : "2.5m×5m"}
            </text>
          )}
        </g>
      )}

      {/* ── Building white fill ── */}
      <rect x={bX} y={bY} width={bW} height={bH} fill="white" />

      {/* ── Architectural wall thickness (outer) ── */}
      {/* Top wall */}
      <rect
        x={bX}
        y={bY}
        width={bW}
        height={wallT}
        fill={`url(#${wallHatchId})`}
      />
      {/* Left wall */}
      <rect
        x={bX}
        y={bY}
        width={wallT}
        height={bH}
        fill={`url(#${wallHatchId})`}
      />
      {/* Right wall */}
      <rect
        x={bX + bW - wallT}
        y={bY}
        width={wallT}
        height={bH}
        fill={`url(#${wallHatchId})`}
      />
      {/* Bottom wall (left of door) */}
      {floor === 0 ? (
        <>
          <rect
            x={bX}
            y={bY + bH - wallT}
            width={Math.max(doorX - bX, 0)}
            height={wallT}
            fill={`url(#${wallHatchId})`}
          />
          <rect
            x={doorX + doorW}
            y={bY + bH - wallT}
            width={Math.max(bX + bW - doorX - doorW, 0)}
            height={wallT}
            fill={`url(#${wallHatchId})`}
          />
        </>
      ) : (
        <rect
          x={bX}
          y={bY + bH - wallT}
          width={bW}
          height={wallT}
          fill={`url(#${wallHatchId})`}
        />
      )}

      {/* ── Building outline (thick border) ── */}
      <rect
        x={bX}
        y={bY}
        width={bW}
        height={bH}
        fill="none"
        stroke="#2a3040"
        strokeWidth="2.5"
        rx="1"
      />

      {/* ── Entrance doorway with door-swing arc (ground floor) ── */}
      {floor === 0 && (
        <g>
          {/* Gap in bottom wall */}
          <rect
            x={doorX}
            y={bY + bH - wallT - 1}
            width={doorW}
            height={wallT + 2}
            fill="white"
          />
          {/* Door jambs */}
          <rect
            x={doorX - 2}
            y={bY + bH - wallT - 2}
            width={2.5}
            height={wallT + 4}
            fill="#2a3040"
            rx="0.5"
          />
          <rect
            x={doorX + doorW - 0.5}
            y={bY + bH - wallT - 2}
            width={2.5}
            height={wallT + 4}
            fill="#2a3040"
            rx="0.5"
          />
          {/* Door leaf (thin line) */}
          <line
            x1={doorX}
            y1={bY + bH - wallT / 2}
            x2={doorX}
            y2={bY + bH - wallT / 2 - doorW}
            stroke="#2a3040"
            strokeWidth="0.8"
          />
          {/* Door swing arc */}
          <path
            d={`M ${doorX} ${bY + bH - wallT / 2} A ${doorArcR} ${doorArcR} 0 0 1 ${doorX + doorW} ${bY + bH - wallT / 2}`}
            fill="none"
            stroke="#2a3040"
            strokeWidth="0.7"
            strokeDasharray="3 2"
          />
          {/* Entry label below */}
          <text
            x={doorCenterX}
            y={bY + bH + 9}
            textAnchor="middle"
            fontSize="6"
            fill="#304060"
            fontWeight="700"
          >
            ENTRY
          </text>
        </g>
      )}

      {/* ── Terrace floor ── */}
      {isTerrace ? (
        <>
          <rect
            x={bX + 4}
            y={bY + 4}
            width={bW - 8}
            height={bH - 8}
            fill="#fdf0e4"
            stroke="#c06020"
            strokeWidth="1.5"
            rx="4"
          />
          {/* Parapet walls */}
          {[
            [bX + 4, bY + 4, bW - 8, 8],
            [bX + 4, bY + bH - 14, bW - 8, 8],
            [bX + 4, bY + 4, 8, bH - 8],
            [bX + bW - 14, bY + 4, 8, bH - 8],
          ].map(([rx, ry, rw, rh]) => (
            <rect
              key={`${rx}-${ry}`}
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill="#c8a080"
              rx="2"
            />
          ))}
          {/* Water tank */}
          <rect
            x={bX + bW * 0.4}
            y={bY + bH * 0.35}
            width={bW * 0.2}
            height={bH * 0.3}
            fill="#b0cce0"
            stroke="#4080a0"
            strokeWidth="1"
            rx="3"
          />
          <text
            x={bX + bW * 0.5}
            y={bY + bH * 0.5 + 4}
            textAnchor="middle"
            fontSize="9"
            fill="#1a4060"
            fontWeight="600"
          >
            Water Tank
          </text>
          <text
            x={bX + bW / 2}
            y={bY + bH * 0.22}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#703010"
          >
            TERRACE
          </text>
          <text
            x={bX + bW / 2}
            y={bY + bH * 0.22 + 16}
            textAnchor="middle"
            fontSize="8"
            fill="#a05020"
          >
            Open Sky · Parapet Walls
          </text>
        </>
      ) : (
        <>
          {/* ── Rooms ── */}
          {floorRooms.map((room) => {
            const rx = bX + wallT + room.x * (bW - wallT * 2);
            const ry = bY + wallT + room.z * (bH - wallT * 2);
            const rw = room.width * (bW - wallT * 2);
            const rh = room.depth * (bH - wallT * 2);
            const fill = ROOM_FILL[room.type] ?? "#f0f0f0";
            const stroke = ROOM_STROKE[room.type] ?? "#607080";
            const textCol = ROOM_TEXT[room.type] ?? "#202020";
            const { text, fontSize } = fitText(room.label, rw, rh);

            const actualW = plotLength ? room.width * plotLength : null;
            const actualD = plotBreadth ? room.depth * plotBreadth : null;
            const dimLabel =
              actualW !== null && actualD !== null
                ? `${actualW.toFixed(1)}×${actualD.toFixed(1)}m`
                : null;
            const showDim = dimLabel !== null && rw > 32 && rh > 24;
            const dimFontSize = Math.min(7, fontSize * 0.8);

            return (
              <g key={room.id}>
                <rect
                  x={rx}
                  y={ry}
                  width={Math.max(rw - 1, 1)}
                  height={Math.max(rh - 1, 1)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.2"
                  rx="1"
                />
                {/* Room name */}
                {rw > 22 && rh > 14 && (
                  <text
                    x={rx + rw / 2}
                    y={
                      showDim ? ry + rh / 2 - 1 : ry + rh / 2 + fontSize * 0.38
                    }
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="600"
                    fill={textCol}
                    style={{ pointerEvents: "none" }}
                  >
                    {text}
                  </text>
                )}
                {/* Dimension label */}
                {showDim && (
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2 + dimFontSize + 2}
                    textAnchor="middle"
                    fontSize={dimFontSize}
                    fontWeight="500"
                    fill={textCol}
                    opacity="0.8"
                    style={{ pointerEvents: "none" }}
                  >
                    {dimLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Internal staircase ── */}
          {showStaircase &&
            (() => {
              const sx = bX + wallT + layout.staircase.x * (bW - wallT * 2);
              const sy = bY + wallT + layout.staircase.z * (bH - wallT * 2);
              const sw = layout.staircase.width * (bW - wallT * 2);
              const sh = layout.staircase.depth * (bH - wallT * 2);
              const stepCount = 8;
              return (
                <g>
                  <rect
                    x={sx}
                    y={sy}
                    width={Math.max(sw - 1, 2)}
                    height={Math.max(sh - 1, 2)}
                    fill={`url(#${patternId})`}
                    stroke="#4060a0"
                    strokeWidth="1.2"
                    rx="1"
                  />
                  {/* Step lines */}
                  {Array.from({ length: stepCount }).map((_, i) => {
                    const yLine = sy + (sh / (stepCount + 1)) * (i + 1);
                    return (
                      <line
                        key={yLine}
                        x1={sx + 2}
                        y1={yLine}
                        x2={sx + sw - 2}
                        y2={yLine}
                        stroke="#4060a0"
                        strokeWidth="0.7"
                        opacity="0.6"
                      />
                    );
                  })}
                  {/* Direction arrow */}
                  <line
                    x1={sx + sw / 2}
                    y1={sy + sh - 4}
                    x2={sx + sw / 2}
                    y2={sy + 4}
                    stroke="#4060a0"
                    strokeWidth="1"
                    markerEnd="url(#arrow)"
                  />
                  {sw > 24 && sh > 14 && (
                    <text
                      x={sx + sw / 2}
                      y={sy + sh / 2 + 4}
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight="700"
                      fill="#2040a0"
                    >
                      STAIR
                    </text>
                  )}
                </g>
              );
            })()}

          {/* ── Balconies ── */}
          {layout.balconies
            ?.filter((b) => b.floor === floor)
            .map((balcony) => {
              const balcW = balcony.widthFraction * bW;
              const balcH = balcony.depthFraction * marginBottom * 0.38;
              const balcX = bX + balcony.startFraction * bW;
              const balcY = bY + bH;
              return (
                <g key={`balcony-${balcony.floor}-${balcony.startFraction}`}>
                  <rect
                    x={balcX}
                    y={balcY}
                    width={balcW}
                    height={balcH}
                    fill="#e4f0f8"
                    stroke="#3080b0"
                    strokeWidth="1"
                    rx="2"
                  />
                  {/* Railing */}
                  <line
                    x1={balcX + 2}
                    y1={balcY + balcH - 2}
                    x2={balcX + balcW - 2}
                    y2={balcY + balcH - 2}
                    stroke="#3080b0"
                    strokeWidth="1.8"
                  />
                  <text
                    x={balcX + balcW / 2}
                    y={balcY + balcH / 2 + 4}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="600"
                    fill="#104060"
                  >
                    Balcony
                  </text>
                </g>
              );
            })}
        </>
      )}

      {/* ── North arrow (top-right corner of plot) ── */}
      <g transform={`translate(${pad + drawW - 16},${pad + 12})`}>
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke="#405060"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <polygon points="0,-7 -3,5 0,2 3,5" fill="#304050" opacity="0.7" />
        <text
          x="0"
          y="-9"
          textAnchor="middle"
          fontSize="5.5"
          fill="#304050"
          fontWeight="700"
          opacity="0.7"
        >
          N
        </text>
      </g>

      {/* ── Floor label badge ── */}
      <rect
        x={pad + 4}
        y={pad + 4}
        width={floor === 0 ? 54 : 46}
        height={16}
        rx="3"
        fill="#1a2030"
        opacity="0.88"
      />
      <text
        x={pad + (floor === 0 ? 31 : 27)}
        y={pad + 14.5}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="white"
      >
        {floor === 0 ? "GROUND" : `FLOOR ${floor}`}
      </text>

      {/* ── Legend ── */}
      {!isTerrace && legendH > 0 && (
        <g transform={`translate(${pad},${pad + planH + 4})`}>
          {presentTypes.map((type, i) => (
            <g key={type} transform={`translate(${i * 76},0)`}>
              <rect
                x="0"
                y="4"
                width="10"
                height="10"
                fill={ROOM_FILL[type] ?? "#f0f0f0"}
                stroke={ROOM_STROKE[type] ?? "#607080"}
                strokeWidth="0.8"
                rx="1.5"
              />
              <text
                x="13"
                y="13"
                fontSize="7.5"
                fill="#384858"
                fontWeight="500"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
