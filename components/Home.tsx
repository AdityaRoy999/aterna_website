import React from 'react';
import { Hero } from './Hero';
import { BentoGrid } from './BentoGrid';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in">
      <Hero />
      <BentoGrid onNavigate={onNavigate} />
    </div>
  );
};