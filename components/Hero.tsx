import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-20">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-luxury/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        {/* Kinetic Typography */}
        <h1 
          className="font-display text-[15vw] leading-[0.85] tracking-tight text-clip-gold select-none animate-fade-in"
          data-cursor="blob"
        >
          TIMELESS
        </h1>

        {/* Subtitle */}
        <div className="mt-8 overflow-hidden">
          <p className="font-script italic text-2xl md:text-3xl text-offwhite/90 animate-fade-in [animation-delay:300ms]">
            redefining luxury for the modern era.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 animate-fade-in [animation-delay:800ms]">
        <span className="font-body text-xs tracking-[0.2em] text-luxury/60 uppercase">
          Discover
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-luxury to-transparent" />
      </div>
    </section>
  );
};