import React from 'react';
import { PageHero } from './PageHero';
import { ArrowUpRight, CheckCircle, Clock, MapPin } from 'lucide-react';

const openings = [
  {
    title: "Master Watchmaker",
    department: "Atelier / Horology",
    location: "Geneva, Switzerland",
    type: "Full-time",
    description: "Seeking a visionary artisan with 10+ years of experience in high complications. You will be responsible for the assembly and finishing of our 'Midnight' caliber series."
  },
  {
    title: "Senior Gemologist",
    department: "Sourcing",
    location: "Antwerp, Belgium",
    type: "Full-time",
    description: "Curate the exceptional. We require an expert eye to source rare colored diamonds and untreated sapphires for our bespoke commissions."
  },
  {
    title: "Private Client Advisor",
    department: "Retail",
    location: "New York, USA",
    type: "Full-time",
    description: "Manage a portfolio of UHNW clients, providing an impeccable, high-touch service experience both in-boutique and remotely."
  },
  {
    title: "Digital Art Director",
    department: "Creative",
    location: "Paris, France",
    type: "Remote / Hybrid",
    description: "Shape the visual identity of AETERNA across all digital touchpoints. Must have a deep understanding of luxury aesthetics and minimal design."
  }
];

export const Careers: React.FC = () => {
  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="CAREERS" 
        subtitle="Join the artisans of eternity."
        bgImage="https://images.unsplash.com/photo-1503602642458-232111445857?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <h2 className="font-display text-4xl text-offwhite mb-6">The Pursuit of Perfection</h2>
            <div className="w-12 h-px bg-luxury mb-6"></div>
            <p className="font-body text-offwhite/60 leading-relaxed text-lg">
              At AETERNA, we believe that true luxury is human. It is the result of patience, passion, and an uncompromising attention to detail. We are always looking for individuals who share our devotion to the extraordinary.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-stone-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
              <CheckCircle className="text-luxury mb-4" size={24} />
              <h3 className="font-display text-xl text-offwhite mb-2">Heritage & Future</h3>
              <p className="font-body text-sm text-offwhite/50">Blending centuries-old techniques with avant-garde innovation.</p>
            </div>
            <div className="bg-stone-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
              <Clock className="text-luxury mb-4" size={24} />
              <h3 className="font-display text-xl text-offwhite mb-2">Timeless Pace</h3>
              <p className="font-body text-sm text-offwhite/50">We value quality over speed. Create work that lasts a lifetime.</p>
            </div>
          </div>
        </div>

        <h3 className="font-ui text-xs uppercase tracking-[0.2em] text-offwhite/40 mb-12">Current Openings</h3>

        <div className="space-y-6">
          {openings.map((job, index) => (
            <div 
              key={index}
              className="group relative bg-stone-900 border border-white/5 p-8 md:p-10 rounded-2xl hover:border-luxury/30 transition-all duration-500 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-ui text-[10px] uppercase tracking-widest text-luxury border border-luxury/20 px-2 py-1 rounded-full">
                      {job.department}
                    </span>
                    <span className="font-ui text-[10px] uppercase tracking-widest text-offwhite/40">
                      {job.type}
                    </span>
                  </div>
                  <h4 className="font-display text-2xl text-offwhite group-hover:text-luxury transition-colors mb-4">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-2 text-offwhite/50 text-xs uppercase tracking-wider mb-6">
                    <MapPin size={12} />
                    {job.location}
                  </div>
                  <p className="font-body text-offwhite/60 text-sm leading-relaxed max-w-2xl">
                    {job.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center mt-4 md:mt-0">
                  <span className="font-ui text-xs uppercase tracking-widest text-luxury opacity-0 transform -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 flex items-center gap-2 group/link">
                    Apply Now <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center border-t border-white/5 pt-12">
          <p className="font-body text-offwhite/60 mb-6">Don't see your role? We are always open to spontaneous applications.</p>
          <a href="mailto:careers@aeterna.com" className="inline-block font-ui text-luxury text-sm uppercase tracking-widest border-b border-luxury/30 pb-1 hover:text-white transition-colors">
            Contact Talent Acquisition
          </a>
        </div>
      </section>
    </div>
  );
};