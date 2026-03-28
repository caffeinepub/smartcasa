import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ReactElement } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Layout, Room } from "../types/house";

const ROOM_COLORS: Record<string, string> = {
  bedroom: "#B8D4E8",
  kitchen: "#F5D5A0",
  hall: "#C8E6C9",
  bathroom: "#E1BEE7",
  study: "#FFF9C4",
  dining: "#FFD0A0",
  parking: "#CFD8DC",
  garden: "#A5D6A7",
  terrace: "#FFCCBC",
};

const ROOM_LABEL_COLORS: Record<string, string> = {
  bedroom: "#1a3a5c",
  kitchen: "#7a4400",
  hall: "#1a4a1a",
  bathroom: "#4a1a5c",
  study: "#5c5a00",
  dining: "#7a3a00",
  parking: "#2a3a44",
  garden: "#1a4a1a",
  terrace: "#6a3020",
};

interface Props {
  layout: Layout;
  plotLength: number;
  plotBreadth: number;
  buildingHeight: number;
  miniMode?: boolean;
  selectedFloor?: number; // -1 = all floors
  onRoomClick?: (room: Room | null) => void;
  showInternalStaircase?: boolean;
  showExternalStaircase?: boolean;
}

function RoomMesh({
  room,
  plotLength,
  plotBreadth,
  floorHeight,
  showLabel,
  onClick,
  isSelected,
}: {
  room: Room;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
  showLabel: boolean;
  onClick?: () => void;
  isSelected: boolean;
}) {
  const roomH = floorHeight * 0.88;
  const rx = (room.x + room.width / 2) * plotLength - plotLength / 2;
  const rz = (room.z + room.depth / 2) * plotBreadth - plotBreadth / 2;
  const ry = room.floor * floorHeight + roomH / 2 + 0.12;
  const rw = Math.max(room.width * plotLength - 0.12, 0.5);
  const rd = Math.max(room.depth * plotBreadth - 0.12, 0.5);
  const color = ROOM_COLORS[room.type] ?? "#E0E0E0";
  const labelColor = ROOM_LABEL_COLORS[room.type] ?? "#333";

  // Actual dimensions for label
  const actualW = (room.width * plotLength).toFixed(1);
  const actualD = (room.depth * plotBreadth).toFixed(1);
  const area = (room.width * plotLength * room.depth * plotBreadth).toFixed(1);

  return (
    <group position={[rx, ry, rz]}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js meshes do not support keyboard events */}
      <mesh onClick={onClick} castShadow receiveShadow>
        <boxGeometry args={[rw, roomH, rd]} />
        <meshStandardMaterial
          color={isSelected ? "#FFE082" : color}
          roughness={0.8}
          metalness={0.05}
          transparent
          opacity={isSelected ? 1.0 : 0.92}
        />
      </mesh>
      {showLabel && (
        <Html
          position={[0, roomH / 2 + 0.3, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: isSelected
                ? "rgba(255,224,130,0.97)"
                : "rgba(15,28,46,0.88)",
              color: isSelected ? labelColor : "#e8f0fe",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: isSelected
                ? "0 0 8px rgba(255,180,0,0.6)"
                : "0 2px 8px rgba(0,0,0,0.5)",
              border: isSelected
                ? "1px solid #f59e0b"
                : "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1px",
            }}
          >
            <span>{room.label}</span>
            <span
              style={{
                fontSize: "8px",
                fontWeight: 500,
                opacity: 0.8,
                letterSpacing: "0.02em",
                textTransform: "none",
                color: isSelected ? labelColor : "#93c5fd",
              }}
            >
              {actualW}m × {actualD}m · {area} m²
            </span>
          </div>
        </Html>
      )}
      {showLabel && (
        <Html
          position={[0, roomH + 0.15, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              color: "#ffffff",
              padding: "3px 6px",
              borderRadius: "4px",
              fontSize: "9px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
              lineHeight: "1.4",
            }}
          >
            <div>{room.label}</div>
            <div style={{ color: "#93c5fd", fontSize: "8px" }}>
              {actualW}×{actualD}m
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function RoomWalls({
  room,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  room: Room;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const roomH = floorHeight * 0.88;
  const rx = (room.x + room.width / 2) * plotLength - plotLength / 2;
  const rz = (room.z + room.depth / 2) * plotBreadth - plotBreadth / 2;
  const ry = room.floor * floorHeight + roomH / 2 + 0.12;
  const rw = Math.max(room.width * plotLength - 0.12, 0.5);
  const rd = Math.max(room.depth * plotBreadth - 0.12, 0.5);
  const wt = 0.08;

  return (
    <group position={[rx, ry, rz]}>
      <mesh position={[0, 0, rd / 2]}>
        <boxGeometry args={[rw, roomH, wt]} />
        <meshStandardMaterial
          color="#455a64"
          roughness={0.9}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[0, 0, -rd / 2]}>
        <boxGeometry args={[rw, roomH, wt]} />
        <meshStandardMaterial
          color="#455a64"
          roughness={0.9}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[-rw / 2, 0, 0]}>
        <boxGeometry args={[wt, roomH, rd]} />
        <meshStandardMaterial
          color="#455a64"
          roughness={0.9}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[rw / 2, 0, 0]}>
        <boxGeometry args={[wt, roomH, rd]} />
        <meshStandardMaterial
          color="#455a64"
          roughness={0.9}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function FloorSlab({
  floorIdx,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  floorIdx: number;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const y = floorIdx * floorHeight - 0.07;
  return (
    <mesh position={[0, y, 0]} receiveShadow>
      <boxGeometry args={[plotLength + 0.4, 0.15, plotBreadth + 0.4]} />
      <meshStandardMaterial color="#b0bec5" roughness={0.9} />
    </mesh>
  );
}

function PerimeterWalls({
  floorIdx,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  floorIdx: number;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const wallH = floorHeight * 0.95;
  const y = floorIdx * floorHeight + wallH / 2 + 0.1;
  const wt = 0.18;

  return (
    <group>
      <mesh position={[0, y, -plotBreadth / 2 - wt / 2]}>
        <boxGeometry args={[plotLength + wt * 2, wallH, wt]} />
        <meshStandardMaterial
          color="#eceff1"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[0, y, plotBreadth / 2 + wt / 2]}>
        <boxGeometry args={[plotLength + wt * 2, wallH, wt]} />
        <meshStandardMaterial
          color="#eceff1"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[-plotLength / 2 - wt / 2, y, 0]}>
        <boxGeometry args={[wt, wallH, plotBreadth]} />
        <meshStandardMaterial
          color="#eceff1"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[plotLength / 2 + wt / 2, y, 0]}>
        <boxGeometry args={[wt, wallH, plotBreadth]} />
        <meshStandardMaterial
          color="#eceff1"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function StaircaseMesh({
  staircase,
  plotLength,
  plotBreadth,
  floorHeight,
  numFloors,
}: {
  staircase: Layout["staircase"];
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
  numFloors: number;
}) {
  const steps: ReactElement[] = [];
  const numSteps = 10;
  const stairW = staircase.width * plotLength;
  const stairD = staircase.depth * plotBreadth;
  const stepDepth = stairD / numSteps;

  for (let f = 0; f < numFloors; f++) {
    for (let s = 0; s < numSteps; s++) {
      const stepH = ((s + 1) / numSteps) * floorHeight;
      const stepY = f * floorHeight + stepH / 2;
      const cx =
        (staircase.x + staircase.width / 2) * plotLength - plotLength / 2;
      const cz =
        (staircase.z + ((s + 0.5) / numSteps) * staircase.depth) * plotBreadth -
        plotBreadth / 2;
      steps.push(
        <mesh key={`step-${f}-${s}`} position={[cx, stepY, cz]} castShadow>
          <boxGeometry args={[stairW * 0.9, stepH, stepDepth * 0.9]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.7} />
        </mesh>,
      );
    }
  }
  return <group>{steps}</group>;
}

function ExternalStaircaseMesh({
  layout,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  layout: Layout;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const ext = layout.externalStaircase;
  const steps: ReactElement[] = [];
  const numSteps = 8;

  const stairW = ext.widthFraction * plotLength;
  const stairD = ext.depthFraction * plotBreadth;
  const stepDepth = stairD / numSteps;

  // Position along Z axis of the building side
  const posZ = ext.posZFraction * plotBreadth - plotBreadth / 2;

  // X position: outside building footprint on left or right
  const buildingEdgeX = ext.side === "left" ? -plotLength / 2 : plotLength / 2;
  const directionX = ext.side === "left" ? -1 : 1;

  for (let s = 0; s < numSteps; s++) {
    const stepH = ((s + 1) / numSteps) * floorHeight;
    const stepY = stepH / 2;
    // Steps extend outward from building edge
    const stepOffsetX = directionX * ((s + 0.5) / numSteps) * stairD;
    const cx = buildingEdgeX + stepOffsetX;
    const cz = posZ;

    steps.push(
      <mesh key={`ext-step-${s}`} position={[cx, stepY, cz]} castShadow>
        <boxGeometry args={[stepDepth * 0.9, stepH, stairW * 0.9]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.7} />
      </mesh>,
    );
  }

  return <group>{steps}</group>;
}

function TerraceMesh({
  numFloors,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  numFloors: number;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const y = numFloors * floorHeight;
  const pw = 0.25;
  const ph = 1.0;

  return (
    <group>
      <mesh position={[0, y - 0.07, 0]} receiveShadow>
        <boxGeometry args={[plotLength + 0.4, 0.15, plotBreadth + 0.4]} />
        <meshStandardMaterial color="#b0bec5" />
      </mesh>
      <mesh position={[0, y + 0.05, 0]}>
        <boxGeometry args={[plotLength, 0.1, plotBreadth]} />
        <meshStandardMaterial
          color="#FFCCBC"
          roughness={0.8}
          transparent
          opacity={0.0}
        />
      </mesh>
      <mesh position={[0, y + ph / 2 + 0.1, -plotBreadth / 2]}>
        <boxGeometry args={[plotLength, ph, pw]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <mesh position={[0, y + ph / 2 + 0.1, plotBreadth / 2]}>
        <boxGeometry args={[plotLength, ph, pw]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <mesh position={[-plotLength / 2, y + ph / 2 + 0.1, 0]}>
        <boxGeometry args={[pw, ph, plotBreadth]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <mesh position={[plotLength / 2, y + ph / 2 + 0.1, 0]}>
        <boxGeometry args={[pw, ph, plotBreadth]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <mesh
        position={[plotLength * 0.3, y + ph + 0.6, plotBreadth * 0.3]}
        castShadow
      >
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#78909C" metalness={0.3} roughness={0.6} />
      </mesh>
      <Html position={[0, y + ph + 0.5, 0]} center distanceFactor={16}>
        <div
          style={{
            background: "rgba(255,204,188,0.9)",
            color: "#6a3020",
            padding: "2px 7px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          Terrace
        </div>
      </Html>
    </group>
  );
}

// Smooth camera animator — interpolates camera and controls target
function CameraAnimator({
  targetPosition,
  targetLookAt,
  animating,
  onDone,
  controlsRef,
}: {
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  animating: boolean;
  onDone: () => void;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const progress = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (animating && targetPosition && targetLookAt) {
      progress.current = 0;
      startPos.current.copy(camera.position);
      if (controlsRef.current) {
        startTarget.current.copy(controlsRef.current.target);
      }
    }
  }, [animating, targetPosition, targetLookAt, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animating || !targetPosition || !targetLookAt || !controlsRef.current)
      return;

    progress.current = Math.min(progress.current + delta * 2.2, 1);
    const t = 1 - (1 - progress.current) ** 3; // ease out cubic

    camera.position.lerpVectors(startPos.current, targetPosition, t);
    controlsRef.current.target.lerpVectors(
      startTarget.current,
      targetLookAt,
      t,
    );
    controlsRef.current.update();

    if (progress.current >= 1) onDone();
  });

  return null;
}

function DimensionBlock({
  room,
  plotLength,
  plotBreadth,
  floorHeight,
}: {
  room: Room;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
}) {
  const rx = (room.x + room.width / 2) * plotLength - plotLength / 2;
  const rz = (room.z + room.depth / 2) * plotBreadth - plotBreadth / 2;
  const ry = room.floor * floorHeight + 0.08;
  const rw = Math.max(room.width * plotLength - 0.12, 0.5);
  const rd = Math.max(room.depth * plotBreadth - 0.12, 0.5);

  const actualW = (room.width * plotLength).toFixed(1);
  const actualD = (room.depth * plotBreadth).toFixed(1);

  return (
    <group position={[rx, ry, rz]}>
      {/* Width block — along X axis */}
      <mesh position={[0, 0.06, rd / 2 - 0.06]}>
        <boxGeometry args={[rw, 0.12, 0.12]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Depth block — along Z axis */}
      <mesh position={[rw / 2 - 0.06, 0.06, 0]}>
        <boxGeometry args={[0.12, 0.12, rd]} />
        <meshStandardMaterial color="#1a5c3a" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Width label */}
      <Html
        position={[0, 0.4, rd / 2]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(30,58,95,0.9)",
            color: "#93c5fd",
            padding: "2px 5px",
            borderRadius: "3px",
            fontSize: "8px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          ↔ {actualW}m
        </div>
      </Html>
      {/* Depth label */}
      <Html
        position={[rw / 2, 0.4, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(26,92,58,0.9)",
            color: "#86efac",
            padding: "2px 5px",
            borderRadius: "3px",
            fontSize: "8px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          ↕ {actualD}m
        </div>
      </Html>
    </group>
  );
}

function Scene({
  layout,
  plotLength,
  plotBreadth,
  floorHeight,
  totalHeight,
  miniMode,
  selectedFloor,
  selectedRoom,
  flyToRoom,
  onRoomClick,
  showInternalStaircase,
  showExternalStaircase,
}: {
  layout: Layout;
  plotLength: number;
  plotBreadth: number;
  floorHeight: number;
  totalHeight: number;
  miniMode: boolean;
  selectedFloor: number;
  selectedRoom: string | null;
  flyToRoom: Room | null;
  onRoomClick?: (room: Room | null) => void;
  showInternalStaircase: boolean;
  showExternalStaircase: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [animating, setAnimating] = useState(false);
  const [camTarget, setCamTarget] = useState<THREE.Vector3 | null>(null);
  const [camLookAt, setCamLookAt] = useState<THREE.Vector3 | null>(null);

  // Set initial controls target on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, totalHeight / 2, 0);
      controlsRef.current.update();
    }
  }, []);

  // Floor navigation camera
  useEffect(() => {
    if (animating) return; // don't interrupt fly-to-room
    if (!controlsRef.current) return;
    const maxDim = Math.max(plotLength, plotBreadth);
    if (selectedFloor === -1) {
      controlsRef.current.target.set(0, totalHeight / 2, 0);
      camera.position.set(
        maxDim * 1.5,
        totalHeight * 1.2 + maxDim * 0.8,
        maxDim * 1.5,
      );
    } else {
      const fy = selectedFloor * floorHeight + floorHeight / 2;
      controlsRef.current.target.set(0, fy, 0);
      camera.position.set(maxDim * 1.2, fy + floorHeight * 1.5, maxDim * 1.2);
    }
    controlsRef.current.update();
  }, [
    selectedFloor,
    plotLength,
    plotBreadth,
    totalHeight,
    floorHeight,
    camera,
    animating,
  ]);

  // Fly-to-room trigger
  useEffect(() => {
    if (!flyToRoom) return;
    const rx =
      (flyToRoom.x + flyToRoom.width / 2) * plotLength - plotLength / 2;
    const rz =
      (flyToRoom.z + flyToRoom.depth / 2) * plotBreadth - plotBreadth / 2;
    const ry = flyToRoom.floor * floorHeight + (floorHeight * 0.88) / 2 + 0.12;
    const roomW = Math.max(flyToRoom.width * plotLength, 1);
    const roomD = Math.max(flyToRoom.depth * plotBreadth, 1);
    const dist = Math.max(roomW, roomD) * 2.5 + 2;

    const lookAt = new THREE.Vector3(rx, ry, rz);
    const camPos = new THREE.Vector3(
      rx + dist * 0.7,
      ry + dist * 0.6,
      rz + dist * 0.7,
    );

    setCamLookAt(lookAt);
    setCamTarget(camPos);
    setAnimating(true);
  }, [flyToRoom, plotLength, plotBreadth, floorHeight]);

  const visibleRooms =
    selectedFloor === -1
      ? layout.rooms
      : layout.rooms.filter((r) => r.floor === selectedFloor);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[plotLength * 1.5, totalHeight * 2, plotBreadth * 1.5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-plotLength, totalHeight, -plotBreadth]}
        intensity={0.4}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.15, 0]}
        receiveShadow
      >
        <planeGeometry args={[plotLength * 3, plotBreadth * 3]} />
        <meshStandardMaterial color="#78909C" roughness={1} />
      </mesh>

      {Array.from({ length: layout.floorCount }, (_, i) => i).map(
        (floorNum) => (
          <FloorSlab
            key={`floor-slab-${floorNum}`}
            floorIdx={floorNum}
            plotLength={plotLength}
            plotBreadth={plotBreadth}
            floorHeight={floorHeight}
          />
        ),
      )}

      {Array.from({ length: layout.floorCount }, (_, i) => i).map((floorNum) =>
        selectedFloor === -1 || floorNum === selectedFloor ? (
          <PerimeterWalls
            key={`wall-${floorNum}`}
            floorIdx={floorNum}
            plotLength={plotLength}
            plotBreadth={plotBreadth}
            floorHeight={floorHeight}
          />
        ) : null,
      )}

      {visibleRooms.map((room) => (
        <RoomMesh
          key={room.id}
          room={room}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
          showLabel={!miniMode}
          isSelected={selectedRoom === room.id}
          onClick={() => onRoomClick?.(room)}
        />
      ))}

      {visibleRooms.map((room) => (
        <RoomWalls
          key={`walls-${room.id}`}
          room={room}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
        />
      ))}

      {!miniMode &&
        visibleRooms.map((room) => (
          <DimensionBlock
            key={`dim-${room.id}`}
            room={room}
            plotLength={plotLength}
            plotBreadth={plotBreadth}
            floorHeight={floorHeight}
          />
        ))}

      {showInternalStaircase && (
        <StaircaseMesh
          staircase={layout.staircase}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
          numFloors={layout.floorCount}
        />
      )}

      {showExternalStaircase && (
        <ExternalStaircaseMesh
          layout={layout}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
        />
      )}

      {layout.hasTerrace && (
        <TerraceMesh
          numFloors={layout.floorCount}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
        />
      )}

      <CameraAnimator
        targetPosition={camTarget}
        targetLookAt={camLookAt}
        animating={animating}
        onDone={() => setAnimating(false)}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        autoRotate={!animating}
        autoRotateSpeed={1.8}
        enableZoom={true}
        enablePan={!miniMode}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minDistance={Math.max(plotLength, plotBreadth) * 0.3}
        maxDistance={Math.max(plotLength, plotBreadth) * 8}
      />
    </>
  );
}

export function HouseViewer3D({
  layout,
  plotLength,
  plotBreadth,
  buildingHeight,
  miniMode = false,
  selectedFloor = -1,
  onRoomClick,
  showInternalStaircase = false,
  showExternalStaircase = false,
}: Props) {
  const floorHeight = buildingHeight / layout.floorCount;
  const totalHeight = buildingHeight + (layout.hasTerrace ? 1.5 : 0);
  const maxDim = Math.max(plotLength, plotBreadth);

  const selectedRoomRef = useRef<string | null>(null);
  const [flyToRoom, setFlyToRoom] = useState<Room | null>(null);
  const [, forceUpdate] = useState(0);

  const handleRoomClick = (room: Room | null) => {
    selectedRoomRef.current = room ? room.id : null;
    forceUpdate((n) => n + 1);
    if (room) setFlyToRoom({ ...room }); // trigger fly-to
    onRoomClick?.(room);
  };

  return (
    <Canvas
      shadows
      camera={{
        position: [maxDim * 1.6, totalHeight + maxDim * 0.8, maxDim * 1.6],
        fov: 45,
        near: 0.1,
        far: 500,
      }}
      style={{
        background: miniMode ? "#0f2233" : "#0d1b2a",
        width: "100%",
        height: "100%",
      }}
    >
      <Suspense fallback={null}>
        <Scene
          layout={layout}
          plotLength={plotLength}
          plotBreadth={plotBreadth}
          floorHeight={floorHeight}
          totalHeight={totalHeight}
          miniMode={miniMode}
          selectedFloor={selectedFloor}
          selectedRoom={selectedRoomRef.current}
          flyToRoom={flyToRoom}
          onRoomClick={handleRoomClick}
          showInternalStaircase={showInternalStaircase}
          showExternalStaircase={showExternalStaircase}
        />
      </Suspense>
    </Canvas>
  );
}
