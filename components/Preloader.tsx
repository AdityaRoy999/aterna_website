import React, { useEffect, useState } from 'react';

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Timeline of animation events
    const timer1 = setTimeout(() => setAnimationStep(1), 500); // Logo In
    const timer2 = setTimeout(() => setAnimationStep(2), 2000); // Text Reveal
    const timer3 = setTimeout(() => setAnimationStep(3), 3500); // Fade Out
    const timer4 = setTimeout(() => onComplete(), 4000); // Unmount

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center transition-opacity duration-1000 ease-out ${
        animationStep >= 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative overflow-hidden">
        <h1 
          className={`font-display text-5xl md:text-8xl text-luxury tracking-tighter transform transition-transform duration-[1.5s] ease-out ${
            animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0'
          }`}
        >
          AETERNA
        </h1>
      </div>
      
      <div className="h-px w-0 bg-luxury/30 mt-8 transition-all duration-[1s] ease-out"
           style={{ width: animationStep >= 2 ? '200px' : '0px' }} 
      />
      
      <div className="mt-4 overflow-hidden h-8">
        <p 
          className={`font-ui text-xs uppercase tracking-[0.3em] text-offwhite/50 transform transition-all duration-1000 delay-200 ${
            animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          Redefining Luxury
        </p>
      </div>
    </div>
  );
};