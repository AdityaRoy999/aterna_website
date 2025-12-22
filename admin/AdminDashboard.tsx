import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { JournalTab } from './JournalTab';
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
  ChevronDown,
  DollarSign,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  Shield,
  Menu,
  MessageSquare,
  Calendar,
  Briefcase,
  FileText,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

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

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (!payload || !payload.new) return;
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when menu is open (mainly for mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/40 hover:text-luxury hover:bg-white/5 rounded-full relative transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="notifications-panel"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
          
          {/* Notification Panel */}
          <div 
            id="notifications-panel" 
            role="dialog" 
            aria-label="Notifications" 
            className="fixed left-4 right-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] sm:max-h-auto"
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="hidden sm:inline text-xs text-luxury hover:text-white transition-colors">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 text-white/40 hover:text-white rounded visible sm:hidden" aria-label="Close notifications">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div 
              className="overflow-y-auto custom-scrollbar overscroll-contain max-h-[60vh] sm:max-h-[400px]"
              data-lenis-prevent="true"
            >
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => { markAsRead(notification.id); if (window.innerWidth < 640) setIsOpen(false); }}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.is_read ? 'bg-white/[0.02]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.is_read ? 'bg-luxury' : 'bg-transparent'}`} />
                      <div>
                        <p className={`text-sm mb-1 ${!notification.is_read ? 'text-white font-medium' : 'text-white/60'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-white/40 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-white/20 uppercase tracking-wider">
                          {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Mobile Footer */}
            <div className="sm:hidden p-3 border-t border-white/10 shrink-0">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="w-full py-2 bg-luxury text-void rounded text-sm font-medium">Mark all read</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ExportMenu = ({ data, filename, headers }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportCSV = () => {
    const csvContent = [
      headers.map((h: any) => h.label).join(','),
      ...data.map((row: any) => headers.map((h: any) => {
        // Handle nested properties
        const val = h.key.split('.').reduce((o: any, i: any) => o?.[i], row);
        // Handle arrays or objects
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '');
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = headers.map((h: any) => h.label);
    const tableRows = data.map((row: any) => {
      return headers.map((h: any) => {
         const val = h.key.split('.').reduce((o: any, i: any) => o?.[i], row);
         // Format specific values if needed, e.g. dates or currency
         if (h.key === 'price' || h.key === 'total_amount') return `$${val}`;
         if (h.key.includes('created_at') || h.key.includes('date')) return new Date(val).toLocaleDateString();
         return val || '';
      });
    });

    doc.text(`${filename.replace(/_/g, ' ').toUpperCase()}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [232, 207, 160], textColor: [0, 0, 0] } // Luxury gold color
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex shadow-sm">
        <button
          onClick={exportPDF}
          className="px-3 py-1.5 bg-white/5 border border-white/10 border-r-0 rounded-l text-white/60 text-sm hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
          title="Export as PDF"
        >
          <FileText size={14} />
          <span>Export PDF</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-r text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border-l border-l-white/10"
        >
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[150px]">
          <button
            onClick={exportCSV}
            className="w-full text-left px-4 py-2.5 text-xs font-medium uppercase hover:bg-white/5 transition-colors flex items-center gap-2 text-white/60 hover:text-white"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'contact' | 'appointments' | 'careers' | 'settings' | 'journal'>('overview');
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
        
        <nav 
          className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar overscroll-contain"
          data-lenis-prevent="true"
        >
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
            <p className="px-3 text-xs font-semibold text-white/20 uppercase tracking-wider">Content</p>
          </div>
          <SidebarItem 
            icon={<FileText size={18} />} 
            label="Journal" 
            active={activeTab === 'journal'} 
            onClick={() => { setActiveTab('journal'); setIsSidebarOpen(false); }} 
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
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-white/20 uppercase tracking-wider">System</p>
          </div>
          <SidebarItem 
            icon={<Settings size={18} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
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
            <NotificationsMenu />
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'text-luxury bg-white/5' : 'text-white/40 hover:text-luxury hover:bg-white/5'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab onNavigate={onNavigate} setActiveTab={setActiveTab} />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'journal' && <JournalTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'contact' && <ContactTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'careers' && <CareersTab />}
            {activeTab === 'settings' && <SettingsTab />}
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
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch basic stats
      const { data: orders } = await supabase.from('orders').select('total_amount, created_at, status');
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { data: orderItems } = await supabase.from('order_items').select('product_name, quantity, price');
      
      const totalSales = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      
      setStats({
        sales: totalSales,
        orders: orders?.length || 0,
        products: productsCount || 0
      });

      // Process Sales Data (Last 7 days or grouped by date)
      if (orders) {
        const salesByDate: Record<string, number> = {};
        orders.forEach(order => {
          const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          salesByDate[date] = (salesByDate[date] || 0) + (Number(order.total_amount) || 0);
        });
        
        // Sort by date (simple approach, assuming data is relatively recent)
        const chartData = Object.entries(salesByDate).map(([name, value]) => ({ name, value }));
        // Limit to last 7 entries if too many
        setSalesData(chartData.slice(-7));

        // Process Order Status
        const statusCounts: Record<string, number> = {};
        orders.forEach(order => {
          const status = order.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        setOrderStatusData(statusData);
      }

      // Process Top Products
      if (orderItems) {
        const productSales: Record<string, number> = {};
        orderItems.forEach(item => {
          productSales[item.product_name] = (productSales[item.product_name] || 0) + (item.quantity || 0);
        });
        
        const topProductsData = Object.entries(productSales)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
          
        setTopProducts(topProductsData);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#D4AF37', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors duration-300">
          <h3 className="text-lg font-display text-white mb-6">Sales Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors duration-300">
          <h3 className="text-lg font-display text-white mb-6">Top Products</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={100} stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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

    // Realtime Subscription
    const subscription = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
         // Ideally update state granularly, but refetching is safer for consistency
         console.log('Realtime update received:', payload);
         fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
        <div className="flex gap-3">
          <ExportMenu 
            data={products.map(p => ({
              ...p,
              status_label: p.is_new ? 'New Arrival' : 'Standard'
            }))} 
            filename="products_inventory" 
            headers={[
              { label: 'ID', key: 'id' },
              { label: 'Name', key: 'name' },
              { label: 'Category', key: 'category' },
              { label: 'Price', key: 'price' },
              { label: 'Quantity', key: 'quantity' },
              { label: 'Status', key: 'status_label' },
              { label: 'Created At', key: 'created_at' }
            ]} 
          />
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-luxury hover:bg-white hover:text-void text-void px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 shadow-[0_0_15px_rgba(232,207,160,0.2)] hover:shadow-[0_0_25px_rgba(232,207,160,0.4)] active:scale-95"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Product Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.map(product => (
              <tr 
                key={product.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:shadow-lg bg-transparent ${
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
                    <span className="font-mono text-white/80">{product.quantity || 0}</span>
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

      {/* Mobile View for Products */}
      <div className="md:hidden space-y-4">
        {products.map(product => (
          <div 
            key={product.id} 
            className={`bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-500 ${
              deletingId === product.id ? 'opacity-0 -translate-x-full' : 'opacity-100'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-16 rounded bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{product.name}</h3>
                <p className="text-xs text-white/40 mb-1">ID: {product.id.slice(0, 6)}</p>
                <span className="font-mono text-luxury">${product.price}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/60 text-sm">{product.category}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_new ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                {product.is_new ? 'New Arrival' : 'Standard'}
              </span>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
              <button 
                onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-all duration-200 active:scale-95 text-sm"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => initiateDelete(product)} 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 active:scale-95 text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
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
    quantity: product?.quantity || 0,
    category: product?.category || 'Timepieces',
    image_url: product?.image_url || '',
    description: product?.description || '',
    is_new: product?.is_new || false,
    variant_type: product?.variant_type || 'Color'
  });
  
  // Parse variants from JSON or use default
  const [variants, setVariants] = useState<any[]>(() => {
    if (product?.variants) {
      return typeof product.variants === 'string' 
        ? JSON.parse(product.variants) 
        : product.variants;
    }
    return [];
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update variant type based on category
  useEffect(() => {
    if (formData.category === 'Fragrance') {
      setFormData(prev => ({ ...prev, variant_type: 'Size' }));
    } else if (formData.category === 'Timepieces') {
      setFormData(prev => ({ ...prev, variant_type: 'Finish' }));
    }
  }, [formData.category]);

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

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', imageUrl: formData.image_url, colorCode: '#000000' }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToSave = isCustomCategory ? customCategory : formData.category;
    
    const dataToSave = {
      ...formData,
      category: categoryToSave,
      variants: variants
    };

    if (product) {
      // Update existing product
      const { error } = await supabase.from('products').update(dataToSave).eq('id', product.id);
      if (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product: ' + error.message);
        return;
      }
    } else {
      // Insert new product - Let DB generate ID
      const { error } = await supabase.from('products').insert([dataToSave]);
      if (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product: ' + error.message);
        return;
      }
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-2xl shadow-2xl my-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-display text-white">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all duration-300 hover:rotate-90"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
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
                <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Base Price</label>
                <input 
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Quantity</label>
                <input 
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all duration-300"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
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
            </div>

            {/* Right Column: Image & Variants */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Main Image</label>
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

              {/* Variants Section */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                    Variants ({formData.variant_type})
                  </label>
                  <button 
                    type="button" 
                    onClick={handleAddVariant}
                    className="text-xs bg-luxury/10 text-luxury px-2 py-1 rounded hover:bg-luxury hover:text-void transition-colors"
                  >
                    + Add Variant
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex gap-2 items-start bg-black/20 p-2 rounded border border-white/5">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-[2fr,1fr] gap-2 mb-2">
                          <div>
                            <label className="block text-[10px] uppercase text-white/30 mb-1">Variant Name</label>
                            <input 
                              placeholder={formData.variant_type === 'Size' ? "e.g. 50ml" : "e.g. Gold"}
                              className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:border-luxury focus:outline-none"
                              value={variant.name}
                              onChange={e => handleVariantChange(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-white/30 mb-1">Price (+)</label>
                            <input 
                              type="number"
                              placeholder="Default"
                              className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:border-luxury focus:outline-none"
                              value={variant.price || ''}
                              onChange={e => handleVariantChange(index, 'price', e.target.value as any)}
                            />
                          </div>
                        </div>
                        <div>
                           <label className="block text-[10px] uppercase text-white/30 mb-1">Image URL</label>
                           <input 
                              placeholder="Optional - Overrides main image"
                              className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white/60 focus:border-luxury focus:outline-none"
                              value={variant.imageUrl || ''}
                              onChange={e => handleVariantChange(index, 'imageUrl', e.target.value)}
                           />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <p className="text-xs text-white/20 text-center py-2 italic">No variants added. Main product will be used.</p>
                  )}
                </div>
              </div>
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
const StatusDropdown = ({ status, onUpdate }: { status: string, onUpdate: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const options = [
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (val: string) => val === 'cancelled' ? 'text-red-400' : 'text-emerald-400';
  const currentLabel = options.find(o => o.value === status)?.label || status;

  return (
    <div className="relative min-w-[160px]" ref={ref}>
      <button
        onClick={toggleDropdown}
        className={`w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs font-medium uppercase flex justify-between items-center transition-all duration-300 hover:border-white/30 ${getStatusColor(status)}`}
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={`ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-white/40`} />
      </button>

      {isOpen && (
        <div 
          className="fixed z-[9999] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: `${coords.top + 4}px`, 
            left: `${coords.left}px`, 
            width: `${coords.width}px` 
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onUpdate(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium uppercase hover:bg-white/5 transition-colors flex justify-between items-center ${getStatusColor(opt.value)}`}
            >
              {opt.label}
              {status === opt.value && <Check size={12} className={getStatusColor(opt.value)} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
          <ExportMenu 
            data={orders} 
            filename="orders_report" 
            headers={[
              { label: 'Order ID', key: 'id' },
              { label: 'Customer Email', key: 'email' },
              { label: 'Total Amount', key: 'total_amount' },
              { label: 'Status', key: 'status' },
              { label: 'Date', key: 'created_at' }
            ]} 
          />
        </div>
      </div>

      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[900px] md:min-w-0 text-left border-collapse">
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
              <tr key={order.id} className="hover:bg-white/5 transition-all duration-200 hover:shadow-lg bg-transparent">
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
                  <StatusDropdown 
                    status={order.status} 
                    onUpdate={(val) => updateStatus(order.id, val)} 
                  />
                </td>
                <td className="p-4 text-white/40 text-sm align-top">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View for Orders */}
      <div className="md:hidden space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-luxury font-mono text-sm">#{order.id.slice(0, 8)}</span>
                <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className="font-medium text-white">${order.total_amount}</span>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-white/40" />
                <span className="text-sm text-white/80">{order.email}</span>
              </div>
              <StatusDropdown 
                status={order.status} 
                onUpdate={(val) => updateStatus(order.id, val)} 
              />
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={12} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-white/40">
                      {item.variant_name && <span className="mr-1">{item.variant_name} •</span>}
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Contact Messages</h2>
        <ExportMenu 
          data={messages} 
          filename="contact_messages" 
          headers={[
            { label: 'Date', key: 'created_at' },
            { label: 'Name', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Subject', key: 'subject' },
            { label: 'Message', key: 'message' }
          ]} 
        />
      </div>
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[800px] md:min-w-0 text-left border-collapse">
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
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:shadow-lg bg-transparent ${
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

      {/* Mobile View for Contact Messages */}
      <div className="md:hidden space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`bg-white/5 border border-white/10 rounded-lg p-4 relative overflow-hidden transition-all duration-500 ${
              deletingId === msg.id ? 'opacity-0 -translate-x-full' : 'opacity-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">{msg.name}</h3>
              <span className="text-xs text-white/40">{new Date(msg.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-white/60 mb-2">{msg.email}</p>
            <div className="mb-3">
              <p className="text-luxury text-sm font-medium mb-1">{msg.subject}</p>
              <p className="text-white/80 text-sm line-clamp-3">{msg.message}</p>
            </div>
            <div className="flex justify-end border-t border-white/10 pt-3">
              <button 
                onClick={() => initiateDelete(msg)} 
                className="flex items-center gap-2 text-red-400 text-sm hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Appointments</h2>
        <ExportMenu 
          data={appointments} 
          filename="appointments_list" 
          headers={[
            { label: 'Date', key: 'created_at' },
            { label: 'Client Name', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Type', key: 'location' },
            { label: 'Preferred Date', key: 'preferred_date' },
            { label: 'Preferred Time', key: 'preferred_time' },
            { label: 'Status', key: 'status' }
          ]} 
        />
      </div>
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[850px] md:min-w-0 text-left border-collapse">
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
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:shadow-lg bg-transparent ${
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

      {/* Mobile View for Appointments */}
      <div className="md:hidden space-y-4">
        {appointments.map(apt => (
          <div 
            key={apt.id} 
            className={`bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-500 ${
              deletingId === apt.id ? 'opacity-0 -translate-x-full' : 'opacity-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-medium">{apt.name}</h3>
                <p className="text-xs text-white/40">{apt.email}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                {apt.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div className="bg-black/20 p-2 rounded border border-white/5">
                <p className="text-xs text-white/40 uppercase mb-1">Date & Time</p>
                <p className="text-white">{apt.preferred_date}</p>
                <p className="text-white/60 text-xs">{apt.preferred_time}</p>
              </div>
              <div className="bg-black/20 p-2 rounded border border-white/5">
                <p className="text-xs text-white/40 uppercase mb-1">Location</p>
                <p className="text-white capitalize">{apt.location}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-3">
              <button 
                onClick={() => initiateDelete(apt)} 
                className="flex items-center gap-2 text-red-400 text-sm hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
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
const ViewAnswersModal = ({ application, onClose }: any) => {
  if (!application) return null;
  
  const answers = application.answers || {};
  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-lg shadow-2xl my-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-display text-white">Application Details</h3>
            <p className="text-white/40 text-sm">{application.full_name} - {application.job_title}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all duration-300 hover:rotate-90">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <h4 className="text-xs font-bold text-luxury uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Email:</span>
                <span className="text-white">{application.email}</span>
              </div>
              {application.phone && (
                <div className="flex justify-between">
                  <span className="text-white/40">Phone:</span>
                  <span className="text-white">{application.phone}</span>
                </div>
              )}
              {application.linkedin_url && (
                <div className="flex justify-between">
                  <span className="text-white/40">LinkedIn:</span>
                  <a href={application.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate max-w-[200px]">
                    {application.linkedin_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Answers */}
          <div>
            <h4 className="text-xs font-bold text-luxury uppercase tracking-wider mb-3">Questionnaire Responses</h4>
            {hasAnswers ? (
              <div className="space-y-4">
                {Object.entries(answers).map(([question, answer]: [string, any], idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <p className="text-white/60 text-xs mb-2">{question}</p>
                    <p className="text-white text-sm">{String(answer)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-white/5 border-dashed">
                <p className="text-white/40 text-sm">No questionnaire answers provided.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CareersTab = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [viewingApplication, setViewingApplication] = useState<any>(null);

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Job Applications</h2>
        <ExportMenu 
          data={applications} 
          filename="job_applications" 
          headers={[
            { label: 'Date', key: 'created_at' },
            { label: 'Candidate', key: 'full_name' },
            { label: 'Email', key: 'email' },
            { label: 'Position', key: 'job_title' },
            { label: 'Resume URL', key: 'signed_resume_url' }
          ]} 
        />
      </div>
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[850px] md:min-w-0 text-left border-collapse">
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
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:shadow-lg bg-transparent ${
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
                    <button 
                      onClick={() => setViewingApplication(app)}
                      className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white/60 transition-all duration-300 hover:text-white active:scale-95"
                    >
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

      {/* Mobile View for Job Applications */}
      <div className="md:hidden space-y-4">
        {applications.map(app => (
          <div 
            key={app.id} 
            className={`bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-500 ${
              deletingId === app.id ? 'opacity-0 -translate-x-full' : 'opacity-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-medium">{app.full_name}</h3>
                <p className="text-xs text-white/40">{app.email}</p>
              </div>
              <span className="text-xs text-white/40">{new Date(app.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase mb-1">Position</p>
              <p className="text-luxury font-medium">{app.job_title}</p>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              {app.signed_resume_url ? (
                <a href={app.signed_resume_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm hover:text-blue-300 transition-colors flex items-center gap-1">
                  <span className="text-xs">📄</span> View Resume
                </a>
              ) : (
                <span className="text-white/20 text-sm">No Resume</span>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingApplication(app)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded text-white/60 transition-all duration-300 hover:text-white active:scale-95"
                >
                  View Answers
                </button>
                <button 
                  onClick={() => initiateDelete(app)} 
                  className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 active:scale-95"
                  title="Delete Application"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
      />

      <ViewAnswersModal 
        application={viewingApplication} 
        onClose={() => setViewingApplication(null)} 
      />
    </div>
  );
};

const SettingsTab = () => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState('AETERNA Luxury');
  const [supportEmail, setSupportEmail] = useState('support@aeterna.com');
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    newMessages: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">System Settings</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-luxury text-void px-6 py-2 rounded-lg font-medium hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(232,207,160,0.2)] disabled:opacity-50 active:scale-95"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Store Profile */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-luxury/10 rounded-lg text-luxury">
              <LayoutDashboard size={20} />
            </div>
            <h3 className="text-lg font-medium text-white">Store Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Store Name</label>
              <input 
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Support Email</label>
              <input 
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white focus:border-luxury focus:outline-none focus:ring-1 focus:ring-luxury/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Currency</label>
              <div className="w-full bg-black/20 border border-white/10 rounded p-3 text-white/60 cursor-not-allowed flex justify-between items-center">
                <span>USD ($)</span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-medium text-white">Admin Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Email Address</label>
              <input 
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white/60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase mb-1 tracking-wider">Role</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-luxury/10 text-luxury border border-luxury/20 rounded text-xs font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <div className="pt-2">
              <button className="text-sm text-luxury hover:text-white transition-colors underline underline-offset-4">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-medium text-white">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
              <div>
                <p className="text-white text-sm font-medium">New Order Alerts</p>
                <p className="text-white/40 text-xs">Get notified when a new order is placed</p>
              </div>
              <button 
                onClick={() => setNotifications({...notifications, newOrders: !notifications.newOrders})}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notifications.newOrders ? 'bg-luxury' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${notifications.newOrders ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
              <div>
                <p className="text-white text-sm font-medium">Low Stock Warnings</p>
                <p className="text-white/40 text-xs">Alert when product inventory is low</p>
              </div>
              <button 
                onClick={() => setNotifications({...notifications, lowStock: !notifications.lowStock})}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notifications.lowStock ? 'bg-luxury' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${notifications.lowStock ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
              <div>
                <p className="text-white text-sm font-medium">Message Alerts</p>
                <p className="text-white/40 text-xs">Notifications for new contact messages</p>
              </div>
              <button 
                onClick={() => setNotifications({...notifications, newMessages: !notifications.newMessages})}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notifications.newMessages ? 'bg-luxury' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${notifications.newMessages ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-medium text-white">System Information</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-white/5 pb-2">
              <span className="text-white/40">Version</span>
              <span className="text-white font-mono">v2.4.0</span>
            </div>
            <div className="flex justify-between text-sm border-b border-white/5 pb-2">
              <span className="text-white/40">Environment</span>
              <span className="text-emerald-400 font-medium">Production</span>
            </div>
            <div className="flex justify-between text-sm border-b border-white/5 pb-2">
              <span className="text-white/40">Database Status</span>
              <span className="text-emerald-400 font-medium">Connected</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-white/40">Last Backup</span>
              <span className="text-white">Today, 04:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
