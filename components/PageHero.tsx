import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  bgImage: string;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, bgImage, children }) => {
  return (
    <section className="relative h-[60vh] w-full flex flex-col justify-center items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img src={bgImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-void/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto mt-24 w-full">
        <h1 className="font-display text-4xl sm:text-5xl md:text-8xl text-luxury animate-fade-in tracking-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 font-script italic text-2xl md:text-3xl text-offwhite/90 animate-fade-in [animation-delay:200ms]">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-10 w-full flex justify-center animate-fade-in [animation-delay:400ms] relative z-20">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};