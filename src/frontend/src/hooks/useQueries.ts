import { useMutation } from "@tanstack/react-query";
import type { FormInputs, Layout } from "../types/house";
import { useActor } from "./useActor";

export function useSaveLayout() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      layout,
      inputs,
    }: { layout: Layout; inputs: FormInputs }) => {
      if (!actor) throw new Error("No actor available");

      const plotDims = {
        length: BigInt(Math.round(inputs.plotLength)),
        width: BigInt(Math.round(inputs.plotBreadth)),
      };

      const rooms = layout.rooms.map((r) => ({
        name: r.label,
        length: BigInt(Math.max(1, Math.round(r.width * inputs.plotLength))),
        width: BigInt(Math.max(1, Math.round(r.depth * inputs.plotBreadth))),
      }));

      const amenities = Object.entries(inputs.amenities)
        .filter(([, v]) => v)
        .map(([k]) => ({
          name: k,
          count: BigInt(1),
        }));

      return actor.createLayout(
        layout.name,
        plotDims,
        BigInt(layout.floorCount),
        rooms,
        amenities,
      );
    },
  });
}
