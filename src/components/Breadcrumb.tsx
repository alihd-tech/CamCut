import React, { useState } from 'react';
import { ChevronRight, Upload, Scissors, Type, Play, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { VideoData } from '../App';
import { TextStyle } from './TextEditor';

type StepType = 'upload' | 'trim' | 'text' | 'preview';

interface BreadcrumbProps {
  currentStep: StepType;
  videoData: VideoData;
  text: string;
  textStyle: TextStyle;
  onStepClick: (step: StepType) => void;
}

const steps: { id: StepType; name: string; short: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'upload', name: 'Upload', short: 'Select your video', icon: Upload },
  { id: 'trim', name: 'Trim', short: 'Pick 3–6 seconds', icon: Scissors },
  { id: 'text', name: 'Add text', short: 'Style your caption', icon: Type },
  { id: 'preview', name: 'Preview', short: 'Review & export', icon: Play },
];

export default function Breadcrumb({ currentStep, videoData, text, onStepClick }: BreadcrumbProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const stepOrder: StepType[] = ['upload', 'trim', 'text', 'preview'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const getStepStatus = (stepId: string) => {
    const stepIndex = stepOrder.indexOf(stepId as StepType);
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const isStepClickable = (stepId: string) => {
    if (stepId === 'upload') return true;
    if (stepId === 'trim' && videoData.url) return true;
    if (stepId === 'text' && videoData.url && videoData.startTime !== videoData.endTime) return true;
    if (stepId === 'preview' && text) return true;
    return false;
  };

  return (
    <div className="sticky z-40 bg-primary border-b border-theme shadow-theme-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Compact header - always visible */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
            aria-label={isExpanded ? 'Collapse progress' : 'Expand progress'}
            aria-expanded={isExpanded}
          >
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider hidden sm:inline">
              Progress
            </span>
            <span className="text-xs font-medium text-primary">
              Step {currentStepIndex + 1} of {stepOrder.length}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-tertiary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-tertiary" />
            )}
          </button>

          {/* Compact step indicator - visible when collapsed */}
          {!isExpanded && (
            <div className="flex items-center gap-1.5">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => isStepClickable(step.id) && onStepClick(step.id)}
                      disabled={!isStepClickable(step.id)}
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg transition-all
                        ${status === 'current'
                          ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                          : status === 'completed'
                          ? 'bg-secondary text-primary'
                          : 'bg-secondary/60 text-tertiary'
                        }
                        ${isStepClickable(step.id) ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'}
                      `}
                      aria-label={`${step.name} - ${status}`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-tertiary flex-shrink-0" aria-hidden />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Expanded view - collapsible */}
        {isExpanded && (
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-2 sm:pb-3" aria-label="Progress">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isClickable = isStepClickable(step.id);
              const stepNumber = index + 1;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-left transition-all min-w-0 flex-1 sm:flex-initial
                      ${status === 'current'
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-md ring-1 ring-[var(--accent-main)]'
                        : status === 'completed'
                        ? 'bg-secondary hover:bg-tertiary border border-theme text-primary'
                        : 'bg-secondary/60 border border-theme text-tertiary'
                      }
                      ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'}
                    `}
                  >
                    <span
                      className={`
                        flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-bold
                        ${status === 'current' ? 'bg-white/20' : status === 'completed' ? 'bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300' : 'bg-primary-100 dark:bg-primary-800/50 text-primary-500'}
                      `}
                    >
                      {status === 'completed' ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : stepNumber}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-xs sm:text-sm block truncate">{step.name}</span>
                      <span className={`text-[10px] sm:text-xs hidden sm:block truncate ${status === 'current' ? 'text-white/90' : 'text-secondary'}`}>
                        {step.short}
                      </span>
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-tertiary flex-shrink-0 hidden sm:block mx-0.5" aria-hidden />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
