import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product, CartItem, User, Order, ToastMessage, Purohit, Booking,
  GeoLocation, AparaPeeta, AparaBooking, AparaReview, SupportTicket, EventNotification, RegistrationData
} from '../types';
import { firebaseMock } from '../services/firebaseMock';
import { PUROHITS, APARA_PEETAS } from '../constants';
import { LanguageCode, TranslationKeys, getTranslation } from '../i18n/languages';

interface AppContextType {
  // Language (Pan-India)
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationKeys) => string;

  // Auth
  user: User | null;
  login: (email: string, phone?: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isAuthLoading: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;

  // DB (Inventory & Orders)
  products: Product[];
  updateProduct: (updated: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  orders: Order[];
  placeOrder: (shippingDetails?: { name: string; phone: string; address: string; location?: GeoLocation }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Purohits & Bookings
  purohits: Purohit[];
  bookings: Booking[];
  createBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  markBookingWhatsappSent: (bookingId: string) => void;
  requestBookingHandoff: (bookingId: string, reason: string) => void;
  acceptBookingHandoff: (bookingId: string, newPurohit: Purohit) => void;
  attachSamagriToBooking: (bookingId: string, samagriMode: Booking['samagriMode'], items?: string[]) => void;
  addPurohitReview: (purohitId: string, review: Omit<AparaReview, 'id' | 'date'>) => void;
  uploadPurohitPhoto: (purohitId: string, dataUrl: string) => void;

  // Apara Peetas & Bookings
  aparaPeetas: AparaPeeta[];
  aparaBookings: AparaBooking[];
  createAparaBooking: (booking: AparaBooking) => void;
  updateAparaBookingStatus: (bookingId: string, status: AparaBooking['status']) => void;
  markAparaWhatsappSent: (bookingId: string) => void;
  updateAparaFoodCustomization: (bookingId: string, updates: Partial<Pick<AparaBooking, 'attendeeCount' | 'foodMenuType' | 'preferredItems' | 'customizations'>>) => void;
  addAparaReview: (peetaId: string, review: Omit<AparaReview, 'id' | 'date'>) => void;
  uploadAparaPhoto: (peetaId: string, dataUrl: string) => void;

  // Support Tickets & Event Notifications
  tickets: SupportTicket[];
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], assignedTo?: string) => void;
  notifications: EventNotification[];
  triggerNotification: (notif: Omit<EventNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushPermission: NotificationPermission | 'unsupported';
  pushEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
  requestPushPermission: () => Promise<boolean>;
  sendTestPush: () => void;

  // UI
  toasts: ToastMessage[];
  addToast: (msg: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const savedUser = localStorage.getItem('gp_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.preferredLanguage) return parsed.preferredLanguage as LanguageCode;
      } catch {
        // ignore parse error
      }
    }
    return (localStorage.getItem('gp_lang') as LanguageCode) || 'en';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purohits, setPurohits] = useState<Purohit[]>(PUROHITS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [aparaPeetas, setAparaPeetas] = useState<AparaPeeta[]>(APARA_PEETAS);
  const [aparaBookings, setAparaBookings] = useState<AparaBooking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gp_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [pushEnabled, setPushEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('gp_push_enabled');
    return saved !== 'false';
  });

  // Load initial data from mock Firebase
  useEffect(() => {
    firebaseMock.db.getProducts().then(setProducts);
    firebaseMock.db.getOrders().then(setOrders);
    firebaseMock.db.getPurohits().then(setPurohits);
    firebaseMock.db.getBookings().then(setBookings);
    firebaseMock.db.getAparaPeetas().then(setAparaPeetas);
    firebaseMock.db.getAparaBookings().then(setAparaBookings);
    firebaseMock.db.getTickets().then(setTickets);
    firebaseMock.db.getNotifications().then(setNotifications);
  }, []);

  // Sync Cart
  useEffect(() => {
    localStorage.setItem('gp_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Toasts ---
  const addToast = useCallback((msg: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('gp_lang', lang);
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, preferredLanguage: lang };
      localStorage.setItem('gp_user', JSON.stringify(updated));
      firebaseMock.auth.updateUser(updated);
      return updated;
    });
  }, []);

  const t = useCallback((key: keyof TranslationKeys) => getTranslation(language, key), [language]);

  // --- Auth ---
  const login = async (email: string, phone?: string) => {
    setIsAuthLoading(true);
    try {
      const existingUser = await firebaseMock.auth.login(email, phone);
      setUser(existingUser);
      localStorage.setItem('gp_user', JSON.stringify(existingUser));
      if (existingUser.preferredLanguage) {
        setLanguageState(existingUser.preferredLanguage);
        localStorage.setItem('gp_lang', existingUser.preferredLanguage);
      }
      addToast(`Welcome back, ${existingUser.name}!`, 'success');
    } catch (error) {
      addToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (data: RegistrationData) => {
    setIsAuthLoading(true);
    try {
      const newUser = await firebaseMock.auth.register(data);
      setUser(newUser);
      localStorage.setItem('gp_user', JSON.stringify(newUser));
      if (newUser.preferredLanguage) {
        setLanguageState(newUser.preferredLanguage);
        localStorage.setItem('gp_lang', newUser.preferredLanguage);
      }
      addToast(`Namaste ${newUser.name}, your account is registered!`, 'success');
    } catch (error) {
      addToast('Registration failed. Please try again.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gp_user');
    addToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    setIsAuthLoading(true);
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('gp_user', JSON.stringify(updatedUser));
      if (data.preferredLanguage) {
        setLanguageState(data.preferredLanguage);
        localStorage.setItem('gp_lang', data.preferredLanguage);
      }
      await firebaseMock.auth.updateUser(updatedUser);
      addToast('Profile updated successfully.', 'success');
    } catch (error) {
      addToast('Failed to update profile.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  // --- Products ---
  const updateProduct = (updated: Product) => {
    const newProducts = products.map(p => p.id === updated.id ? updated : p);
    setProducts(newProducts);
    firebaseMock.db.saveProducts(newProducts);
    addToast('Product updated successfully.', 'success');
  };

  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    firebaseMock.db.saveProducts(newProducts);
    addToast('New product added.', 'success');
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    firebaseMock.db.deleteProduct(id);
    addToast('Product deleted.', 'info');
  };

  // --- Orders ---
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    firebaseMock.db.updateOrder(orderId, status);
    addToast(`Order ${orderId} marked as ${status}.`, 'success');
  };

  // --- Event Notifications, Browser Push & Support Tickets ---
  const dispatchBrowserPush = useCallback(
    (title: string, body: string) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (!pushEnabled || Notification.permission !== 'granted') return;
      try {
        new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      } catch {
        // Ignore browser notification restrictions
      }
    },
    [pushEnabled]
  );

  const setPushEnabled = useCallback((enabled: boolean) => {
    setPushEnabledState(enabled);
    localStorage.setItem('gp_push_enabled', String(enabled));
  }, []);

  const triggerNotification = useCallback((notif: Omit<EventNotification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: EventNotification = {
      ...notif,
      id: `NTF${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev].slice(0, 30);
      firebaseMock.db.saveNotifications(next);
      return next;
    });
    dispatchBrowserPush(`Guru Padukam: ${notif.title}`, notif.message);
  }, [dispatchBrowserPush]);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Browser push notifications are not supported on this device.', 'info');
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setPushPermission(result);
      if (result === 'granted') {
        setPushEnabled(true);
        addToast('Live Push Notifications enabled! 🙏', 'success');
        new Notification('Guru Padukam Push Alerts Enabled 🙏', {
          body: 'You will receive real-time Purohit arrival, Apara checklist & order updates.',
          icon: '/logo.png',
        });
        return true;
      }
      addToast('Push permission was not granted. Enable notifications in browser site settings.', 'info');
      return false;
    } catch {
      addToast('Could not enable browser push notifications.', 'error');
      return false;
    }
  }, [addToast, setPushEnabled]);

  const sendTestPush = useCallback(() => {
    triggerNotification({
      title: 'Push Alert Active 🙏',
      message: 'Guru Padukam live notifications are working! You will receive ceremony, samagri & Purohit alerts here.',
      type: 'success',
    });
    addToast('Test notification dispatched!', 'success');
  }, [triggerNotification, addToast]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      firebaseMock.db.saveNotifications(next);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      firebaseMock.db.saveNotifications(next);
      return next;
    });
  };

  const createTicket = (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>): SupportTicket => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: 'TKT' + Math.floor(100000 + Math.random() * 900000),
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    setTickets(prev => {
      const next = [newTicket, ...prev];
      firebaseMock.db.saveTickets(next);
      return next;
    });
    triggerNotification({
      title: `Ticket Created: ${newTicket.id}`,
      message: `${newTicket.category} (${newTicket.severity}) — Shared with Guru Padukam Admin.`,
      type: newTicket.severity === 'Emergency' ? 'urgent' : 'warning',
      bookingId: newTicket.bookingId,
    });
    addToast(`Support Ticket ${newTicket.id} created & shared with Admin!`, 'success');
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status'], assignedTo?: string) => {
    setTickets(prev => {
      const next = prev.map(t => t.id === ticketId ? { ...t, status, ...(assignedTo ? { assignedTo } : {}) } : t);
      firebaseMock.db.saveTickets(next);
      return next;
    });
    addToast(`Ticket ${ticketId} marked as ${status}.`, 'success');
  };

  // --- Bookings ---
  const createBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    firebaseMock.db.saveBooking(booking);
    triggerNotification({
      title: `Booking Confirmed: ${booking.id}`,
      message: `${booking.occasion} on ${booking.date} (${booking.time}) with ${booking.purohitName}. Guru Padukam support active!`,
      type: 'success',
      bookingId: booking.id,
    });
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    firebaseMock.db.updateBookingStatus(bookingId, status);
    addToast(`Booking ${bookingId} marked as ${status}.`, 'success');
  };

  const markBookingWhatsappSent = (bookingId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, whatsappDispatchStatus: 'Sent', whatsappDispatchedAt: now }
          : b
      )
    );
    firebaseMock.db.markBookingWhatsappSent(bookingId);
    addToast(`Google Maps & ritual details dispatched to Purohit on WhatsApp!`, 'success');
  };

  const requestBookingHandoff = (bookingId: string, reason: string) => {
    let targetBooking: Booking | undefined;
    setBookings(prev => {
      const next = prev.map(b => {
        if (b.id !== bookingId) return b;
        targetBooking = {
          ...b,
          handoffStatus: 'requested' as const,
          handoffReason: reason || 'Purohit emergency — immediate locality replacement requested',
          originalPurohitName: b.originalPurohitName || b.purohitName,
        };
        return targetBooking;
      });
      firebaseMock.db.saveBookingsList(next);
      return next;
    });
    createTicket({
      bookingId,
      userName: targetBooking?.userName || 'Devotee',
      userPhone: targetBooking?.userPhone || '9949730175',
      category: 'Emergency Swap',
      severity: 'Emergency',
      description: `Emergency handoff requested for ${bookingId}. Locality Purohits alerted for first-acceptance auto-assign. Reason: ${reason}`,
    });
    triggerNotification({
      title: `Emergency Handoff Alert: ${bookingId}`,
      message: `Locality Purohits alerted! First Purohit to accept will be auto-assigned to ${targetBooking?.occasion || 'ceremony'}.`,
      type: 'urgent',
      bookingId,
    });
    addToast(`Emergency Handoff broadcasted to locality Purohits!`, 'info');
  };

  const acceptBookingHandoff = (bookingId: string, newPurohit: Purohit) => {
    setBookings(prev => {
      const next = prev.map(b => {
        if (b.id !== bookingId || b.handoffStatus !== 'requested') return b;
        return {
          ...b,
          purohitId: newPurohit.id,
          purohitName: newPurohit.name,
          purohitPhone: newPurohit.phone || '919949730175',
          handoffStatus: 'reassigned' as const,
        };
      });
      firebaseMock.db.saveBookingsList(next);
      return next;
    });
    setTickets(prev => {
      const next = prev.map(t =>
        t.bookingId === bookingId && t.category === 'Emergency Swap' && t.status !== 'Resolved'
          ? { ...t, status: 'Assigned' as const, assignedTo: newPurohit.name }
          : t
      );
      firebaseMock.db.saveTickets(next);
      return next;
    });
    triggerNotification({
      title: `New Purohit Auto-Assigned: ${bookingId}`,
      message: `${newPurohit.name} accepted the locality handoff! Ticket assigned & devotee notified.`,
      type: 'success',
      bookingId,
    });
    addToast(`Handoff Accepted! ${newPurohit.name} auto-assigned to ${bookingId}.`, 'success');
  };

  const attachSamagriToBooking = (bookingId: string, samagriMode: Booking['samagriMode'], items?: string[]) => {
    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId
          ? { ...b, samagriMode, samagriItems: items, shipBefore30Min: samagriMode === 'marketplace-30min' }
          : b
      );
      firebaseMock.db.saveBookingsList(next);
      return next;
    });
    if (samagriMode === 'marketplace-30min') {
      triggerNotification({
        title: `30-Min Prior Express Samagri Scheduled`,
        message: `Pooja items for ${bookingId} will be shipped 30 minutes before the ceremony.`,
        type: 'info',
        bookingId,
      });
      addToast(`Pooja items scheduled for shipping 30 min prior to ${bookingId}!`, 'success');
    } else {
      addToast(`Samagri preference updated for ${bookingId}.`, 'success');
    }
  };

  // --- Apara Peetas & Bookings ---
  const createAparaBooking = (booking: AparaBooking) => {
    setAparaBookings(prev => [booking, ...prev]);
    firebaseMock.db.saveAparaBooking(booking);
    triggerNotification({
      title: `Apara Booking Confirmed: ${booking.id}`,
      message: `${booking.ceremonyType} on ${booking.date}. Full Guru Padukam support active (food customizable up to 2 days prior).`,
      type: 'success',
      bookingId: booking.id,
    });
  };

  const updateAparaFoodCustomization = (
    bookingId: string,
    updates: Partial<Pick<AparaBooking, 'attendeeCount' | 'foodMenuType' | 'preferredItems' | 'customizations'>>
  ) => {
    setAparaBookings(prev => {
      const next = prev.map(b => (b.id === bookingId ? { ...b, ...updates } : b));
      firebaseMock.db.saveAparaBookingsList(next);
      return next;
    });
    addToast(`Food customization updated for ${bookingId} (sent to Peeta 1-day prior).`, 'success');
  };

  const updateAparaBookingStatus = (bookingId: string, status: AparaBooking['status']) => {
    setAparaBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    firebaseMock.db.updateAparaBookingStatus(bookingId, status);
    addToast(`Apara Booking ${bookingId} marked as ${status}.`, 'success');
  };

  const markAparaWhatsappSent = (bookingId: string) => {
    const now = new Date().toISOString();
    setAparaBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, whatsappDispatchStatus: 'Sent', whatsappDispatchedAt: now }
          : b
      )
    );
    firebaseMock.db.markAparaWhatsappSent(bookingId);
    addToast(`1-Day Prior Checklist & Map sent to Peeta organizer on WhatsApp!`, 'success');
  };

  const addAparaReview = (peetaId: string, review: Omit<AparaReview, 'id' | 'date'>) => {
    const newRev: AparaReview = {
      ...review,
      id: `ar_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = aparaPeetas.map(peeta => {
      if (peeta.id !== peetaId) return peeta;
      const newList = [newRev, ...peeta.reviewsList];
      const totalScore = peeta.rating * peeta.reviewCount + review.rating;
      const newCount = peeta.reviewCount + 1;
      const newRating = Number((totalScore / newCount).toFixed(1));
      return {
        ...peeta,
        rating: newRating,
        reviewCount: newCount,
        reviewsList: newList,
      };
    });
    setAparaPeetas(updated);
    firebaseMock.db.saveAparaPeetas(updated);
    addToast('Thank you! Your rating & feedback have been published.', 'success');
  };

  const uploadAparaPhoto = (peetaId: string, dataUrl: string) => {
    const updated = aparaPeetas.map(peeta =>
      peeta.id === peetaId
        ? { ...peeta, galleryImages: [dataUrl, ...(peeta.galleryImages || [])] }
        : peeta
    );
    setAparaPeetas(updated);
    firebaseMock.db.saveAparaPeetas(updated);
    addToast('Photo uploaded to Peeta gallery!', 'success');
  };

  const addPurohitReview = (purohitId: string, review: Omit<AparaReview, 'id' | 'date'>) => {
    const newRev: AparaReview = {
      ...review,
      id: `prrev_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = purohits.map(p => {
      if (p.id !== purohitId) return p;
      const newList = [newRev, ...(p.reviewsList || [])];
      const totalScore = p.rating * p.reviews + review.rating;
      const newCount = p.reviews + 1;
      const newRating = Number((totalScore / newCount).toFixed(1));
      return {
        ...p,
        rating: newRating,
        reviews: newCount,
        reviewsList: newList,
      };
    });
    setPurohits(updated);
    firebaseMock.db.savePurohits(updated);
    addToast('Thank you! Your review has been added to the Purohit profile.', 'success');
  };

  const uploadPurohitPhoto = (purohitId: string, dataUrl: string) => {
    const updated = purohits.map(p =>
      p.id === purohitId
        ? { ...p, galleryImages: [dataUrl, ...(p.galleryImages || [])] }
        : p
    );
    setPurohits(updated);
    firebaseMock.db.savePurohits(updated);
    addToast('Photo uploaded to Purohit profile!', 'success');
  };

  // --- Cart ---
  const addToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { ...product, qty }];
    });
    addToast(`${product.name} added to cart.`, 'success');
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async (shippingDetails?: { name: string; phone: string; address: string; location?: GeoLocation }) => {
    if (!user || cart.length === 0) return null;

    // Check stock
    for (const item of cart) {
      const dbProduct = products.find(p => p.id === item.id);
      if (!dbProduct || dbProduct.stock < item.qty) {
        addToast(`Insufficient stock for ${item.name}`, 'error');
        return null;
      }
    }

    // Deduct stock
    const newProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.qty };
      }
      return p;
    });
    setProducts(newProducts);
    firebaseMock.db.saveProducts(newProducts);

    const deliveryName = shippingDetails?.name || user.name;
    const deliveryPhone = shippingDetails?.phone || user.phone || 'N/A';
    const deliveryAddress = shippingDetails?.address || user.address || 'Address on file';

    // Create order
    const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      userName: deliveryName,
      userEmail: user.email,
      userPhone: deliveryPhone,
      shippingAddress: deliveryAddress,
      location: shippingDetails?.location,
      items: [...cart],
      total: cartTotal,
      status: 'Processing',
      date: new Date().toISOString(),
      trackingUrl: `https://shiprocket.co/track/${orderId}`
    };

    setOrders(prev => [newOrder, ...prev]);
    await firebaseMock.db.saveOrder(newOrder);

    clearCart();
    triggerNotification({
      title: `Order Placed: ${orderId}`,
      message: `₹${cartTotal} Marketplace order confirmed. Track live updates anytime.`,
      type: 'success',
    });
    addToast('Order placed successfully!', 'success');
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, t,
      user, login, register, logout, updateProfile, isAdmin, isAuthLoading,
      cart, addToCart, removeFromCart, updateCartQty, clearCart, cartTotal, isCartOpen, setCartOpen,
      products, updateProduct, addProduct, deleteProduct, orders, placeOrder, updateOrderStatus,
      purohits, bookings, createBooking, updateBookingStatus, markBookingWhatsappSent,
      requestBookingHandoff, acceptBookingHandoff, attachSamagriToBooking, addPurohitReview, uploadPurohitPhoto,
      aparaPeetas, aparaBookings, createAparaBooking, updateAparaBookingStatus, markAparaWhatsappSent,
      updateAparaFoodCustomization, addAparaReview, uploadAparaPhoto,
      tickets, createTicket, updateTicketStatus,
      notifications, triggerNotification, markNotificationRead, markAllNotificationsRead,
      pushPermission, pushEnabled, setPushEnabled, requestPushPermission, sendTestPush,
      toasts, addToast, removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
