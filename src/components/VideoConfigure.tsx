import { Loader2, Scissors, Zap, Film, Monitor, Check } from 'lucide-react';
import {
  useSettings,
  QualityPreference,
  SizePreference,
  FormatPreference,
} from '../contexts/SettingsContext';

export type TrimMethod = 'manual' | 'quick';

interface VideoConfigureProps {
  fileName: string;
  isLoading: boolean;
  error: string | null;
  trimMethod: TrimMethod;
  includeText: boolean;
  onTrimMethodChange: (method: TrimMethod) => void;
  onIncludeTextChange: (include: boolean) => void;
  onContinue: () => void;
}

export default function VideoConfigure({
  fileName,
  isLoading,
  error,
  trimMethod,
  includeText,
  onTrimMethodChange,
  onIncludeTextChange,
  onContinue,
}: VideoConfigureProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      {/* Loading status */}
      <div className="rounded-xl border border-theme bg-secondary p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[var(--accent-main)] animate-spin flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary truncate">{fileName}</p>
            <p className="text-xs text-secondary mt-0.5">
              {isLoading
                ? 'Loading video — choose your trim method and settings below while you wait.'
                : 'Video ready. Review your choices, then continue to trim.'}
            </p>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Trim method */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scissors className="w-4 h-4 text-[var(--accent-main)]" />
          <h3 className="text-sm font-semibold text-primary">Trim Method</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onTrimMethodChange('manual')}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              trimMethod === 'manual'
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-primary">Manual Trim</span>
              {trimMethod === 'manual' && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">Set precise in/out points on the timeline</p>
          </button>
          <button
            type="button"
            onClick={() => onTrimMethodChange('quick')}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              trimMethod === 'quick'
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                Quick Clip
              </span>
              {trimMethod === 'quick' && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">
              Auto-select {settings.duration === 'short' ? 'a 4s' : 'a 30s'} clip from the start
            </p>
          </button>
        </div>
      </div>

      {/* Text overlay */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-[var(--accent-main)]" />
          <h3 className="text-sm font-semibold text-primary">Text Overlay</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onIncludeTextChange(true)}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              includeText
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary">Include Text</span>
              {includeText && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">Add text overlay</p>
          </button>
          <button
            type="button"
            onClick={() => onIncludeTextChange(false)}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              !includeText
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary">No Text</span>
              {!includeText && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">Skip text step</p>
          </button>
        </div>
      </div>

      {/* Duration preference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-[var(--accent-main)]" />
          <h3 className="text-sm font-semibold text-primary">Duration Preference</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ duration: 'short' })}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              settings.duration === 'short'
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary">Short Form</span>
              {settings.duration === 'short' && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">3–6 seconds</p>
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ duration: 'long' })}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              settings.duration === 'long'
                ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-primary">Long Form</span>
              {settings.duration === 'long' && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-contrast)]" />
                </div>
              )}
            </div>
            <p className="text-xs text-secondary">30+ seconds</p>
          </button>
        </div>
      </div>

      {/* Output configuration */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-[var(--accent-main)]" />
          <h3 className="text-sm font-semibold text-primary">Output Configuration</h3>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-secondary mb-2">Quality</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'ultra'] as QualityPreference[]).map((quality) => (
              <button
                key={quality}
                type="button"
                onClick={() => updateSettings({ quality })}
                className={`text-xs p-2 rounded-lg border transition-all ${
                  settings.quality === quality
                    ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                    : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                }`}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-secondary mb-2">Resolution</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['480p', '720p', '1080p', '4k'] as SizePreference[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateSettings({ size })}
                className={`text-xs p-2 rounded-lg border transition-all ${
                  settings.size === size
                    ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                    : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary mb-2">Output Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(['mp4', 'webm', 'mov'] as FormatPreference[]).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => updateSettings({ format })}
                className={`text-xs p-2 rounded-lg border transition-all uppercase ${
                  settings.format === format
                    ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 font-semibold text-primary'
                    : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 text-secondary'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading || !!error}
        className="w-full px-4 py-3 bg-[var(--accent-main)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--accent-contrast)] rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] shadow-theme-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading video…</span>
          </>
        ) : (
          <>
            <Scissors className="w-4 h-4" />
            <span>Continue to trim</span>
          </>
        )}
      </button>
    </div>
  );
}
