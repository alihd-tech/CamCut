import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, CreditCard as Edit2, Volume2, VolumeX } from 'lucide-react';
import { VideoData } from '../App';
import { TextStyle } from './TextEditor';
import { useSettings } from '../contexts/SettingsContext';

interface VideoPreviewProps {
  videoData: VideoData;
  text: string;
  textStyle: TextStyle;
  onBack: () => void;
  onEdit: () => void;
}

function VideoPreview({ videoData, text, textStyle, onBack, onEdit }: VideoPreviewProps) {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(videoData.startTime);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getPreviewStyle = () => {
    const baseClass = 'text-4xl font-black text-center leading-tight';
    switch (textStyle) {
      case 'comic':
        return `${baseClass} text-white` + ' [text-shadow:3px_3px_0px_rgba(0,0,0,1),6px_6px_0px_rgba(255,255,255,0.3)]';
      case 'neon':
        return `${baseClass} text-green-400` + ' [text-shadow:0_0_10px_rgba(34,197,94,1),0_0_20px_rgba(34,197,94,0.8),0_0_30px_rgba(34,197,94,0.6)]';
      case 'retro':
        return `${baseClass} text-yellow-300` + ' [text-shadow:2px_2px_0px_#FF00FF,4px_4px_0px_#00FFFF]';
      default:
        return baseClass;
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const fontSize = Math.floor(width / 15);
    ctx.font = `900 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width * 0.85) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = Math.floor(fontSize * 1.3);
    const startY = (height - (lines.length * lineHeight)) / 2;

    switch (textStyle) {
      case 'comic':
        lines.forEach((line, i) => {
          ctx.fillStyle = 'black';
          ctx.fillText(line, width / 2 + 3, startY + (i * lineHeight) + 3);
          ctx.fillStyle = 'white';
          ctx.fillText(line, width / 2, startY + (i * lineHeight));
        });
        break;

      case 'neon':
        lines.forEach((line, i) => {
          ctx.shadowColor = '#22C55E';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#4ADE80';
          ctx.fillText(line, width / 2, startY + (i * lineHeight));
          ctx.shadowColor = '#16A34A';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#86EFAC';
          ctx.fillText(line, width / 2, startY + (i * lineHeight));
        });
        ctx.shadowColor = 'transparent';
        break;

      case 'retro':
        lines.forEach((line, i) => {
          ctx.fillStyle = 'cyan';
          ctx.fillText(line, width / 2 - 4, startY + (i * lineHeight) - 4);
          ctx.fillStyle = 'magenta';
          ctx.fillText(line, width / 2 + 4, startY + (i * lineHeight) + 4);
          ctx.fillStyle = '#FBBF24';
          ctx.fillText(line, width / 2, startY + (i * lineHeight));
        });
        break;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  // Seek to clip start when video loads and when clip range changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoData.url) return;

    const seekToStart = () => {
      const start = videoData.startTime;
      if (video.currentTime < start - 0.1 || video.currentTime > start + 0.1) {
        video.currentTime = start;
        setCurrentTime(start);
      }
    };

    if (video.readyState >= 1) {
      seekToStart();
    } else {
      video.addEventListener('loadedmetadata', seekToStart);
      video.addEventListener('loadeddata', seekToStart);
      return () => {
        video.removeEventListener('loadedmetadata', seekToStart);
        video.removeEventListener('loadeddata', seekToStart);
      };
    }
  }, [videoData.url, videoData.startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      if (time >= videoData.endTime) {
        video.pause();
        setIsPlaying(false);
        setShowText(true);
      } else {
        setShowText(false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoData.endTime]);

  const duration = videoData.endTime - videoData.startTime;
  const totalProgress = videoData.duration > 0
    ? Math.min(100, (currentTime / videoData.duration) * 100)
    : 0;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.currentTime = videoData.startTime;
      setShowText(false);
      video.play();
      setIsPlaying(true);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply size/resolution settings
      let width = video.videoWidth;
      let height = video.videoHeight;
      const aspectRatio = width / height;

      switch (settings.size) {
        case '480p':
          height = 480;
          width = Math.round(height * aspectRatio);
          break;
        case '720p':
          height = 720;
          width = Math.round(height * aspectRatio);
          break;
        case '1080p':
          height = 1080;
          width = Math.round(height * aspectRatio);
          break;
        case '4k':
          height = 2160;
          width = Math.round(height * aspectRatio);
          break;
      }

      canvas.width = width;
      canvas.height = height;

      // Apply quality settings
      let videoBitsPerSecond = 5000000; // default high
      switch (settings.quality) {
        case 'low':
          videoBitsPerSecond = 1000000;
          break;
        case 'medium':
          videoBitsPerSecond = 2500000;
          break;
        case 'high':
          videoBitsPerSecond = 5000000;
          break;
        case 'ultra':
          videoBitsPerSecond = 10000000;
          break;
      }

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme-clip-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      video.currentTime = videoData.startTime;

      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      mediaRecorder.start();

      const drawFrame = () => {
        if (video.currentTime >= videoData.endTime) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          drawText(ctx, canvas.width, canvas.height);

          setTimeout(() => {
            mediaRecorder.stop();
            video.pause();
          }, 1000);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      };

      video.play();
      drawFrame();

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export video. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-accent-main mb-2 flex items-center justify-center gap-3">
          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-accent-main" />
          Preview Your Video
        </h2>
        <p className="text-secondary text-sm sm:text-base">
          Review your final clip before exporting
        </p>
      </div>

      <div className="relative group rounded-xl overflow-hidden bg-primary border border-theme shadow-lg">
        <video
          ref={videoRef}
          src={videoData.url}
          className="w-full aspect-video object-cover relative z-10"
          playsInline
          muted={isMuted}
          preload="metadata"
        />
        <canvas ref={canvasRef} className="hidden" />

        {showText && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 sm:p-8 z-20">
            <div className="w-full">
              <p className={getPreviewStyle()}>
                {text}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all group z-30"
        >
          {isPlaying ? (
            <Pause className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          ) : (
            <Play className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Volume Controls */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsMuted(!isMuted)}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="p-2 bg-black/60 hover:bg-black/80 rounded-lg backdrop-blur-sm transition-all"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            {showVolumeSlider && (
              <div
                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    setIsMuted(newVolume === 0);
                  }}
                  className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  style={{
                    background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${volume * 100}%, rgb(75, 85, 99) ${volume * 100}%, rgb(75, 85, 99) 100%)`
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Timeline in preview */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 sm:p-4">
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="relative h-2 sm:h-3 bg-gray-800/80 backdrop-blur-sm rounded-full overflow-hidden">
              {/* Full video range indicator */}
              <div 
                className="absolute inset-0 bg-gray-700/50"
                style={{
                  left: `${(videoData.startTime / videoData.duration) * 100}%`,
                  right: `${((videoData.duration - videoData.endTime) / videoData.duration) * 100}%`
                }}
              />
              {/* Selected clip range */}
              <div 
                className="absolute h-full bg-primary-500"
                style={{
                  left: `${(videoData.startTime / videoData.duration) * 100}%`,
                  width: `${(duration / videoData.duration) * 100}%`
                }}
              />
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white rounded-full"
                style={{ left: `${totalProgress}%` }}
              />
            </div>

            {/* Time info */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-white/90 font-semibold">Clip:</span>
                <span className="text-white/80 font-mono">
                  {currentTime.toFixed(1)}s / {videoData.endTime.toFixed(1)}s
                </span>
              </div>
              <div className="text-white/70 font-mono">
                {duration.toFixed(1)}s duration
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-4 sm:p-6 border border-theme shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-primary font-bold mb-2 text-sm sm:text-base">Text Overlay</h3>
            <p className="text-secondary text-base sm:text-lg mb-2 break-words">{text}</p>
            <p className="text-tertiary text-xs sm:text-sm">
              Style: <span className="text-primary-600 dark:text-primary-400 font-semibold capitalize">{textStyle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary hover:bg-tertiary border border-theme text-primary rounded-xl transition-all font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-primary-500/50 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'Exporting...' : 'Download Video'}
        </button>
      </div>
    </div>
  );
}

export default VideoPreview;
