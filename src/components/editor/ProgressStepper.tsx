"use client";

interface ProgressStepperProps {
  currentStep: number; // 1-based: which step is active
  totalSteps?: number;
}

const steps = ["Upload", "Trim", "Metadata", "Lyrics"];

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={label} className="flex flex-col gap-2">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                isCompleted
                  ? "bg-primary"
                  : isCurrent
                  ? "bg-primary animate-pulse"
                  : "bg-primary/20"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isCompleted || isCurrent ? "text-primary" : "text-slate-400"
              }`}
            >
              Step {stepNum}: {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
