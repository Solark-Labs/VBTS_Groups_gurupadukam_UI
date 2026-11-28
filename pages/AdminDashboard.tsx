import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Product, Order } from '../types';
import { Package, ShoppingBag, Edit2, Check, Plus, BarChart3, TrendingUp, DollarSign, Trash2, AlertTriangle, LayoutDashboard, ShieldCheck, Calendar, MapPin, MessageCircle, ExternalLink, Utensils, Ticket, Users, BellRing, Database } from 'lucide-react';
import { buildPurohitWhatsAppUrl, getBookingMapDirectionsUrl, getReminderWindowInfo, buildAparaOrganizerWhatsAppUrl, getAparaPriorDispatchInfo } from '../utils/whatsapp';
import { isFirebaseConfigured } from '../services/firebase';

export const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    purohits,
    bookings,
    updateBookingStatus,
    markBookingWhatsappSent,
    aparaBookings,
    updateAparaBookingStatus,
    markAparaWhatsappSent,
    tickets,
    updateTicketStatus,
    seedCatalogToFirestore,
    triggerNotification,
    addToast,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<'balance' | 'inventory' | 'orders' | 'bookings' | 'apara' | 'purohits' | 'tickets'>('balance');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertBody, setAlertBody] = useState('');
  const [syncingFb, setSyncingFb] = useState(false);
  
  // Inventory State
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ price: number; stock: number }>({ price: 0, stock: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'powder', stock: 0, price: 0, origPrice: 0 });

  // --- Balance Sheet & Platform Calculations (must run unconditionally before auth guard) ---
  const financialStats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const ordersRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const validBookings = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Rejected by Purohit');
    const tokenRevenue = validBookings.reduce((sum, b) => sum + (b.total || 11), 0);
    const totalRevenue = ordersRevenue + tokenRevenue;
    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(ordersRevenue / totalOrders) : 0;
    const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;
    const pendingBookingsCount = bookings.filter(b => b.status === 'Awaiting Purohit Approval' || b.status === 'Cancellation Requested').length;

    // Revenue by category
    const revByCategory: Record<Product['category'], number> = {
      powder: 0,
      thread: 0,
      combo: 0,
      items: 0,
      'return-gifts': 0,
      flowers: 0,
      prasad: 0,
      essentials: 0,
    };
    validOrders.forEach(o => {
      o.items.forEach(item => {
        if (revByCategory[item.category] !== undefined) {
          revByCategory[item.category] += (item.price * item.qty);
        }
      });
    });

    return {
      totalRevenue,
      ordersRevenue,
      tokenRevenue,
      totalOrders,
      avgOrderValue,
      totalBookings: bookings.length,
      totalApara: aparaBookings.length,
      openTicketsCount,
      pendingBookingsCount,
      revByCategory,
    };
  }, [orders, bookings, aparaBookings, tickets]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // --- Handlers ---
  const handleEditClick = (p: Product) => {
    setEditingProduct(p.id);
    setEditForm({ price: p.price, stock: p.stock });
  };

  const handleSaveProduct = (p: Product) => {
    updateProduct({ ...p, price: editForm.price, stock: editForm.stock });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const p: Product = {
      id: `p_${Date.now()}`,
      name: newProduct.name || 'New Product',
      nameTe: newProduct.nameTe || '',
      price: newProduct.price || 0,
      origPrice: newProduct.origPrice || 0,
      discount: '',
      image: newProduct.image || '/logo.png',
      desc: newProduct.desc || '',
      category: newProduct.category as any,
      stock: newProduct.stock || 0
    };
    addProduct(p);
    setIsAdding(false);
    setNewProduct({ category: 'powder', stock: 0, price: 0, origPrice: 0 });
  };

  const handleSeedFirebase = async () => {
    setSyncingFb(true);
    try {
      await seedCatalogToFirestore();
    } finally {
      setSyncingFb(false);
    }
  };

  const handleBroadcastPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertBody.trim()) return;
    triggerNotification({
      title: alertTitle.trim(),
      message: alertBody.trim(),
      type: 'info',
    });
    addToast('Push alert & reminder dispatched!', 'success');
    setAlertTitle('');
    setAlertBody('');
  };

  const tabs = [
    { id: 'balance', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Purohit Bookings', icon: Calendar },
    { id: 'apara', label: 'Apara Seva', icon: Utensils },
    { id: 'purohits', label: 'Purohits & KYC', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
  ] as const;

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row pt-[104px]">
      
      {/* Premium Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gold/20 flex flex-col z-10">
        <div className="p-6 border-b border-gold/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-maroon rounded-sm flex items-center justify-center text-gold-pale">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-sm tracking-widest text-maroon uppercase">Admin</h2>
            <p className="text-[0.65rem] text-text-md uppercase tracking-widest mt-0.5">Guru Padukam</p>
          </div>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-1 px-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm font-cinzel text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  isActive 
                    ? 'bg-maroon/5 text-maroon border-l-2 border-maroon' 
                    : 'text-text-md hover:bg-cream hover:text-maroon border-l-2 border-transparent'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          
          {/* Header */}
          <header className="mb-10 flex justify-between items-end border-b border-gold/20 pb-6">
            <div>
              <h1 className="font-cinzel text-2xl font-bold text-maroon tracking-widest uppercase">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-text-md mt-1 font-garamond italic">Manage your divine enterprise.</p>
            </div>
            {activeTab === 'inventory' && (
              <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-maroon text-gold-pale px-5 py-2.5 font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-all">
                <Plus size={16} /> Add Product
              </button>
            )}
          </header>

          {/* Balance Sheet Tab */}
          {activeTab === 'balance' && (
            <div className="space-y-8 animate-slide-up">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 border border-gold/10 shadow-sm flex items-center gap-4 rounded-sm">
                  <div className="w-11 h-11 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100"><DollarSign size={22} /></div>
                  <div>
                    <p className="text-[0.65rem] text-text-md uppercase tracking-widest font-bold">Total Revenue</p>
                    <p className="font-cinzel text-xl font-bold text-maroon mt-0.5">₹{financialStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-text-lt">Orders ₹{financialStats.ordersRevenue} + Tokens ₹{financialStats.tokenRevenue}</p>
                  </div>
                </div>
                <div className="bg-white p-5 border border-gold/10 shadow-sm flex items-center gap-4 rounded-sm">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100"><Calendar size={22} /></div>
                  <div>
                    <p className="text-[0.65rem] text-text-md uppercase tracking-widest font-bold">Ritual Bookings</p>
                    <p className="font-cinzel text-xl font-bold text-maroon mt-0.5">{financialStats.totalBookings} + {financialStats.totalApara} Apara</p>
                    <p className="text-[10px] text-amber-700 font-semibold">{financialStats.pendingBookingsCount} awaiting action</p>
                  </div>
                </div>
                <div className="bg-white p-5 border border-gold/10 shadow-sm flex items-center gap-4 rounded-sm">
                  <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center border border-purple-100"><TrendingUp size={22} /></div>
                  <div>
                    <p className="text-[0.65rem] text-text-md uppercase tracking-widest font-bold">Marketplace Orders</p>
                    <p className="font-cinzel text-xl font-bold text-maroon mt-0.5">{financialStats.totalOrders}</p>
                    <p className="text-[10px] text-text-lt">Avg ₹{financialStats.avgOrderValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white p-5 border border-gold/10 shadow-sm flex items-center gap-4 rounded-sm">
                  <div className="w-11 h-11 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center border border-amber-200"><Ticket size={22} /></div>
                  <div>
                    <p className="text-[0.65rem] text-text-md uppercase tracking-widest font-bold">Verified Purohits &amp; Tickets</p>
                    <p className="font-cinzel text-xl font-bold text-maroon mt-0.5">{purohits.length} Purohits</p>
                    <p className="text-[10px] text-red-700 font-semibold">{financialStats.openTicketsCount} open tickets</p>
                  </div>
                </div>
              </div>

              {/* Firebase Cloud Sync & Push Notification Broadcast */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 border border-gold/20 rounded-sm shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cinzel text-sm font-bold text-maroon uppercase tracking-widest flex items-center gap-2">
                      <Database size={16} /> Firebase Storage &amp; Firestore
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isFirebaseConfigured ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isFirebaseConfigured ? 'Connected' : 'Env Vars Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-text-md">
                    Products ({products.length}), Purohits ({purohits.length}), Bookings ({bookings.length}), and KYC Aadhaar documents are synced via Firestore &amp; Firebase Storage.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedFirebase}
                    disabled={syncingFb}
                    className="px-4 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon-md transition disabled:opacity-60"
                  >
                    {syncingFb ? 'Syncing...' : 'Sync Starter Catalog to Firebase'}
                  </button>
                </div>

                <form onSubmit={handleBroadcastPush} className="bg-white p-6 border border-gold/20 rounded-sm shadow-sm space-y-3">
                  <h3 className="font-cinzel text-sm font-bold text-maroon uppercase tracking-widest flex items-center gap-2">
                    <BellRing size={16} /> Send Push Reminder / Alert
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={alertTitle}
                      onChange={e => setAlertTitle(e.target.value)}
                      placeholder="Alert title (e.g., Muhurtham Reminder)"
                      className="p-2 border border-gold/30 text-xs rounded-sm bg-cream/30"
                      required
                    />
                    <input
                      type="text"
                      value={alertBody}
                      onChange={e => setAlertBody(e.target.value)}
                      placeholder="Message (e.g., Keep pooja essentials ready)"
                      className="p-2 border border-gold/30 text-xs rounded-sm bg-cream/30"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#25D366] hover:bg-[#1fb858] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition"
                  >
                    Dispatch Push Notification
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom CSS Bar Chart */}
                <div className="lg:col-span-2 bg-white p-8 border border-gold/10 shadow-sm rounded-sm">
                  <h3 className="font-cinzel text-sm font-bold text-maroon uppercase tracking-widest mb-8 flex items-center gap-2">
                    <BarChart3 size={16} /> Revenue by Category
                  </h3>
                  <div className="flex items-end gap-8 h-56 mt-4 border-b border-gray-200 pb-2 px-4">
                    {Object.entries(financialStats.revByCategory).map(([cat, val]) => {
                      const max = Math.max(...Object.values(financialStats.revByCategory), 1);
                      const heightPct = (val / max) * 100;
                      return (
                        <div key={cat} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                          <div className="w-full max-w-[80px] bg-maroon/80 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-maroon" style={{ height: `${heightPct}%` }}></div>
                          <span className="absolute -top-8 text-xs font-bold text-maroon opacity-0 group-hover:opacity-100 transition-opacity bg-cream px-2 py-1 rounded shadow-sm border border-gold/20 z-10">₹{val.toLocaleString()}</span>
                          <span className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-text-md">{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Transactions Mini */}
                <div className="bg-white border border-gold/10 shadow-sm rounded-sm flex flex-col">
                  <div className="p-5 border-b border-gold/10 bg-cream/30">
                    <h3 className="font-cinzel text-sm font-bold text-maroon uppercase tracking-widest">Recent Sales</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {orders.filter(o => o.status !== 'Cancelled').slice(0, 6).map(o => (
                      <div key={o.id} className="p-4 border-b border-gray-100 hover:bg-cream/50 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-cinzel font-bold text-maroon text-xs">{o.id}</p>
                          <p className="text-[0.65rem] text-text-md mt-1 font-mono">{new Date(o.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right font-bold text-green-700 text-sm font-mono">
                          + ₹{o.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="animate-slide-up space-y-6">
              {isAdding && (
                <form onSubmit={handleAddProduct} className="bg-white p-8 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm border border-gold/20 animate-fade-in">
                  <h3 className="md:col-span-2 font-cinzel text-sm font-bold text-maroon uppercase tracking-widest border-b border-gold/10 pb-2">Add New Offering</h3>
                  
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Product Name</label>
                    <input type="text" required onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Telugu Name</label>
                    <input type="text" onChange={e => setNewProduct({...newProduct, nameTe: e.target.value})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Price (₹)</label>
                    <input type="number" required onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Initial Stock</label>
                    <input type="number" required onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Category</label>
                    <select onChange={e => setNewProduct({...newProduct, category: e.target.value as Product['category']})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm">
                      <option value="powder">Powder</option>
                      <option value="thread">Thread</option>
                      <option value="combo">Combo</option>
                      <option value="items">Pooja Kit / Items</option>
                      <option value="essentials">Everyday Essentials</option>
                      <option value="return-gifts">Return Gifts</option>
                      <option value="flowers">Fresh Flowers</option>
                      <option value="prasad">Prasad & Sweets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-widest uppercase text-text-md mb-2">Image URL</label>
                    <input type="text" onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/30 text-sm" />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase px-8 py-3 clip-btn hover:bg-maroon-md transition-colors">Save Product</button>
                  </div>
                </form>
              )}

              <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-cream/30 transition-colors">
                          <td className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm overflow-hidden border border-gold/20 shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-cinzel font-bold text-text-dk text-sm block">{p.name}</span>
                              <span className="text-[0.65rem] text-text-md font-telugu block">{p.nameTe}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-text-md font-bold uppercase tracking-widest">{p.category}</td>
                          <td className="p-4">
                            {editingProduct === p.id ? (
                              <input 
                                type="number" 
                                value={editForm.price} 
                                onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                className="w-20 p-1.5 border border-gold/50 focus:outline-none focus:border-maroon text-sm"
                              />
                            ) : (
                              <span className="font-bold text-sm text-maroon font-mono">₹{p.price}</span>
                            )}
                          </td>
                          <td className="p-4">
                            {editingProduct === p.id ? (
                              <input 
                                type="number" 
                                value={editForm.stock} 
                                onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                                className="w-20 p-1.5 border border-gold/50 focus:outline-none focus:border-maroon text-sm"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm font-mono ${p.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span>
                                {p.stock < 10 && <span title="Low Stock"><AlertTriangle size={14} className="text-red-500" /></span>}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {editingProduct === p.id ? (
                                <button onClick={() => handleSaveProduct(p)} className="text-green-600 hover:bg-green-50 p-2 rounded-sm transition-colors">
                                  <Check size={16} />
                                </button>
                              ) : (
                                <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-sm transition-colors">
                                  <Edit2 size={16} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-sm transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-text-md font-cinzel text-sm">No orders yet.</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id} className="border-b border-gray-100 hover:bg-cream/30 transition-colors">
                        <td className="p-4 font-cinzel font-bold text-maroon text-sm">{o.id}</td>
                        <td className="p-4 text-xs font-semibold text-text-dk">{o.userEmail}</td>
                        <td className="p-4 text-xs text-text-md font-mono">{new Date(o.date).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-sm text-maroon font-mono">₹{o.total}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[0.65rem] font-bold tracking-widest uppercase rounded-sm border ${
                            o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                            className="p-1.5 border border-gold/30 text-xs font-bold text-maroon focus:outline-none focus:border-maroon bg-white rounded-sm cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm animate-slide-up">
              <div className="p-4 bg-green-50/70 border-b border-green-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-green-900">
                  <strong>Purohit WhatsApp Navigation Dispatch:</strong> Send exact Google Maps directions &amp; devotee contact details to the assigned purohit prior to the scheduled Muhurtham.
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                      <th className="p-4">Booking &amp; Devotee</th>
                      <th className="p-4">Purohit &amp; Occasion</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Location &amp; Map</th>
                      <th className="p-4">WhatsApp Dispatch</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={7} className="p-10 text-center text-text-md font-cinzel text-sm">No purohit bookings yet.</td></tr>
                    ) : bookings.map(b => {
                      const reminder = getReminderWindowInfo(b.date, b.time, b.reminderHoursBefore || 2);
                      const mapUrl = getBookingMapDirectionsUrl(b);
                      return (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-cream/30 transition-colors">
                        <td className="p-4">
                          <div className="font-cinzel font-bold text-maroon text-sm">{b.id}</div>
                          <div className="text-xs font-semibold text-text-dk mt-0.5">{b.userName}</div>
                          <div className="text-[11px] text-text-lt">+91 {b.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold text-text-dk">{b.purohitName}</div>
                          <div className="text-[11px] text-text-md mt-0.5">{b.occasion} · ₹{b.total} token</div>
                        </td>
                        <td className="p-4 text-xs text-text-md font-mono">
                          <div>{b.date}</div>
                          <div className="font-bold text-maroon">{b.time}</div>
                        </td>
                        <td className="p-4 max-w-[200px]">
                          <div className="text-[11px] text-text-md line-clamp-2">{b.address}, {b.city} - {b.pincode}</div>
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-maroon hover:underline mt-1"
                          >
                            <MapPin size={11} /> Open Map <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1.5">
                            {b.whatsappDispatchStatus === 'Sent' ? (
                              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full">
                                ✓ Sent to Purohit
                              </span>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                reminder.isDueNow
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {reminder.label}
                              </span>
                            )}
                            <div>
                              <a
                                href={buildPurohitWhatsAppUrl(b)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => markBookingWhatsappSent(b.id)}
                                className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1fb858] text-white text-[11px] font-bold px-2.5 py-1 rounded-sm transition-colors"
                              >
                                <MessageCircle size={12} /> Send Map
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[0.65rem] font-bold tracking-widest uppercase rounded-sm border ${
                            b.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            b.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            b.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value as 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled')}
                            className="p-1.5 border border-gold/30 text-xs font-bold text-maroon focus:outline-none focus:border-maroon bg-white rounded-sm cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Apara Seva Tab (1-Day Prior Checklist Dispatch) */}
          {activeTab === 'apara' && (
            <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm animate-slide-up">
              <div className="p-4 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-950">
                <strong>Apara 1-Day Prior Organizer Dispatch:</strong> Automatically flags ceremonies 1 day prior (e.g. 20 Dec ceremony → 19 Dec dispatch) so Peetas receive exact purohit group, attendee count, food curries/pickles &amp; preferred items on WhatsApp.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                      <th className="p-4">Booking &amp; Devotee</th>
                      <th className="p-4">Peeta &amp; Mode</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Group &amp; Food Items</th>
                      <th className="p-4">1-Day Prior WhatsApp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aparaBookings.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-text-md font-cinzel text-sm">No Apara Seva bookings yet.</td></tr>
                    ) : aparaBookings.map(ab => {
                      const prior = getAparaPriorDispatchInfo(ab.date);
                      return (
                        <tr key={ab.id} className="border-b border-gray-100 hover:bg-cream/30 transition-colors">
                          <td className="p-4">
                            <div className="font-cinzel font-bold text-maroon text-sm">{ab.id}</div>
                            <div className="text-xs font-semibold text-text-dk">{ab.userName}</div>
                            <div className="text-[11px] text-text-lt">+91 {ab.userPhone}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs font-semibold text-text-dk">{ab.peetaName}</div>
                            <div className="text-[11px] text-maroon">{ab.ceremonyType}</div>
                            <div className="text-[10px] text-text-lt uppercase">{ab.ritualMode}</div>
                          </td>
                          <td className="p-4 text-xs font-mono">
                            <div className="font-bold text-maroon">{ab.date}</div>
                            <div className="text-text-md">{ab.time}</div>
                          </td>
                          <td className="p-4 max-w-[240px] text-[11px] text-text-md space-y-0.5">
                            <div><strong>Team:</strong> {ab.purohitGroup} ({ab.attendeeCount} ppl)</div>
                            <div><strong>Food:</strong> {ab.foodPackage === 'with-food' ? ab.foodMenuType : 'Without Food'}</div>
                            {ab.preferredItems && <div className="truncate"><strong>Items:</strong> {ab.preferredItems}</div>}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1.5">
                              {ab.whatsappDispatchStatus === 'Sent' ? (
                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full">
                                  ✓ Checklist Sent
                                </span>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                  prior.isDueNow
                                    ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {prior.isDueNow ? `Due Now (${prior.formattedPrior})` : `1-Day Prior: ${prior.formattedPrior}`}
                                </span>
                              )}
                              <div>
                                <a
                                  href={buildAparaOrganizerWhatsAppUrl(ab)}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => markAparaWhatsappSent(ab.id)}
                                  className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1fb858] text-white text-[11px] font-bold px-2.5 py-1 rounded-sm"
                                >
                                  <MessageCircle size={12} /> Send Checklist
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={ab.status}
                              onChange={e => updateAparaBookingStatus(ab.id, e.target.value as any)}
                              className="p-1.5 border border-gold/30 text-xs font-bold text-maroon bg-white rounded-sm"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Purohits & KYC Tab */}
          {activeTab === 'purohits' && (
            <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm animate-slide-up">
              <div className="p-4 bg-cream/60 border-b border-gold/20 text-xs text-text-md">
                <strong>Verified Purohits Directory (Firebase):</strong> Aadhaar + ₹1 Witness KYC verified Purohits synced with Firestore.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                      <th className="p-4">Purohit</th>
                      <th className="p-4">Location &amp; Languages</th>
                      <th className="p-4">KYC Status</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4">Poojas Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purohits.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-text-md font-cinzel text-sm">No purohits loaded. Click "Sync Starter Catalog to Firebase" on the Dashboard tab.</td></tr>
                    ) : purohits.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-cream/30">
                        <td className="p-4">
                          <div className="font-cinzel font-bold text-maroon text-sm">{p.name}</div>
                          <div className="text-[11px] text-text-md">{p.experience} yrs exp · ★ {p.rating}</div>
                        </td>
                        <td className="p-4 text-xs text-text-md">
                          <div>{p.location}</div>
                          <div className="text-[11px] text-text-lt">{p.languages.join(', ')}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            p.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {p.verified ? '✓ Aadhaar + ₹1 KYC Verified' : 'Pending KYC'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold uppercase text-maroon">{p.availability}</td>
                        <td className="p-4 text-xs font-mono font-bold text-text-dk">{p.completedPoojas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tickets & Incidents Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-white shadow-sm border border-gold/10 overflow-hidden rounded-sm animate-slide-up">
              <div className="p-4 bg-red-50/70 border-b border-red-200 text-xs text-red-950">
                <strong>Incident Reports, Purohit Delays &amp; Emergency Handoffs:</strong> Tickets created via PadukaAI, Tracker, or Purohit Dashboard appear here in real time.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/50 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase border-b border-gold/20">
                      <th className="p-4">Ticket &amp; Booking</th>
                      <th className="p-4">Category &amp; Severity</th>
                      <th className="p-4">Devotee</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Assigned To</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-text-md font-cinzel text-sm">No incident tickets reported.</td></tr>
                    ) : tickets.map(t => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-cream/30">
                        <td className="p-4">
                          <div className="font-cinzel font-bold text-maroon text-sm">{t.id}</div>
                          {t.bookingId && <div className="text-[11px] font-mono text-text-md">{t.bookingId}</div>}
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-bold text-text-dk">{t.category}</div>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            t.severity === 'Emergency' ? 'bg-red-100 text-red-800 border-red-300' :
                            t.severity === 'Urgent' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>{t.severity}</span>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="font-semibold text-text-dk">{t.userName}</div>
                          <div className="text-text-lt">+91 {t.userPhone}</div>
                        </td>
                        <td className="p-4 text-xs text-text-md max-w-xs">{t.description}</td>
                        <td className="p-4 text-xs font-semibold text-green-700">{t.assignedTo || 'Coordinator Queue'}</td>
                        <td className="p-4">
                          <select
                            value={t.status}
                            onChange={e => updateTicketStatus(t.id, e.target.value as any)}
                            className="p-1.5 border border-gold/30 text-xs font-bold text-maroon bg-white rounded-sm"
                          >
                            <option value="Open">Open</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
