import { useEffect, useState } from "react";
import { fallbackPlatformData, fetchPlatformData, type PlatformData } from "../lib/api";

export function usePlatformData() {
  const [data, setData] = useState<PlatformData>(fallbackPlatformData);
  const [source, setSource] = useState<"local" | "api">("local");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchPlatformData()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setSource("api");
      })
      .catch(() => {
        if (!active) return;
        setData(fallbackPlatformData);
        setSource("local");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, source, isLoading };
}
