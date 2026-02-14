import React, { useEffect, useState } from 'react';
import { Video, Play, Trash2, Loader2, HardDrive, Grid3x3 } from 'lucide-react';
import { useRouter } from '../router';
import { listVideos, StoredVideoMeta } from '../utils/videoStorage';
import VideoPlayer from './VideoPlayer';
import { deleteVideo } from '../utils/videoStorage';

interface StoredVideo {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  duration: number;
  uploadedAt: number;
  metadata?: {
    width: number;
    height: number;
    fps: number;
  };
}

interface LocalVideosProps {
  openedFile?: File | null;
  onFileProcessed?: () => void;
}

export default function LocalVideos({ openedFile, onFileProcessed }: LocalVideosProps = {}) {
  const { navigate } = useRouter();
  const [videos, setVideos] = useState<StoredVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<StoredVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  // Handle opened file from file handler
  useEffect(() => {
    if (openedFile) {
      const handleOpenedFile = async () => {
        try {
          // Create a URL for the file
          const fileUrl = URL.createObjectURL(openedFile);
          
          // Get video duration
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = fileUrl;
          
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              video.currentTime = 0.1; // Seek to get duration
            };
            video.onseeked = () => {
              resolve(undefined);
            };
            video.onerror = reject;
          });

          const duration = video.duration || 0;
          
          // Create a StoredVideo object for the opened file
          const videoData: StoredVideo = {
            id: `opened-${Date.now()}`,
            file: openedFile,
            url: fileUrl,
            name: openedFile.name,
            size: openedFile.size,
            type: openedFile.type,
            duration: duration,
            uploadedAt: Date.now()
          };

          // Automatically select and play the opened video
          setSelectedVideo(videoData);
          
          // Notify parent that file has been processed
          if (onFileProcessed) {
            onFileProcessed();
          }
        } catch (error) {
          console.error('Error processing opened file:', error);
          alert('Failed to open video file. Please try again.');
          if (onFileProcessed) {
            onFileProcessed();
          }
        }
      };

      handleOpenedFile();
    }
  }, [openedFile, onFileProcessed]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const storedVideos = await listVideos();
      // Sort by upload date, newest first
      storedVideos.sort((a: StoredVideoMeta, b: StoredVideoMeta) => b.createdAt - a.createdAt);
      setVideos(storedVideos.map((video) => ({
        id: video.id,
        file: new File([], video.name, { type: video.type }),
        url: '',
        name: video.name,
        size: video.size,
        type: video.type,
        duration: 0,
        uploadedAt: video.createdAt
      })));
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteVideo(id);
      setVideos(videos.filter((v) => v.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--accent-main)] animate-spin mx-auto mb-4" />
          <p className="text-primary font-medium">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="min-h-screen py-4">
        <div className="container-app mx-auto">
          <VideoPlayer
            videoUrl={selectedVideo.url}
            videoName={selectedVideo.name}
            onClose={() => setSelectedVideo(null)}
            autoPlay={true}
            className="w-full aspect-video"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-app mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-8 h-8 text-[var(--accent-main)]" />
              <h1 className="text-3xl font-black text-primary font-outfit">My Videos</h1>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-tertiary border border-theme transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]"
              aria-label="View gallery"
            >
              <Grid3x3 className="w-4 h-4 text-[var(--accent-main)]" />
              <span className="text-sm font-semibold text-primary">Gallery</span>
            </button>
          </div>
          <p className="text-secondary">
            Videos stored on your device for offline playback
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-primary font-semibold mb-2">No videos stored yet</p>
            <p className="text-secondary text-sm">
              Upload videos in the Studio to store them locally for offline playback
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative bg-secondary border border-theme rounded-xl overflow-hidden shadow-theme-sm hover:shadow-theme-md transition-all cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-black">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-primary mb-2 truncate font-outfit">
                    {video.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>{formatFileSize(video.size)}</span>
                    <span>{formatDate(video.uploadedAt)}</span>
                  </div>
                  {video.metadata && (
                    <div className="mt-2 text-xs text-tertiary">
                      {video.metadata.width} × {video.metadata.height}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(video.id, e)}
                  disabled={deletingId === video.id}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/70 hover:bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                  aria-label="Delete video"
                >
                  {deletingId === video.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

