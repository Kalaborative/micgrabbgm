"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface UseWaveSurferOptions {
  url?: string;
  container: React.RefObject<HTMLDivElement | null>;
  detuneCents?: number;
}

interface WaveSurferState {
  isReady: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  regionStart: number;
  regionEnd: number;
}

export function useWaveSurfer({ url, container, detuneCents = 0 }: UseWaveSurferOptions) {
  const wsRef = useRef<any>(null);
  const regionsRef = useRef<any>(null);
  const regionRef = useRef<any>(null);
  const pitchNodeRef = useRef<{ node: ScriptProcessorNode; st: any } | null>(null);
  const semitonesRef = useRef<number>(detuneCents / 100);
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
      const { SoundTouch } = await import("soundtouchjs");

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

        // Insert pitch-shift ScriptProcessorNode into the audio graph
        try {
          const player = ws.getMediaElement() as any;
          const gainNode: GainNode = player.getGainNode();
          const audioCtx: AudioContext = gainNode.context as AudioContext;

          const bufferSize = 4096;
          const scriptNode = audioCtx.createScriptProcessor(bufferSize, 2, 2);
          const st = new SoundTouch();
          st.pitchSemitones = semitonesRef.current;

          // Carry-over buffer for frames SoundTouch produces beyond what
          // the current output buffer needs — prevents gaps/choppiness
          let carryOver = new Float32Array(0);

          scriptNode.onaudioprocess = (e) => {
            const inL = e.inputBuffer.getChannelData(0);
            const inR = e.inputBuffer.numberOfChannels > 1
              ? e.inputBuffer.getChannelData(1)
              : inL;
            const outL = e.outputBuffer.getChannelData(0);
            const outR = e.outputBuffer.getChannelData(1);
            const needed = e.inputBuffer.length;

            if (st.pitchSemitones === 0) {
              outL.set(inL);
              outR.set(inR);
              carryOver = new Float32Array(0);
              return;
            }

            // Feed interleaved input into SoundTouch
            const interleaved = new Float32Array(needed * 2);
            for (let i = 0; i < needed; i++) {
              interleaved[i * 2] = inL[i];
              interleaved[i * 2 + 1] = inR[i];
            }
            st.inputBuffer.putSamples(interleaved, 0, needed);
            st.process();

            // Collect carry-over + newly produced frames
            const freshCount = st.outputBuffer.frameCount;
            let allOutput: Float32Array;

            if (freshCount > 0) {
              const freshSamples = new Float32Array(freshCount * 2);
              st.outputBuffer.receiveSamples(freshSamples, freshCount);

              if (carryOver.length > 0) {
                allOutput = new Float32Array(carryOver.length + freshSamples.length);
                allOutput.set(carryOver);
                allOutput.set(freshSamples, carryOver.length);
              } else {
                allOutput = freshSamples;
              }
            } else {
              allOutput = carryOver;
            }

            // Fill output buffer from available frames
            const totalFrames = allOutput.length / 2;
            const usable = Math.min(needed, totalFrames);

            for (let i = 0; i < usable; i++) {
              outL[i] = allOutput[i * 2];
              outR[i] = allOutput[i * 2 + 1];
            }
            for (let i = usable; i < needed; i++) {
              outL[i] = 0;
              outR[i] = 0;
            }

            // Save excess frames for next callback
            if (totalFrames > needed) {
              carryOver = allOutput.slice(needed * 2);
            } else {
              carryOver = new Float32Array(0);
            }
          };

          // Rewire: gainNode → scriptNode → destination
          gainNode.disconnect();
          gainNode.connect(scriptNode);
          scriptNode.connect(audioCtx.destination);

          pitchNodeRef.current = { node: scriptNode, st };
        } catch {
          // If insertion fails, audio plays without pitch shift
        }

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
      if (pitchNodeRef.current) {
        pitchNodeRef.current.node.disconnect();
        pitchNodeRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.destroy();
        wsRef.current = null;
      }
    };
  }, [url, container]);

  // Update pitch semitones live when detuneCents changes
  useEffect(() => {
    semitonesRef.current = detuneCents / 100;
    if (pitchNodeRef.current) {
      pitchNodeRef.current.st.pitchSemitones = detuneCents / 100;
    }
  }, [detuneCents]);

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
