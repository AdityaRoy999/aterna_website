import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isBlob, setIsBlob] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
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

  // Don't render on touch devices (basic check)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-exclusion">
      {/* Main Dot */}
      <div
        className="absolute rounded-full bg-luxury transition-transform duration-100 ease-out"
        style={{
          left: position.x,
          top: position.y,
          width: '8px',
          height: '8px',
          transform: `translate(-50%, -50%) scale(${isHovering ? 0 : 1})`,
        }}
      />
      
      {/* Outer Ring / Trail */}
      <div
        className="absolute rounded-full border border-luxury transition-all duration-300 ease-out"
        style={{
          left: position.x,
          top: position.y,
          width: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          height: isBlob ? '100px' : (isHovering ? '64px' : '32px'),
          transform: `translate(-50%, -50%)`,
          backgroundColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.1)' : 'transparent'),
          borderColor: isBlob ? '#E8CFA0' : (isHovering ? 'rgba(232, 207, 160, 0.8)' : 'rgba(232, 207, 160, 0.3)'),
          opacity: isBlob ? 0.8 : 1,
        }}
      />
    </div>
  );
};