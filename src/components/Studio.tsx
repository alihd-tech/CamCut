import { useState, useEffect, useRef, useCallback } from 'react';
import VideoUpload from './VideoUpload';
import VideoConfigure, { TrimMethod } from './VideoConfigure';
import VideoTrimmer from './VideoTrimmer';
import TextEditor, { TextStyle } from './TextEditor';
import VideoPreview from './VideoPreview';
import StudioBottomNavigation from './StudioBottomNavigation';
import { VideoData } from '../App';
import { useSettings, QualityPreference, SizePreference, FormatPreference } from '../contexts/SettingsContext';
import SEO from './SEO';
import JSONLD from './JSONLD';
import { Settings, ChevronDown, ChevronUp, Film } from 'lucide-react';

type StepType = 'upload' | 'trim' | 'text' | 'preview';
type UploadPhase = 'select' | 'configure';

const detectFormat = (file: File): FormatPreference => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (extension === 'webm') return 'webm';
  if (extension === 'mov' || extension === 'qt') return 'mov';
  return 'mp4';
};

const detectResolution = (width: number, height: number): SizePreference => {
  const maxDimension = Math.max(width, height);
  if (maxDimension >= 2160) return '4k';
  if (maxDimension >= 1080) return '1080p';
  if (maxDimension >= 720) return '720p';
  return '480p';
};

const estimateQuality = (fileSize: number, width: number, height: number): QualityPreference => {
  const pixels = width * height;
  const bitsPerPixel = (fileSize * 8) / pixels;

  if (bitsPerPixel > 0.5) return 'ultra';
  if (bitsPerPixel > 0.3) return 'high';
  if (bitsPerPixel > 0.15) return 'medium';
  return 'low';
};

