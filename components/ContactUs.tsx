import React, { useState, useEffect } from 'react';
import { PageHero } from './PageHero';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { CustomSelect } from './CustomInputs';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../src/supabaseClient';

export const ContactUs: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [subject, setSubject] = useState('General Inquiry');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            user_id: user?.id || null,
            name: formData.name,
            email: formData.email,
            subject: subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="CONTACT" 
        subtitle="At your service, always."
        bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="font-display text-3xl text-offwhite mb-6">Headquarters</h2>
              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-luxury shrink-0 group-hover:bg-luxury group-hover:text-void transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm uppercase tracking-widest text-offwhite mb-1">Paris Atelier</h4>
                    <p className="font-body text-offwhite/50 text-sm leading-relaxed">
                      12 Rue de la Paix<br />
                      75002 Paris, France
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-luxury shrink-0 group-hover:bg-luxury group-hover:text-void transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm uppercase tracking-widest text-offwhite mb-1">Concierge</h4>
                    <p className="font-body text-offwhite/50 text-sm">
                      +33 1 42 60 00 00
                    </p>
                    <p className="font-body text-offwhite/30 text-xs mt-1">
                      Mon-Sat, 9am - 8pm CET
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-luxury shrink-0 group-hover:bg-luxury group-hover:text-void transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="font-ui text-sm uppercase tracking-widest text-offwhite mb-1">Email</h4>
                    <p className="font-body text-offwhite/50 text-sm">
                      concierge@aeterna.com
                    </p>
                    <p className="font-body text-offwhite/50 text-sm">
                      press@aeterna.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5">
              <h2 className="font-display text-2xl text-offwhite mb-6">Global Boutiques</h2>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-ui text-xs uppercase tracking-widest text-luxury mb-2">London</h4>
                    <p className="font-body text-offwhite/50 text-xs">Mayfair, London</p>
                 </div>
                 <div>
                    <h4 className="font-ui text-xs uppercase tracking-widest text-luxury mb-2">New York</h4>
                    <p className="font-body text-offwhite/50 text-xs">5th Avenue, NYC</p>
                 </div>
                 <div>
                    <h4 className="font-ui text-xs uppercase tracking-widest text-luxury mb-2">Tokyo</h4>
                    <p className="font-body text-offwhite/50 text-xs">Ginza, Tokyo</p>
                 </div>
                 <div>
                    <h4 className="font-ui text-xs uppercase tracking-widest text-luxury mb-2">Dubai</h4>
                    <p className="font-body text-offwhite/50 text-xs">Dubai Mall, UAE</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
             <div className="bg-stone-900/50 p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-xl">
                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                    <CheckCircle size={64} className="text-luxury mb-6" />
                    <h3 className="font-display text-3xl text-offwhite mb-4">Message Sent</h3>
                    <p className="font-body text-offwhite/60 max-w-sm mb-8">
                      Thank you for contacting AETERNA. Our concierge team has received your inquiry and will respond within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="font-ui text-luxury uppercase tracking-widest text-xs border-b border-luxury/30 pb-1 hover:text-white transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-display text-2xl text-offwhite mb-2">Send an Inquiry</h3>
                    <p className="font-body text-offwhite/40 text-sm mb-8">Fields marked with * are required</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Name *</label>
                        <input 
                          required 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Email *</label>
                        <input 
                          required 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" 
                        />
                      </div>
                    </div>

                    <div>
                      <CustomSelect 
                        label="Subject *"
                        value={subject}
                        onChange={setSubject}
                        options={[
                          { value: 'General Inquiry', label: 'General Inquiry' },
                          { value: 'Product Information', label: 'Product Information' },
                          { value: 'Order Status', label: 'Order Status' },
                          { value: 'Press & Media', label: 'Press & Media' },
                          { value: 'Careers', label: 'Careers' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Message *</label>
                      <textarea 
                        required 
                        rows={5} 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors resize-none"
                      ></textarea>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-luxury text-void font-ui font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(232,207,160,0.1)] disabled:opacity-50 flex items-center justify-center gap-2 group"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        {!isSubmitting && <Send size={16} className="transition-transform group-hover:translate-x-1" />}
                      </button>
                    </div>
                  </form>
                )}
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};