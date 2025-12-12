import { Product } from '../types';

import clockGold from '../src_images/clock_gold.png';
import clockSilver from '../src_images/clock_silver.png';
import clockOynx from '../src_images/clock_oynx.png';
import channel50 from '../src_images/channel_50.png';
import channel100 from '../src_images/channel_100.png';
import channel200 from '../src_images/channel_200.png';
import goldAbstract from '../src_images/gold_abstract.png';
import noirStan from '../src_images/noir_stan.png';
import noirMatte from '../src_images/noir_matte.png';
import goldChrono from '../src_images/gold_chrono.png';
import silverChrono from '../src_images/silver_chrono.png';
import oynxChrono from '../src_images/oynx_chrono.png';
import amb50 from '../src_images/amb50.png';
import amb100 from '../src_images/amb100.png';
import amb200 from '../src_images/amb200.png';
import pearlWhite from '../src_images/pearl_white.png';
import pearlGold from '../src_images/pearl_gold.png';
import pink from '../src_images/pink.png';

export const shopProducts: Product[] = [
  {
    id: '1',
    name: 'Ulania Watch',
    price: 18100.00,
    category: 'Timepieces',
    imageUrl: clockGold,
    isNew: true,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: clockGold, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: clockSilver, colorCode: '#C0C0C0' },
      { name: 'Onyx', imageUrl: clockOynx, colorCode: '#1A1A1A' }
    ]
  },
  {
    id: '2',
    name: 'Chanel No. 5',
    price: 259.00,
    category: 'Fragrance',
    imageUrl: channel50,
    variantType: 'Size',
    variants: [
      { name: '50ml', imageUrl: channel50 },
      { name: '100ml', imageUrl: channel100 },
      { name: '200ml', imageUrl: channel200 }
    ]
  },
  {
    id: '3',
    name: 'Gold Abstract',
    price: 1250.50,
    category: 'Jewelry',
    imageUrl: goldAbstract,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: goldAbstract, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop', colorCode: '#C0C0C0' }
    ]
  },
  {
    id: '4',
    name: 'Noir Elegance',
    price: 450.00,
    category: 'Accessories',
    imageUrl: noirStan,
    variantType: 'Style',
    variants: [
      { name: 'Standard', imageUrl: noirStan, colorCode: '#1A1A1A' },
      { name: 'Textured', imageUrl: noirMatte, colorCode: '#333333' }
    ]
  },
  {
    id: '5',
    name: 'Royal Chrono',
    price: 24500.00,
    category: 'Timepieces',
    imageUrl: goldChrono,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: goldChrono, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: silverChrono, colorCode: '#C0C0C0' },
      { name: 'Onyx', imageUrl: oynxChrono, colorCode: '#1A1A1A' }
    ]
  },
  {
    id: '6',
    name: 'Amber Essence',
    price: 310.00,
    category: 'Fragrance',
    imageUrl: amb50,
    isNew: true,
    variantType: 'Size',
    variants: [
      { name: '50ml', imageUrl: amb50 },
      { name: '100ml', imageUrl: amb100 },
      { name: '200ml', imageUrl: amb200 }
    ]
  },
  {
    id: '7',
    name: 'Pearl Drop',
    price: 890.00,
    category: 'Jewelry',
    imageUrl: pearlWhite,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: pearlGold, colorCode: '#E8CFA0' },
      { name: 'White', imageUrl: pearlWhite, colorCode: '#eeeae3ff' }
    ]
  },
  {
    id: '8',
    name: 'Pink Glow',
    price: 1200.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop',
    variantType: 'Style',
    variants: [
      { name: 'Standard', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', colorCode: '#b614b3ff' },
      { name: 'Matte', imageUrl: pink, colorCode: '#a40c9aff' }
    ]
  }
];
