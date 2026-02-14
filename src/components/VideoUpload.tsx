import React, { useRef, useState } from 'react';
import { Upload, Video, Zap, ArrowLeft } from 'lucide-react'; 

interface VideoUploadProps {
  onVideoUpload: (file: File, url: string, duration: number) => void;
  onBack?: () => void;
}

const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'video/x-msvideo',
  'video/3gpp',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/mkv',
  'video/x-matroska'
];

const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const isVideoFile = (file: File) => {
  const extension = getFileExtension(file.name);
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'qt', '3gp', 'flv', 'wmv', 'mkv', 'm4v', 'mpg', 'mpeg'];
  
  return SUPPORTED_VIDEO_FORMATS.includes(file.type) || videoExtensions.includes(extension);
};

function VideoUpload({ onVideoUpload, onBack }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    setIsProcessing(true);

    if (!isVideoFile(file)) {
      setError('Please upload a valid video file. Supported formats: MP4, WebM, AVI, MOV, MKV, and more.');
      setIsProcessing(false);
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB. Please compress your video or choose a smaller file.');
      setIsProcessing(false);
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;

    video.onloadedmetadata = async () => {
      if (video.duration < 3) {
        setError('Video must be at least 3 seconds long.');
        setIsProcessing(false);
        URL.revokeObjectURL(url);
        return;
      }

      setIsProcessing(false);
      onVideoUpload(file, url, video.duration);
    };

    video.onerror = () => {
      setError('Failed to load video. Please ensure the file is not corrupted and try again.');
      setIsProcessing(false);
      URL.revokeObjectURL(url);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {(onBack != null) && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-md bg-secondary hover:bg-tertiary border border-theme touch-target flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]"
            aria-label="Back to source selection"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary font-outfit">Upload Your Video</h2>
            <p className="text-secondary text-sm">Choose a video to transform into a clip</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
          <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-main)]" />
          Upload Your Video
        </h2>
        <p className="text-secondary text-sm sm:text-base">Choose a video to transform into a meme clip</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-8 sm:p-12 transition-all cursor-pointer overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2 bg-secondary border-theme hover:border-[var(--accent-main)] ${isDragging ? 'border-[var(--accent-main)] bg-tertiary scale-[1.01]' : ''}`}
      >

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.webm,.ogg,.avi,.mov,.qt,.3gp,.flv,.wmv,.mkv,.m4v,.mpg,.mpeg"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden
        />

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm text-white p-3 rounded-xl text-sm font-medium z-20" role="alert">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 rounded-lg sm:rounded-xl" aria-busy="true">
            <div className="bg-primary rounded-lg p-5 text-center border border-theme shadow-theme-md">
              <div className="w-7 h-7 border-2 border-[var(--accent-main)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-primary font-semibold">Processing video...</p>
              <p className="text-secondary text-sm mt-1">This may take a moment</p>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-tertiary border border-theme flex items-center justify-center">
            <Video className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--accent-main)]" />
          </div>

          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {isDragging ? 'Drop your video here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-secondary">
              MP4, WebM, AVI, MOV, MKV, and more (Max 100MB)
            </p>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 bg-[var(--accent-main)] text-[var(--accent-contrast)] rounded-lg font-semibold transition-all shadow-theme-md hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Video File
          </button>
        </div>
      </div>

      <div className="bg-secondary border border-theme rounded-lg p-4 sm:p-5 shadow-theme-sm">
        <h3 className="text-primary font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
          Pro Tips for Best Results
        </h3>
        <ul className="space-y-2 text-secondary text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-main)] font-semibold flex-shrink-0 text-xs">1</span>
              <span>Supports all major video formats (MP4, WebM, AVI, MOV, MKV, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-main)] font-semibold flex-shrink-0 text-xs">2</span>
              <span>Videos must be at least 3 seconds long</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent-main)] font-semibold flex-shrink-0 text-xs">3</span>
              <span>High-quality videos produce better results</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent-main)] font-semibold flex-shrink-0 text-xs">4</span>
              <span>Professional trimming tools for precise editing</span>
            </li>
          </ul>
        </div>
      </div>
  );
}

export default VideoUpload;
