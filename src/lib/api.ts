import { countries, datasets, ecsRecords, treaties, treatyProgress } from "../data/mockData";
import type { Country, Dataset, EcsRecord, Treaty } from "../data/types";

export type PlatformData = {
  countries: Country[];
  treaties: Treaty[];
  datasets: Dataset[];
  ecsRecords: EcsRecord[];
  treatyProgress: Array<{ year: string; treaties: number }>;
};

export const fallbackPlatformData: PlatformData = {
  countries,
  treaties,
  datasets,
  ecsRecords,
  treatyProgress,
};

export async function fetchPlatformData(): Promise<PlatformData> {
  const response = await fetch("/api/platform");
  if (!response.ok) {
    throw new Error("Unable to load platform API data");
  }
  return response.json() as Promise<PlatformData>;
}
