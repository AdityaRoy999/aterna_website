import React, { useEffect, useRef } from 'react';

interface ParallaxBackgroundProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ 
  containerClassName = "",
  className = "",
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !imgWrapperRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      
      // Only animate if visible
      if (rect.bottom >= -100 && rect.top <= viewHeight + 100) {
        const distFromCenter = (rect.top + rect.height / 2) - (viewHeight / 2);
        // Parallax factor (negative moves against scroll for depth)
        const yPos = distFromCenter * -0.08; 
        
        imgWrapperRef.current.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 w-full h-full overflow-hidden ${containerClassName}`}>
      <div 
        ref={imgWrapperRef}
        className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform"
      >
        <img
          className={`w-full h-full object-cover ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
