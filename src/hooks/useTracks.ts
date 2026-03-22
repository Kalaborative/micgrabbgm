"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTracks, searchAllTracks, type PaginatedResult } from "@/lib/firebase/firestore";
import type { Track } from "@/types/track";
import type { QueryDocumentSnapshot } from "firebase/firestore";

const PAGE_SIZE = 12;

export function useTracks(userId?: string | null, searchQuery?: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Track[] | null>(null);

  // Store cursors for each page boundary: cursors[1] = cursor to fetch page 2
  const cursorsRef = useRef<Map<number, QueryDocumentSnapshot | null>>(new Map());

  const isSearching = !!searchQuery?.trim();
  const totalPages = isSearching ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));

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
    if (isSearching) return;
    cursorsRef.current.clear();
    loadPage(1);
  }, [loadPage, isSearching]);

  // Search across all tracks when query is active
  useEffect(() => {
    if (!isSearching) {
      setSearchResults(null);
      return;
    }
    const q = searchQuery!.trim().toLowerCase();
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchAllTracks(userId ?? undefined).then((allTracks) => {
      if (cancelled) return;
      const filtered = allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.lyrics.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Search failed");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [searchQuery, isSearching, userId]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;

      // If we already have the cursor for the previous page, jump directly
      if (targetPage === 1 || cursorsRef.current.has(targetPage - 1)) {
        loadPage(targetPage);
        return;
      }

      // Otherwise, walk forward from the nearest cached cursor to build missing cursors
      (async () => {
        setLoading(true);
        setError(null);
        try {
          // Find the highest cached page that's before our target
          let startPage = 0;
          for (let p = targetPage - 1; p >= 1; p--) {
            if (cursorsRef.current.has(p)) {
              startPage = p;
              break;
            }
          }

          let cursor: QueryDocumentSnapshot | null =
            startPage === 0 ? null : cursorsRef.current.get(startPage)!;
          let result: PaginatedResult | null = null;

          // Walk from startPage+1 up to targetPage, caching cursors along the way
          for (let p = startPage + 1; p <= targetPage; p++) {
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
    },
    [page, totalPages, loadPage, userId]
  );

  const displayTracks = isSearching ? (searchResults ?? []) : tracks;

  return { tracks: displayTracks, total, totalPages, page, loading, error, goToPage };
}
