import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { VideoData } from '../App';

type StepType = 'upload' | 'trim' | 'text' | 'preview';

interface StudioBottomNavigationProps {
  currentStep: StepType;
  videoData: VideoData;
  text: string;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export default function StudioBottomNavigation({
  currentStep,
  onStepBack,
  onStepForward,
  onReset,
  canGoBack,
  canGoForward,
}: StudioBottomNavigationProps) {
  const stepOrder: StepType[] = ['upload', 'trim', 'text', 'preview'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const getStepName = (step: StepType): string => {
    if (step === 'upload') return 'Upload';
    if (step === 'trim') return 'Trim';
    if (step === 'text') return 'Add text';
    if (step === 'preview') return 'Preview';
    return '';
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          aria-label="Studio navigation"
          role="navigation"
        >
          <div className="relative mx-2 mb-2">
            <div className="relative backdrop-blur-xl rounded-xl border-2 border-[var(--accent-main)] shadow-theme-lg overflow-hidden">
              <div className="relative flex items-center justify-between px-2 py-2.5 gap-2">
                {/* Back button */}
                <button
                  type="button"
                  onClick={onStepBack}
                  disabled={!canGoBack}
                  className={`
                    flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                    ${canGoBack
                      ? 'bg-secondary hover:bg-tertiary text-primary active:scale-[0.96]'
                      : 'bg-secondary/50 text-tertiary cursor-not-allowed opacity-60'
                    }
                  `}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Back</span>
                </button>

                {/* Current step indicator */}
                <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-secondary truncate">
                    {getStepName(currentStep)}
                  </span>
                  <span className="text-xs text-tertiary">
                    {currentStepIndex + 1}/{stepOrder.length}
                  </span>
                </div>

                {/* Forward/Reset button */}
                {currentStep === 'preview' ? (
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.96] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                    aria-label="Create new clip"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-xs font-semibold hidden sm:inline">New</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStepForward}
                    disabled={!canGoForward}
                    className={`
                      flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                      transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                      ${canGoForward
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.96]'
                        : 'bg-secondary/50 text-tertiary cursor-not-allowed opacity-60'
                      }
                    `}
                    aria-label="Next step"
                  >
                    <span className="text-xs font-semibold hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div
              className="h-[env(safe-area-inset-bottom)] min-h-[8px]"
              aria-hidden
            />
          </div>
        </nav>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          aria-label="Studio navigation"
          role="navigation"
        >
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="relative bg-[var(--bg-primary)]/95 backdrop-blur-xl rounded-xl border border-primary shadow-theme-lg overflow-hidden">
              <div className="relative flex items-center justify-between px-4 py-3 gap-4">
                {/* Back button */}
                <button
                  type="button"
                  onClick={onStepBack}
                  disabled={!canGoBack}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                    ${canGoBack
                      ? 'bg-secondary hover:bg-tertiary text-primary active:scale-[0.96]'
                      : 'bg-secondary/50 text-tertiary cursor-not-allowed opacity-60'
                    }
                  `}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-semibold">Back</span>
                </button>

                {/* Current step indicator */}
                <div className="flex-1 flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {getStepName(currentStep)}
                  </span>
                  <span className="text-xs text-secondary px-2 py-1 rounded-md bg-secondary">
                    Step {currentStepIndex + 1} of {stepOrder.length}
                  </span>
                </div>

                {/* Forward/Reset button */}
                {currentStep === 'preview' ? (
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.96] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                    aria-label="Create new clip"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-semibold">New Clip</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onStepForward}
                    disabled={!canGoForward}
                    className={`
                      flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                      transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2
                      ${canGoForward
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.96]'
                        : 'bg-secondary/50 text-tertiary cursor-not-allowed opacity-60'
                      }
                    `}
                    aria-label="Next step"
                  >
                    <span className="text-sm font-semibold">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

