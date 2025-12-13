import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isBlob, setIsBlob] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use refs for state accessed inside the event listener to avoid re-binding
  const isHoveringRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      // Direct DOM manipulation for performance
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(${isHoveringRef.current ? 0 : 1})`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for blob trigger
      if (target.closest('[data-cursor="blob"]')) {
        setIsBlob(true);
        setIsHovering(true);
        return;
      } else {
        setIsBlob(false);
      }

      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.dataset.hover === 'true'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible]); // Removed isHovering dependency, now using ref

  // Don't render on touch devices (basic check)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-exclusion">
      {/* Main Dot */}
      <div
        ref={cursorDotRef}
        className="absolute rounded-full bg-luxury transition-transform duration-100 ease-out will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: '8px',
          height: '8px',
          // Initial transform
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Outer Ring / Trail */}
      <div
        ref={cursorRingRef}
        className="absolute rounded-full border border-luxury transition-all duration-300 ease-out will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          height: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          // Initial transform
          transform: 'translate(-50%, -50%)',
          backgroundColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.1)' : 'transparent'),
          borderColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.8)' : 'rgba(232, 207, 160, 0.3)'),
          opacity: isBlob ? 0.8 : 1,
        }}
      />
    </div>
  );
};