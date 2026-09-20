import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollableCarousel: React.FC<ScrollableCarouselProps> = ({ children, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      // Small margin of error for mobile subpixel rendering
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 150);
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => checkScroll())
      : null;

    if (observer && scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300); // Check again after scrolling animation
    }
  };

  return (
    <div className="relative group">
      {/* Left Button Overlay */}
      {showLeft && (
        <div className="absolute left-0 top-0 bottom-0 hidden md:flex items-center z-10 pointer-events-none pb-4 sm:pb-0 px-2 sm:px-0">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto -ml-3 sm:-ml-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-accent hover:border-accent transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div 
        ref={scrollRef} 
        onScroll={checkScroll}
        className={`flex overflow-x-auto snap-x snap-mandatory no-scrollbar ${className}`}
      >
        {children}
      </div>

      {/* Right Button Overlay */}
      {showRight && (
        <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center z-10 pointer-events-none pb-4 sm:pb-0 px-2 sm:px-0">
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto -mr-3 sm:-mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-accent hover:border-accent transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 active:scale-95 animate-pulse-subtle cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Mobile-only Bottom Navigation Arrows */}
      {(showLeft || showRight) && (
        <div className="flex md:hidden items-center justify-center gap-2.5 mt-1 mb-1">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeft}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
              showLeft 
                ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 shadow-xs cursor-pointer' 
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800/50 text-neutral-300 dark:text-neutral-700 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            disabled={!showRight}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
              showRight 
                ? 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 shadow-xs cursor-pointer' 
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800/50 text-neutral-300 dark:text-neutral-700 opacity-40 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
