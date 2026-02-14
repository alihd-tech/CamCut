export interface VideoClip {
  id: string;
  name: string;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
  createdAt: Date;
  creator: string;
  format?: string;
  resolution?: string;
  fileSize?: number;
  thumbnail?: string;
}

export interface VideoState {
  file: File | null;
  url: string;
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
  isLoading: boolean;
  metadata?: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    codec: string;
    format: string;
  };
}

export interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'avi';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '480p' | '720p' | '1080p' | '4k' | 'original';
  fps: 24 | 30 | 60;
  bitrate?: number;
  audioQuality?: 'low' | 'medium' | 'high';
}

export interface TimelineMarker {
  time: number;
  label: string;
  type?: 'chapter' | 'bookmark' | 'cut';
}