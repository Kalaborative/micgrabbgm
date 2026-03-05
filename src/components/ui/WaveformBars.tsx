"use client";

interface WaveformBarsProps {
  count?: number;
  maxHeight?: number;
  className?: string;
}

export default function WaveformBars({
  count = 20,
  maxHeight = 8,
  className = "",
}: WaveformBarsProps) {
  const heights = Array.from({ length: count }, () =>
    Math.max(1, Math.floor(Math.random() * maxHeight) + 1)
  );

  return (
    <div className={`flex items-end gap-[2px] opacity-80 overflow-hidden ${className}`}>
      {heights.map((h, i) => (
        <div key={i} className="waveform-bar" style={{ height: `${h * 4}px` }} />
      ))}
    </div>
  );
}
