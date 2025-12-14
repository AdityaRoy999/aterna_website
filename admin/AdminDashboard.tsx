import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Upload,
  ChevronRight,
  DollarSign,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  Shield,
  Menu,
  MessageSquare,
  Calendar,
  Briefcase
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-display text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-6 text-sm">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'contact' | 'appointments' | 'careers'>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check Admin Status (Hardcoded for now)
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      if (user.email?.toLowerCase() === 'adiroyboy2@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAdmin();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('redirect_to_admin', 'true');
      // Use query param for more robust redirect handling across environments
      const redirectTo = `${window.location.origin}/?page=admin`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-void flex items-center justify-center text-white/60 font-body">Loading system...</div>;

  if (!user) {
    const appLogo = '/images/app_logo.png';
    
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luxury/10 via-void to-void"></div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 animate-fade-in">
            <img src={appLogo} alt="AETERNA Logo" className="h-16 w-auto mb-4 drop-shadow-[0_0_15px_rgba(232,207,160,0.3)]" />
            <span className="font-display text-4xl text-luxury tracking-widest">
              AETERNA
            </span>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-luxury to-transparent my-4"></div>
            <p className="text-luxury/60 text-xs tracking-[0.2em] uppercase font-medium">Administration Portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-xl font-display text-white">Welcome Back</h2>
              <p className="text-white/40 text-sm mt-1 font-body">Please sign in to continue</p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 font-body">
                <Shield size={16} />
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-body">
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase mb-1 ml-1 tracking-wider">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-luxury focus:ring-1 focus:ring-luxury focus:outline-none transition-all placeholder:text-white/20"
                  placeholder="admin@aeterna.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase mb-1 ml-1 tracking-wider">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-luxury focus:ring-1 focus:ring-luxury focus:outline-none transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-luxury hover:bg-white text-void py-3 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(232,207,160,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 tracking-wider"
              >
                {authLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider font-body">
                <span className="bg-[#0a0a0a] px-3 text-white/40">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-void hover:bg-white/90 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 shadow-sm font-body tracking-wide"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>
          
          <div className="text-center mt-8 text-white/20 text-xs font-body tracking-widest">
            &copy; {new Date().getFullYear()} Aeterna Luxury. Secure Admin Environment.
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center font-body">
        <div className="bg-white/5 p-8 rounded-lg border border-white/10 max-w-md w-full text-center shadow-2xl backdrop-blur-sm">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-display text-white mb-2">Access Denied</h1>
          <p className="text-white/60 mb-6">You are not authorized to access the admin portal.</p>
          <div className="p-4 bg-white/5 rounded border border-white/10 mb-6 text-left">
            <p className="text-xs text-white/40 uppercase mb-1 tracking-wider">Logged in as</p>
            <p className="text-sm text-white font-mono">{user.email}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('home')}
              className="bg-luxury text-void px-6 py-2 rounded hover:bg-white transition-colors w-full font-medium tracking-wider"
            >
              Return to Store
            </button>
            <button 
              onClick={() => signOut()}
              className="text-white/40 hover:text-white text-sm w-full transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-offwhite font-body flex relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Luxury Theme */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col shadow-xl z-30 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-luxury rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-void" />
            </div>
            <span className="font-display text-lg text-luxury tracking-widest">ADMIN</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Package size={18} />} 
            label="Inventory" 
            active={activeTab === 'products'} 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<ShoppingBag size={18} />} 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} 
          />
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-white/20 uppercase tracking-wider">Communication</p>
          </div>
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="Contact Messages" 
            active={activeTab === 'contact'} 
            onClick={() => { setActiveTab('contact'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Calendar size={18} />} 
            label="Appointments" 
            active={activeTab === 'appointments'} 
            onClick={() => { setActiveTab('appointments'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Briefcase size={18} />} 
            label="Job Applications" 
            active={activeTab === 'careers'} 
            onClick={() => { setActiveTab('careers'); setIsSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-luxury border border-luxury/20">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => { signOut(); onNavigate('home'); }}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 text-sm w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen bg-void md:ml-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-display text-white capitalize tracking-wide">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-luxury hover:bg-white/5 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-white/40 hover:text-luxury hover:bg-white/5 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab onNavigate={onNavigate} setActiveTab={setActiveTab} />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'contact' && <ContactTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'careers' && <CareersTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-300 tracking-wide group relative overflow-hidden ${
      active 
        ? 'bg-luxury text-void shadow-[0_0_15px_rgba(232,207,160,0.3)] translate-x-1' 
        : 'text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className="relative z-10">{label}</span>
    {active && <div className="absolute inset-0 bg-white/10 animate-pulse-slow pointer-events-none" />}
  </button>
);

// --- OVERVIEW TAB ---
const OverviewTab = ({ onNavigate, setActiveTab }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sales: 0, orders: 0, products: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('orders').select('total_amount');
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      
      const totalSales = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      
      setStats({
        sales: totalSales,
        orders: orders?.length || 0,
        products: productsCount || 0
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-luxury/10 to-void border border-luxury/20 p-8 rounded-2xl relative overflow-hidden group hover:border-luxury/40 transition-all duration-500">
        <div className="relative z-10">
          <h1 className="text-3xl font-display text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">Welcome back, Admin</h1>
          <p className="text-white/60 max-w-xl font-body">
            Here's what's happening with your store today. You have <span className="font-bold text-luxury">{stats.orders} total orders</span> in the system.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-luxury/5 to-transparent pointer-events-none group-hover:opacity-75 transition-opacity duration-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.sales.toLocaleString()}`} 
          trend="+12.5%" 
          trendUp={true}
          icon={<DollarSign className="text-luxury" size={24} />} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders.toString()} 
          trend="+4.2%" 
          trendUp={true}
          icon={<ShoppingBag className="text-blue-400" size={24} />} 
        />
        <StatCard 
          title="Active Products" 
          value={stats.products.toString()} 
          trend="0%" 
          trendUp={true}
          icon={<Package className="text-purple-400" size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors duration-300">
          <h3 className="text-lg font-display text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('products')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all duration-300 group border border-white/5 hover:border-luxury/30 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              <div className="w-10 h-10 bg-luxury/10 text-luxury rounded-lg flex items-center justify-center mb-3 group-hover:bg-luxury group-hover:text-void transition-colors duration-300">
                <Plus size={20} />
              </div>
              <span className="font-medium text-white/60 group-hover:text-white transition-colors">Add Product</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all duration-300 group border border-white/5 hover:border-luxury/30 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <ShoppingBag size={20} />
              </div>
              <span className="font-medium text-white/60 group-hover:text-white transition-colors">View Orders</span>
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all duration-300 group border border-white/5 hover:border-luxury/30 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-medium text-white/60 group-hover:text-white transition-colors">Go to Website</span>
            </button>
            <button 
              onClick={() => setActiveTab('contact')}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all duration-300 group border border-white/5 hover:border-luxury/30 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <MessageSquare size={20} />
              </div>
              <span className="font-medium text-white/60 group-hover:text-white transition-colors">Check Messages</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors duration-300">
          <h3 className="text-lg font-display text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform duration-300"></div>
                <span className="text-white/60 text-sm group-hover:text-white transition-colors">Database</span>
              </div>
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform duration-300"></div>
                <span className="text-white/60 text-sm group-hover:text-white transition-colors">API Gateway</span>
              </div>
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform duration-300"></div>
                <span className="text-white/60 text-sm group-hover:text-white transition-colors">Storage</span>
              </div>
              <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, trendUp, icon }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-lg shadow-sm hover:border-luxury/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-white/40 text-sm font-medium mb-1 uppercase tracking-wider group-hover:text-luxury/60 transition-colors">{title}</p>
        <h3 className="text-2xl font-display text-white group-hover:scale-105 origin-left transition-transform duration-300">{value}</h3>
      </div>
      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors duration-300 group-hover:rotate-3">{icon}</div>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className={`${trendUp ? 'text-emerald-400' : 'text-red-400'} font-medium`}>{trend}</span>
      <span className="text-white/40">from last month</span>
    </div>
  </div>
);

// --- PRODUCTS TAB ---
const ProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const initiateDelete = (product: any) => {
    setItemToDelete(product);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const product = itemToDelete;
    setItemToDelete(null);
    
    setDeletingId(product.id);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Delete image from storage if exists
    if (product.image_url) {
      try {
        // Extract filename from URL - assumes standard Supabase storage URL format
        const urlParts = product.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await supabase.storage.from('products').remove([fileName]);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', product.id);
    
    if (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
      setDeletingId(null);
    } else {
      fetchProducts();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-luxury transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-luxury focus:ring-1 focus:ring-luxury/50 w-64 placeholder:text-white/20 transition-all duration-300"
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-luxury hover:bg-white hover:text-void text-void px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 shadow-[0_0_15px_rgba(232,207,160,0.2)] hover:shadow-[0_0_25px_rgba(232,207,160,0.4)] active:scale-95"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Product Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.map(product => (
              <tr 
                key={product.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:scale-[1.002] hover:shadow-lg bg-transparent ${
                  deletingId === product.id ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100'
                }`}
              >
                <td className={`transition-all duration-500 ease-in-out ${deletingId === product.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === product.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white/5 overflow-hidden border border-white/10 group-hover:border-luxury/30 transition-colors">
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-white/40">ID: {product.id.slice(0, 6)}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === product.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === product.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/60">{product.category}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === product.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === product.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="font-mono text-luxury">${product.price}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === product.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === product.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_new ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                      {product.is_new ? 'New Arrival' : 'Standard'}
                    </span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === product.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === product.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"><Edit size={16} /></button>
                      <button onClick={() => initiateDelete(product)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsModalOpen(false); fetchProducts(); }} 
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || 'Timepieces',
    image_url: product?.image_url || '',
    description: product?.description || '',
    color: product?.color || '',
    is_new: product?.is_new || false
  });
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error) {
      alert('Error uploading image: ' + (error as any).message);
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToSave = isCustomCategory ? customCategory : formData.category;
    
    const dataToSave = {
      ...formData,
      category: categoryToSave
    };

    if (product) {
      // Update existing product
      await supabase.from('products').update(dataToSave).eq('id', product.id);
    } else {
      // Check if product with same name exists (case-insensitive)
      const { data: existingProducts } = await supabase
        .from('products')
        .select('*')
        .ilike('name', formData.name.trim());

      if (existingProducts && existingProducts.length > 0) {
        // Product exists, append variant
        const existingProduct = existingProducts[0];
        const newVariant = {
          name: formData.color || 'Standard',
          imageUrl: formData.image_url,
          colorCode: '#000000', // Default or could be inferred
          description: formData.description
        };

        // Get existing variants or initialize with current main product as first variant
        let updatedVariants = existingProduct.variants || [];
        
        // If variants array is empty but product exists, it means it was a single product.
        // We should add the original product as the first variant if it's not there.
        if (updatedVariants.length === 0) {
           updatedVariants.push({
             name: existingProduct.color || 'Standard',
             imageUrl: existingProduct.image_url,
             colorCode: '#000000',
             description: existingProduct.description
           });
        }

        updatedVariants.push(newVariant);

        await supabase
          .from('products')
          .update({ 
            variants: updatedVariants,
            variant_type: existingProduct.variant_type || 'Color' // Ensure variant_type is set
          })
          .eq('id', existingProduct.id);
      } else {
        // New product, create with initial variant
        const initialVariant = {
          name: formData.color || 'Standard',
          imageUrl: formData.image_url,
          colorCode: '#000000',
          description: formData.description
        };
        
        await supabase.from('products').insert([{
          ...dataToSave,
          variant_type: 'Color',
          variants: [initialVariant]
        }]);
      }
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md shadow-2xl my-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-display text-white">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all duration-300 hover:rotate-90"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Product Name</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Description</label>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300 h-24 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Price</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Color</label>
              <input 
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
                placeholder="e.g. Gold, Silver"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Category</label>
            {!isCustomCategory ? (
              <select 
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                value={formData.category}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                  } else {
                    setFormData({...formData, category: e.target.value});
                  }
                }}
              >
                <option value="Timepieces">Timepieces</option>
                <option value="Fragrance">Fragrance</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Accessories">Accessories</option>
                <option value="custom">+ Custom Category</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Enter category name"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setIsCustomCategory(false)}
                  className="px-3 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Product Image</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  className="flex-1 bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300 text-sm"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="Image URL or upload file"
                  required
                />
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded p-2.5 transition-all duration-300 active:scale-95 hover:border-luxury/50">
                  <Upload size={20} className="text-luxury" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && <p className="text-xs text-luxury animate-pulse">Uploading image...</p>}
              {formData.image_url && (
                <div className="w-full h-32 bg-black/20 rounded border border-white/5 overflow-hidden group relative">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox"
              checked={formData.is_new}
              onChange={e => setFormData({...formData, is_new: e.target.checked})}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-luxury focus:ring-luxury accent-luxury cursor-pointer"
            />
            <span className="text-white/60 text-sm cursor-pointer" onClick={() => setFormData({...formData, is_new: !formData.is_new})}>Mark as New Arrival</span>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-all duration-300 active:scale-95">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 bg-luxury text-void py-2.5 rounded font-medium hover:bg-white transition-all duration-300 shadow-lg shadow-luxury/20 disabled:opacity-50 active:scale-95 hover:shadow-xl hover:shadow-luxury/30">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ORDERS TAB ---
const OrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // Fetch orders with items
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price,
          variant_name,
          product_id
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersData) {
      // Fetch product images
      const { data: productsData } = await supabase.from('products').select('id, image_url');
      const productImages = new Map(productsData?.map(p => [p.id, p.image_url]));

      const ordersWithImages = ordersData.map(order => ({
        ...order,
        items: order.order_items.map((item: any) => ({
          ...item,
          image_url: productImages.get(item.product_id)
        }))
      }));
      setOrders(ordersWithImages);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Order Management</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded text-sm hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95 hover:shadow-lg">Export CSV</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-white/5 transition-all duration-200 hover:scale-[1.002] hover:shadow-lg bg-transparent">
                <td className="p-4 font-mono text-sm text-luxury align-top">#{order.id.slice(0, 8)}</td>
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40">
                      <Users size={12} />
                    </div>
                    <span className="text-white/80 text-sm">{order.email}</span>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-luxury/30 transition-colors">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={12} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white group-hover:text-luxury transition-colors">{item.product_name}</p>
                          <p className="text-xs text-white/40">
                            {item.variant_name && <span className="mr-1">{item.variant_name} •</span>}
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-medium text-white align-top">${order.total_amount}</td>
                <td className="p-4 align-top">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`bg-black/20 border border-white/10 rounded px-2 py-1 text-xs font-medium uppercase focus:outline-none focus:border-luxury focus:ring-1 focus:ring-luxury/50 transition-all duration-300 cursor-pointer ${
                      order.status === 'delivered' ? 'text-emerald-400 border-emerald-500/20' :
                      order.status === 'shipped' ? 'text-blue-400 border-blue-500/20' :
                      'text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-4 text-white/40 text-sm align-top">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- CONTACT TAB ---
const ContactTab = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchMessages = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const initiateDelete = (msg: any) => {
    setItemToDelete(msg);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setItemToDelete(null);

    setDeletingId(id);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    
    if (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
      setDeletingId(null);
    } else {
      fetchMessages();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display text-white">Contact Messages</h2>
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Message</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {messages.map(msg => (
              <tr 
                key={msg.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:scale-[1.002] hover:shadow-lg bg-transparent ${
                  deletingId === msg.id ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100'
                }`}
              >
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/40 text-sm">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white">{msg.name}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/60">{msg.email}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-luxury">{msg.subject}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/80 max-w-xs truncate block" title={msg.message}>{msg.message}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === msg.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === msg.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <div className="text-right">
                      <button 
                        onClick={() => initiateDelete(msg)} 
                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                        title="Delete Message"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
};

// --- APPOINTMENTS TAB ---
const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    setAppointments(data || []);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const initiateDelete = (apt: any) => {
    setItemToDelete(apt);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    setItemToDelete(null);

    setDeletingId(id);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error } = await supabase.from('appointments').delete().eq('id', id);
    
    if (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
      setDeletingId(null);
    } else {
      fetchAppointments();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display text-white">Appointments</h2>
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Client</th>
              <th className="p-4">Type</th>
              <th className="p-4">Preferred Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {appointments.map(apt => (
              <tr 
                key={apt.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:scale-[1.002] hover:shadow-lg bg-transparent ${
                  deletingId === apt.id ? 'opacity-0 border-none' : 'opacity-100'
                }`}
              >
                <td className={`transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white/40 text-sm">{new Date(apt.created_at).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white">{apt.name}</div>
                    <div className="text-xs text-white/40">{apt.email}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white/60 capitalize">{apt.location}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white">
                      {apt.preferred_date} at {apt.preferred_time}
                    </div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {apt.status}
                    </span>
                  </div>
                </td>
                <td className={`text-right transition-all duration-500 ease-in-out ${deletingId === apt.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === apt.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <button 
                      onClick={() => initiateDelete(apt)} 
                      className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Delete Appointment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  );
};

// --- CAREERS TAB ---
const CareersTab = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchApplications = async () => {
    const { data } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false });
    
    if (data) {
      // Generate signed URLs for resumes (since bucket is private)
      const appsWithUrls = await Promise.all(data.map(async (app) => {
        if (app.resume_url) {
          const { data: signedData } = await supabase.storage
            .from('resumes')
            .createSignedUrl(app.resume_url, 3600); // Valid for 1 hour
          return { ...app, signed_resume_url: signedData?.signedUrl };
        }
        return app;
      }));
      setApplications(appsWithUrls);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const initiateDelete = (app: any) => {
    setItemToDelete(app);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const app = itemToDelete;
    setItemToDelete(null);

    setDeletingId(app.id);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Delete resume from storage if exists
    if (app.resume_url) {
      const { error: storageError } = await supabase.storage.from('resumes').remove([app.resume_url]);
      if (storageError) console.error('Error deleting resume:', storageError);
    }

    const { error } = await supabase.from('job_applications').delete().eq('id', app.id);
    
    if (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
      setDeletingId(null);
    } else {
      fetchApplications();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display text-white">Job Applications</h2>
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Candidate</th>
              <th className="p-4">Position</th>
              <th className="p-4">Resume</th>
              <th className="p-4">Details</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {applications.map(app => (
              <tr 
                key={app.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:scale-[1.002] hover:shadow-lg bg-transparent ${
                  deletingId === app.id ? 'opacity-0 border-none' : 'opacity-100'
                }`}
              >
                <td className={`transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white/40 text-sm">{new Date(app.created_at).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-white">{app.full_name}</div>
                    <div className="text-xs text-white/40">{app.email}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <div className="text-luxury">{app.job_title}</div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    {app.signed_resume_url ? (
                      <a href={app.signed_resume_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm hover:text-blue-300 transition-colors">
                        View PDF
                      </a>
                    ) : (
                      <span className="text-white/20">No Resume</span>
                    )}
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <button className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white/60 transition-all duration-300 hover:text-white active:scale-95">
                      View Answers
                    </button>
                  </div>
                </td>
                <td className={`text-right transition-all duration-500 ease-in-out ${deletingId === app.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === app.id ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    <button 
                      onClick={() => initiateDelete(app)} 
                      className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Delete Application"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
      />
    </div>
  );
};
