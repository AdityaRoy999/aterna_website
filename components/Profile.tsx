import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../src/supabaseClient';
 import { User, Package, RotateCcw, CreditCard, MapPin, LogOut, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: any[]; // We'll fetch these separately or join
}

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const { clearLocalCart } = useCart();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'returns'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

      if (data) {
        console.log('Fetched Profile Data:', data); // Debugging
        setProfile({ ...profile, ...data, email: user?.email || '' });
      } else {
        // If no profile exists yet, just set email
        setProfile(prev => ({ ...prev, email: user?.email || '' }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name,
          phone: profile.phone,
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
          country: profile.country,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setNotification({ type: 'success', message: 'Profile updated successfully' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-32 flex justify-center"><Loader className="animate-spin text-luxury" /></div>;

  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 w-full text-left transition-all duration-300 border-l-2 ${
        activeTab === id 
          ? 'border-luxury bg-white/5 text-luxury' 
          : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="uppercase tracking-widest text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-void pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-display text-4xl md:text-5xl text-luxury mb-2">My Account</h1>
        <p className="text-white/40 font-body mb-12">Welcome back, {profile.full_name || user?.email}</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900/50 rounded-2xl border border-white/5 overflow-hidden">
              <TabButton id="profile" icon={User} label="Profile" />
              <TabButton id="orders" icon={Package} label="Orders" />
              <TabButton id="returns" icon={RotateCcw} label="Returns" />

              <button
                onClick={async () => {
                  clearLocalCart();
                  await signOut();
                  onNavigate('home');
                }}
                className="flex items-center gap-3 px-6 py-4 w-full text-left text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border-l-2 border-transparent mt-4"
              >
                <LogOut size={20} />
                <span className="uppercase tracking-widest text-sm">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-stone-900/50 rounded-2xl border border-white/5 p-8 min-h-[500px] relative">
              
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-white/40">Full Name</label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={e => setProfile({...profile, full_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white/50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-white/40">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h3 className="font-display text-xl text-white mb-6 flex items-center gap-2">
                      <MapPin size={20} className="text-luxury" /> Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Address Line 1</label>
                        <input
                          type="text"
                          value={profile.address_line1}
                          onChange={e => setProfile({...profile, address_line1: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Address Line 2</label>
                        <input
                          type="text"
                          value={profile.address_line2}
                          onChange={e => setProfile({...profile, address_line2: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">City</label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={e => setProfile({...profile, city: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">State / Province</label>
                        <input
                          type="text"
                          value={profile.state}
                          onChange={e => setProfile({...profile, state: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Postal Code</label>
                        <input
                          type="text"
                          value={profile.postal_code}
                          onChange={e => setProfile({...profile, postal_code: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Country</label>
                        <input
                          type="text"
                          value={profile.country}
                          onChange={e => setProfile({...profile, country: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-luxury focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4">
                    {notification && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border animate-fade-in ${
                        notification.type === 'success' 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span className="text-sm font-medium">{notification.message}</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-luxury text-void px-8 py-3 rounded-lg font-body uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-display text-xl text-white mb-6">Order History</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No orders found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Order ID</p>
                              <p className="font-mono text-sm text-white/80">{order.id.slice(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Date</p>
                              <p className="text-sm text-white/80">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                ['shipped', 'out_for_delivery'].includes(order.status) ? 'bg-blue-500/10 text-blue-400' :
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-400' :
                                  ['shipped', 'out_for_delivery'].includes(order.status) ? 'bg-blue-400' :
                                  order.status === 'cancelled' ? 'bg-red-400' :
                                  'bg-yellow-400'
                                }`} />
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="font-display text-xl text-luxury">${order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'returns' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-display text-xl text-white mb-6">Returns & Refunds</h3>
                  <div className="text-center py-12 text-white/40">
                    <RotateCcw size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No active returns.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
