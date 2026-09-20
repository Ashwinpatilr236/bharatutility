import React, { useEffect, useState } from 'react';

export const AntigravityCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);

  useEffect(() => {
    // Only enable on fine pointer devices (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest('[data-antigravity-cursor]');
      if (interactiveEl) {
        const text = interactiveEl.getAttribute('data-antigravity-cursor');
        setCursorText(text || 'Explore');
      } else {
        setCursorText(null);
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
      setCursorText(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Smooth lerp follower
  useEffect(() => {
    if (!visible) return;

    let frameId: number;
    const lerp = () => {
      setPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        return {
          x: prev.x + dx * 0.2,
          y: prev.y + dy * 0.2,
        };
      });
      frameId = requestAnimationFrame(lerp);
    };

    frameId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(frameId);
  }, [visible, targetPos]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-opacity duration-200 hidden md:block"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
      }}
    >
      {cursorText ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 text-[11px] font-bold shadow-2xl backdrop-blur-md border border-neutral-700/40 dark:border-neutral-200/40 animate-in zoom-in-75 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>{cursorText}</span>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full border border-accent/40 bg-accent/10 backdrop-blur-[1px] transition-transform duration-100 ease-out flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </div>
      )}
    </div>
  );
};
