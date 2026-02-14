import { useState, useCallback } from 'react';
import { VideoState, ExportOptions } from '../types/video';

export const useVideoEditor = () => {
  const [videoState, setVideoState] = useState<VideoState>({
    file: null,
    url: '',
    duration: 0,
    currentTime: 0,
    startTime: 0,
    endTime: 0,
    isPlaying: false,
    isLoading: false,
    metadata: undefined
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    fps: 30
  });

  // Enhanced video upload with format detection
  const handleVideoUpload = useCallback((file: File) => {
    setVideoState(prev => ({ ...prev, isLoading: true }));
    
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;

    video.onloadedmetadata = () => {
      const metadata = {
        width: video.videoWidth,
        height: video.videoHeight,
        fps: 30, // Default, would need more complex detection
        bitrate: 0, // Would need file analysis
        codec: 'Unknown',
        format: file.type
      };

      setVideoState(prev => ({
        ...prev,
        file,
        url,
        duration: video.duration,
        endTime: Math.min(video.duration, 6), // Default 6-second clip
        isLoading: false,
        metadata
      }));
    };

    video.onerror = () => {
      console.error('Failed to load video');
      setVideoState(prev => ({ ...prev, isLoading: false }));
    };
    
  }, []);

  const updateVideoState = useCallback((updates: Partial<VideoState>) => {
    setVideoState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateExportOptions = useCallback((updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  }, []);

  // Enhanced export with format support
  const handleExport = useCallback(async (customOptions?: Partial<ExportOptions>) => {
    const options = { ...exportOptions, ...customOptions };
    
    console.log('Exporting video clip:', {
      startTime: videoState.startTime,
      endTime: videoState.endTime,
      duration: videoState.endTime - videoState.startTime,
      exportOptions: options,
      metadata: videoState.metadata
    });
    
    // In a real app, this would trigger advanced video processing
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(`Export complete! Format: ${options.format}, Quality: ${options.quality}`);
        resolve(true);
      }, 2000);
    });
  }, [videoState, exportOptions]);

  // Enhanced publish with metadata
  const handlePublish = useCallback(() => {
    console.log('Publishing to Solana:', {
      startTime: videoState.startTime,
      endTime: videoState.endTime,
      duration: videoState.endTime - videoState.startTime,
      metadata: videoState.metadata,
      fileInfo: {
        name: videoState.file?.name,
        size: videoState.file?.size,
        type: videoState.file?.type
      }
    });
    // In a real app, this would interact with Solana
    alert('Publish functionality would upload enhanced clip metadata to Solana!');
  }, [videoState]);

  // Enhanced reset with cleanup
  const resetEditor = useCallback(() => {
    if (videoState.url) {
      URL.revokeObjectURL(videoState.url);
    }
    setVideoState({
      file: null,
      url: '',
      duration: 0,
      currentTime: 0,
      startTime: 0,
      endTime: 0,
      isPlaying: false,
      isLoading: false,
      metadata: undefined
    });
    
    // Reset export options to defaults
    setExportOptions({
      format: 'mp4',
      quality: 'high',
      resolution: '1080p',
      fps: 30
    });
  }, [videoState.url]);

  return {
    videoState,
    exportOptions,
    handleVideoUpload,
    updateVideoState,
    updateExportOptions,
    handleExport,
    handlePublish,
    resetEditor
  };
};