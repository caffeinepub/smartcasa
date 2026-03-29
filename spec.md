# SmartCasa

## Current State
- Landing page (App.tsx) has a hero slideshow plus potentially community/blog/product feature sections below
- FloorPlan2D.tsx renders rooms as white/grey fills with no room-type color differentiation
- HouseViewer3D.tsx renders 3D models; room divisions (walls) may not be clearly visible from top-down camera angle
- InputPage.tsx has an "External Staircase" amenity chip
- types/house.ts has `externalStaircase` in Amenities interface
- layoutEngine.ts generates external staircase data for all 5 layouts

## Requested Changes (Diff)

### Add
- Room type color palette in 2D floor plans: each room type (bedroom, kitchen, hall, bathroom, study, dining, parking, garden) gets a distinct, visually clear fill color
- Thick wall/partition lines between rooms in 3D top view so divisions are clearly visible looking straight down

### Modify
- App.tsx: Remove any community features, product sections, and blog sections from the landing page. Keep only the hero slideshow and the configure/input section.
- FloorPlan2D.tsx: Apply room-type colors as fills for each room rectangle in the 2D plan (e.g. bedroom=light blue, kitchen=warm yellow, hall=light green, bathroom=light purple, dining=peach/salmon, study=light teal, parking=grey, garden=light green)
- HouseViewer3D.tsx: Ensure room divider walls (thin box geometries) are rendered with sufficient height and contrast to be clearly visible when camera is overhead (top view). Add top-face colored fills to room boxes matching room type.
- InputPage.tsx: Remove "External Staircase" amenity chip entirely

### Remove
- External Staircase chip from InputPage.tsx
- External staircase rendering from FloorPlan2D.tsx and HouseViewer3D.tsx
- Community, blog, and product feature marketing sections from the landing page in App.tsx

## Implementation Plan
1. App.tsx: Locate and remove community, blog, product/features sections from landing page
2. InputPage.tsx: Remove externalStaircase chip from amenity options
3. FloorPlan2D.tsx: Add a ROOM_COLORS map keyed by RoomType, apply as SVG fill for each room rectangle
4. HouseViewer3D.tsx: 
   - Add room-type colored top faces to room boxes
   - Ensure wall dividers between rooms are rendered as thin tall boxes with dark color (e.g. #333), visible from top
   - Wall height should match floor height so they're clearly visible from above
5. types/house.ts: Keep externalStaircase in Layout type but it won't render
