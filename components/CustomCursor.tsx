import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isBlob, setIsBlob] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Target positions
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  
  // Current positions
  const dotX = useRef(0);
  const dotY = useRef(0);
  const ringX = useRef(0);
  const ringY = useRef(0);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
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
  }, [isVisible]);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Lerp for smooth movement
      // Dot follows quickly
      dotX.current += (mouseX.current - dotX.current) * 0.5;
      dotY.current += (mouseY.current - dotY.current) * 0.5;

      // Ring follows slowly
      ringX.current += (mouseX.current - ringX.current) * 0.15;
      ringY.current += (mouseY.current - ringY.current) * 0.15;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${dotX.current}px, ${dotY.current}px) translate(-50%, -50%)`;
      }
      
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${ringX.current}px, ${ringY.current}px) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Don't render on touch devices (basic check)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-exclusion">
      {/* Main Dot */}
      <div
        ref={cursorDotRef}
        className="absolute rounded-full bg-luxury will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: '8px',
          height: '8px',
          opacity: isVisible && !isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease-out'
        }}
      />
      
      {/* Outer Ring / Trail */}
      <div
        ref={cursorRingRef}
        className="absolute rounded-full border will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          height: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          backgroundColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.1)' : 'transparent'),
          borderColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.8)' : 'rgba(232, 207, 160, 0.3)'),
          opacity: isVisible ? (isBlob ? 0.8 : 1) : 0,
          transition: 'width 0.3s ease-out, height 0.3s ease-out, background-color 0.3s ease-out, border-color 0.3s ease-out, opacity 0.3s ease-out'
        }}
      />
    </div>
  );
};