import { ArrowLeft, Film, Monitor, Zap, RotateCcw } from 'lucide-react';
import { useRouter } from '../router';
import { useSettings, DurationPreference, QualityPreference, SizePreference } from '../contexts/SettingsContext';
import SEO from './SEO';

export default function Settings() {
  const { navigate } = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();

  const durationOptions: { value: DurationPreference; label: string; description: string }[] = [
    { value: 'short', label: 'Short Form', description: '3-6 seconds (ideal for viral clips)' },
    { value: 'long', label: 'Long Form', description: '30+ seconds (for extended content)' },
  ];

  const qualityOptions: { value: QualityPreference; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Faster processing, smaller file size' },
    { value: 'medium', label: 'Medium', description: 'Balanced quality and file size' },
    { value: 'high', label: 'High', description: 'Best quality, larger file size (recommended)' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality, largest file size' },
  ];

  const sizeOptions: { value: SizePreference; label: string; description: string }[] = [
    { value: '480p', label: '480p (SD)', description: '640×480 - Small file size' },
    { value: '720p', label: '720p (HD)', description: '1280×720 - Standard HD' },
    { value: '1080p', label: '1080p (Full HD)', description: '1920×1080 - Recommended' },
    { value: '4k', label: '4K (UHD)', description: '3840×2160 - Maximum resolution' },
  ];

  return (
    <>
      <SEO
        title="Settings - CamCut | camcut.fun"
        description="Configure your studio preferences and output settings for video creation."
        keywords="settings, preferences, video quality, output settings, camcut settings"
        url="https://camcut.fun/settings"
      />

      <div className="min-h-screen bg-primary">
        {/* Header */}
        <section className="pt-16 pb-8 sm:pt-20 sm:pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to profile</span>
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-secondary border border-theme rounded-full px-3 py-1.5 text-sm font-medium text-primary shadow-theme-sm mb-4">
                <Zap className="w-4 h-4 text-[var(--accent-main)]" />
                <span>Settings</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary font-outfit mb-4">
                Studio Preferences &{' '}
                <span className="text-[var(--accent-main)]">Output Settings</span>
              </h1>

              <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
                Customize your video creation workflow and export configuration.
              </p>
            </div>
          </div>
        </section>

        {/* Settings Content */}
        <section className="pb-8 sm:pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Studio Preferences */}
            <div className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-tertiary border border-theme flex items-center justify-center">
                  <Film className="w-5 h-5 text-[var(--accent-main)]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary font-outfit">Studio Preferences</h2>
                  <p className="text-sm text-secondary mt-0.5">Configure your default video creation settings</p>
                </div>
              </div>

              {/* Duration Preference */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Default Duration Type
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings({ duration: option.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        settings.duration === option.value
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 hover:bg-tertiary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-primary">{option.label}</span>
                        {settings.duration === option.value && (
                          <div className="w-5 h-5 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Configuration */}
            <div className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-tertiary border border-theme flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-[var(--accent-main)]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary font-outfit">Output Configuration</h2>
                  <p className="text-sm text-secondary mt-0.5">Set your preferred export quality and resolution</p>
                </div>
              </div>

              {/* Quality Preference */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Export Quality
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings({ quality: option.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        settings.quality === option.value
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 hover:bg-tertiary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-primary">{option.label}</span>
                        {settings.quality === option.value && (
                          <div className="w-5 h-5 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Preference */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Output Resolution
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings({ size: option.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        settings.size === option.value
                          ? 'border-[var(--accent-main)] bg-accent-50/50 dark:bg-accent-950/20 shadow-theme-sm'
                          : 'border-theme bg-secondary hover:border-[var(--accent-main)]/50 hover:bg-tertiary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-primary">{option.label}</span>
                        {settings.size === option.value && (
                          <div className="w-5 h-5 rounded-full bg-[var(--accent-main)] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-contrast)]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-secondary">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-primary bg-secondary hover:bg-tertiary border border-theme transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to defaults</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

