import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product, CartItem, User, Order, ToastMessage, Purohit, Booking, WalletTransaction, BookingTimelineEvent,
  GeoLocation, AparaPeeta, AparaBooking, AparaReview, SupportTicket, EventNotification, RegistrationData
} from '../types';
import { firebaseMock } from '../services/firebaseMock';
import {
  syncBookingCreateToBackend,
  syncBookingNoteToBackend,
  syncDevoteeCancelToBackend,
  syncPurohitActionToBackend,
  syncPurohitKycToBackend,
} from '../services/paymentService';
import { getBookingCancellationPolicy } from '../utils/bookingRules';
import { PUROHITS, APARA_PEETAS } from '../constants';
import { LanguageCode, TranslationKeys, getTranslation } from '../i18n/languages';

interface AppContextType {
  // Language (Pan-India)
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationKeys) => string;

  // Auth
  user: User | null;
  login: (email: string, phone?: string, password?: string) => Promise<boolean>;
  register: (data: RegistrationData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

  // Wallet, Purohits & Bookings
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  debitWalletForBooking: (amount: number, reason: string, bookingId: string) => boolean;
  purohits: Purohit[];
  bookings: Booking[];
  createBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  purohitRespondToBooking: (
    bookingId: string,
    action: 'accept' | 'reject',
    options?: string | { reason?: string; finalDate?: string; finalTime?: string; nakshatram?: string }
  ) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTime: string, reason?: string) => void;
  updateBookingNoteAndAdvance: (
    bookingId: string,
    params: { actor: 'Devotee' | 'Purohit'; note?: string; advancePaidToPurohit?: number; acknowledgeAdvance?: boolean }
  ) => void;
  requestDevoteeCancellation: (bookingId: string, reason: string) => void;
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