export default function Studio() {
  const { settings, updateSettings } = useSettings();
  const [currentStep, setCurrentStep] = useState<StepType>('upload');
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('select');
  const [showSettings, setShowSettings] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [configureError, setConfigureError] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [trimMethod, setTrimMethod] = useState<TrimMethod>('manual');
  const videoUrlRef = useRef<string>('');

  const [videoData, setVideoData] = useState<VideoData>({
    url: '',
    duration: 0,
    startTime: 0,
    endTime: 0,
  });
  const [text, setText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle>('neon');
  const [includeText, setIncludeText] = useState(true);

  const getDefaultEndTime = useCallback(
    (duration: number) => {
      if (settings.duration === 'long') {
        return Math.min(30, duration);
      }
      return Math.min(6, duration);
    },
    [settings.duration]
  );

  const loadVideoMetadata = useCallback(
    (file: File | undefined, url: string, onComplete: (duration: number) => void) => {
      const video = document.createElement('video');
      video.src = url;

      video.onloadedmetadata = () => {
        if (video.duration < 3) {
          setConfigureError('Video must be at least 3 seconds long.');
          setIsVideoLoading(false);
          URL.revokeObjectURL(url);
          videoUrlRef.current = '';
          return;
        }

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (file) {
          updateSettings({
            format: detectFormat(file),
            size: detectResolution(width, height),
            quality: estimateQuality(file.size, width, height),
          });
        } else {
          let detectedFormat: FormatPreference = 'mp4';
          try {
            const pathname = new URL(url).pathname.toLowerCase();
            if (pathname.includes('.webm')) detectedFormat = 'webm';
            else if (pathname.includes('.mov')) detectedFormat = 'mov';
          } catch {
            // keep default
          }

          const detectedResolution = detectResolution(width, height);
          let detectedQuality: QualityPreference = 'high';
          if (detectedResolution === '4k') detectedQuality = 'ultra';
          else if (detectedResolution === '1080p') detectedQuality = 'high';
          else if (detectedResolution === '720p') detectedQuality = 'medium';
          else detectedQuality = 'low';

          updateSettings({
            format: detectedFormat,
            size: detectedResolution,
            quality: detectedQuality,
          });
        }

        onComplete(video.duration);
        setIsVideoLoading(false);
        setConfigureError(null);
      };

      video.onerror = () => {
        setConfigureError('Failed to load video. Please ensure the file is not corrupted and try again.');
        setIsVideoLoading(false);
        URL.revokeObjectURL(url);
        videoUrlRef.current = '';
      };
    },
    [updateSettings]
  );

  const beginConfigure = useCallback(
    (file: File | undefined, url: string, fileName: string) => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }

      videoUrlRef.current = url;
      setPendingFileName(fileName);
      setConfigureError(null);
      setIsVideoLoading(true);
      setUploadPhase('configure');
      setCurrentStep('upload');

      loadVideoMetadata(file, url, (duration) => {
        setVideoData({
          file,
          url,
          duration,
          startTime: 0,
          endTime: getDefaultEndTime(duration),
        });
      });
    },
    [getDefaultEndTime, loadVideoMetadata]
  );

  useEffect(() => {
    const importedData = sessionStorage.getItem('importedVideoData');
    if (!importedData) return;

    try {
      const parsed = JSON.parse(importedData);
      if (parsed.url) {
        beginConfigure(undefined, parsed.url, 'Imported video');
      }
    } catch (error) {
      console.error('Error parsing imported video data:', error);
    } finally {
      sessionStorage.removeItem('importedVideoData');
    }
  }, [beginConfigure]);

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const handleVideoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    beginConfigure(file, url, file.name);
  };

  const handleConfigureContinue = () => {
    if (isVideoLoading || configureError || !videoData.url) return;
    setUploadPhase('select');
    setCurrentStep('trim');
  };

  const handleConfigureCancel = () => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = '';
    }
    setVideoData({ url: '', duration: 0, startTime: 0, endTime: 0 });
    setUploadPhase('select');
    setIsVideoLoading(false);
    setConfigureError(null);
    setPendingFileName('');
  };

  const handleTrimComplete = (startTime: number, endTime: number) => {
    setVideoData((prev: VideoData) => ({ ...prev, startTime, endTime }));
    if (includeText) {
      setCurrentStep('text');
    } else {
      setText('');
      setCurrentStep('preview');
    }
  };

  const handleTextComplete = (finalText: string, style: TextStyle) => {
    setText(finalText);
    setTextStyle(style);
    setCurrentStep('preview');
  };

  const handleReset = () => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = '';
    }
    setCurrentStep('upload');
    setUploadPhase('select');
    setVideoData({ url: '', duration: 0, startTime: 0, endTime: 0 });
    setText('');
    setTextStyle('neon');
    setIncludeText(true);
    setTrimMethod('manual');
    setIsVideoLoading(false);
    setConfigureError(null);
    setPendingFileName('');
  };

  const handleStepBack = () => {
    if (currentStep === 'preview') {
      if (includeText) {
        setCurrentStep('text');
      } else {
        setCurrentStep('trim');
      }
    } else if (currentStep === 'text') {
      setCurrentStep('trim');
    } else if (currentStep === 'trim') {
      setUploadPhase('configure');
      setCurrentStep('upload');
    } else if (currentStep === 'upload' && uploadPhase === 'configure') {
      handleConfigureCancel();
    }
  };

  const handleStepForward = () => {
    if (currentStep === 'upload' && uploadPhase === 'configure' && !isVideoLoading && videoData.url) {
      handleConfigureContinue();
    } else if (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) {
      if (includeText) {
        setCurrentStep('text');
      } else {
        setText('');
        setCurrentStep('preview');
      }
    } else if (currentStep === 'text' && text) {
      setCurrentStep('preview');
    }
  };

  const canGoBack =
    currentStep !== 'upload' || uploadPhase === 'configure';
  const canGoForward = Boolean(
    (currentStep === 'upload' && uploadPhase === 'configure' && !isVideoLoading && videoData.url && !configureError) ||
    (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) ||
    (currentStep === 'text' && (text || !includeText))
  );

  const showQuickSettings = currentStep !== 'upload';

  return (
    <>
      <SEO
        title="Video Studio - Create & Edit Viral Clips | CamCut"
        description="Create stunning video clips with custom text overlays. Upload your own video, trim, add text styles, and export in seconds."
        keywords="video studio, video editor, video trimmer, text overlay, video creation, clip editor, camcut studio"
        url="https://camcut.fun/studio"
      />
      <JSONLD
        type="WebApplication"
        data={{
          name: 'CamCut Video Studio',
          applicationCategory: 'MultimediaApplication',
          featureList: [
            'Video upload',
            'Precise video trimming',
            'Text overlay with 6+ styles',
            'Real-time preview',
            'Instant export',
          ],
        }}
      />
      <div className="relative flex flex-col h-full bg-secondary/40 overflow-hidden">
        {showQuickSettings && (
          <div className="border-b border-theme bg-primary/50">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between max-w-4xl mx-auto hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--accent-main)]" />
                <span className="text-sm font-semibold text-primary">Quick Settings</span>
              </div>
              {showSettings ? (
                <ChevronUp className="w-4 h-4 text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-secondary" />
              )}
            </button>

            {showSettings && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-theme bg-primary">
                <div className="max-w-4xl mx-auto space-y-4">
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
                        <span className="text-xs font-semibold text-primary">Short Form</span>
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
                        <span className="text-xs font-semibold text-primary">Long Form</span>
                        <p className="text-xs text-secondary">30+ seconds</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="animate-fade-in">
              {currentStep === 'upload' && uploadPhase === 'select' && (
                <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 1 of 4</span>
                    <h2 className="text-xl font-bold text-primary font-outfit mt-1">Upload your video</h2>
                    <p className="text-secondary text-sm mt-1">Select a video, then choose trim method and settings while it loads.</p>
                  </div>
                  <VideoUpload onVideoSelect={handleVideoSelect} />
                </section>
              )}

              {currentStep === 'upload' && uploadPhase === 'configure' && (
                <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 1 of 4</span>
                    <h2 className="text-xl font-bold text-primary font-outfit mt-1">Configure your clip</h2>
                    <p className="text-secondary text-sm mt-1">
                      Choose trim method and output settings while your video loads.
                    </p>
                  </div>
                  <VideoConfigure
                    fileName={pendingFileName}
                    isLoading={isVideoLoading}
                    error={configureError}
                    trimMethod={trimMethod}
                    includeText={includeText}
                    onTrimMethodChange={setTrimMethod}
                    onIncludeTextChange={setIncludeText}
                    onContinue={handleConfigureContinue}
                  />
                  {!isVideoLoading && configureError && (
                    <button
                      type="button"
                      onClick={handleConfigureCancel}
                      className="mt-4 w-full px-4 py-2 text-sm text-secondary hover:text-primary border border-theme rounded-lg transition-colors"
                    >
                      Choose a different video
                    </button>
                  )}
                </section>
              )}

              {currentStep === 'trim' && (
                <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 2 of 4</span>
                    <h2 className="text-xl font-bold text-primary font-outfit mt-1">Trim your clip</h2>
                    <p className="text-secondary text-sm mt-1">
                      {trimMethod === 'quick'
                        ? 'Quick clip applied — fine-tune the selection if needed.'
                        : settings.duration === 'short'
                          ? 'Choose 3–6 seconds for the best viral clip length.'
                          : 'Choose your preferred length for long-form content (30+ seconds recommended).'}
                    </p>
                  </div>
                  <VideoTrimmer
                    videoData={videoData}
                    trimMethod={trimMethod}
                    onTrimComplete={handleTrimComplete}
                    onBack={() => {
                      setUploadPhase('configure');
                      setCurrentStep('upload');
                    }}
                  />
                </section>
              )}

              {currentStep === 'text' && includeText && (
                <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 3 of 4</span>
                    <h2 className="text-xl font-bold text-primary font-outfit mt-1">Add text overlay</h2>
                    <p className="text-secondary text-sm mt-1">Type your caption and pick a style. You can preview in the next step.</p>
                  </div>
                  <TextEditor
                    onTextComplete={handleTextComplete}
                    onBack={() => setCurrentStep('trim')}
                  />
                </section>
              )}

              {currentStep === 'preview' && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                    <div className="mb-6">
                      <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 4 of 4</span>
                      <h2 className="text-xl font-bold text-primary font-outfit mt-1">Preview & export</h2>
                      <p className="text-secondary text-sm mt-1">Review your clip, then download or share.</p>
                    </div>
                    <VideoPreview
                      videoData={videoData}
                      text={text}
                      textStyle={textStyle}
                      onBack={() => setCurrentStep('text')}
                      onEdit={() => setCurrentStep('text')}
                      includeText={includeText}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        <StudioBottomNavigation
          currentStep={currentStep}
          uploadPhase={uploadPhase}
          videoData={videoData}
          text={text}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onReset={handleReset}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      </div>
    </>
  );
}
