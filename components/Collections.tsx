import React from 'react';
import { PageHero } from './PageHero';
import { ArrowUpRight } from 'lucide-react';
import { ParallaxBackground } from './ParallaxBackground';

interface CollectionsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Collections: React.FC<CollectionsProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-void/50 animate-fade-in pt-24 md:pt-0 relative z-10">
      <PageHero 
        title="COLLECTIONS" 
        bgImage="src_images//collections.png"
      />
      
      <section className="py-20 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
          
          {/* Block 1: Timepieces (Large Square, Left) */}
          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-8 md:row-span-2 relative group overflow-hidden rounded-[2rem] border border-white/5 bg-stone-900 min-h-[400px] cursor-pointer hover:shadow-2xl hover:shadow-luxury/5 transition-all duration-700"
            data-hover="true"
          >
            <ParallaxBackground 
              src="src_images//royal_chrono.png" 
              alt="Timepieces"
              className="transition-transform duration-[1.2s] ease-out group-hover:scale-110 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end items-start transform transition-transform duration-700 group-hover:translate-x-2 z-10">
              <h2 className="font-display text-5xl md:text-6xl text-luxury mb-4 drop-shadow-lg transform transition-transform duration-500 group-hover:-translate-y-2">TIMEPIECES</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('shop'); }}
                className="font-ui font-semibold text-sm tracking-widest uppercase bg-luxury text-void px-8 py-4 rounded-lg hover:bg-white transition-all duration-300 flex items-center gap-2 transform group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
              >
                Explore Collection
              </button>
            </div>
          </div>

          {/* Block 2: Scents (Medium Rectangle, Top Right) */}
          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-4 relative group overflow-hidden rounded-[2rem] border border-white/5 bg-stone-900 min-h-[300px] cursor-pointer hover:shadow-xl hover:border-white/10 transition-all duration-500"
            data-hover="true"
          >
            <ParallaxBackground 
              src="src_images//channel_200.png" 
              alt="Scents"
              className="transition-transform duration-[1.2s] ease-out group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 pointer-events-none" />
            
            {/* Button Top Right */}
            <div className="absolute top-8 right-8 z-20">
                <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate('shop'); }}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 backdrop-blur-md hover:bg-luxury hover:text-void text-luxury group/btn"
                >
                    <ArrowUpRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
            </div>

            {/* Text Bottom */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                 <h2 className="font-display text-3xl text-offwhite group-hover:text-luxury transition-colors duration-300 transform group-hover:translate-x-1">SCENTS</h2>
            </div>
          </div>

          {/* Block 3: Adornments (Medium Rectangle, Bottom Right) */}
          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-4 relative group overflow-hidden rounded-[2rem] border border-white/5 bg-stone-900 min-h-[300px] cursor-pointer hover:shadow-xl hover:border-white/10 transition-all duration-500"
            data-hover="true"
          >
            <ParallaxBackground 
              src="src_images//pearl_white.png" 
              alt="Ornaments"
              className="transition-transform duration-[1.2s] ease-out group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/90 to-transparent pointer-events-none" />
            
            {/* Button Top Right */}
            <div className="absolute top-8 right-8 z-20">
                <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate('shop'); }}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 backdrop-blur-md hover:bg-luxury hover:text-void text-luxury group/btn"
                >
                    <ArrowUpRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
            </div>

            <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-2 z-10">
              <h2 className="font-display text-3xl text-offwhite mb-2 group-hover:text-luxury transition-colors duration-300">ADORNMENTS</h2>
              <p className="font-body text-sm text-offwhite/60 group-hover:text-offwhite/80 transition-colors">Gold & Precious Stones</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
