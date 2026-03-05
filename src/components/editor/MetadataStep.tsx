"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface MetadataStepProps {
  title: string;
  artist: string;
  onTitleChange: (val: string) => void;
  onArtistChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MetadataStep({
  title,
  artist,
  onTitleChange,
  onArtistChange,
  onNext,
  onBack,
}: MetadataStepProps) {
  const canProceed = title.trim().length > 0 && artist.trim().length > 0;

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Track Title
          </label>
          <input
            className="w-full bg-bg-dark border border-primary/20 rounded-lg focus:ring-primary focus:border-primary py-3 px-4 text-white"
            placeholder="e.g. Midnight Grooves"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Artist Name
          </label>
          <input
            className="w-full bg-bg-dark border border-primary/20 rounded-lg focus:ring-primary focus:border-primary py-3 px-4 text-white"
            placeholder="e.g. DJ Synthwave"
            type="text"
            value={artist}
            onChange={(e) => onArtistChange(e.target.value)}
          />
        </div>
      </div>

      {!canProceed && (title.length > 0 || artist.length > 0) && (
        <p className="text-sm text-slate-500">Please fill in both fields to continue.</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-primary/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <MaterialIcon icon="arrow_back" className="text-lg" />
          <span className="font-bold text-sm">Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm glow-button disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <MaterialIcon icon="arrow_forward" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
