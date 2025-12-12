import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PageHero } from './PageHero';
import { ArrowUpRight, ArrowLeft, Calendar, Share2, Clock } from 'lucide-react';
import { ParallaxBackground } from './ParallaxBackground';

// --- Types ---
interface Article {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  category: string;
  imageUrl: string;
  excerpt: string;
  author?: string;
  readTime?: string;
  content: React.ReactNode;
  isFeatured?: boolean;
}

// --- Mock Content Data ---
const allArticles: Article[] = [
  {
    id: 'featured-1',
    title: 'The Art of Slow Luxury',
    subtitle: '"In a world of instant gratification, we explore the quiet power of waiting."',
    date: 'October 12, 2025',
    category: 'Featured',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1500&auto=format&fit=crop',
    excerpt: 'True luxury is not about excess, but about the absence of noise. We sit down with ceramicist Elena Vora to discuss how the passage of time influences her creative process.',
    author: 'Isabella Ross',
    readTime: '6 min read',
    isFeatured: true,
    content: (
      <>
        <p className="first-letter:text-7xl first-letter:font-display first-letter:text-luxury first-letter:float-left first-letter:mr-4 first-letter:mt-[-10px] first-letter:leading-none">
          True luxury is not about excess, but about the absence of noise. In an age where digital notifications compete for our attention every second, the ability to pause, reflect, and appreciate the minute details of craftsmanship has become the ultimate rarity.
        </p>
        <p className="mt-6">
          We sit down with ceramicist Elena Vora to discuss how the passage of time influences her creative process. "Clay has a memory," she tells us from her sun-drenched studio in Provence. "If you rush it, it remembers. It cracks. It fails. You must breathe with it."
        </p>
        <blockquote className="font-script italic text-3xl md:text-4xl text-luxury border-l-2 border-luxury pl-8 my-12 leading-tight">
          "Perfection is a machine's goal. Character is the human goal. The flaw is where the soul enters."
        </blockquote>
        <p className="mt-6">
          This philosophy mirrors our own approach at AETERNA. Whether it's the seasoning of oak for our watch cases or the maceration of rare petals for our scents, we understand that time is not an enemy to be beaten, but an ingredient to be savored.
        </p>
        <div className="my-12 w-full h-[400px] relative rounded-lg overflow-hidden">
           <ParallaxBackground src="https://images.unsplash.com/photo-1459749411177-287ce35e8b4f?q=80&w=1500&auto=format&fit=crop" alt="Craftsmanship" />
        </div>
        <h3 className="font-display text-3xl text-offwhite mb-4 mt-12">The Ritual of Creation</h3>
        <p className="mt-4">
          Elena moves around her wheel with a dancer's grace. Her hands, dusted with white porcelain clay, move with deliberate slowness. There is no clock on the wall. "The sun tells me enough," she smiles.
        </p>
        <p className="mt-6">
          It forces us to ask: What are we rushing towards? If the end product is meant to last a lifetime, surely its creation deserves more than a fleeting moment. At AETERNA, we are re-committing ourselves to this slow rhythm. Every stitch, every setting, every drop is a testament to patience.
        </p>
      </>
    )
  },
  {
    id: 's1',
    title: 'Paris Design Week Highlights',
    date: 'Oct 08, 2025',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop',
    excerpt: 'A curated look at the installations that defined this year’s showcase of avant-garde aesthetics.',
    author: 'Marc Dubois',
    readTime: '4 min read',
    content: (
      <>
        <p>
          Paris was alight this week, not just with its usual city glow, but with the fervent energy of creation. Design Week 2025 brought together the old guard and the new disruptors in a collision of marble, light, and sustainable synthetics.
        </p>
        <p className="mt-6">
          The standout theme was "Ethereal Materiality"—objects that seem to defy gravity or disappear into their surroundings. We were particularly taken by the installation at the Grand Palais, where floating glass structures refracted light into spectrums of impossible color.
        </p>
        <blockquote className="font-script italic text-3xl text-luxury border-l-2 border-luxury pl-8 my-12 leading-tight">
          "Design is not just about form. It is about the space between the forms."
        </blockquote>
        <p className="mt-6">
          AETERNA's own pop-up gallery in Le Marais drew crowds eager to see our new "Void" collection, displayed on plinths of raw obsidian. It was a reminder that in a city of history, the future is always being written.
        </p>
      </>
    )
  },
  {
    id: 's2',
    title: 'The Scent of Gold',
    date: 'Sep 28, 2025',
    category: 'Fragrance',
    imageUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=600&auto=format&fit=crop',
    excerpt: 'Translating the visual luster of precious metal into an olfactory experience.',
    author: 'Elena Fisher',
    readTime: '5 min read',
    content: (
      <>
        <p>
          How does one bottle a metal? Gold has no smell. It is inert, eternal, cold to the touch yet warm to the eye. This was the paradox facing our master perfumer, Jean-Claude Ellena, when tasked with creating "Aurum."
        </p>
        <p className="mt-6">
          "I did not want to smell the metal," he explains. "I wanted to smell the light it reflects." The result is a composition of saffron, ambergris, and a solar accord of jasmine that feels physically warm on the skin.
        </p>
        <div className="grid grid-cols-2 gap-6 my-12">
           <img src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop" className="rounded-lg" alt="Perfume Bottle" />
           <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=600&auto=format&fit=crop" className="rounded-lg" alt="Amber Texture" />
        </div>
        <p className="mt-6">
          It is a scent for the evening, for the moment the sun dips below the horizon and the world turns golden. It is luxury, distilled into air.
        </p>
      </>
    )
  },
  {
    id: 's3',
    title: 'Interview with the Founder',
    date: 'Sep 15, 2025',
    category: 'Maison',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    excerpt: 'A rare conversation about the origins of AETERNA and the future of independent luxury.',
    author: 'AETERNA Editorial',
    readTime: '10 min read',
    content: (
      <>
        <p>
          He is a man who prefers the shadows to the spotlight. But today, the founder of AETERNA sits in a high-backed leather chair, overlooking the rainy streets of London, ready to speak.
        </p>
        <p className="mt-6">
          <strong>Editorial:</strong> Why start a luxury brand now? The market seems saturated.
        </p>
        <p className="mt-4">
          <strong>Founder:</strong> That is exactly why. The market is saturated with "stuff." Logos. Noise. Fast fashion masquerading as prestige. I wanted to build a sanctuary. AETERNA is not for everyone. It is for those who know.
        </p>
        <p className="mt-6">
          <strong>Editorial:</strong> You define the brand as "Timeless." Is that possible in 2025?
        </p>
        <p className="mt-4">
          <strong>Founder:</strong> Timelessness is not about being old. It is about being outside of time. A Greek statue is timeless. A perfect white shirt is timeless. We aim for that—objects that do not age, they only mature.
        </p>
      </>
    )
  },
  {
    id: 'a1',
    title: 'The Midnight Collection Launch',
    date: 'August 2024',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'An evening of shadows and light as we unveiled our most ambitious timepieces to date.',
    author: 'AETERNA Editorial',
    readTime: '3 min read',
    content: <p>Full coverage of the Midnight Collection launch event coming soon from the archives.</p>
  },
  {
    id: 'a2',
    title: 'Sourcing the Rarest Diamonds',
    date: 'July 2024',
    category: 'Craftsmanship',
    imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop',
    excerpt: 'A journey into the deep earth to find stones that speak the language of eternity.',
    author: 'Geoffrey Stone',
    readTime: '7 min read',
    content: (
      <>
        <p>
          To find a diamond that meets the AETERNA standard is to search for a needle in a thousand haystacks. Our gemologists travel to the most remote corners of the earth—from the icy mines of Canada to the riverbeds of Sierra Leone.
        </p>
        <p className="mt-6">
          It is not just about the 4Cs (Cut, Color, Clarity, Carat). It is about the fire within the stone. Does it speak? Does it hold the light? Only 0.01% of the world's diamonds are deemed worthy of our settings.
        </p>
      </>
    )
  }
];

