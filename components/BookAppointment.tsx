import React, { useState, useEffect } from 'react';
import { PageHero } from './PageHero';
import { MapPin, Send, CheckCircle, Lock } from 'lucide-react';
import { CustomSelect, CustomDatePicker, CustomTimePicker } from './CustomInputs';
import { supabase } from '../src/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'virtual',
    date: '',
    time: '',
    interest: 'timepieces',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Should be handled by UI, but extra safety
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            location: formData.location,
            preferred_date: formData.date,
            preferred_time: formData.time,
            interest: formData.interest,
            message: formData.message,
            status: 'Pending'
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="BOOK APPOINTMENT" 
        subtitle="Experience AETERNA firsthand."
        bgImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-6xl mx-auto">
        
        {isSuccess ? (
           <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-luxury/10 flex items-center justify-center text-luxury mb-8 border border-luxury/20 shadow-[0_0_40px_rgba(232,207,160,0.2)]">
                <CheckCircle size={48} />
              </div>
              <h2 className="font-display text-5xl text-offwhite mb-6">Request Received</h2>
              <p className="font-body text-offwhite/60 max-w-lg mb-8 text-lg leading-relaxed">
                Thank you, {formData.name}. Your appointment request has been sent to our Concierge team. We will confirm your consultation shortly via email.
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="font-ui text-luxury uppercase tracking-widest text-xs border-b border-luxury/30 pb-1 hover:text-white transition-colors"
                data-hover="true"
              >
                Book Another Appointment
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Intro Text */}
            <div className="lg:col-span-5" data-aos="fade-right">
               <h2 className="font-display text-4xl text-offwhite mb-8">Private Consultation</h2>
               <div className="space-y-6 text-offwhite/60 font-body leading-relaxed text-lg">
                 <p>
                   Whether you wish to explore our latest collection, commission a bespoke piece, or simply seek advice on your next acquisition, our specialists are at your disposal.
                 </p>
                 <p>
                   We offer virtual consultations via secure video link, or private appointments at our boutiques in Paris, London, and New York.
                 </p>
               </div>
               
               <div className="mt-12 space-y-6">
                 <div className="flex items-center gap-4 text-offwhite/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-luxury">
                       <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-display text-lg">Global Boutiques</h4>
                      <p className="text-xs text-offwhite/40 uppercase tracking-widest">Paris • London • New York</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-offwhite/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-luxury">
                       {/* Replaced Clock with a simple div or icon since Clock is now imported from CustomInputs implicitly or we need to re-import it if we removed it from top import */}
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <h4 className="font-display text-lg">Flexible Hours</h4>
                      <p className="text-xs text-offwhite/40 uppercase tracking-widest">Tailored to your timezone</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7" data-aos="fade-left">
               {!user ? (
                 <div className="bg-stone-900/30 p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-luxury mb-6">
                       <Lock size={32} />
                    </div>
                    <h3 className="font-display text-2xl text-offwhite mb-4">Members Only</h3>
                    <p className="font-body text-offwhite/60 max-w-sm mb-8">
                      Please sign in to your account to book a private consultation with our specialists.
                    </p>
                 </div>
               ) : (
               <form onSubmit={handleSubmit} className="bg-stone-900/30 p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="md:col-span-2">
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-3">Consultation Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {['virtual', 'paris', 'london', 'new-york'].map((loc) => (
                             <button
                                key={loc}
                                type="button"
                                onClick={() => setFormData({...formData, location: loc})}
                                className={`py-3 px-2 rounded-lg border text-center transition-all duration-300 ${
                                  formData.location === loc 
                                    ? 'bg-luxury text-void border-luxury font-bold' 
                                    : 'bg-transparent text-offwhite/60 border-white/10 hover:border-white/30'
                                }`}
                             >
                               <span className="font-ui text-[10px] uppercase tracking-wider block truncate">
                                 {loc.replace('-', ' ')}
                               </span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Full Name</label>
                        <input required name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                     </div>
                     <div>
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Email Address</label>
                        <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors" />
                     </div>
                     
                     <CustomDatePicker 
                        label="Preferred Date" 
                        value={formData.date} 
                        onChange={(val) => setFormData({...formData, date: val})} 
                     />
                     
                     <CustomTimePicker 
                        label="Preferred Time" 
                        value={formData.time} 
                        onChange={(val) => setFormData({...formData, time: val})} 
                     />

                     <div className="md:col-span-2">
                        <CustomSelect 
                           label="Area of Interest"
                           value={formData.interest}
                           onChange={(val) => setFormData({...formData, interest: val})}
                           options={[
                              { value: 'timepieces', label: 'Timepieces' },
                              { value: 'jewelry', label: 'Fine Jewelry' },
                              { value: 'fragrance', label: 'Fragrance' },
                              { value: 'bespoke', label: 'Bespoke Commission' },
                              { value: 'other', label: 'Other Inquiry' }
                           ]}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">Message (Optional)</label>
                        <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-white/30 focus:outline-none focus:border-luxury transition-colors resize-none"></textarea>
                     </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-luxury text-void font-ui font-bold text-sm uppercase tracking-widest py-5 rounded-lg hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(232,207,160,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 group"
                    data-hover="true"
                  >
                     {isSubmitting ? 'Processing...' : 'Request Appointment'}
                     {!isSubmitting && <Send size={16} className="transition-transform group-hover:translate-x-1" />}
                  </button>
               </form>
               )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};