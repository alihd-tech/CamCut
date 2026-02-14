import { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import VideoTrimmer from './VideoTrimmer';
import TextEditor, { TextStyle } from './TextEditor';
import VideoPreview from './VideoPreview';
import Breadcrumb from './Breadcrumb';
import StudioBottomNavigation from './StudioBottomNavigation';
import { VideoData } from '../App';
import { useSettings } from '../contexts/SettingsContext';
import SEO from './SEO';
import JSONLD from './JSONLD';

type StepType = 'upload' | 'trim' | 'text' | 'preview';

export default function Studio() {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState<StepType>('upload');
  const [videoData, setVideoData] = useState<VideoData>({
    url: '',
    duration: 0,
    startTime: 0,
    endTime: 0,
  });
  const [text, setText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle>('neon');

  // Get default end time based on duration preference
  const getDefaultEndTime = (duration: number) => {
    if (settings.duration === 'long') {
      return Math.min(30, duration); // Default to 30 seconds for long form
    } else {
      return Math.min(6, duration); // Default to 6 seconds for short form
    }
  };

  // Check for imported video data from VideoPlayer
  useEffect(() => {
    const importedData = sessionStorage.getItem('importedVideoData');
    if (importedData) {
      try {
        const videoData = JSON.parse(importedData);
        if (videoData.url) {
          const videoDuration = videoData.duration || 0;
          const defaultEndTime = settings.duration === 'long' 
            ? Math.min(30, videoDuration)
            : Math.min(6, videoDuration);
          
          setVideoData({
            url: videoData.url,
            duration: videoDuration,
            startTime: 0,
            endTime: defaultEndTime,
          });
          setCurrentStep('trim');
          // Clear the imported data so it doesn't reload on next visit
          sessionStorage.removeItem('importedVideoData');
        }
      } catch (error) {
        console.error('Error parsing imported video data:', error);
        sessionStorage.removeItem('importedVideoData');
      }
    }
  }, [settings.duration]);

  const handleVideoUpload = (file: File, url: string, duration: number) => {
    setVideoData({
      file,
      url,
      duration,
      startTime: 0,
      endTime: getDefaultEndTime(duration),
    });
    setCurrentStep('trim');
  };

  const handleTrimComplete = (startTime: number, endTime: number) => {
    setVideoData((prev: VideoData) => ({ ...prev, startTime, endTime }));
    setCurrentStep('text');
  };

  const handleTextComplete = (finalText: string, style: TextStyle) => {
    setText(finalText);
    setTextStyle(style);
    setCurrentStep('preview');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setVideoData({ url: '', duration: 0, startTime: 0, endTime: 0 });
    setText('');
    setTextStyle('neon');
  };

  const handleStepClick = (step: StepType) => {
    if (step === 'upload') {
      if (currentStep === 'trim' || currentStep === 'text' || currentStep === 'preview') setCurrentStep('upload');
    } else if (step === 'trim' && (currentStep === 'text' || currentStep === 'preview')) {
      setCurrentStep('trim');
    } else if (step === 'text' && currentStep === 'preview') {
      setCurrentStep('text');
    }
  };

  const handleStepBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('text');
    } else if (currentStep === 'text') {
      setCurrentStep('trim');
    } else if (currentStep === 'trim') {
      setCurrentStep('upload');
    }
  };

  const handleStepForward = () => {
    if (currentStep === 'upload' && videoData.url) {
      setCurrentStep('trim');
    } else if (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) {
      setCurrentStep('text');
    } else if (currentStep === 'text' && text) {
      setCurrentStep('preview');
    }
  };

  const canGoBack = currentStep !== 'upload';
  const canGoForward = Boolean(
    (currentStep === 'upload' && videoData.url) ||
    (currentStep === 'trim' && videoData.url && videoData.startTime !== videoData.endTime) ||
    (currentStep === 'text' && text)
  );

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
        <Breadcrumb
          currentStep={currentStep}
          videoData={videoData}
          text={text}
          textStyle={textStyle}
          onStepClick={handleStepClick}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="animate-fade-in">
            {/* ——— Step 1: Upload ——— */}
            {currentStep === 'upload' && (
              <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 1 of 4</span>
                  <h2 className="text-xl font-bold text-primary font-outfit mt-1">Upload your video</h2>
                </div>
                <VideoUpload onVideoUpload={handleVideoUpload} />
              </section>
            )}

            {/* ——— Step 2: Trim ——— */}
            {currentStep === 'trim' && (
              <section className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[var(--accent-main)] uppercase tracking-wider">Step 2 of 4</span>
                  <h2 className="text-xl font-bold text-primary font-outfit mt-1">Trim your clip</h2>
                  <p className="text-secondary text-sm mt-1">
                    {settings.duration === 'short' 
                      ? 'Choose 3–6 seconds for the best viral clip length.'
                      : 'Choose your preferred length for long-form content (30+ seconds recommended).'}
                  </p>
                </div>
                <VideoTrimmer
                  videoData={videoData}
                  onTrimComplete={handleTrimComplete}
                  onBack={() => setCurrentStep('upload')}
                />
              </section>
            )}

            {/* ——— Step 3: Text ——— */}
            {currentStep === 'text' && (
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

            {/* ——— Step 4: Preview ——— */}
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
                  />
                </div>
              </section>
            )}
            </div>
          </div>
        </div>

        <StudioBottomNavigation
          currentStep={currentStep}
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
