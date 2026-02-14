import { Grid3x3, Play, Loader2, HardDrive } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '../router';
import type { ApiVideo } from '../lib/api';
import { ApiError, listVideos, resolveMediaUrl } from '../lib/api';

const LAZY_ROOT_MARGIN = '200px 0px 400px 0px'; // Load a bit above, more below for scroll

function useIntersectionObserver(
  rootMargin: string,
  threshold: number
): [ (el: HTMLElement | null) => void, boolean ] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [node, setNode] = useState<HTMLElement | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setEntry({ isIntersecting: true } as IntersectionObserverEntry);
      return () => {};
    }
    observer.current = new IntersectionObserver(
      ([e]) => setEntry(e),
      { rootMargin, threshold }
    );
    return () => {
      if (observer.current) observer.current.disconnect();
      observer.current = null;
    };
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (!observer.current || !node) return;
    observer.current.observe(node);
    return () => {
      if (observer.current) observer.current.unobserve(node);
    };
  }, [node]);

  return [setNode, !!entry?.isIntersecting];
}

function GalleryCard({
  video,
  isActive,
  onActivate,
  onPlayingRef,
}: {
  video: ApiVideo;
  isActive: boolean;
  onActivate: () => void;
  onPlayingRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const [containerRef, inView] = useIntersectionObserver(LAZY_ROOT_MARGIN, 0.1);
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (inView && !shouldLoad) setShouldLoad(true);
  }, [inView, shouldLoad]);

  const src = shouldLoad ? resolveMediaUrl(video.video_url) : '';
  const title = video.caption?.trim() || `Video #${video.id}`;

  const handlePlay = useCallback(() => {
    if (onPlayingRef.current && onPlayingRef.current !== videoRef.current) {
      onPlayingRef.current.pause();
    }
    onPlayingRef.current = videoRef.current;
    onActivate();
  }, [onActivate, onPlayingRef]);

  useEffect(() => {
    if (!isActive && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      if (onPlayingRef.current === videoRef.current) onPlayingRef.current = null;
    }
  }, [isActive, onPlayingRef]);

  return (
    <div ref={containerRef} className="group">
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-subtle-lg hover:shadow-subtle-xl transition-all duration-300 transform group-hover:scale-[1.02] bg-black">
        {shouldLoad ? (
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
            controls
            onPlay={handlePlay}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-900/80">
            <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Play className="w-14 h-14 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-outfit">
          {title}
        </h3>
        <p className="text-sm text-secondary">
          {video.view_count.toLocaleString()} views · {video.like_count.toLocaleString()} likes
        </p>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { navigate } = useRouter();
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const playingVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await listVideos();
        setVideos(resp.data ?? []);
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof ApiError) setError(e.message);
        else setError('Failed to load videos.');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const hasApiBase = !!(import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env?.VITE_API_BASE_URL;
  const hasMediaBase = !!(import.meta as unknown as { env?: { VITE_MEDIA_BASE_URL?: string } })?.env?.VITE_MEDIA_BASE_URL;
  const baseLabel = hasApiBase || hasMediaBase ? '' : ' HI';

  return (
    <div className="min-h-screen py-12 relative">
      {/* Full-screen loading overlay */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary/95 backdrop-blur-sm transition-opacity duration-300"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="w-12 h-12 text-[var(--accent-main)] animate-spin mb-4" aria-hidden />
          <p className="text-primary font-medium">Loading videos…</p>
          <p className="text-secondary text-sm mt-1">{baseLabel || 'Just a moment'}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Grid3x3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-3xl font-black text-primary font-outfit">Video Gallery</h1>
            </div>
            <button
              onClick={() => navigate('/local-videos')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-tertiary border border-theme transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]"
              aria-label="View local videos"
            >
              <HardDrive className="w-4 h-4 text-[var(--accent-main)]" />
              <span className="text-sm font-semibold text-primary">My Videos</span>
            </button>
          </div>
          <p className="text-secondary">Discover amazing videos from our community creators</p>
        </div>

        {!loading && error ? (
          <div className="rounded-xl border border-theme bg-secondary p-4 text-secondary">
            <div className="font-semibold text-primary mb-1">Couldn't load videos</div>
            <div className="text-sm">{error}{baseLabel}</div>
            <div className="text-xs text-tertiary mt-2">
              Expected endpoint: <span className="font-mono">GET /api/videos</span>
            </div>
          </div>
        ) : !loading && videos.length === 0 ? (
          <div className="text-secondary">No videos yet.</div>
        ) : !loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <GalleryCard
                key={video.id}
                video={video}
                isActive={activeVideoId === video.id}
                onActivate={() => setActiveVideoId(video.id)}
                onPlayingRef={playingVideoRef}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
