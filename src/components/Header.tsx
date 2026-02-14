import React, { useState, useEffect } from 'react';
import { Sun, Moon, Home, Wand2, Settings } from 'lucide-react';
import { useRouter } from '../router';

export const Header: React.FC = () => {
  const { navigate } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      // Default to dark theme when no preference is stored
      return true;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (isMenuOpen) {
      body.classList.add('overflow-hidden');
    } else {
      body.classList.remove('overflow-hidden');
    }
    return () => {
      body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMenu();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-theme bg-primary shadow-theme-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="relative flex justify-between items-center h-12 sm:h-14">
          {/* Left side - Menu Toggle */}
          <button
            className="p-1.5 rounded-md bg-secondary hover:bg-tertiary border border-theme transition-colors active:scale-95 flex items-center justify-center"
            aria-label="Open menu"
            onClick={openMenu}
            type="button"
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--accent-main)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Right side - Theme toggle */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md bg-secondary hover:bg-tertiary border border-theme transition-colors active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[var(--accent-main)]" />
              ) : (
                <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[var(--accent-main)]" />
              )}
            </button>
          </div>

          {/* Center - Logo (clickable) */}
            <button
            onClick={handleLogoClick}
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center p-1.5 rounded-md hover:bg-secondary transition-colors active:scale-95"
            aria-label="Go to home"
          >
            <img
              src={isDark ? '/logo.png' : '/logo-dark.png'}
              alt="CamCut Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
            />
          </button>
        </div>
      </div>
      {/* Fullscreen menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[color:rgba(7,10,15,0.96)]/90 dark:bg-[color:rgba(3,6,12,0.98)]/95 backdrop-blur-xl flex flex-col">
          {/* Close target area */}
          <div className="absolute inset-0" onClick={closeMenu} aria-hidden="true" />

          <div className="relative z-10 flex flex-col h-full max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
            {/* Top row with logo and close button */}
            <div className="flex items-center justify-between mb-10 sm:mb-12">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary/60 transition-colors active:scale-95"
              >
                <img
                  src={isDark ? '/logo.png' : '/logo-dark.png'}
                  alt="CamCut Logo"
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                /> 
              </button>

              <button
                onClick={closeMenu}
                className="p-2 rounded-full bg-secondary hover:bg-tertiary border border-theme transition-transform active:scale-95"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[var(--accent-main)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 flex flex-col justify-center gap-5 sm:gap-7">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 sm:mb-4">
                Main sections
              </p>
              <button
                onClick={() => handleNavigate('/')}
                className="group text-left rounded-xl px-3 py-3 sm:px-4 sm:py-4 hover:bg-secondary/60 hover:border-theme/80 border border-transparent transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary/80 border border-theme text-[var(--accent-main)] shadow-theme-sm transition-transform group-hover:scale-105">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-baseline gap-3 justify-start  text-left">
                      <span className="h-px w-8 bg-[var(--accent-main)]/70 group-hover:w-14 transition-all" />
                      <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground group-hover:text-[var(--accent-main)] transition-colors">
                        Home
                      </span>
                    </div>
                    <p className="mt-1 text-sm sm:text-base text-muted-foreground max-w-md">
                      Overview and quick access to all CamCut features.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('/studio')}
                className="group text-left rounded-xl px-3 py-3 sm:px-4 sm:py-4 hover:bg-secondary/60 hover:border-theme/80 border border-transparent transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary/80 border border-theme text-[var(--accent-main)] shadow-theme-sm transition-transform group-hover:scale-105">
                    <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-baseline gap-3 text-left">
                      <span className="h-px w-8 bg-[var(--accent-main)]/70 group-hover:w-14 transition-all" />
                      <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground group-hover:text-[var(--accent-main)] transition-colors">
                        Studio
                      </span>
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-main)]/10 text-[var(--accent-main)] border border-[var(--accent-main)]/40 uppercase tracking-[0.18em]">
                        Core
                      </span>
                    </div>
                    <p className="mt-1 text-sm sm:text-base text-muted-foreground max-w-md">
                      Open the editing studio to cut, trim, and fine‑tune your videos.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('/settings')}
                className="group text-left rounded-xl px-3 py-3 sm:px-4 sm:py-4 hover:bg-secondary/60 hover:border-theme/80 border border-transparent transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary/80 border border-theme text-[var(--accent-main)] shadow-theme-sm transition-transform group-hover:scale-105">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-baseline gap-3">
                      <span className="h-px w-8 bg-[var(--accent-main)]/70 group-hover:w-14 transition-all" />
                      <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground group-hover:text-[var(--accent-main)] transition-colors">
                        Settings
                      </span>
                    </div>
                    <p className="mt-1 text-sm sm:text-base text-muted-foreground max-w-md">
                      Adjust appearance, defaults, and advanced preferences.
                    </p>
                  </div>
                </div>
              </button>
            </nav>

            {/* Footer text */}
            <div className="mt-8 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} CamCut. All rights reserved.</span>
              <span className="hidden sm:inline">Crafted for fast, precise video cutting.</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};