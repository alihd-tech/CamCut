import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload,
  Scissors,
  Type,
  Eye,
  Settings,
} from 'lucide-react';
import { VideoData } from '../App';
import { useEffect, useRef } from 'react';

type StepType = 'upload' | 'trim' | 'text' | 'preview';
type UploadPhase = 'select' | 'configure';

interface StudioBottomNavigationProps {
  currentStep: StepType;
  uploadPhase?: UploadPhase;
  videoData: VideoData;
  text: string;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface StepInfo {
  name: string;
  icon: typeof Upload;
  shortName: string;
}

const STEP_ORDER: StepType[] = ['upload', 'trim', 'text', 'preview'];

const STEP_INFO: Record<StepType, StepInfo> = {
  upload: { name: 'Upload', icon: Upload, shortName: 'Upload' },
  trim: { name: 'Trim', icon: Scissors, shortName: 'Trim' },
  text: { name: 'Add Text', icon: Type, shortName: 'Text' },
  preview: { name: 'Preview', icon: Eye, shortName: 'Preview' },
};
 

export default function StudioBottomNavigation({
  currentStep,
  uploadPhase = 'select',
  onStepBack,
  onStepForward,
  onReset,
  canGoBack,
  canGoForward,
}: StudioBottomNavigationProps) {
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const progressPercentage = uploadPhase === 'configure'
    ? ((currentStepIndex + 0.5) / STEP_ORDER.length) * 100
    : ((currentStepIndex + 1) / STEP_ORDER.length) * 100;
  const progressRef = useRef<HTMLDivElement>(null);

  const currentInfo = uploadPhase === 'configure'
    ? { name: 'Configure', icon: Settings, shortName: 'Setup' }
    : STEP_INFO[currentStep];
  const CurrentIcon = currentInfo.icon;
  const isPreview = currentStep === 'preview';

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progressPercentage}%`;
    }
  }, [progressPercentage]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none pb-4 md:pb-6"
      aria-label="Studio navigation"
    >
      <div className="mx-auto w-full max-w-lg md:max-w-2xl px-4 pointer-events-auto">
        <div
          className="
            relative overflow-hidden rounded-2xl md:rounded-3xl
            bg-[var(--bg-primary)]/85 backdrop-blur-xl
            shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]
          "
        >
          {/* Progress track */}
          <div
            className="absolute top-0 inset-x-0 h-0.5 md:h-1 bg-[var(--bg-secondary)]"
            role="progressbar"
            aria-valuenow={currentStepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_ORDER.length}
            aria-label={`Step ${currentStepIndex + 1} of ${STEP_ORDER.length}`}
          >
            <div
              ref={progressRef}
              className="h-full bg-[var(--accent-main)] transition-[width] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
 
          {/* Action row */}
          <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1.5 md:gap-3 md:px-4 md:pb-3.5 md:pt-2">
            <button
              type="button"
              onClick={onStepBack}
              disabled={!canGoBack}
              aria-disabled={!canGoBack}
              className={`
                group flex shrink-0 items-center justify-center gap-1
                min-h-[var(--touch-min)] px-3 md:px-4 rounded-full
                font-outfit text-xs md:text-sm font-semibold
                transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/50
                focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                ${canGoBack
                  ? 'bg-[var(--text-primary)]/5 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/8 active:scale-95 cursor-pointer'
                  : 'bg-[var(--bg-secondary)]/40 text-[var(--text-tertiary)] cursor-not-allowed opacity-40'
                }
              `}
              aria-label="Previous step"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${canGoBack ? 'group-hover:-translate-x-0.5' : ''}`}
                aria-hidden
              />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Current step summary */}
            <div
              className="
                flex flex-1 items-center justify-center gap-2 min-w-0
                px-3 py-2 rounded-xl bg-[var(--text-primary)]/[0.03]
              "
              aria-live="polite"
            >
              <CurrentIcon
                className="w-4 h-4 md:w-[18px] md:h-[18px] text-[var(--accent-main)] shrink-0"
                strokeWidth={2.5}
                aria-hidden
              />
              <div className="flex flex-col items-center min-w-0">
                <span className="font-outfit text-xs md:text-sm font-semibold text-[var(--text-primary)] truncate max-w-full leading-tight">
                  {currentInfo.name}
                </span> 
              </div>
            </div>

            {isPreview ? (
              <button
                type="button"
                onClick={onReset}
                className="
                  group flex shrink-0 items-center justify-center gap-1
                  min-h-[var(--touch-min)] px-3 md:px-5 rounded-full
                  bg-[var(--accent-main)] text-[var(--accent-contrast)]
                  font-outfit text-xs md:text-sm font-semibold
                  shadow-sm shadow-[var(--accent-main)]/20
                  hover:shadow-md hover:shadow-[var(--accent-main)]/30
                  active:scale-95 transition-all duration-200 ease-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/50
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                "
                aria-label="Create new clip"
              >
                <RotateCcw
                  className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-180"
                  aria-hidden
                />
                <span className="hidden sm:inline">New</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStepForward}
                disabled={!canGoForward}
                aria-disabled={!canGoForward}
                className={`
                  group flex shrink-0 items-center justify-center gap-1
                  min-h-[var(--touch-min)] px-3 md:px-5 rounded-full
                  font-outfit text-xs md:text-sm font-semibold
                  transition-all duration-200 ease-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/50
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                  ${canGoForward
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-sm shadow-[var(--accent-main)]/20 hover:shadow-md hover:shadow-[var(--accent-main)]/30 active:scale-95 cursor-pointer'
                    : 'bg-[var(--bg-secondary)]/40 text-[var(--text-tertiary)] cursor-not-allowed opacity-40'
                  }
                `}
                aria-label="Next step"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${canGoForward ? 'group-hover:translate-x-0.5' : ''}`}
                  aria-hidden
                />
              </button>
            )}
          </div>
        </div>

        <div
          className="h-[env(safe-area-inset-bottom)] min-h-[4px]"
          aria-hidden
        />
      </div>
    </nav>
  );
}
