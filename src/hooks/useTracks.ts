"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTracks, type PaginatedResult } from "@/lib/firebase/firestore";
import type { Track } from "@/types/track";
import type { QueryDocumentSnapshot } from "firebase/firestore";

const PAGE_SIZE = 12;

export function useTracks(userId?: string | null) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Store cursors for each page boundary: cursors[1] = cursor to fetch page 2
  const cursorsRef = useRef<Map<number, QueryDocumentSnapshot | null>>(new Map());

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const cursor = targetPage === 1 ? null : cursorsRef.current.get(targetPage - 1) ?? null;
        const result: PaginatedResult = await getTracks(
          PAGE_SIZE,
          cursor,
          userId ?? undefined
        );
        setTracks(result.tracks);
        setTotal(result.total);
        if (result.lastDoc) {
          cursorsRef.current.set(targetPage, result.lastDoc);
        }
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tracks");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Load page 1 on mount or when userId changes
  useEffect(() => {
    cursorsRef.current.clear();
    loadPage(1);
  }, [loadPage]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
      // For forward navigation we have the cursor; for backward we need to refetch from start
      if (targetPage < page) {
        // Reset cursors and walk forward to the target page
        cursorsRef.current.clear();
        (async () => {
          setLoading(true);
          setError(null);
          try {
            let cursor: QueryDocumentSnapshot | null = null;
            let result: PaginatedResult | null = null;
            for (let p = 1; p <= targetPage; p++) {
              result = await getTracks(PAGE_SIZE, cursor, userId ?? undefined);
              if (result.lastDoc) {
                cursorsRef.current.set(p, result.lastDoc);
              }
              cursor = result.lastDoc;
            }
            if (result) {
              setTracks(result.tracks);
              setTotal(result.total);
              setPage(targetPage);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tracks");
          } finally {
            setLoading(false);
          }
        })();
      } else {
        loadPage(targetPage);
      }
    },
    [page, totalPages, loadPage, userId]
  );

  return { tracks, total, totalPages, page, loading, error, goToPage };
}