const API_BASE_URL = String((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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
        if (parsed.preferredLanguage === 'te' || parsed.preferredLanguage === 'en') {
          return parsed.preferredLanguage;
        }
      } catch {
        // ignore parse error
      }
    }
    const stored = localStorage.getItem('gp_lang');
    return stored === 'te' ? 'te' : 'en';
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

  // Load initial data & verify JWT session with backend
  useEffect(() => {
    const token = localStorage.getItem('gp_auth_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : Promise.reject(new Error('Invalid session'))))
        .then(data => {
          if (data?.user?.role) {
            setUser(prev => {
              if (!prev) return prev;
              const verified = { ...prev, role: data.user.role, email: data.user.email, id: data.user.id };
              localStorage.setItem('gp_user', JSON.stringify(verified));
              return verified;
            });
          }
        })
        .catch(() => {
          // If backend rejects token (401), clear tampered/expired session
        });
    }
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

  // --- Auth (Server-backed via /api/auth/*) ---
  const login = async (email: string, _phone?: string, password?: string): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.user || !data.token) {
        throw new Error(data.message || 'Invalid email or password.');
      }
      const existingUser: User = data.user;
      localStorage.setItem('gp_auth_token', data.token);
      setUser(existingUser);
      localStorage.setItem('gp_user', JSON.stringify(existingUser));
      if (existingUser.preferredLanguage === 'te' || existingUser.preferredLanguage === 'en') {
        setLanguageState(existingUser.preferredLanguage);
        localStorage.setItem('gp_lang', existingUser.preferredLanguage);
      }
      addToast(`Welcome back, ${existingUser.name}!`, 'success');
      return true;
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Login failed. Please check your credentials.', 'error');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success || !body.user || !body.token) {
        throw new Error(body.message || 'Registration failed. Please try again.');
      }
      const newUser: User = { ...body.user, preferredLanguage: data.preferredLanguage || 'en', profileImage: data.profileImage };
      localStorage.setItem('gp_auth_token', body.token);
      setUser(newUser);
      localStorage.setItem('gp_user', JSON.stringify(newUser));
      if (newUser.preferredLanguage === 'te' || newUser.preferredLanguage === 'en') {
        setLanguageState(newUser.preferredLanguage);
        localStorage.setItem('gp_lang', newUser.preferredLanguage);
      }
      if (newUser.role === 'purohit' && newUser.kycVerified && newUser.kycCfPaymentId) {
        syncPurohitKycToBackend({
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          aadhaarLast4: '',
          kycCfOrderId: newUser.kycCfOrderId || '',
          kycCfPaymentId: newUser.kycCfPaymentId,
          readyToShowVerification: Boolean(newUser.readyToShowVerification),
          vedicSampradaya: newUser.vedicSampradaya,
        });
      }
      addToast(`Namaste ${newUser.name}, your account is registered!`, 'success');
      return true;
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Registration failed. Please try again.', 'error');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gp_user');
    localStorage.removeItem('gp_auth_token');
    setCart([]);
    localStorage.removeItem('gp_cart');
    setCartOpen(false);
    addToast('Logged out successfully.', 'info');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await firebaseMock.auth.changePassword(user.email, currentPassword, newPassword);
      addToast('Password updated successfully.', 'success');
      return true;
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update password.', 'error');
      return false;
    }
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

  // --- Wallet & Bookings ---
  const walletBalance = user?.walletBalance || 0;
  const walletTransactions: WalletTransaction[] = user?.walletTransactions || [];

  const creditUserWallet = useCallback(
    (targetEmail: string, targetUserId: string, amount: number, reason: string, bookingId: string) => {
      const tx: WalletTransaction = {
        id: `WLT${Date.now()}`,
        amount,
        type: 'credit',
        reason,
        bookingId,
        paymentMethod: 'Cashfree',
        createdAt: new Date().toISOString(),
      };

      const savedUsers: Record<string, User> = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const normalized = targetEmail.trim().toLowerCase();
      const matchedKey =
        (savedUsers[normalized] && normalized) ||
        Object.keys(savedUsers).find(k => savedUsers[k]?.id === targetUserId);

      if (matchedKey && savedUsers[matchedKey]) {
        const u = savedUsers[matchedKey];
        savedUsers[matchedKey] = {
          ...u,
          walletBalance: (u.walletBalance || 0) + amount,
          walletTransactions: [tx, ...(u.walletTransactions || [])],
        };
        localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      }

      setUser(prev => {
        if (!prev) return prev;
        if (prev.email.toLowerCase() !== normalized && prev.id !== targetUserId) return prev;
        const updated: User = {
          ...prev,
          walletBalance: (prev.walletBalance || 0) + amount,
          walletTransactions: [tx, ...(prev.walletTransactions || [])],
        };
        localStorage.setItem('gp_user', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const debitWalletForBooking = useCallback(
    (amount: number, reason: string, bookingId: string): boolean => {
      if (!user || (user.walletBalance || 0) < amount) return false;
      const tx: WalletTransaction = {
        id: `WLT${Date.now()}`,
        amount,
        type: 'debit',
        reason,
        bookingId,
        paymentMethod: 'Wallet',
        createdAt: new Date().toISOString(),
      };
      const updated: User = {
        ...user,
        walletBalance: (user.walletBalance || 0) - amount,
        walletTransactions: [tx, ...(user.walletTransactions || [])],
      };
      setUser(updated);
      localStorage.setItem('gp_user', JSON.stringify(updated));
      firebaseMock.auth.updateUser(updated);
      return true;
    },
    [user]
  );

  const createBooking = (booking: Booking) => {
    const initialTimeline: BookingTimelineEvent[] = booking.timeline || [
      {
        id: `TL_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'System',
        action: `₹11 Token Verified (${booking.paymentMethod || 'Cashfree'})`,
        details: `${booking.occasion} on ${booking.date} (${booking.time}) · Sent to ${booking.purohitName}`,
      },
    ];
    const enriched: Booking = { ...booking, timeline: initialTimeline };
    setBookings(prev => [enriched, ...prev]);
    firebaseMock.db.saveBooking(enriched);
    syncBookingCreateToBackend(enriched);
    triggerNotification({
      title: `₹11 Payment Verified · Request Sent (${enriched.id})`,
      message: `${enriched.occasion} on ${enriched.date} (${enriched.time}) sent to ${enriched.purohitName} (${enriched.paymentMethod || 'Cashfree'}).`,
      type: 'success',
      bookingId: enriched.id,
    });
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    firebaseMock.db.updateBookingStatus(bookingId, status);
    addToast(`Booking ${bookingId} marked as ${status}.`, 'success');
  };

  const purohitRespondToBooking = (
    bookingId: string,
    action: 'accept' | 'reject',
    options?: string | { reason?: string; finalDate?: string; finalTime?: string; nakshatram?: string }
  ) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    const opts = typeof options === 'string' ? { reason: options } : options || {};

    if (action === 'accept') {
      const finalDate = opts.finalDate || target.date;
      const finalTime = opts.finalTime || target.time;
      const nakshatram = opts.nakshatram?.trim();
      const teamAction = 'Guru Padukam Team Active: Reminders & 30-Min Pooja Essentials Scheduled';
      const finalizedAt = new Date().toISOString();

      const tlEvent: BookingTimelineEvent = {
        id: `TL_${Date.now()}`,
        timestamp: finalizedAt,
        actor: 'Purohit',
        action: 'Muhurtham Finalized Post Devotee Call',
        details: `${finalDate} at ${finalTime}${nakshatram ? ` · ${nakshatram}` : ''} → ${teamAction}`,
      };

      setBookings(prev => {
        const next = prev.map(b =>
          b.id === bookingId
            ? {
                ...b,
                date: finalDate,
                time: finalTime,
                nakshatram: nakshatram || b.nakshatram,
                muhurthamFinalized: true,
                muhurthamFinalizedAt: finalizedAt,
                guruPadukamTeamAction: teamAction,
                status: 'Muhurtham Finalized' as const,
                timeline: [...(b.timeline || []), tlEvent],
              }
            : b
        );
        firebaseMock.db.saveBookingsList(next);
        return next;
      });

      syncPurohitActionToBackend({
        bookingId,
        userId: target.userId,
        action: 'accept_finalize',
        finalDate,
        finalTime,
        nakshatram,
      });

      triggerNotification({
        title: `Muhurtham Finalized! (${bookingId})`,
        message: `${target.purohitName} finalized ${finalDate} at ${finalTime}${nakshatram ? ` (${nakshatram})` : ''}. ${teamAction}!`,
        type: 'success',
        bookingId,
      });
      addToast(`Muhurtham finalized for ${bookingId}! Guru Padukam team notified for reminders & essentials.`, 'success');
    } else {
      const rejectReason = opts.reason?.trim();
      if (!rejectReason) {
        addToast('Please specify a valid reason before cancelling.', 'error');
        return;
      }
      const tlCancel: BookingTimelineEvent = {
        id: `TL_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Purohit',
        action: 'Cancelled Prior to Ritual · ₹11 Credited to Wallet',
        details: rejectReason,
      };
      setBookings(prev => {
        const next = prev.map(b =>
          b.id === bookingId
            ? {
                ...b,
                status: 'Rejected by Purohit' as const,
                purohitActionReason: rejectReason,
                refundCreditedToWallet: true,
                timeline: [...(b.timeline || []), tlCancel],
              }
            : b
        );
        firebaseMock.db.saveBookingsList(next);
        return next;
      });
      if (!target.refundCreditedToWallet) {
        creditUserWallet(
          target.userEmail,
          target.userId,
          target.total || 11,
          `₹${target.total || 11} Wallet Credit — ${target.purohitName} cancelled (${rejectReason})`,
          bookingId
        );
      }
      syncPurohitActionToBackend({ bookingId, userId: target.userId, action: 'reject', reason: rejectReason });
      triggerNotification({
        title: `Purohit Cancelled · ₹11 Credited to Wallet (${bookingId})`,
        message: `${target.purohitName} cancelled (${rejectReason}). Choose the next available Purohit with the same ₹11 or contact Guru Padukam directly!`,
        type: 'warning',
        bookingId,
      });
      addToast(`Booking ${bookingId} cancelled (${rejectReason}) — ₹11 credited to Devotee Wallet!`, 'info');
    }
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTime: string, reason?: string) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;
    const evalPolicy = getBookingCancellationPolicy(target);
    const tlSwap: BookingTimelineEvent = {
      id: `TL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Devotee',
      action: evalPolicy.isMajorCeremony
        ? 'Major Event Date Swap Routed to Purohit & Admin'
        : 'Ceremony Date / Time Swapped (Routed to Purohit & Admin)',
      details: `${newDate} at ${newTime}${reason ? ` · Reason: ${reason}` : ''}`,
    };
    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              time: newTime,
              rescheduleCount: (b.rescheduleCount || 0) + 1,
              notes: reason ? `${b.notes ? b.notes + ' | ' : ''}Swapped Date: ${reason}` : b.notes,
              cancellationRoutedTo: ['Purohit', 'Admin'] as ('Purohit' | 'Admin')[],
              timeline: [...(b.timeline || []), tlSwap],
            }
          : b
      );
      firebaseMock.db.saveBookingsList(next);
      return next;
    });
    syncPurohitActionToBackend({ bookingId, userId: target.userId, action: 'reschedule', finalDate: newDate, finalTime: newTime, reason });
    triggerNotification({
      title: `Date Swap Routed to Purohit & Admin (${bookingId})`,
      message: `${target.occasion} swapped to ${newDate} at ${newTime} at ₹0 extra token fee.`,
      type: 'info',
      bookingId,
    });
    addToast(`Booking ${bookingId} swapped to ${newDate} (${newTime}) & routed to Purohit and Admin!`, 'success');
  };

  const updateBookingNoteAndAdvance = (
    bookingId: string,
    params: { actor: 'Devotee' | 'Purohit'; note?: string; advancePaidToPurohit?: number; acknowledgeAdvance?: boolean }
  ) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;
    const tlEntry: BookingTimelineEvent = {
      id: `TL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: params.actor,
      action: params.acknowledgeAdvance
        ? `Direct Advance / Settlement Acknowledged by ${params.actor}`
        : `Booking Notes / Advance Details Updated by ${params.actor}`,
      details: [
        params.note ? `Notes: ${params.note}` : null,
        typeof params.advancePaidToPurohit === 'number'
          ? `Direct Purohit Advance Recorded: ₹${params.advancePaidToPurohit}`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
    };

    setBookings(prev => {
      const next = prev.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          notes: params.note !== undefined ? params.note : b.notes,
          advancePaidToPurohit:
            typeof params.advancePaidToPurohit === 'number'
              ? params.advancePaidToPurohit
              : b.advancePaidToPurohit,
          advanceAcknowledgedByDevotee:
            params.acknowledgeAdvance && params.actor === 'Devotee'
              ? true
              : b.advanceAcknowledgedByDevotee,
          advanceAcknowledgedByPurohit:
            params.acknowledgeAdvance && params.actor === 'Purohit'
              ? true
              : b.advanceAcknowledgedByPurohit,
          timeline: [...(b.timeline || []), tlEntry],
        };
      });
      firebaseMock.db.saveBookingsList(next);
      return next;
    });

    syncBookingNoteToBackend({ bookingId, ...params });
    if (params.acknowledgeAdvance) {
      triggerNotification({
        title: `Advance Acknowledged (${bookingId})`,
        message: `${params.actor} acknowledged direct advance terms on booking ${bookingId}.`,
        type: 'info',
        bookingId,
      });
    }
    addToast('Booking notes & timeline updated!', 'success');
  };

  const requestDevoteeCancellation = (bookingId: string, reason: string) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;
    const evalPolicy = getBookingCancellationPolicy(target);
    if (!evalPolicy.canDevoteeSelfCancelOrSwap) {
      addToast(evalPolicy.summaryEn, 'error');
      return;
    }
    if (!reason.trim()) {
      addToast('Please state a clear reason for cancellation.', 'error');
      return;
    }
    const tlCancelReq: BookingTimelineEvent = {
      id: `TL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Devotee',
      action: 'Cancellation Request Submitted (Routed to Purohit & Admin)',
      details: `Reason: ${reason.trim()} (${evalPolicy.isMajorCeremony ? 'Major Ceremony 10+ days prior' : 'Pre-Event 3+ days prior'})`,
    };
    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Cancellation Requested' as const,
              devoteeCancelStatus: 'requested' as const,
              devoteeCancelReason: reason.trim(),
              cancellationRoutedTo: ['Purohit', 'Admin'] as ('Purohit' | 'Admin')[],
              timeline: [...(b.timeline || []), tlCancelReq],
            }
          : b
      );
      firebaseMock.db.saveBookingsList(next);
      return next;
    });
    createTicket({
      bookingId,
      userName: target.userName,
      userPhone: target.userPhone,
      category: 'Other',
      severity: 'Urgent',
      description: `Devotee cancellation requested for ${target.occasion} (${bookingId}) on ${target.date}. Routed to Purohit (${target.purohitName}) & Admin. Reason: ${reason.trim()}`,
    });
    syncDevoteeCancelToBackend({ bookingId, reason: reason.trim(), actionType: 'cancel' });
    triggerNotification({
      title: `Cancellation Request Routed to Purohit & Admin (${bookingId})`,
      message: `${target.occasion} cancellation sent to ${target.purohitName} & Admin. Note: Direct private advances are settled directly between devotee & Purohit.`,
      type: 'warning',
      bookingId,
    });
    addToast(`Cancellation request for ${bookingId} routed to Purohit & Admin.`, 'info');
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
      user, login, register, logout, updateProfile, changePassword, isAdmin, isAuthLoading,
      cart, addToCart, removeFromCart, updateCartQty, clearCart, cartTotal, isCartOpen, setCartOpen,
      products, updateProduct, addProduct, deleteProduct, orders, placeOrder, updateOrderStatus,
      walletBalance, walletTransactions, debitWalletForBooking,
      purohits, bookings, createBooking, updateBookingStatus, purohitRespondToBooking, rescheduleBooking,
      updateBookingNoteAndAdvance, requestDevoteeCancellation, markBookingWhatsappSent,
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
