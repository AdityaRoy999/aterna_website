import React from 'react';
import { PageHero } from './PageHero';

const shippingSections = [
  {
    title: "Global Delivery",
    content: "AETERNA is pleased to offer complimentary secure delivery to over 80 countries worldwide. Each parcel is insured from the moment it leaves our atelier until it is placed in your hands. We partner with the world's most prestigious couriers to ensure a seamless journey for your acquisition."
  },
  {
    title: "White Glove Service",
    content: "For our most exceptional creations, we offer a dedicated White Glove service. A representative will personally deliver the item to your residence, hotel, or private office, ensuring a handover that is as exceptional as the piece itself. This service is available in major capitals including Paris, London, New York, and Tokyo."
  },
  {
    title: "Dispatch Timing",
    content: "Ready-to-wear items and fragrances are typically dispatched within 24 hours of purchase. For bespoke jewelry and high complications, please allow 3-5 business days for final inspection and calibration by our master artisans before dispatch."
  },
  {
    title: "The Unboxing",
    content: "Your purchase arrives in our signature midnight-blue packaging, crafted from sustainable Italian paper and accented with gold leaf. Inside, you will find your certificate of authenticity, care instructions, and a personalized note from the Maison."
  },
  {
    title: "Returns & Exchanges",
    content: "We accept returns or exchanges within 30 days of delivery, provided the item is in its original, unworn condition with all protective seals intact. Bespoke or personalized pieces are final sale. To initiate a return, simply contact our Concierge to arrange a complimentary collection at your convenience."
  }
];

export const ShippingReturns: React.FC = () => {
  return (
    <div className="min-h-screen bg-void animate-fade-in pt-24 md:pt-0">
      <PageHero 
        title="SHIPPING & RETURNS" 
        subtitle="Seamless delivery, global reach."
        bgImage="https://images.unsplash.com/photo-1566935654340-08703e488d5e?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-20 max-w-3xl">
          <p className="font-display text-2xl md:text-3xl text-offwhite leading-relaxed">
            The experience of acquiring an AETERNA piece extends far beyond the click of a button. We are dedicated to ensuring that the journey of your item is handled with the utmost precision, security, and elegance.
          </p>
        </div>

        <div className="space-y-0">
          {shippingSections.map((section, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 border-t border-white/10 py-12 md:py-16 hover:bg-white/[0.02] transition-colors duration-500">
              <div className="md:col-span-4">
                <span className="font-ui text-xs text-luxury uppercase tracking-widest mb-4 block">0{index + 1}</span>
                <h3 className="font-display text-3xl text-offwhite">{section.title}</h3>
              </div>
              <div className="md:col-span-8">
                <p className="font-body text-offwhite/60 leading-loose text-lg font-light">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
             <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui mb-2">Need immediate assistance?</p>
             <a href="#" className="font-ui text-luxury uppercase tracking-widest text-sm hover:text-white transition-colors">Contact Concierge</a>
          </div>
          <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui">Paris, France</p>
        </div>
      </section>
    </div>
  );
};