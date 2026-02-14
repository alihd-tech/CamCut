import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Scissors, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw, Zap } from 'lucide-react';
import { VideoData } from '../App';

interface VideoTrimmerProps {
  videoData: VideoData;
  onTrimComplete: (startTime: number, endTime: number) => void;
  onBack: () => void;
}

interface TimelineMarker {
  time: number;
  label: string;
}

function VideoTrimmer({ videoData, onTrimComplete, onBack }: VideoTrimmerProps) {
  const [startTime, setStartTime] = useState(videoData.startTime);
  const [endTime, setEndTime] = useState(Math.min(videoData.endTime, videoData.startTime + 6));
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
  const maxDuration = 6; // Maximum clip duration
  const minDuration = 3; // Minimum clip duration

  // Format time display (used in generateMarkers and JSX)
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    if (videoData.duration < 60) {
      return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [videoData.duration]);

  // Generate timeline markers for easier navigation
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

  // Snap to nearest marker if enabled
  const snapToNearestMarker = useCallback((time: number): number => {
    if (!snapToMarkers) return time;
    
    const threshold = 0.5; // 0.5 second snap threshold
    const nearestMarker = markers.find(marker => 
      Math.abs(marker.time - time) < threshold
    );
    
    return nearestMarker ? nearestMarker.time : time;
  }, [markers, snapToMarkers]);

  // Stable refs for keyboard handler to avoid stale closures
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const currentTimeRef = useRef(currentTime);
  startTimeRef.current = startTime;
  endTimeRef.current = endTime;
  currentTimeRef.current = currentTime;

  // Enhanced keyboard shortcuts
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

  // Video event handlers
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

  // Mouse drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      if (isDraggingStart || isDraggingEnd || isDraggingPlayhead) {
        const rect = timelineRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const visibleDuration = videoData.duration / zoomLevel;
        const visibleStart = timelineOffset;
        const newTime = visibleStart + (percent * visibleDuration);
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

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDraggingStart || isDraggingEnd) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const visibleDuration = videoData.duration / zoomLevel;
    const visibleStart = timelineOffset;
    const newTime = visibleStart + (percent * visibleDuration);
    
    seekTo(newTime);
  };

  const resetTrim = () => {
    setStartTime(0);
    setEndTime(Math.min(6, videoData.duration));
    seekTo(0);
  };

  const setOptimalClip = () => {
    const optimalDuration = 4; // 4 seconds is often ideal for social media
    const center = currentTime;
    const newStart = Math.max(0, center - optimalDuration / 2);
    const newEnd = Math.min(videoData.duration, newStart + optimalDuration);
    
    setStartTime(newStart);
    setEndTime(newEnd);
  };

  // Calculate timeline positions
  const visibleDuration = videoData.duration / zoomLevel;
  const visibleStart = timelineOffset;
  const visibleEnd = Math.min(videoData.duration, visibleStart + visibleDuration);
  
  const getTimelinePosition = (time: number) => {
    return ((time - visibleStart) / visibleDuration) * 100;
  };

  const startPercent = getTimelinePosition(startTime);
  const endPercent = getTimelinePosition(endTime);
  const currentPercent = getTimelinePosition(currentTime);

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Compact header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-primary font-outfit">Trim clip</h2>
            <p className="text-xs text-secondary">Set in/out points (3–6s)</p>
          </div>
        </div>
      </div>

      {/* Video player — compact */}
      <div className="relative group rounded-xl overflow-hidden bg-primary border border-theme">
        <video
          ref={videoRef}
          src={videoData.url}
          className="w-full aspect-video object-cover relative z-10"
          playsInline
          muted={isMuted}
          preload="metadata"
          aria-label="Video preview"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white gap-2">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={togglePlay} className="p-1.5 bg-black/60 hover:bg-black/80 rounded-lg" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button type="button" onClick={() => seekRelative(-5)} className="p-1 bg-black/60 hover:bg-black/80 rounded" aria-label="Rewind 5s"><SkipBack className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => seekRelative(5)} className="p-1 bg-black/60 hover:bg-black/80 rounded" aria-label="Forward 5s"><SkipForward className="w-3.5 h-3.5" /></button>
              <span className="text-[10px] font-mono bg-black/60 px-1.5 py-0.5 rounded">{formatTime(currentTime)} / {formatTime(videoData.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5 border-0" aria-label="Speed">
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              <button type="button" onClick={() => setIsMuted(!isMuted)} className="p-1 bg-black/60 hover:bg-black/80 rounded" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              {showVolumeSlider && (
                <div className="absolute right-0 bottom-full mb-1 bg-black/80 rounded p-2" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); setIsMuted(v === 0); }} className="w-16 h-1 accent-primary-500" aria-label="Volume" />
                </div>
              )}
            </div>
          </div>
        </div>
        <button type="button" onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-10 bg-transparent hover:bg-black/5 transition-colors">
          {!isPlaying && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/90 dark:bg-primary-800 rounded-full flex items-center justify-center border-2 border-theme shadow-md">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary ml-0.5" />
            </div>
          )}
        </button>
      </div>

      {/* Compact timeline */}
      <div className="bg-secondary rounded-xl p-4 border border-theme">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary">Timeline</span>
            <button type="button" onClick={() => setSnapToMarkers(!snapToMarkers)} className={`px-2 py-0.5 text-[10px] rounded ${snapToMarkers ? 'bg-primary-600 text-white' : 'bg-tertiary text-secondary border border-theme'}`}>Snap</button>
            <button type="button" onClick={() => setShowMarkers(!showMarkers)} className={`px-2 py-0.5 text-[10px] rounded ${showMarkers ? 'bg-primary-600 text-white' : 'bg-tertiary text-secondary border border-theme'}`}>Markers</button>
            <span className="text-[10px] text-secondary">Zoom</span>
            <input type="range" min="1" max="10" step="0.5" value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))} className="w-14 accent-primary-500" aria-label="Timeline zoom" />
            <span className="text-[10px] text-secondary w-6">{zoomLevel}x</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={setOptimalClip} className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-[10px] rounded flex items-center gap-1"><Zap className="w-2.5 h-2.5" />4s</button>
            <button type="button" onClick={resetTrim} className="px-2 py-1 bg-tertiary hover:bg-primary-200 dark:hover:bg-primary-800 text-primary border border-theme text-[10px] rounded flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" />Reset</button>
          </div>
        </div>

        {showMarkers && (
          <div className="relative h-4 mb-0.5">
            {markers.filter(m => m.time >= visibleStart && m.time <= visibleEnd).map(marker => (
              <div key={marker.time} className="absolute text-[10px] text-secondary font-mono -translate-x-1/2" style={{ left: `${getTimelinePosition(marker.time)}%` }}>{marker.label}</div>
            ))}
          </div>
        )}

        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          role="group"
          aria-label="Trim range — click to seek, drag handles to set in/out"
          className="relative h-11 bg-tertiary rounded-lg cursor-pointer overflow-hidden border border-theme"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-300/40 via-tertiary to-primary-300/40 dark:from-primary-700/30 dark:via-tertiary dark:to-primary-700/30" />
          {showMarkers && markers.filter(m => m.time >= visibleStart && m.time <= visibleEnd).map(marker => (
            <div key={`t-${marker.time}`} className="absolute top-0 bottom-0 w-px bg-primary-400/50 dark:bg-primary-600/50" style={{ left: `${getTimelinePosition(marker.time)}%` }} />
          ))}
          <div
            className="absolute top-0 h-full bg-primary-500/70 dark:bg-primary-600/70 border-x border-primary-400 dark:border-primary-500"
            style={{ left: `${Math.max(0, startPercent)}%`, right: `${Math.max(0, 100 - endPercent)}%` }}
          />
          <div className="absolute top-0 bottom-0 cursor-ew-resize z-30 flex items-center" style={{ left: `${startPercent}%` }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStart(true); }}>
            <div className="w-2.5 h-8 -translate-x-1/2 bg-primary-600 dark:bg-primary-500 rounded-sm border border-primary shadow-sm hover:scale-105 transition-transform" />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-primary-800 text-primary px-1 py-0.5 rounded opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none">Start {formatTime(startTime)}</span>
          </div>
          <div className="absolute top-0 bottom-0 cursor-ew-resize z-30 flex items-center" style={{ left: `${endPercent}%` }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingEnd(true); }}>
            <div className="w-2.5 h-8 -translate-x-1/2 bg-primary-600 dark:bg-primary-500 rounded-sm border border-primary shadow-sm hover:scale-105 transition-transform" />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-primary-800 text-primary px-1 py-0.5 rounded opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none">End {formatTime(endTime)}</span>
          </div>
          <div className="absolute top-0 bottom-0 cursor-ew-resize z-20 flex items-center" style={{ left: `${currentPercent}%` }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPlayhead(true); }}>
            <div className="w-0.5 h-full bg-primary-600 dark:bg-primary-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-600 dark:bg-primary-500 rounded-full border-2 border-primary" />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-primary-800 text-primary px-1 py-0.5 rounded opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none">{formatTime(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5 text-[10px] text-secondary">
          <span className={`font-mono font-semibold ${duration >= minDuration && duration <= maxDuration ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Duration {formatTime(duration)}</span>
          <span className="font-mono">{formatTime(startTime)} → {formatTime(endTime)}</span>
        </div>
      </div>

      {/* Shortcuts — collapsible */}
      <div className="bg-secondary rounded-lg border border-theme overflow-hidden">
        <button type="button" onClick={() => setShowShortcuts(!showShortcuts)} className="w-full px-3 py-2 text-left text-xs font-semibold text-primary flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
          Keyboard shortcuts
          <span className="text-secondary font-normal">{showShortcuts ? '−' : '+'}</span>
        </button>
        {showShortcuts && (
          <div className="px-3 pb-2 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-secondary">
            <div><kbd className="bg-tertiary border border-theme px-1 py-0.5 rounded text-primary">Space</kbd> Play</div>
            <div><kbd className="bg-tertiary border border-theme px-1 py-0.5 rounded text-primary">←/→</kbd> Seek</div>
            <div><kbd className="bg-tertiary border border-theme px-1 py-0.5 rounded text-primary">I/O</kbd> In/Out</div>
            <div><kbd className="bg-tertiary border border-theme px-1 py-0.5 rounded text-primary">M</kbd> Mute</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 px-4 py-2.5 bg-secondary hover:bg-tertiary border border-theme text-primary rounded-xl text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          Back
        </button>
        <button type="button" onClick={() => onTrimComplete(startTime, endTime)} disabled={duration < minDuration || duration > maxDuration} className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          Continue to text
        </button>
      </div>
    </div>
  );
}

export default VideoTrimmer;