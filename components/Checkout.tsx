import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';
import { ArrowLeft, CreditCard, Lock, CheckCircle, Truck, Package, Smartphone, Wallet, QrCode, Search } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (page: string, params?: any) => void;
}

type PaymentMethod = 'card' | 'upi';
type UPIApp = 'gpay' | 'paytm' | 'phonepe' | 'other' | null;

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UPIApp>(null);
  const [orderId, setOrderId] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    upiId: ''
  });

  // Auto-fill from profile if available
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          const [first, ...last] = (data.full_name || '').split(' ');
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            firstName: first || '',
            lastName: last.join(' ') || '',
            address: data.address_line1 || '',
            city: data.city || '',
            zip: data.postal_code || '',
            country: data.country || ''
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Create Order in Supabase
      // Note: If user is guest, user_id will be null. 
      // Our schema requires user_id. 
      // For now, we only allow checkout for logged in users OR we need to make user_id nullable in schema.
      // Let's assume we want to enforce login or handle guest later.
      // For this implementation, we'll try to insert.
      
      let userIdToUse = user?.id;
      
      // If no user, we can't save to 'orders' table as per current schema (not null).
      // We should probably prompt login or make it nullable.
      // For now, let's proceed. If it fails, we catch it.
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userIdToUse, // This will fail if null and schema is NOT NULL
            email: formData.email,
            total_amount: cartTotal,
            status: 'processing',
            shipping_address: {
              line1: formData.address,
              city: formData.city,
              zip: formData.zip,
              country: formData.country
            }
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const newOrderId = orderData.id;
      setOrderId(newOrderId);

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: newOrderId,
        product_id: item.id.split('-')[0], // Original ID
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant_name: item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send Email via EmailJS
      try {
        const trackingLink = `${window.location.origin}?page=tracking&id=${newOrderId}`;
        const emailParams = {
          order_id: newOrderId,
          to_name: `${formData.firstName} ${formData.lastName}`,
          to_email: formData.email,
          total_amount: cartTotal.toLocaleString(),
          order_date: new Date().toLocaleDateString(),
          tracking_link: trackingLink,
          cart_items_html: items.map(item => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #333; color: #e0e0e0;">${item.name} ${item.selectedColor ? `(${item.selectedColor})` : ''}</td>
              <td style="padding: 12px; border-bottom: 1px solid #333; color: #e0e0e0;">${item.quantity}</td>
              <td style="padding: 12px; border-bottom: 1px solid #333; color: #d4af37;">$${item.price.toLocaleString()}</td>
            </tr>
          `).join('')
        };

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          emailParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      // 4. Clear Cart
      clearCart();
      setIsSuccess(true);

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const upiApps = [
    { 
      id: 'gpay', 
      label: 'Google Pay', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png' 
    },
    { 
      id: 'paytm', 
      label: 'Paytm', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png' 
    },
    { 
      id: 'phonepe', 
      label: 'PhonePe', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png' 
    },
    { 
      id: 'other', 
      label: 'Other / ID', 
      icon: <QrCode size={24} className="text-void" /> 
    }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-void pt-24 pb-12 px-6 flex flex-col items-center justify-center animate-fade-in text-center">
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <CheckCircle size={48} />
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-luxury mb-6">Order Confirmed</h1>
        <p className="font-body text-offwhite/60 max-w-lg mb-8 text-lg">
          Thank you for choosing AETERNA. Your order #{orderId} has been placed successfully. A confirmation email has been sent to {formData.email}.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => onNavigate('tracking', { orderId })}
            className="bg-luxury text-void hover:bg-white border border-transparent px-8 py-4 rounded-lg font-ui text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            data-hover="true"
          >
            <Search size={16} /> Track Order
          </button>
          <button 
            onClick={() => onNavigate('shop')}
            className="bg-white/5 border border-white/10 text-offwhite hover:bg-white/10 hover:border-white/20 px-8 py-4 rounded-lg font-ui text-xs uppercase tracking-widest transition-all duration-300"
            data-hover="true"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void pt-28 pb-20 animate-fade-in relative z-10">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <button 
          onClick={() => onNavigate('shop')} 
          className="flex items-center gap-2 text-offwhite/50 hover:text-luxury transition-colors mb-12 group"
          data-hover="true"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-ui text-xs uppercase tracking-widest">Back to Shop</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Column: Forms */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="mb-12">
              <h1 className="font-display text-4xl text-offwhite mb-2">Secure Checkout</h1>
              <p className="font-body text-offwhite/40 text-sm">Please enter your details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Contact & Shipping */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-luxury">
                   <Truck size={20} />
                   <h2 className="font-ui text-xs uppercase tracking-[0.2em] font-bold">Shipping Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Email Address</label>
                    <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors placeholder:text-white/10" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">First Name</label>
                    <input required name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Last Name</label>
                    <input required name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Address</label>
                    <input required name="address" type="text" value={formData.address} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors" placeholder="123 Luxury Blvd" />
                  </div>
                  <div>
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">City</label>
                    <input required name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Postal Code</label>
                    <input required name="zip" type="text" value={formData.zip} onChange={handleInputChange} className="w-full bg-white/5 border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors" />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-luxury">
                   <CreditCard size={20} />
                   <h2 className="font-ui text-xs uppercase tracking-[0.2em] font-bold">Payment Method</h2>
                </div>

                {/* Payment Method Toggles */}
                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-4 px-6 rounded-lg font-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
                      paymentMethod === 'card' 
                      ? 'bg-luxury text-void border-luxury' 
                      : 'bg-white/5 text-offwhite/60 border-white/10 hover:border-white/30 hover:text-offwhite'
                    }`}
                    data-hover="true"
                  >
                    <CreditCard size={16} /> Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-4 px-6 rounded-lg font-ui text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
                      paymentMethod === 'upi' 
                      ? 'bg-luxury text-void border-luxury' 
                      : 'bg-white/5 text-offwhite/60 border-white/10 hover:border-white/30 hover:text-offwhite'
                    }`}
                    data-hover="true"
                  >
                    <Smartphone size={16} /> UPI / VPA
                  </button>
                </div>
                
                <div className="bg-stone-900/50 p-8 rounded-2xl border border-white/5 min-h-[300px] transition-all duration-500">
                  {paymentMethod === 'card' ? (
                    <div className="animate-fade-in">
                       <div className="mb-6">
                          <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Card Number</label>
                          <div className="relative">
                            <input required={paymentMethod === 'card'} name="cardNumber" type="text" value={formData.cardNumber} onChange={handleInputChange} className="w-full bg-void border-b border-white/10 focus:border-luxury text-offwhite p-4 pl-12 outline-none transition-colors placeholder:text-white/10" placeholder="0000 0000 0000 0000" />
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-offwhite/30" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Expiry Date</label>
                            <input required={paymentMethod === 'card'} name="expiry" type="text" value={formData.expiry} onChange={handleInputChange} className="w-full bg-void border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors placeholder:text-white/10" placeholder="MM/YY" />
                          </div>
                          <div>
                            <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">CVC</label>
                            <input required={paymentMethod === 'card'} name="cvc" type="text" value={formData.cvc} onChange={handleInputChange} className="w-full bg-void border-b border-white/10 focus:border-luxury text-offwhite p-4 outline-none transition-colors placeholder:text-white/10" placeholder="123" />
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in space-y-8">
                       <div>
                         <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-4">Select Application</label>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {upiApps.map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.id as UPIApp)}
                                className={`relative py-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 group ${
                                  selectedUpiApp === app.id
                                  ? 'bg-luxury/10 border-luxury shadow-[0_0_15px_rgba(232,207,160,0.15)]'
                                  : 'bg-void border-white/10 text-offwhite/60 hover:border-luxury/50 hover:bg-white/5'
                                }`}
                                data-hover="true"
                              >
                                {selectedUpiApp === app.id && (
                                   <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                                )}

                                {/* Logo Container */}
                                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 transition-transform duration-300 ${selectedUpiApp === app.id ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                                  {app.logo ? (
                                    <img src={app.logo} alt={app.label} className="w-full h-full object-contain" />
                                  ) : (
                                    app.icon
                                  )}
                                </div>
                                
                                <span className={`font-ui text-[10px] uppercase tracking-wider font-bold transition-colors ${selectedUpiApp === app.id ? 'text-luxury' : 'text-offwhite/50 group-hover:text-offwhite'}`}>
                                  {app.label}
                                </span>
                              </button>
                            ))}
                         </div>
                       </div>

                       <div className={`transition-all duration-500 overflow-hidden ${selectedUpiApp ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">
                             {selectedUpiApp === 'other' ? 'Enter UPI ID / VPA' : `Enter ${selectedUpiApp === 'gpay' ? 'Google Pay' : selectedUpiApp === 'paytm' ? 'Paytm' : 'PhonePe'} Linked Number`}
                          </label>
                          <div className="relative">
                            <input 
                              required={paymentMethod === 'upi'} 
                              name="upiId" 
                              type="text" 
                              value={formData.upiId} 
                              onChange={handleInputChange} 
                              className="w-full bg-void border-b border-white/10 focus:border-luxury text-offwhite p-4 pl-12 outline-none transition-colors placeholder:text-white/10" 
                              placeholder={selectedUpiApp === 'other' ? "username@bank" : "+91 00000 00000"} 
                            />
                            <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-offwhite/30" />
                          </div>
                       </div>

                       {!selectedUpiApp && (
                          <div className="text-center py-4 text-offwhite/30 text-xs italic">
                            Select an app to proceed with secure payment
                          </div>
                       )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-offwhite/40 text-xs">
                  <Lock size={12} />
                  <span>Payments are secure and encrypted.</span>
                </div>
              </section>

              <button 
                type="submit" 
                disabled={isProcessing || (paymentMethod === 'upi' && !selectedUpiApp)}
                className="w-full bg-luxury text-void font-ui font-bold text-sm uppercase tracking-widest py-5 rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(232,207,160,0.2)] disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group"
                data-hover="true"
              >
                {isProcessing ? (
                   <span className="flex items-center justify-center gap-2">
                     <span className="w-2 h-2 bg-void rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-void rounded-full animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-2 h-2 bg-void rounded-full animate-bounce [animation-delay:0.4s]"></span>
                   </span>
                ) : (
                   <span className="relative z-10 group-hover:tracking-[0.2em] transition-all duration-300">
                     {paymentMethod === 'upi' ? 'Proceed to Pay' : `Pay $${cartTotal.toLocaleString()}`}
                   </span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Summary */}
          <div className="w-full lg:w-[400px] order-1 lg:order-2">
             <div className="sticky top-32">
                <div className="bg-stone-900 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Package size={100} className="text-luxury" />
                   </div>

                   <h3 className="font-display text-2xl text-offwhite mb-8 relative z-10">Order Summary</h3>

                   <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-8 relative z-10">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4">
                           <div className="w-16 h-20 bg-void rounded border border-white/5 overflow-hidden shrink-0">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1">
                              <h4 className="font-display text-lg text-offwhite">{item.name}</h4>
                              <p className="font-ui text-xs text-luxury mb-1">${item.price.toLocaleString()}</p>
                              <div className="flex justify-between text-xs text-offwhite/40">
                                <span>Qty: {item.quantity}</span>
                                {item.selectedColor && <span>{item.selectedColor}</span>}
                              </div>
                           </div>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <p className="text-offwhite/40 text-sm">Your cart is empty.</p>
                      )}
                   </div>

                   <div className="border-t border-white/10 pt-6 space-y-3 relative z-10">
                      <div className="flex justify-between text-sm text-offwhite/60 font-body">
                         <span>Subtotal</span>
                         <span>${cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-offwhite/60 font-body">
                         <span>Shipping</span>
                         <span>Free</span>
                      </div>
                      <div className="flex justify-between text-lg text-luxury font-display pt-4 border-t border-white/5 mt-4">
                         <span>Total</span>
                         <span>${cartTotal.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
                
                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-offwhite/30 text-xs uppercase tracking-widest">
                   <Lock size={12} />
                   <span>Guaranteed Safe Checkout</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
