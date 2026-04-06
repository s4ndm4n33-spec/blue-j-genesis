import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

export function Tooltip({ content, children, position = 'top', maxWidth = 260 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const GAP = 8;
    let top = 0, left = 0;
    if (position === 'top') {
      top = rect.top - GAP; left = rect.left + rect.width / 2;
    } else if (position === 'bottom') {
      top = rect.bottom + GAP; left = rect.left + rect.width / 2;
    } else if (position === 'left') {
      top = rect.top + rect.height / 2; left = rect.left - GAP;
    } else {
      top = rect.top + rect.height / 2; left = rect.right + GAP;
    }
    setCoords({ top, left });
  };

  const show = () => { updatePosition(); setVisible(true); };
  const hide = () => setVisible(false);

  // Dismiss on any touch/click elsewhere (handles stuck tooltip on mobile)
  useEffect(() => {
    if (!visible) return;
    const onOutside = (e: Event) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return;
      setVisible(false);
    };
    window.addEventListener('touchstart', onOutside, { passive: true });
    window.addEventListener('pointerdown', onOutside, { capture: true });
    return () => {
      window.removeEventListener('touchstart', onOutside);
      window.removeEventListener('pointerdown', onOutside, { capture: true });
    };
  }, [visible]);

  if (!content) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {visible && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform: position === 'top'
              ? 'translate(-50%, -100%)'
              : position === 'bottom'
              ? 'translate(-50%, 0)'
              : position === 'left'
              ? 'translate(-100%, -50%)'
              : 'translate(0, -50%)',
          }}
        >
          <div
            className="px-2.5 py-1.5 text-[0.65rem] font-mono bg-black/95 border border-primary/40 text-primary/90 rounded-sm shadow-xl shadow-black/60 leading-relaxed"
            style={{ maxWidth }}
          >
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
