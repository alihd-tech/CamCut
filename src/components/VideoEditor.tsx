import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download, Share2, Scissors, Volume2, VolumeX, SkipBack, SkipForward, Settings, Sparkles, Sliders } from 'lucide-react';
import { VideoState } from '../types/video';

interface Props {
  videoState: VideoState;
  onVideoStateChange: (updates: Partial<VideoState>) => void;
  onExport: () => void;
  onPublish: () => void;
}

interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | 'original';
  fps: 24 | 30 | 60;
}

type EditorMode = 'easy' | 'advanced';

export const VideoEditor: React.FC<Props> = ({
  videoState,
  onVideoStateChange,
  onPublish,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>('easy');
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    fps: 30,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [videoMetadata, setVideoMetadata] = useState({
    width: 0,
    height: 0,
    fps: 0,
    bitrate: 0,
    codec: '',
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.url) return;

    const handleLoadedMetadata = () => {
      setVideoMetadata({
        width: video.videoWidth,
        height: video.videoHeight,
        fps: 30,
        bitrate: 0,
        codec: 'Unknown',
      });
      onVideoStateChange({
        duration: video.duration,
        endTime: Math.min(video.duration, videoState.startTime + 6),
      });
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (currentTime >= videoState.endTime && videoState.isPlaying) {
        video.pause();
        onVideoStateChange({ isPlaying: false });
        video.currentTime = videoState.startTime;
      }
      onVideoStateChange({ currentTime });
    };

    const handlePlay = () => onVideoStateChange({ isPlaying: true });
    const handlePause = () => onVideoStateChange({ isPlaying: false });

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoState.url, videoState.endTime, videoState.startTime, videoState.isPlaying, onVideoStateChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoState.isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= videoState.endTime) video.currentTime = videoState.startTime;
      video.play();
    }
  }, [videoState.isPlaying, videoState.startTime, videoState.endTime]);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(videoState.startTime, Math.min(videoState.endTime, time));
    video.currentTime = clamped;
  }, [videoState.startTime, videoState.endTime]);

  const seekRelative = useCallback((seconds: number) => {
    seekTo(videoState.currentTime + seconds);
  }, [videoState.currentTime, seekTo]);

  const resetTrim = useCallback(() => {
    onVideoStateChange({ startTime: 0, endTime: videoState.duration });
    seekTo(0);
  }, [videoState.duration, onVideoStateChange, seekTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || (e.target instanceof HTMLSelectElement)) return;
      if ((e.target as HTMLElement).closest('button')) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(e.shiftKey ? -5 : -1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(e.shiftKey ? 5 : 1);
          break;
        case 'Home':
          e.preventDefault();
          seekTo(videoState.startTime);
          break;
        case 'End':
          e.preventDefault();
          seekTo(videoState.endTime);
          break;
        case 'i':
          e.preventDefault();
          onVideoStateChange({ startTime: videoState.currentTime });
          break;
        case 'o':
          e.preventDefault();
          onVideoStateChange({ endTime: videoState.currentTime });
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((m) => !m);
          break;
        case 'r':
          e.preventDefault();
          resetTrim();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seekRelative, seekTo, resetTrim, videoState.currentTime, videoState.startTime, videoState.endTime, onVideoStateChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current || !isDragging) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = percent * videoState.duration;
      switch (isDragging) {
        case 'start':
          onVideoStateChange({ startTime: Math.min(time, videoState.endTime - 1) });
          break;
        case 'end':
          onVideoStateChange({ endTime: Math.max(time, videoState.startTime + 1) });
          break;
        case 'playhead':
          seekTo(time);
          break;
      }
    };
    const handleMouseUp = () => setIsDragging(null);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, videoState.duration, videoState.startTime, videoState.endTime, onVideoStateChange, seekTo]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDragging) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * videoState.duration);
  };

  const handleTrimmerDrag = (e: React.MouseEvent, type: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  };
  const handlePlayheadDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging('playhead');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const trimmedDuration = videoState.endTime - videoState.startTime;

  const handleQuickExport = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width, height } = videoMetadata;
      if (width === 0 || height === 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
      const w = canvas.width;
      const h = canvas.height;
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clip-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(0);
      };
      video.currentTime = videoState.startTime;
      await new Promise((resolve) => { video.onseeked = resolve; });
      mediaRecorder.start();
      video.play();
      const start = Date.now();
      const durationMs = (videoState.endTime - videoState.startTime) * 1000;
      const tick = () => {
        const elapsed = Date.now() - start;
        setExportProgress(Math.min((elapsed / durationMs) * 100, 100));
        if (video.currentTime >= videoState.endTime) {
          mediaRecorder.stop();
          video.pause();
        } else {
          ctx.drawImage(video, 0, 0, w, h);
          requestAnimationFrame(tick);
        }
      };
      tick();
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleAdvancedExport = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let { width, height } = videoMetadata;
      switch (exportSettings.resolution) {
        case '480p': height = 480; width = Math.round((height * videoMetadata.width) / videoMetadata.height); break;
        case '720p': height = 720; width = Math.round((height * videoMetadata.width) / videoMetadata.height); break;
        case '1080p': height = 1080; width = Math.round((height * videoMetadata.width) / videoMetadata.height); break;
      }
      canvas.width = width;
      canvas.height = height;
      const stream = canvas.captureStream(exportSettings.fps);
      const mimeType = `video/${exportSettings.format === 'mov' ? 'mp4' : exportSettings.format}`;
      let videoBitrate = 5000000;
      switch (exportSettings.quality) {
        case 'low': videoBitrate = 1000000; break;
        case 'medium': videoBitrate = 2500000; break;
        case 'high': videoBitrate = 5000000; break;
        case 'ultra': videoBitrate = 10000000; break;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: videoBitrate });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-${Date.now()}.${exportSettings.format}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(0);
      };
      video.currentTime = videoState.startTime;
      await new Promise((resolve) => { video.onseeked = resolve; });
      mediaRecorder.start();
      video.play();
      const start = Date.now();
      const durationMs = (videoState.endTime - videoState.startTime) * 1000;
      const tick = () => {
        setExportProgress(Math.min(((Date.now() - start) / durationMs) * 100, 100));
        if (video.currentTime >= videoState.endTime) {
          mediaRecorder.stop();
          video.pause();
        } else {
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(tick);
        }
      };
      tick();
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Mode toggle: Easy | Advanced */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div
          className="inline-flex rounded-xl bg-secondary border border-theme p-1"
          role="tablist"
          aria-label="Editor mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === 'easy'}
            aria-controls="editor-easy-panel"
            id="editor-tab-easy"
            onClick={() => setEditorMode('easy')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              editorMode === 'easy'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-secondary hover:bg-tertiary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Easy
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editorMode === 'advanced'}
            aria-controls="editor-advanced-panel"
            id="editor-tab-advanced"
            onClick={() => setEditorMode('advanced')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              editorMode === 'advanced'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-secondary hover:bg-tertiary'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Video player */}
      <section className="bg-secondary rounded-xl border border-theme overflow-hidden" aria-label="Video preview">
        <div className="relative aspect-video bg-primary group">
          <video
            ref={videoRef}
            src={videoState.url}
            className="w-full h-full object-contain"
            onClick={togglePlayPause}
            playsInline
            muted={isMuted}
            preload="metadata"
            aria-label="Video playback"
          />
          <canvas ref={canvasRef} className="hidden" aria-hidden />

          {/* Overlay controls — always visible in advanced; hover in easy */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${editorMode === 'advanced' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between text-white gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="p-2 bg-black/60 hover:bg-black/80 rounded-lg backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={videoState.isPlaying ? 'Pause' : 'Play'}
                  >
                    {videoState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button type="button" onClick={() => seekRelative(-5)} className="p-1.5 bg-black/60 hover:bg-black/80 rounded backdrop-blur-sm" aria-label="Rewind 5 seconds">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => seekRelative(5)} className="p-1.5 bg-black/60 hover:bg-black/80 rounded backdrop-blur-sm" aria-label="Forward 5 seconds">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono bg-black/60 px-2 py-1 rounded" aria-live="polite">
                    {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                  </span>
                </div>
                {editorMode === 'advanced' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className="bg-black/60 text-white text-xs rounded px-2 py-1 border-0 focus:ring-2 focus:ring-white"
                      aria-label="Playback speed"
                    >
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((x) => (
                        <option key={x} value={x}>{x}x</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 bg-black/60 hover:bg-black/80 rounded backdrop-blur-sm"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-16 accent-primary-500"
                      aria-label="Volume"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {!videoState.isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {editorMode === 'advanced' && videoMetadata.width > 0 && (
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-secondary border-t border-theme">
            <div><span className="text-tertiary">Resolution</span><div className="font-mono text-primary">{videoMetadata.width}×{videoMetadata.height}</div></div>
            <div><span className="text-tertiary">Duration</span><div className="font-mono text-primary">{formatTime(videoState.duration)}</div></div>
            <div><span className="text-tertiary">Clip</span><div className="font-mono text-primary">{formatTime(trimmedDuration)}</div></div>
            <div><span className="text-tertiary">Format</span><div className="font-mono text-primary truncate">{videoState.file?.type || '—'}</div></div>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="bg-secondary rounded-xl border border-theme p-4" aria-label="Trim timeline">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary-500" />
            Timeline
          </h3>
          <span className="text-xs text-secondary font-mono">Clip: {formatTime(trimmedDuration)}</span>
        </div>
        <div
          ref={timelineRef}
          role="group"
          aria-label="Trim range — click to seek, drag handles to set in/out"
          className="relative h-12 bg-tertiary rounded-lg cursor-pointer overflow-hidden border border-theme"
          onClick={handleTimelineClick}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-200/50 via-tertiary to-primary-200/50 dark:from-primary-800/30 dark:via-tertiary dark:to-primary-800/30" />
          <div
            className="absolute top-0 h-full bg-primary-500/60 border-x-2 border-primary-400 dark:border-primary-600"
            style={{
              left: `${(videoState.startTime / videoState.duration) * 100}%`,
              width: `${((videoState.endTime - videoState.startTime) / videoState.duration) * 100}%`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary-600 dark:bg-primary-500 z-20 cursor-ew-resize"
            style={{ left: `${(videoState.currentTime / videoState.duration) * 100}%` }}
            onMouseDown={handlePlayheadDrag}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-600 dark:bg-primary-500 rounded-full border-2 border-primary" />
          </div>
          <div
            className="absolute top-0 bottom-0 w-3 bg-primary-500 hover:bg-primary-600 cursor-ew-resize z-10 rounded-l"
            style={{ left: `${(videoState.startTime / videoState.duration) * 100}%` }}
            onMouseDown={(e) => handleTrimmerDrag(e, 'start')}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-primary-800 text-primary px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatTime(videoState.startTime)}
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-3 bg-primary-600 hover:bg-primary-700 cursor-ew-resize z-10 rounded-r"
            style={{ left: `calc(${(videoState.endTime / videoState.duration) * 100}% - 12px)` }}
            onMouseDown={(e) => handleTrimmerDrag(e, 'end')}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-primary-800 text-primary px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatTime(videoState.endTime)}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-secondary font-mono mt-1.5">
          <span>Start {formatTime(videoState.startTime)}</span>
          <span>End {formatTime(videoState.endTime)}</span>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={togglePlayPause}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {videoState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {videoState.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={resetTrim}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-tertiary border border-theme text-primary rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        {editorMode === 'easy' ? (
          <button
            type="button"
            onClick={handleQuickExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowExportSettings(true)}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Settings className="w-4 h-4" />
            Export options
          </button>
        )}
        <button
          type="button"
          onClick={onPublish}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Share2 className="w-4 h-4" />
          Publish
        </button>
      </div>

      {/* Keyboard shortcuts — Advanced: always; Easy: collapsible */}
      {(editorMode === 'advanced' || showShortcuts) && (
        <section className="bg-secondary rounded-xl border border-theme p-3" aria-label="Keyboard shortcuts">
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-sm font-semibold text-primary flex items-center gap-2 w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Shortcuts
            <span className="text-secondary font-normal text-xs">{showShortcuts ? 'Hide' : 'Show'}</span>
          </button>
          {showShortcuts && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs text-secondary">
              <div><kbd className="bg-tertiary border border-theme px-1.5 py-0.5 rounded text-primary">Space</kbd> Play/Pause</div>
              <div><kbd className="bg-tertiary border border-theme px-1.5 py-0.5 rounded text-primary">←/→</kbd> Seek</div>
              <div><kbd className="bg-tertiary border border-theme px-1.5 py-0.5 rounded text-primary">I/O</kbd> In/Out</div>
              <div><kbd className="bg-tertiary border border-theme px-1.5 py-0.5 rounded text-primary">R</kbd> Reset</div>
            </div>
          )}
        </section>
      )}

      {editorMode === 'easy' && !showShortcuts && (
        <button
          type="button"
          onClick={() => setShowShortcuts(true)}
          className="text-xs text-secondary hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          Show keyboard shortcuts
        </button>
      )}

      {/* Export settings modal (Advanced) */}
      {showExportSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title">
          <div className="bg-primary border border-theme rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 id="export-dialog-title" className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary-500" />
              Export settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Format</label>
                <select
                  value={exportSettings.format}
                  onChange={(e) => setExportSettings((p) => ({ ...p, format: e.target.value as ExportSettings['format'] }))}
                  className="w-full bg-secondary border border-theme text-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Quality</label>
                <select
                  value={exportSettings.quality}
                  onChange={(e) => setExportSettings((p) => ({ ...p, quality: e.target.value as ExportSettings['quality'] }))}
                  className="w-full bg-secondary border border-theme text-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Resolution</label>
                <select
                  value={exportSettings.resolution}
                  onChange={(e) => setExportSettings((p) => ({ ...p, resolution: e.target.value as ExportSettings['resolution'] }))}
                  className="w-full bg-secondary border border-theme text-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="original">Original</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Frame rate</label>
                <select
                  value={exportSettings.fps}
                  onChange={(e) => setExportSettings((p) => ({ ...p, fps: parseInt(e.target.value) as ExportSettings['fps'] }))}
                  className="w-full bg-secondary border border-theme text-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowExportSettings(false)}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-tertiary border border-theme text-primary rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowExportSettings(false); handleAdvancedExport(); }}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export progress */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="status" aria-live="polite" aria-busy="true">
          <div className="bg-primary border border-theme rounded-xl p-5 max-w-xs w-full">
            <p className="text-sm font-semibold text-primary text-center mb-3">Exporting…</p>
            <div className="w-full h-2 bg-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
            <p className="text-xs text-secondary text-center mt-2">{Math.round(exportProgress)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};
