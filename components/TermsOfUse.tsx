import React from 'react';
import { PageHero } from './PageHero';

const termsSections = [
  {
    title: "Intellectual Property",
    content: "All content available on this site, including but not limited to text, graphics, logos, images, audio clips, and software, is the property of AETERNA Luxury Holdings and is protected by international copyright laws. Unlawful use, reproduction, or distribution of any content without express written consent is strictly prohibited."
  },
  {
    title: "Commercial Terms",
    content: "AETERNA reserves the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time."
  },
  {
    title: "Authenticity Guarantee",
    content: "We guarantee the authenticity of every item purchased directly through our official channels. Each piece is accompanied by a certificate of authenticity and a unique serial number recorded in our archives. Purchases made from unauthorized third-party retailers are not covered by our warranty."
  },
  {
    title: "Limitation of Liability",
    content: "In no case shall AETERNA, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages."
  },
  {
    title: "Governing Law",
    content: "These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of France. Any disputes arising from these terms shall be resolved exclusively in the courts of Paris."
  }
];

export const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="TERMS OF USE" 
        subtitle="Governance of the House of AETERNA."
        bgImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-20 max-w-3xl">
          <p className="font-display text-2xl md:text-3xl text-offwhite leading-relaxed">
            Welcome to AETERNA. By accessing our digital boutique, you agree to be bound by the following terms and conditions. These terms govern your relationship with AETERNA Luxury Holdings and your use of our services.
          </p>
        </div>

        <div className="space-y-0">
          {termsSections.map((section, index) => (
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
          <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui">Effective Date: October 2025</p>
          <p className="text-xs text-offwhite/30 uppercase tracking-widest font-ui">Paris, France</p>
        </div>
      </section>
    </div>
  );
};