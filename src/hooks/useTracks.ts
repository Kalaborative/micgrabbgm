"use client";

import { useState, useEffect } from "react";
import { getAllTracks, getTracksByUser } from "@/lib/firebase/firestore";
import type { Track } from "@/types/track";

export function useTracks(userId?: string | null) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = userId
          ? await getTracksByUser(userId)
          : await getAllTracks();
        if (!cancelled) setTracks(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tracks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = userId
        ? await getTracksByUser(userId)
        : await getAllTracks();
      setTracks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tracks");
    } finally {
      setLoading(false);
    }
  };

  return { tracks, loading, error, refetch };
}
