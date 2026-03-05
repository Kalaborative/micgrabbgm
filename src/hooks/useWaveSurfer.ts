"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface UseWaveSurferOptions {
  url?: string;
  container: React.RefObject<HTMLDivElement | null>;
}

interface WaveSurferState {
  isReady: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  regionStart: number;
  regionEnd: number;
}

export function useWaveSurfer({ url, container }: UseWaveSurferOptions) {
  const wsRef = useRef<any>(null);
  const regionsRef = useRef<any>(null);
  const regionRef = useRef<any>(null);
  const [state, setState] = useState<WaveSurferState>({
    isReady: false,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    regionStart: 0,
    regionEnd: 0,
  });

  useEffect(() => {
    if (!url || !container.current) return;

    let cancelled = false;

    async function init() {
      const WaveSurfer = (await import("wavesurfer.js")).default;
      const RegionsPlugin = (await import("wavesurfer.js/dist/plugins/regions.js")).default;

      if (cancelled) return;

      const ws = WaveSurfer.create({
        container: container.current!,
        waveColor: "rgba(192, 37, 244, 0.4)",
        progressColor: "#c025f4",
        cursorColor: "#00f5ff",
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 128,
        normalize: true,
        url,
        backend: "WebAudio",
      });

      if (cancelled) {
        ws.destroy();
        return;
      }

      const regions = ws.registerPlugin(RegionsPlugin.create());
      wsRef.current = ws;
      regionsRef.current = regions;

      ws.on("ready", () => {
        if (cancelled) return;
        const dur = ws.getDuration();
        const region = regions.addRegion({
          start: 0,
          end: dur,
          color: "rgba(192, 37, 244, 0.1)",
          drag: false,
          resize: true,
        });
        regionRef.current = region;
        setState((s) => ({
          ...s,
          isReady: true,
          duration: dur,
          regionStart: 0,
          regionEnd: dur,
        }));
      });

      ws.on("timeupdate", (time: number) => {
        setState((s) => ({ ...s, currentTime: time }));
      });

      ws.on("play", () => setState((s) => ({ ...s, isPlaying: true })));
      ws.on("pause", () => setState((s) => ({ ...s, isPlaying: false })));

      regions.on("region-updated", (region: any) => {
        setState((s) => ({
          ...s,
          regionStart: region.start,
          regionEnd: region.end,
        }));
      });
    }

    init();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.destroy();
        wsRef.current = null;
      }
    };
  }, [url, container]);

  const playRegion = useCallback(() => {
    const ws = wsRef.current;
    const region = regionRef.current;
    if (!ws || !region) return;

    // Start from region start
    ws.setTime(region.start);
    ws.play();

    // Watch for when playback passes the region end
    const onTime = (time: number) => {
      if (time >= region.end) {
        ws.pause();
        ws.setTime(region.end);
        ws.un("timeupdate", onTime);
      }
    };
    // Remove any previous listener to avoid stacking
    ws.un("timeupdate", onTime);
    ws.on("timeupdate", onTime);

    // Also clean up if user manually pauses
    const onPause = () => {
      ws.un("timeupdate", onTime);
      ws.un("pause", onPause);
    };
    ws.on("pause", onPause);
  }, []);

  const playPause = useCallback(() => {
    wsRef.current?.playPause();
  }, []);

  const stop = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.pause();
      wsRef.current.setTime(0);
    }
  }, []);

  return { ...state, playRegion, playPause, stop };
}