const JournalArticleModal: React.FC<{ article: Article; onClose: () => void }> = ({ article, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 700);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex flex-col bg-void overflow-y-auto custom-scrollbar transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isClosing ? 'opacity-0 translate-y-8' : (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}`}>
        {/* Close / Nav */}
        <div className="fixed top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:p-10 pointer-events-none">
            <button 
                onClick={handleClose}
                className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-offwhite hover:bg-luxury hover:text-void transition-all duration-300 group"
                data-hover="true"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="pointer-events-auto flex gap-4">
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-offwhite hover:bg-luxury hover:text-void transition-all duration-300" data-hover="true">
                    <Share2 size={20} />
                </button>
            </div>
        </div>

        {/* Article Hero */}
        <div className="w-full h-[60vh] relative shrink-0">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-20 max-w-5xl">
                 <span className="inline-block bg-luxury text-void font-ui text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                    {article.category}
                 </span>
                 <h1 className="font-display text-4xl md:text-6xl text-offwhite leading-tight mb-6">
                    {article.title}
                 </h1>
                 {article.subtitle && (
                    <p className="font-script italic text-2xl text-offwhite/80 max-w-3xl">
                        {article.subtitle}
                    </p>
                 )}
            </div>
        </div>

        {/* Article Content */}
        <div className="w-full max-w-3xl mx-auto px-6 py-20">
            {/* Meta Data */}
            <div className="flex flex-wrap items-center gap-8 border-b border-white/10 pb-12 mb-12 text-offwhite/50 font-ui text-xs uppercase tracking-widest">
                 {article.author && (
                     <div className="flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-luxury"></span>
                        <span>{article.author}</span>
                     </div>
                 )}
                 <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{article.date}</span>
                 </div>
                 {article.readTime && (
                     <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{article.readTime}</span>
                     </div>
                 )}
            </div>

            {/* Text */}
            <div className="font-body text-offwhite/80 text-lg leading-relaxed space-y-6 [&_strong]:text-white [&_strong]:font-bold">
                {article.content}
            </div>

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-white/10 flex justify-between items-center">
                 <p className="font-script text-2xl text-offwhite/40 italic">Thanks for reading.</p>
                 <button 
                    onClick={handleClose}
                    className="font-ui text-luxury uppercase tracking-widest text-xs hover:text-white transition-colors"
                    data-hover="true"
                >
                    Back to Journal
                 </button>
            </div>
        </div>
    </div>,
    document.body
  );
};

export const Journal: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'Featured', 'Events', 'Fragrance', 'Maison', 'Craftsmanship'];
  
  const filteredArticles = filter === 'All' 
    ? allArticles 
    : allArticles.filter(a => a.category === filter || (filter === 'Featured' && a.isFeatured));



  return (
    <div className="min-h-screen bg-void animate-fade-in relative z-10">
        {/* Article Reading View Overlay */}
        {selectedArticle && (
            <JournalArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}

      <PageHero 
        title="THE JOURNAL" 
        subtitle="Stories of craft, culture, and time."
        bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-20 px-6 max-w-[1600px] mx-auto min-h-screen">
         
         {/* Filters */}
         <div className="flex flex-wrap gap-4 mb-16 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-ui text-xs uppercase tracking-widest px-6 py-3 rounded-full border transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-luxury text-void border-luxury font-bold' 
                    : 'bg-transparent text-offwhite/60 border-white/10 hover:border-luxury hover:text-luxury'
                }`}
                data-hover="true"
              >
                {cat}
              </button>
            ))}
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, idx) => (
                <article 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`group cursor-pointer flex flex-col gap-4 ${article.isFeatured && filter === 'All' ? 'md:col-span-2 lg:col-span-2' : ''}`}
                    data-hover="true"
                >
                    <div className={`relative overflow-hidden rounded-2xl bg-stone-900 border border-white/5 ${article.isFeatured && filter === 'All' ? 'aspect-[16/9]' : 'aspect-[4/5] md:aspect-[3/4]'}`}>
                        <ParallaxBackground 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                        
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/10 backdrop-blur-md border border-white/10 text-offwhite px-3 py-1 rounded-full text-[10px] font-ui uppercase tracking-widest">
                                {article.category}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 px-2">
                        <div className="flex items-center gap-4 text-[10px] font-ui uppercase tracking-widest text-offwhite/40">
                            <span>{article.date}</span>
                            {article.readTime && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{article.readTime}</span>
                                </>
                            )}
                        </div>
                        
                        <h2 className={`font-display text-offwhite group-hover:text-luxury transition-colors leading-tight ${article.isFeatured && filter === 'All' ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                            {article.title}
                        </h2>
                        
                        <p className="font-body text-offwhite/60 text-sm line-clamp-2 leading-relaxed group-hover:text-offwhite/80 transition-colors">
                            {article.excerpt}
                        </p>
                        
                        <div className="pt-2 flex items-center gap-2 text-luxury font-ui text-xs uppercase tracking-widest opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 group/link">
                            Read Article <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </div>
                    </div>
                </article>
            ))}
         </div>

      </section>
    </div>
  );
};