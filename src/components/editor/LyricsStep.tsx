"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";
import GlowButton from "@/components/ui/GlowButton";

interface LyricsStepProps {
  lyrics: string;
  onLyricsChange: (val: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onBack: () => void;
  publishing: boolean;
}

export default function LyricsStep({
  lyrics,
  onLyricsChange,
  onSaveDraft,
  onPublish,
  onBack,
  publishing,
}: LyricsStepProps) {
  return (
    <div className="p-8 flex flex-col gap-6">
      <textarea
        className="w-full bg-bg-dark border border-primary/20 rounded-xl focus:ring-primary focus:border-primary p-4 text-lg italic text-white"
        placeholder="Paste or type your lyrics here..."
        rows={8}
        value={lyrics}
        onChange={(e) => onLyricsChange(e.target.value)}
      />

      {/* Navigation + actions */}
      <div className="flex justify-between items-center pt-4 border-t border-primary/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <MaterialIcon icon="arrow_back" className="text-lg" />
          <span className="font-bold text-sm">Back</span>
        </button>
        <div className="flex gap-4">
          <GlowButton variant="outline" onClick={onSaveDraft} disabled={publishing}>
            Save Draft
          </GlowButton>
          <GlowButton onClick={onPublish} disabled={publishing}>
            {publishing ? (
              <>
                <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
                Publishing...
              </>
            ) : (
              <>
                <MaterialIcon icon="publish" className="text-lg" />
                Publish Track
              </>
            )}
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
