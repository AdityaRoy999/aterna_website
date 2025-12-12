import React, { useState, useEffect } from 'react';
import { PageHero } from './PageHero';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

import orderPlacedBg from '../src_images/order_placed.png';

interface OrderTrackingProps {
  initialOrderId?: string;
}

type TrackingStep = {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ initialOrderId }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [email, setEmail] = useState('');
  const [viewState, setViewState] = useState<'input' | 'searching' | 'result'>('input');

  // If initialOrderId is present, simulate auto-search
  useEffect(() => {
    if (initialOrderId) {
      setViewState('searching');
      setTimeout(() => setViewState('result'), 1500);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    setViewState('searching');
    // Simulate API delay
    setTimeout(() => setViewState('result'), 2000);
  };

  const steps: TrackingStep[] = [
    {
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been securely received.',
      date: 'Oct 24, 10:30 AM',
      status: 'completed',
      icon: <CheckCircle size={18} />
    },
    {
      id: 2,
      title: 'Processing',
      description: 'Our artisans are preparing your selection.',
      date: 'Oct 25, 09:15 AM',
      status: 'completed',
      icon: <Package size={18} />
    },
    {
      id: 3,
      title: 'Dispatched',
      description: 'Handed over to our secure courier partner.',
      date: 'Oct 25, 06:00 PM',
      status: 'current',
      icon: <Truck size={18} />
    },
    {
      id: 4,
      title: 'Out for Delivery',
      description: 'Arriving at your destination.',
      date: 'Estimated Oct 27',
      status: 'pending',
      icon: <MapPin size={18} />
    },
    {
      id: 5,
      title: 'Delivered',
      description: 'Package delivered to recipient.',
      date: 'Estimated Oct 27',
      status: 'pending',
      icon: <CheckCircle size={18} />
    }
  ];

  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="TRACK ORDER" 
        subtitle="Follow the journey of your acquisition."
        bgImage={orderPlacedBg}
      />
      
      <section className="py-24 px-6 max-w-4xl mx-auto">
        
        {/* Search Form */}
        <div className={`transition-all duration-700 ${viewState === 'result' ? 'mb-16 opacity-50 hover:opacity-100' : 'mb-0 opacity-100'}`}>
          <form onSubmit={handleSearch} className="bg-stone-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-xl">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5">
                   <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Order Number</label>
                   <input 
                      type="text" 
                      value={orderId} 
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="#12345"
                      className="w-full bg-void/50 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors placeholder:text-white/10"
                      disabled={viewState === 'searching'}
                   />
                </div>
                <div className="md:col-span-5">
                   <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Billing Email</label>
                   <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-void/50 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors placeholder:text-white/10"
                      disabled={viewState === 'searching'}
                   />
                </div>
                <div className="md:col-span-2">
                   <button 
                      type="submit"
                      disabled={viewState === 'searching' || !orderId}
                      className="w-full h-[58px] bg-luxury text-void font-ui font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                      data-hover="true"
                   >
                      {viewState === 'searching' ? (
                        <div className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search size={18} />
                      )}
                   </button>
                </div>
             </div>
          </form>
        </div>

        {/* Results */}
        {viewState === 'result' && (
          <div className="animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8">
               <div>
                  <h2 className="font-display text-3xl text-offwhite mb-2">Order #{orderId}</h2>
                  <p className="font-body text-offwhite/50 text-sm">Expected Arrival: <span className="text-luxury">October 27, 2025</span></p>
               </div>
               <div className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-luxury/10 border border-luxury/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-luxury animate-pulse"></span>
                  <span className="font-ui text-xs text-luxury uppercase tracking-widest font-bold">In Transit</span>
               </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-4 md:pl-8 space-y-12 before:absolute before:left-[44px] md:before:left-[60px] before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-luxury before:via-white/10 before:to-transparent">
               {steps.map((step, index) => (
                  <div key={step.id} className={`relative flex gap-6 md:gap-10 group ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                     
                     {/* Icon Node */}
                     <div 
                        className={`relative z-10 w-14 h-14 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500 ${
                           step.status === 'completed' 
                              ? 'bg-luxury text-void border-luxury' 
                              : step.status === 'current'
                              ? 'bg-void text-luxury border-luxury shadow-[0_0_20px_rgba(232,207,160,0.3)]'
                              : 'bg-void text-offwhite/30 border-white/10'
                        }`}
                     >
                        {step.icon}
                     </div>

                     {/* Content */}
                     <div className="pt-2">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                           <h3 className={`font-display text-xl transition-colors ${step.status === 'current' ? 'text-luxury' : 'text-offwhite'}`}>
                              {step.title}
                           </h3>
                           <span className="font-ui text-[10px] text-offwhite/40 uppercase tracking-widest">{step.date}</span>
                        </div>
                        <p className="font-body text-offwhite/60 text-sm">{step.description}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Assistance */}
            <div className="mt-20 pt-10 border-t border-white/5 text-center">
               <p className="font-body text-offwhite/40 text-sm mb-4">Have an issue with your delivery?</p>
               <a href="#" className="font-ui text-luxury text-xs uppercase tracking-widest hover:text-white transition-colors border-b border-luxury/30 pb-1">
                  Contact Concierge
               </a>
            </div>
          </div>
        )}

      </section>
    </div>
  );
};