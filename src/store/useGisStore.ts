import { create } from "zustand";
import type { GisLayer } from "../lib/gisApi";

type GisState = {
  token: string | null;
  isAdmin: boolean;
  userEmail: string;
  gisLayers: GisLayer[];
  setAuth: (token: string | null, isAdmin: boolean, email: string) => void;
  setGisLayers: (layers: GisLayer[]) => void;
  addGisLayer: (layer: GisLayer) => void;
  removeGisLayer: (id: string) => void;
};

export const useGisStore = create<GisState>((set) => ({
  token: null,
  isAdmin: false,
  userEmail: "",
  gisLayers: [],
  setAuth: (token, isAdmin, email) => set({ token, isAdmin, userEmail: email }),
  setGisLayers: (gisLayers) => set({ gisLayers }),
  addGisLayer: (layer) => set((s) => ({ gisLayers: [...s.gisLayers, layer] })),
  removeGisLayer: (id) => set((s) => ({ gisLayers: s.gisLayers.filter((l) => l.id !== id) })),
}));
