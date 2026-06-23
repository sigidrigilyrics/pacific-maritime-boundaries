import { create } from "zustand";
import type { Country } from "../data/types";

type PlatformState = {
  selectedCountry?: Country;
  hoveredCountry?: Country;
  activeLayers: string[];
  setSelectedCountry: (country?: Country) => void;
  setHoveredCountry: (country?: Country) => void;
  toggleLayer: (layer: string) => void;
};

export const usePlatformStore = create<PlatformState>((set) => ({
  activeLayers: ["eez", "ecs", "treaties"],
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setHoveredCountry: (hoveredCountry) => set({ hoveredCountry }),
  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: state.activeLayers.includes(layer)
        ? state.activeLayers.filter((item) => item !== layer)
        : [...state.activeLayers, layer],
    })),
}));
