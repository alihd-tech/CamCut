import { Home, Film, Settings } from 'lucide-react';
import { useRouter } from '../router';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/studio', label: 'Studio', icon: Film },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNavigation() {
  const { currentRoute, navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const index = navItems.findIndex(item => item.path === currentRoute);
    setActiveIndex(index >= 0 ? index : 0);
  }, [currentRoute]);

  useEffect(() => {
    const item = itemRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!item || !indicator || !item.parentElement) return;

    const isDesktop = window.innerWidth >= 768;
    const itemRect = item.getBoundingClientRect();
    const containerRect = item.parentElement.getBoundingClientRect();

    const left = itemRect.left - containerRect.left;
    const width = itemRect.width;

    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;

    // slight visual tweak for desktop vs mobile
    indicator.style.top = isDesktop ? '6px' : '4px';
    indicator.style.bottom = isDesktop ? '6px' : '4px';
  }, [activeIndex]);

  const handleNav = (path: string, idx: number) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNav(path, idx);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      const next = Math.max(0, Math.min(navItems.length - 1, activeIndex + dir));
      if (next !== activeIndex) {
        handleNav(navItems[next].path, next);
        itemRefs.current[next]?.focus();
      }
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-md px-4 pb-5 md:px-6 md:pt-5 md:pb-6">
        <div className="relative bg-base-100/90 backdrop-blur-xl rounded-2xl border border-theme shadow-theme-lg">
          {/* Indicator */}
          <div
            ref={indicatorRef}
            className="absolute bg-base-200 rounded-xl transition-all duration-500 ease-out-expo shadow-sm pointer-events-none"
            style={{ left: 0, width: 0 }}
            aria-hidden
          />

          <div
            className={`
              relative flex items-center justify-around
              max-md:p-2 max-md:gap-1
              md:gap-2 md:p-3
            `}
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === activeIndex;

              return (
                <button
                  key={item.path}
                  ref={el => (itemRefs.current[idx] = el)}
                  type="button"
                  onClick={() => handleNav(item.path, idx)}
                  onKeyDown={e => handleKeyDown(e, item.path, idx)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`${item.label}${active ? ' (current)' : ''}`}
                  className={`
                    group relative flex items-center justify-center
                    transition-all duration-300 ease-out
                    focus-visible:ring-2 focus-visible:ring-accent-main focus:outline-none
                    active:scale-95
                    max-md:flex-col max-md:flex-1 max-md:min-w-0 max-md:py-3 max-md:px-3
                    md:gap-3 md:py-2 md:px-5 md:min-w-[110px]
                    ${active ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div
                    className={`transition-transform duration-300 ${
                      active ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  >
                    <Icon
                      className={`
                        transition-colors duration-300
                        ${active
                          ? 'text-base-content drop-shadow-sm'
                          : 'text-secondary group-hover:text-base-content'
                        }
                      `}
                      size={active ? 26 : 24}
                      strokeWidth={active ? 2.5 : 2}
                      aria-hidden
                    />
                  </div>

                  <span
                    className={`
                      font-medium transition-all duration-300
                      max-md:text-xs
                      md:text-sm
                      ${active
                        ? 'text-base-content drop-shadow-sm'
                        : 'text-secondary group-hover:text-base-content'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}