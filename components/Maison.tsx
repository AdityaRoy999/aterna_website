import React from 'react';
import { PageHero } from './PageHero';
import { ArrowUpRight } from 'lucide-react';
import { ParallaxBackground } from './ParallaxBackground';

import maisonBg from '../src_images/maison.png';

export const Maison: React.FC = () => {
  return (
    <div className="min-h-screen bg-void animate-fade-in pt-24 md:pt-0">
      <PageHero 
        title="THE MAISON" 
        subtitle="Crafting legacy since 1925."
        bgImage={maisonBg}
      />
      
      <section className="py-20 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Block 1: Our Heritage (Tall Vertical, Left) */}
          <div className="md:col-span-4 md:row-span-2 bg-white/5 rounded-[2rem] p-10 border border-white/5 flex flex-col justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 group">
            <h2 className="font-display text-4xl text-luxury mb-8 group-hover:translate-x-1 transition-transform duration-500">OUR HERITAGE</h2>
            <div className="space-y-6 font-body text-offwhite/70 leading-relaxed text-sm md:text-base group-hover:text-offwhite/90 transition-colors duration-500">
              <p>
                Founded in the heart of Europe, AETERNA began as a small collective of visionaries dedicated to the pursuit of absolute perfection. For over a century, we have remained steadfast in our commitment to traditional craftsmanship while embracing the avant-garde.
              </p>
              <p>
                Every piece that leaves our atelier is a testament to patience. We believe that true luxury cannot be rushed; it must be cultivated, nurtured, and refined until it transcends the material world to become an object of art.
              </p>
              <p>
                Today, AETERNA stands as a beacon of timeless elegance in a world of fleeting trends, redefining what it means to possess the extraordinary.
              </p>
            </div>
          </div>

          {/* Block 2: Workbench (Square, Top Right) */}
          <div className="md:col-span-4 min-h-[300px] relative overflow-hidden rounded-[2rem] border border-white/5 group cursor-pointer">
             <ParallaxBackground 
                src="https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1000&auto=format&fit=crop" 
                alt="Watchmaker Workbench"
                className="transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-void/20 group-hover:bg-void/0 transition-colors duration-700 pointer-events-none" />
          </div>

           {/* Decorative Filler - Material Detail */}
           <div className="md:col-span-4 min-h-[300px] relative overflow-hidden rounded-[2rem] border border-white/5 group cursor-pointer">
             <ParallaxBackground 
                src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop" 
                alt="Gold Texture"
                className="transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              <div className="absolute bottom-6 left-6 z-10">
                <span className="font-ui text-xs tracking-widest text-luxury uppercase bg-void/80 px-3 py-1 rounded-full backdrop-blur-md group-hover:bg-luxury group-hover:text-void transition-all duration-300">Raw Materials</span>
              </div>
          </div>

          {/* Block 3: Craftsmanship (Wide Horizontal, Bottom) */}
          <div className="md:col-span-8 bg-stone-900 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[300px] group hover:border-white/20 transition-colors duration-500">
             <div className="flex-1 p-10 flex flex-col justify-center relative z-10">
                <h2 className="font-display text-3xl text-offwhite mb-4">CRAFTSMANSHIP</h2>
                <p className="font-body text-offwhite/60 leading-relaxed mb-6">
                  Our master artisans dedicate thousands of hours to mastering a single technique. From the setting of a stone to the polishing of a caliber, no detail is too small to be ignored.
                </p>
                <a href="#" className="font-ui text-luxury text-sm uppercase tracking-widest hover:text-white transition-colors inline-flex items-center gap-2 group/link" data-hover="true">
                  View the Atelier <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </a>
             </div>
             <div className="flex-1 relative min-h-[250px] md:min-h-0 overflow-hidden">
                <ParallaxBackground 
                  src="https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=1000&auto=format&fit=crop" 
                  alt="Artisan Hands"
                  className="transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};