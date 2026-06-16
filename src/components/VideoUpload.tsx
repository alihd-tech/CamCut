import React, { useRef, useState } from 'react';
import { Upload, Video, ArrowLeft } from 'lucide-react'; 

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
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

function VideoUpload({ onVideoSelect, onBack }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!isVideoFile(file)) {
      setError('Please upload a valid video file. Supported formats: MP4, WebM, AVI, MOV, MKV, and more.');
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB. Please compress your video or choose a smaller file.');
      return;
    }

    onVideoSelect(file);
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
 
      </div>
  );
}

export default VideoUpload;
