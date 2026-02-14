import { RouterProvider, useRouter } from './router';
import { SettingsProvider } from './contexts/SettingsContext';
import { Header } from './components/Header';
import Studio from './components/Studio';
import Landing from './components/Landing';
import Gallery from './components/Gallery';
import LocalVideos from './components/LocalVideos'; 
import About from './components/About';
import Settings from './components/Settings';
import BottomNavigation from './components/BottomNavigation';
import OfflineIndicator from './components/OfflineIndicator';
import { useEffect, useState } from 'react';

// File Handling API types
interface FileSystemFileHandle {
  getFile(): Promise<File>;
  name: string;
  kind: 'file' | 'directory';
}

interface LaunchParams {
  files: FileSystemFileHandle[];
}

interface LaunchQueue {
  setConsumer: (consumer: (launchParams: LaunchParams) => void) => void;
}

interface WindowWithLaunchQueue extends Window {
  launchQueue?: LaunchQueue;
}

export interface VideoData {
  file?: File;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
}

function AppContent() {
  const { currentRoute, navigate } = useRouter();
  const [openedFile, setOpenedFile] = useState<File | null>(null);

  // Handle file opening via File Handling API
  useEffect(() => {
    // Check if File Handling API is supported (Windows)
    const windowWithLaunchQueue = window as WindowWithLaunchQueue;
    if (windowWithLaunchQueue.launchQueue) {
      windowWithLaunchQueue.launchQueue.setConsumer((launchParams: LaunchParams) => {
        if (launchParams.files && launchParams.files.length > 0) {
          const fileHandle = launchParams.files[0];
          
          // Get the file from the file handle
          fileHandle.getFile().then((file: File) => {
            // Check if it's a video file
            if (file.type.startsWith('video/') || 
                /\.(mp4|mkv|webm|mov|avi|m4v|3gp|flv|wmv|ogv|mpeg|mpg)$/i.test(file.name)) {
              setOpenedFile(file);
              // Navigate to local-videos page to play the video
              navigate('/local-videos');
            }
          }).catch((error: Error) => {
            console.error('Error reading file:', error);
          });
        }
      });
    }

    // Also handle file opening via URL parameters (for other platforms)
    const urlParams = new URLSearchParams(window.location.search);
    const fileUrl = urlParams.get('file');
    if (fileUrl) {
      // Try to fetch and create a File object from the URL
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const fileName = fileUrl.split('/').pop() || 'video.mp4';
          const file = new File([blob], fileName, { type: blob.type });
          if (file.type.startsWith('video/') || 
              /\.(mp4|mkv|webm|mov|avi|m4v|3gp|flv|wmv|ogv|mpeg|mpg)$/i.test(file.name)) {
            setOpenedFile(file);
            navigate('/local-videos');
          }
        })
        .catch(error => {
          console.error('Error loading file from URL:', error);
        });
    }
  }, [navigate]);

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return <Landing />;
      case '/studio':
        return <Studio />;
      case '/gallery':
        return <Gallery />;
      case '/local-videos':
        return <LocalVideos openedFile={openedFile} onFileProcessed={() => setOpenedFile(null)} />;
      case '/about':
        return <About />;
      case '/settings':
        return <Settings />;
      default:
        return <Landing />;
    }
  };

  const isFullBleed = currentRoute === '/' || currentRoute === '/studio' || currentRoute === '/local-videos';

  return (
    <div className="app-root flex flex-col min-h-[100dvh] bg-base-100">
      {/* Skip to main content — visible when focused (keyboard/screen reader) */}
      <a
        href="#main-content"
        className="absolute left-[-9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-[var(--bg-secondary)] focus:text-[var(--text-primary)] focus:border focus:border-[var(--border-color)] focus:overflow-visible focus:shadow-theme-sm"
      >
        Skip to main content
      </a>

      <OfflineIndicator />
      <Header />

      <main
        id="main-content"
        role="main"
        className="flex-1 flex flex-col w-full max-w-full min-h-0 pb-safe"
      >
        <div
          className={
            isFullBleed
              ? 'flex-1 w-full'
              : 'container-app mx-auto w-full flex-1 pb-safe'
          }
        >
          {renderCurrentPage()}
        </div>
      </main>

      {currentRoute !== '/studio' && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider> 
        <SettingsProvider>
          <AppContent />
        </SettingsProvider> 
    </RouterProvider>
  );
}

export default App;