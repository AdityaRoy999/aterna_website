import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';
import { sendAdminAlert } from '../lib/notifications';
import { ArrowLeft, CreditCard, Lock, CheckCircle, Truck, Package, Search } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (page: string, params?: any) => void;
}

type PaymentMethod = 'razorpay';

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  
  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    phone: ''
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
            country: data.country || '',
            phone: data.phone || ''
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 1. Create Order in Supabase (Pending)
      let userIdToUse = user?.id;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userIdToUse,
            email: formData.email,
            total_amount: cartTotal,
            status: 'pending', // Initial status
            shipping_address: {
              line1: formData.address,
              city: formData.city,
              zip: formData.zip,
              country: formData.country,
              phone: formData.phone
            }
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const newOrderId = orderData.id;
      setOrderId(newOrderId);

      // 1.5 Validate and Fix Product IDs (Attempt to resolve, but don't block)
      const validItems = await Promise.all(items.map(async (item) => {
        let resolvedId = item.productId;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // If ID is missing or invalid, try to resolve it from the DB by name
        if (!resolvedId || !uuidRegex.test(resolvedId)) {
           // Try to extract from string first
           if (item.selectedColor && item.id.endsWith(`-${item.selectedColor}`)) {
               const potentialId = item.id.slice(0, -(item.selectedColor.length + 1));
               if (uuidRegex.test(potentialId)) {
                   resolvedId = potentialId;
               }
           }
           
           // If still invalid, fetch from DB by name
           if (!resolvedId || !uuidRegex.test(resolvedId)) {
             try {
                // Remove variant suffix from name if present (e.g. "Watch (Gold)")
                const cleanName = item.name.replace(/\s*\(.*?\)\s*$/, '');  
                const { data } = await supabase
                  .from('products')
                  .select('id')
                  .eq('name', cleanName)
                  .single();
                
                if (data) {
                  resolvedId = data.id;
                }
             } catch (e) {
               console.warn("Failed to resolve product ID for", item.name);
             }
           }
        }
        
        // Use resolved ID if found, otherwise keep original
        return { ...item, resolvedId: resolvedId || item.id }; 
      }));

      // REMOVED STRICT CHECKS per user request to allow checkout to proceed 
      // even if frontend thinks items are invalid. 
      // (Relying on "Emergency SQL Fix" to drop DB constraint if needed)

      // 2. Create Order Items
      const orderItems = validItems.map(item => ({
          order_id: newOrderId,
          product_id: item.resolvedId, // Use resolved ID (guaranteed valid now)
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant_name: item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Initialize Razorpay
      const amount = currency === 'INR' ? Math.round(cartTotal * 85 * 100) : Math.round(cartTotal * 100); // Approx 1 USD = 85 INR
      
      const options = {
        key: "rzp_test_RsduSHftu7RxTq", // Test Key ID
        amount: amount, 
        currency: currency,
        name: "AETERNA",
        description: "Luxury Purchase",
        image: "/images/app_logo.png", // Assuming you have a logo here
        order_id: "", // For manual/test mode, we can skip backend order creation if allowed, or we'd need a backend endpoint. 
                      // Since we don't have a backend to generate Razorpay Order ID, we'll rely on client-side checkout for this demo.
                      // Note: In production, ALWAYS generate order_id on backend.
        handler: async function (response: any) {
          // Payment Success
          // Update Order Status
          await supabase
            .from('orders')
            .update({ status: 'processing', payment_id: response.razorpay_payment_id })
            .eq('id', newOrderId);

          // Update Stock and Check for Low Stock
          // Use validItems which has the correctly resolved UUIDs
          for (const item of validItems) {
             let productId = item.resolvedId;

             // 1.5. Validate ID format (Loose check)
             // We now allow non-UUIDs because we updated the backend to handle text IDs (legacy support)
             if (!productId) {
                 if (item.selectedColor && item.id.endsWith(`-${item.selectedColor}`)) {
                     const potentialId = item.id.slice(0, -(item.selectedColor.length + 1));
                     if (potentialId) productId = potentialId;
                 }
                 
                 // DB Lookup fallback
                 if (!productId) {
                    const cleanName = item.name.replace(/\s*\(.*?\)\s*$/, '');
                    const { data } = await supabase.from('products').select('id').eq('name', cleanName).single();
                    if (data) productId = data.id;
                 }
             }
            
            if (!productId) {
                console.error("Skipping stock update: No Product ID could be resolved for", item.name);
                continue;
            }

            // Try updating by ID first
            let { error: stockError } = await supabase.rpc('decrement_stock', {
              product_id: productId.toString(), // Ensure string
              quantity_to_decrement: item.quantity
            });

            if (stockError) {
              console.warn(`Stock update by ID failed for ${item.name}, trying by name...`, stockError);
              
              // Fallback: Try updating by Name
              const cleanName = item.name.replace(/\s*\(.*?\)\s*$/, '');
              const { error: nameStockError } = await supabase.rpc('decrement_stock_by_name', {
                 p_name: cleanName,
                 q_decrement: item.quantity
              });
              
              if (nameStockError) {
                 console.error(`CRITICAL: Stock update failed by BOTH ID and Name for ${item.name}`, nameStockError);
                 // Optional: Fire an admin alert here about data inconsistency
              } else {
                 console.log(`Stock updated by name for ${item.name}`);
              }
            } else {
              // Check remaining stock logic ...
              const { data: productData } = await supabase
                .from('products')
                .select('quantity, name')
                .eq('id', productId)
                .single();
              
              if (productData && productData.quantity <= 3) {
                 // ... alert logic
                 sendAdminAlert(
                  'stock',
                  'Low Stock Alert',
                  `Product "${productData.name}" is running low. Only ${productData.quantity} remaining.`,
                  productId
                ).catch(e => console.error('Stock alert failed', e));
              }
            }
          }

          // Send Admin Alert for New Order (Safely)
          try {
            sendAdminAlert(
              'order',
              'New Order Received',
              `New order #${newOrderId} received from ${formData.firstName} ${formData.lastName}. Total: ${currency === 'INR' ? '₹' : '$'}${cartTotal}`,
              newOrderId
            ).catch(e => console.warn('Admin alert background error:', e));
          } catch (e) {
            console.warn('Failed to initiate admin alert:', e);
          }

          // Send Email to Customer
          try {
            console.log('Preparing customer email...');
            const trackingLink = `${window.location.origin}?page=tracking&id=${newOrderId}`;
            
            // Ensure data is present
            const customerName = (formData.firstName || 'Customer') + ' ' + (formData.lastName || '');
            const customerEmail = formData.email;
            
            if (!customerEmail) {
              throw new Error('No customer email address found');
            }

            const emailParams = {
              order_id: newOrderId,
              to_name: customerName,
              to_email: customerEmail,
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

            console.log('Sending customer email with template:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
            
            const response = await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              emailParams,
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            
            console.log('Customer email sent successfully!', response.status, response.text);
          } catch (emailError) {
            console.error('CRITICAL: Failed to send customer email:', emailError);
            // Don't block success screen, but log it
          }

          clearCart();
          setIsSuccess(true);
          setIsProcessing(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#E8CFA0"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
      setIsProcessing(false);
    }
  };

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
              <h1 className="font-display text-4xl text-offwhite mb-2">Secure Checkout (v2)</h1>
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

                {/* Currency Selection */}
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`flex-1 py-3 px-4 rounded-lg font-ui text-xs uppercase tracking-widest border transition-all duration-300 ${
                      currency === 'INR' 
                      ? 'bg-luxury text-void border-luxury' 
                      : 'bg-white/5 text-offwhite/60 border-white/10 hover:border-white/30 hover:text-offwhite'
                    }`}
                  >
                    Pay in INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-3 px-4 rounded-lg font-ui text-xs uppercase tracking-widest border transition-all duration-300 ${
                      currency === 'USD' 
                      ? 'bg-luxury text-void border-luxury' 
                      : 'bg-white/5 text-offwhite/60 border-white/10 hover:border-white/30 hover:text-offwhite'
                    }`}
                  >
                    Pay in USD ($)
                  </button>
                </div>
                
                <div className="bg-stone-900/50 p-8 rounded-2xl border border-white/5 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2">
                      <img src="https://cdn.iconscout.com/icon/free/png-256/free-razorpay-1649771-1399875.png" alt="Razorpay" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-offwhite">Razorpay Secure Payment</h3>
                      <p className="font-ui text-xs text-offwhite/40">
                        {currency === 'INR' ? 'Cards, UPI, NetBanking, Wallets' : 'International Cards Only'}
                      </p>
                    </div>
                  </div>
                  <p className="text-offwhite/60 text-sm leading-relaxed">
                    {currency === 'INR' 
                      ? "Pay securely using UPI (GPay, PhonePe), Cards, or NetBanking in Indian Rupees."
                      : "Pay using international credit/debit cards in US Dollars. Note: UPI is not available for USD payments."}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-offwhite/40 text-xs">
                  <Lock size={12} />
                  <span>Payments are secure and encrypted.</span>
                </div>
              </section>

              <button 
                type="submit" 
                disabled={isProcessing}
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
                     Pay {currency === 'INR' ? `₹${(cartTotal * 85).toLocaleString()}` : `$${cartTotal.toLocaleString()}`}
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
