import React from 'react';
import { Hero } from './Hero';
import { BentoGrid } from './BentoGrid';
import { useCursor } from '../context/CursorContext';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { setMode } = useCursor();

  const handleHeroHover = () => setMode('blob');
  const handleHeroLeave = () => setMode('default');
  const handleSectionHover = () => setMode('ring');
  const handleSectionLeave = () => setMode('default');

  return (
    <div className="animate-fade-in">
      <div onMouseEnter={handleHeroHover} onMouseLeave={handleHeroLeave}>
        <Hero />
      </div>
      <div onMouseEnter={handleSectionHover} onMouseLeave={handleSectionLeave}>
        <BentoGrid onNavigate={onNavigate} />
      </div>
    </div>
  );
};