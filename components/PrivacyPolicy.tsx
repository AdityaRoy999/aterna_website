import React from 'react';
import { PageHero } from './PageHero';

const policySections = [
  {
    title: "Collection of Information",
    content: "We collect information that you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact our Concierge team. This includes personal identifiers, payment details, and shipping coordinates. We handle this data with the utmost discretion, ensuring your digital footprint remains as guarded as our physical ateliers."
  },
  {
    title: "Usage & Curation",
    content: "Your information is used solely to curate your experience with AETERNA. This includes processing transactions, delivering products, and sending you invitations to private viewings or product launches that align with your tastes. We do not sell, trade, or otherwise transfer your information to outside parties without your consent, except to trusted third parties who assist us in operating our website."
  },
  {
    title: "Digital Sovereignty",
    content: "We employ state-of-the-art encryption technologies (SSL) to ensure that your data remains secure. Our digital infrastructure is monitored continuously to prevent unauthorized access. Your payment information is processed via secure gateways and is never stored on our local servers."
  },
  {
    title: "Cookies & Tracking",
    content: "We use cookies to enhance your browsing experience, allowing us to remember your preferences and cart contents. You may choose to disable cookies in your browser settings, though this may affect the seamless nature of your visit to our digital boutique. These small data files are used purely for analytical and functional purposes."
  },
  {
    title: "Client Rights",
    content: "You have the right to access, correct, or delete your personal information at any time. You may also object to the processing of your data or request its portability. Simply contact our Concierge team at concierge@aeterna.com, and we will assist you immediately with any privacy-related inquiries."
  }
];

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="PRIVACY POLICY" 
        subtitle="Your privacy is the ultimate luxury."
        bgImage="https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-20 max-w-3xl">
          <p className="font-display text-2xl md:text-3xl text-offwhite leading-relaxed">
            At AETERNA, we believe that trust is the foundation of any lasting relationship. We are committed to protecting your personal information with the same level of care and attention to detail that we apply to our craftsmanship.
          </p>
        </div>

        <div className="space-y-0">
          {policySections.map((section, index) => (
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
        
        <div className="mt-12 pt-12 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui">Last Updated: October 2025</p>
          <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui">Paris, France</p>
        </div>
      </section>
    </div>
  );
};