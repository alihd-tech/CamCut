import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Scissors,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Magnet,
  Ruler,
  ArrowRight,
} from 'lucide-react';
import { VideoData } from '../App';
import { useSettings } from '../contexts/SettingsContext';
import { TrimMethod } from './VideoConfigure';

interface VideoTrimmerProps {
  videoData: VideoData;
  trimMethod?: TrimMethod;
  onTrimComplete: (startTime: number, endTime: number) => void;
  onBack: () => void;
}

interface TimelineMarker {
  time: number;
  label: string;
}

function VideoTrimmer({ videoData, trimMethod = 'manual', onTrimComplete }: VideoTrimmerProps) {
  const { settings } = useSettings();

  const getQuickClipRange = useCallback(() => {
    const optimalDuration = settings.duration === 'long' ? 30 : 4;
    return {
      start: 0,
      end: Math.min(optimalDuration, videoData.duration),
    };
  }, [settings.duration, videoData.duration]);

  const getInitialEndTime = () => {
    if (trimMethod === 'quick') {
      return getQuickClipRange().end;
    }
    return Math.min(videoData.endTime, videoData.startTime + (settings.duration === 'long' ? 30 : 6));
  };

  const [startTime, setStartTime] = useState(trimMethod === 'quick' ? 0 : videoData.startTime);
  const [endTime, setEndTime] = useState(getInitialEndTime);
  const [currentTime, setCurrentTime] = useState(videoData.startTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelineOffset] = useState(0);
  const [showMarkers, setShowMarkers] = useState(true);
  const [snapToMarkers, setSnapToMarkers] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const duration = endTime - startTime;
  const maxDuration = settings.duration === 'long' ? 300 : 6;
  const minDuration = settings.duration === 'long' ? 10 : 3;
  const targetLabel = settings.duration === 'short' ? '3–6s' : '10s+';
  const optimalClipLabel = settings.duration === 'short' ? '4s clip' : '30s clip';

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    if (videoData.duration < 60) {
      return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [videoData.duration]);

  const generateMarkers = useCallback((): TimelineMarker[] => {
    const result: TimelineMarker[] = [];
    const totalDuration = videoData.duration;
    const interval = totalDuration > 60 ? 10 : totalDuration > 30 ? 5 : 1;
    for (let i = 0; i <= totalDuration; i += interval) {
      result.push({ time: i, label: formatTime(i) });
    }
    return result;
  }, [videoData.duration, formatTime]);

  const markers = useMemo(() => generateMarkers(), [generateMarkers]);

  const snapToNearestMarker = useCallback((time: number): number => {
    if (!snapToMarkers) return time;

    const threshold = 0.5;
    const nearestMarker = markers.find((marker) => Math.abs(marker.time - time) < threshold);

    return nearestMarker ? nearestMarker.time : time;
  }, [markers, snapToMarkers]);

  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const currentTimeRef = useRef(currentTime);
  startTimeRef.current = startTime;
  endTimeRef.current = endTime;
  currentTimeRef.current = currentTime;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || (e.target as HTMLElement).closest('button')) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
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
          seekTo(startTimeRef.current);
          break;
        case 'End':
          e.preventDefault();
          seekTo(endTimeRef.current);
          break;
        case 'i':
          e.preventDefault();
          setStartTime(currentTimeRef.current);
          break;
        case 'o':
          e.preventDefault();
          setEndTime(currentTimeRef.current);
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((m) => !m);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs used for latest values; adding togglePlay/seekTo/seekRelative would re-run every render
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      if (time >= endTime && isPlaying) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
      setCurrentTime(time);
    };

    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [startTime, endTime, isPlaying, volume, isMuted, playbackRate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      if (isDraggingStart || isDraggingEnd || isDraggingPlayhead) {
        const rect = timelineRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const visibleDuration = videoData.duration / zoomLevel;
        const visibleStart = timelineOffset;
        const newTime = visibleStart + percent * visibleDuration;
        const snappedTime = snapToNearestMarker(newTime);

        if (isDraggingStart) {
          const maxStart = Math.min(endTime - minDuration, videoData.duration - minDuration);
          setStartTime(Math.max(0, Math.min(snappedTime, maxStart)));
        } else if (isDraggingEnd) {
          const minEnd = Math.max(startTime + minDuration, minDuration);
          setEndTime(Math.min(videoData.duration, Math.max(snappedTime, minEnd)));
        } else if (isDraggingPlayhead) {
          seekTo(Math.max(startTime, Math.min(endTime, snappedTime)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingPlayhead(false);
    };

    if (isDraggingStart || isDraggingEnd || isDraggingPlayhead) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seekTo is stable in behavior; omit to avoid re-subscribing every render
  }, [isDraggingStart, isDraggingEnd, isDraggingPlayhead, startTime, endTime, videoData.duration, zoomLevel, timelineOffset, snapToNearestMarker]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clampedTime = Math.max(0, Math.min(videoData.duration, time));
    video.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  const seekRelative = (seconds: number) => {
    seekTo(currentTime + seconds);
  };

  useEffect(() => {
    if (trimMethod !== 'quick') return;
    const { start, end } = getQuickClipRange();
    setStartTime(start);
    setEndTime(end);
    seekTo(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply quick clip once when trimmer opens
  }, [trimMethod]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDraggingStart || isDraggingEnd) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const visibleDuration = videoData.duration / zoomLevel;
    const visibleStart = timelineOffset;
    const newTime = visibleStart + percent * visibleDuration;

    seekTo(newTime);
  };

  const resetTrim = () => {
    setStartTime(0);
    const defaultEnd = settings.duration === 'long' ? Math.min(30, videoData.duration) : Math.min(6, videoData.duration);
    setEndTime(defaultEnd);
    seekTo(0);
  };

  const setOptimalClip = () => {
    const optimalDuration = settings.duration === 'long' ? 30 : 4;
    const center = currentTime;
    const newStart = Math.max(0, center - optimalDuration / 2);
    const newEnd = Math.min(videoData.duration, newStart + optimalDuration);

    setStartTime(newStart);
    setEndTime(newEnd);
  };

  const handleContinue = () => {
    if (duration >= minDuration && duration <= maxDuration) {
      onTrimComplete(startTime, endTime);
    }
  };

  const visibleDuration = videoData.duration / zoomLevel;
  const visibleStart = timelineOffset;
  const visibleEnd = Math.min(videoData.duration, visibleStart + visibleDuration);

  const getTimelinePosition = (time: number) => {
    return ((time - visibleStart) / visibleDuration) * 100;
  };

  const startPercent = getTimelinePosition(startTime);
  const endPercent = getTimelinePosition(endTime);
  const currentPercent = getTimelinePosition(currentTime);

  const isValidDuration = duration >= minDuration && duration <= maxDuration;
  const isDragging = isDraggingStart || isDraggingEnd || isDraggingPlayhead;
  const durationProgress = Math.min(100, (duration / maxDuration) * 100);

  const playbackSpeeds = [0.25, 0.5, 1, 1.5, 2];

  return (
    <div className="space-y-5 sm:space-y-6" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-[var(--accent-main)]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-primary font-outfit tracking-tight">
                Trim your clip
              </h2>
              {trimMethod === 'quick' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-main)]/10 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                  <Zap className="w-3 h-3" />
                  Quick clip
                </span>
              )}
            </div>
            <p className="text-sm text-secondary mt-1 leading-relaxed">
              Drag the handles on the timeline or use{' '}
              <kbd className="px-1 py-0.5 rounded bg-tertiary border border-theme text-[11px] font-mono text-primary">
                I
              </kbd>{' '}
              /{' '}
              <kbd className="px-1 py-0.5 rounded bg-tertiary border border-theme text-[11px] font-mono text-primary">
                O
              </kbd>{' '}
              to set in and out points. Target length: {targetLabel}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!isValidDuration}
          className="w-full sm:w-auto px-5 py-2.5 bg-[var(--accent-main)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--accent-contrast)] rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] shadow-theme-md touch-target"
        >
          <Check className="w-4 h-4" />
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 opacity-80" />
        </button>
      </div>

      {/* In / Out / Duration stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-theme bg-secondary p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary mb-1">In point</p>
          <p className="text-lg font-mono font-semibold text-primary tabular-nums">{formatTime(startTime)}</p>
          <button
            type="button"
            onClick={() => setStartTime(currentTime)}
            className="mt-2 text-xs font-medium text-[var(--accent-main)] hover:opacity-80 transition-opacity"
          >
            Set to playhead
          </button>
        </div>
        <div className="rounded-xl border border-theme bg-secondary p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary mb-1">Out point</p>
          <p className="text-lg font-mono font-semibold text-primary tabular-nums">{formatTime(endTime)}</p>
          <button
            type="button"
            onClick={() => setEndTime(currentTime)}
            className="mt-2 text-xs font-medium text-[var(--accent-main)] hover:opacity-80 transition-opacity"
          >
            Set to playhead
          </button>
        </div>
        <div
          className={`rounded-xl border p-3.5 sm:p-4 ${
            isValidDuration
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-red-500/30 bg-red-500/5'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary mb-1">Selection</p>
          <p
            className={`text-lg font-mono font-semibold tabular-nums ${
              isValidDuration ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatTime(duration)}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-tertiary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isValidDuration ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${durationProgress}%` }}
            />
          </div>
          {!isValidDuration && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {duration < minDuration ? `Minimum ${targetLabel} required` : `Maximum ${maxDuration}s exceeded`}
            </p>
          )}
        </div>
      </div>

      {/* Video player */}
      <div className="rounded-2xl overflow-hidden border border-theme bg-primary shadow-theme-lg">
        <div className="relative group bg-black">
          <video
            ref={videoRef}
            src={videoData.url}
            className="w-full aspect-video object-contain"
            playsInline
            muted={isMuted}
            preload="metadata"
            aria-label="Video preview"
          />

          {/* Center play overlay */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 hover:bg-black/30 transition-colors"
              aria-label="Play"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 dark:bg-white/90 flex items-center justify-center shadow-theme-lg ring-4 ring-white/20">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-900 ml-1" />
              </div>
            </button>
          )}

          {isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label="Pause"
            />
          )}
        </div>

        {/* Control bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-secondary border-t border-theme">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={togglePlay}
              className="touch-target flex items-center justify-center w-9 h-9 rounded-lg bg-primary border border-theme hover:border-[var(--accent-main)]/40 text-primary transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => seekRelative(-5)}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-tertiary text-secondary hover:text-primary transition-colors"
              aria-label="Rewind 5 seconds"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => seekRelative(5)}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-tertiary text-secondary hover:text-primary transition-colors"
              aria-label="Forward 5 seconds"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary border border-theme font-mono text-xs sm:text-sm tabular-nums text-primary">
            <span className="font-semibold text-[var(--accent-main)]">{formatTime(currentTime)}</span>
            <span className="text-tertiary">/</span>
            <span className="text-secondary">{formatTime(videoData.duration)}</span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <div className="hidden sm:flex items-center rounded-lg border border-theme bg-primary p-0.5">
              {playbackSpeeds.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    playbackRate === speed
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-theme-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="sm:hidden bg-primary text-primary text-xs rounded-lg px-2 py-1.5 border border-theme"
              aria-label="Playback speed"
            >
              {playbackSpeeds.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>

            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-tertiary text-secondary hover:text-primary transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {showVolumeSlider && (
                <div className="absolute right-0 bottom-full mb-2 px-3 py-2 rounded-xl bg-primary border border-theme shadow-theme-md">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      setIsMuted(v === 0);
                    }}
                    className="w-20 h-1 accent-[var(--accent-main)]"
                    aria-label="Volume"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline editor */}
      <div className="rounded-2xl border border-theme bg-secondary p-4 sm:p-5 shadow-theme-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[var(--accent-main)]" />
            <span className="text-sm font-semibold text-primary">Timeline</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-theme bg-primary p-0.5">
              <button
                type="button"
                onClick={() => setSnapToMarkers(!snapToMarkers)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  snapToMarkers
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-theme-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Magnet className="w-3.5 h-3.5" />
                Snap
              </button>
              <button
                type="button"
                onClick={() => setShowMarkers(!showMarkers)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                  showMarkers
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-theme-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Markers
              </button>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-theme bg-primary">
              <span className="text-xs text-secondary whitespace-nowrap">Zoom</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 accent-[var(--accent-main)]"
                aria-label="Timeline zoom"
              />
              <span className="text-xs font-mono font-semibold text-primary w-7">{zoomLevel}x</span>
            </div>

            <button
              type="button"
              onClick={setOptimalClip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-main)] hover:opacity-90 text-[var(--accent-contrast)] text-xs font-semibold transition-all shadow-theme-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              {optimalClipLabel}
            </button>
            <button
              type="button"
              onClick={resetTrim}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-tertiary text-primary border border-theme text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Time ruler */}
        {showMarkers && (
          <div className="relative h-5 mb-1 select-none">
            {markers
              .filter((m) => m.time >= visibleStart && m.time <= visibleEnd)
              .map((marker) => (
                <div
                  key={marker.time}
                  className="absolute text-[10px] sm:text-[11px] text-tertiary font-mono -translate-x-1/2 tabular-nums"
                  style={{ left: `${getTimelinePosition(marker.time)}%` }}
                >
                  {marker.label}
                </div>
              ))}
          </div>
        )}

        {/* Track */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          role="group"
          aria-label="Trim range — click to seek, drag handles to set in/out"
          className={`relative h-14 sm:h-16 rounded-xl cursor-pointer overflow-hidden border transition-shadow ${
            isDragging ? 'border-[var(--accent-main)] shadow-theme-md ring-2 ring-[var(--accent-main)]/20' : 'border-theme'
          }`}
        >
          {/* Base track */}
          <div className="absolute inset-0 bg-tertiary" />

          {/* Subtle film-strip texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px)',
            }}
          />

          {/* Marker ticks */}
          {showMarkers &&
            markers
              .filter((m) => m.time >= visibleStart && m.time <= visibleEnd)
              .map((marker) => (
                <div
                  key={`t-${marker.time}`}
                  className="absolute top-0 bottom-0 w-px bg-border-strong/40"
                  style={{ left: `${getTimelinePosition(marker.time)}%` }}
                />
              ))}

          {/* Dimmed regions outside selection */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-black/45 dark:bg-black/55 backdrop-blur-[1px]"
            style={{ width: `${Math.max(0, startPercent)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 bg-black/45 dark:bg-black/55 backdrop-blur-[1px]"
            style={{ width: `${Math.max(0, 100 - endPercent)}%` }}
          />

          {/* Selected region */}
          <div
            className="absolute top-0 h-full bg-[var(--accent-main)]/25 border-y-2 border-[var(--accent-main)]"
            style={{
              left: `${Math.max(0, startPercent)}%`,
              right: `${Math.max(0, 100 - endPercent)}%`,
            }}
          />

          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 cursor-ew-resize z-30 flex items-center group/handle"
            style={{ left: `${startPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingStart(true);
            }}
          >
            <div className="relative -translate-x-1/2 flex flex-col items-center">
              <span
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold whitespace-nowrap px-2 py-0.5 rounded-md bg-primary border border-theme shadow-theme-sm transition-opacity ${
                  isDraggingStart ? 'opacity-100' : 'opacity-0 group-hover/handle:opacity-100'
                }`}
              >
                In {formatTime(startTime)}
              </span>
              <div className="w-1 h-full bg-[var(--accent-main)]" />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-10 rounded-md bg-[var(--accent-main)] border-2 border-[var(--accent-contrast)]/30 shadow-theme-md flex items-center justify-center">
                <div className="flex flex-col gap-0.5">
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                </div>
              </div>
            </div>
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 cursor-ew-resize z-30 flex items-center group/handle"
            style={{ left: `${endPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingEnd(true);
            }}
          >
            <div className="relative -translate-x-1/2 flex flex-col items-center">
              <span
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold whitespace-nowrap px-2 py-0.5 rounded-md bg-primary border border-theme shadow-theme-sm transition-opacity ${
                  isDraggingEnd ? 'opacity-100' : 'opacity-0 group-hover/handle:opacity-100'
                }`}
              >
                Out {formatTime(endTime)}
              </span>
              <div className="w-1 h-full bg-[var(--accent-main)]" />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-10 rounded-md bg-[var(--accent-main)] border-2 border-[var(--accent-contrast)]/30 shadow-theme-md flex items-center justify-center">
                <div className="flex flex-col gap-0.5">
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                  <div className="w-0.5 h-0.5 rounded-full bg-[var(--accent-contrast)]/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 cursor-ew-resize z-20 pointer-events-auto group/playhead"
            style={{ left: `${currentPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingPlayhead(true);
            }}
          >
            <div className="relative -translate-x-1/2 h-full flex flex-col items-center">
              <span
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold whitespace-nowrap px-2 py-0.5 rounded-md bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-theme-sm transition-opacity ${
                  isDraggingPlayhead ? 'opacity-100' : 'opacity-0 group-hover/playhead:opacity-100'
                }`}
              >
                {formatTime(currentTime)}
              </span>
              <div className="w-0.5 h-full bg-primary shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
              <div className="absolute top-0 w-3 h-3 -translate-y-0.5 rotate-45 bg-primary border border-theme shadow-theme-sm" />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-secondary text-center sm:text-left">
          Click the track to seek · Drag orange handles for in/out · Playhead scrubs within the selection
        </p>
      </div>

      {/* Keyboard shortcuts */}
      <div className="rounded-xl border border-theme bg-secondary overflow-hidden">
        <button
          type="button"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="w-full px-4 py-3 text-left text-sm font-semibold text-primary flex items-center justify-between hover:bg-tertiary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-main)]"
        >
          <span>Keyboard shortcuts</span>
          {showShortcuts ? (
            <ChevronUp className="w-4 h-4 text-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-secondary" />
          )}
        </button>
        {showShortcuts && (
          <div className="px-4 pb-4 pt-0 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-theme">
            {[
              { keys: 'Space', action: 'Play / Pause' },
              { keys: '← / →', action: 'Seek ±1s' },
              { keys: 'Shift + ←/→', action: 'Seek ±5s' },
              { keys: 'Home / End', action: 'Jump to in/out' },
              { keys: 'I / O', action: 'Set in / out point' },
              { keys: 'M', action: 'Toggle mute' },
            ].map(({ keys, action }) => (
              <div key={keys} className="flex items-center gap-2 pt-3">
                <kbd className="flex-shrink-0 px-2 py-1 rounded-md bg-primary border border-theme text-[11px] font-mono font-semibold text-primary shadow-theme-sm">
                  {keys}
                </kbd>
                <span className="text-xs text-secondary">{action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoTrimmer;
