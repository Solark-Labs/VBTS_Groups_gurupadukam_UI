import { User, Product, Order, Booking, Purohit, AparaPeeta, AparaBooking, SupportTicket, EventNotification, RegistrationData } from '../types';
import { INITIAL_PRODUCTS, PUROHITS, APARA_PEETAS } from '../constants';

/**
 * This service simulates a Firebase backend using localStorage.
 */

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const firebaseMock = {
  auth: {
    async signInWithGoogle(email: string): Promise<User> {
      await delay(500);
      const role: User['role'] = email.toLowerCase().includes('admin')
        ? 'admin'
        : email.toLowerCase().includes('purohit')
        ? 'purohit'
        : 'user';

      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      if (savedUsers[email]) {
        return savedUsers[email];
      }

      const user: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '9949730175',
        address: 'Madhuranagar, Gollagudem',
        city: 'Khammam',
        pincode: '507002',
        role,
        createdAt: new Date().toISOString(),
        notifications: { email: true, sms: false }
      };

      savedUsers[email] = user;
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));

      return user;
    },
    async register(data: RegistrationData): Promise<User> {
      await delay(400);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const role: User['role'] =
        data.role ||
        (data.email.toLowerCase().includes('admin')
          ? 'admin'
          : data.email.toLowerCase().includes('purohit')
          ? 'purohit'
          : 'user');

      const user: User = {
        id: `usr_${Date.now()}`,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        pincode: data.pincode.trim(),
        role,
        preferredLanguage: data.preferredLanguage || 'en',
        profileImage: data.profileImage,
        aadhaarLast4: data.aadhaarLast4,
        aadhaarDocPreview: data.aadhaarDocPreview,
        kycVerified: data.kycVerified,
        kycRupeePaid: data.kycRupeePaid,
        kycCfOrderId: data.kycCfOrderId,
        kycCfPaymentId: data.kycCfPaymentId,
        kycVerifiedAt: data.kycVerifiedAt,
        readyToShowVerification: data.readyToShowVerification,
        vedicSampradaya: data.vedicSampradaya,
        experienceYears: data.experienceYears,
        acceptedRolePolicyAt: data.acceptedRolePolicyAt,
        createdAt: new Date().toISOString(),
        notifications: { email: true, sms: true }
      };

      savedUsers[user.email] = user;
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      return user;
    },
    async login(email: string, phone?: string): Promise<User> {
      await delay(400);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const normalizedEmail = email.trim().toLowerCase();

      if (savedUsers[normalizedEmail]) {
        return savedUsers[normalizedEmail];
      }

      // If user logs in first time without registration, create default user but flag missing info
      const role = normalizedEmail.includes('admin') ? 'admin' : 'user';
      const user: User = {
        id: `usr_${Date.now()}`,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        phone: phone || '',
        address: '',
        role,
        createdAt: new Date().toISOString(),
        notifications: { email: true, sms: true }
      };
      savedUsers[normalizedEmail] = user;
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      return user;
    },
    async updateUser(user: User): Promise<void> {
      await delay(300);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      savedUsers[user.email] = user;
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
    }
  },
  db: {
    async getProducts(): Promise<Product[]> {
      await delay(100);
      const saved = localStorage.getItem('gp_fb_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Force refresh to official logo if any items still have external URLs
        const hasExternalUrls = parsed.some(p => p.image && p.image.startsWith('http'));
        if (hasExternalUrls) {
          localStorage.setItem('gp_fb_products', JSON.stringify(INITIAL_PRODUCTS));
          return INITIAL_PRODUCTS;
        }
        return parsed;
      }
      localStorage.setItem('gp_fb_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    },
    async saveProducts(products: Product[]): Promise<void> {
      localStorage.setItem('gp_fb_products', JSON.stringify(products));
    },
    async deleteProduct(productId: string): Promise<void> {
      const products = await this.getProducts();
      const updated = products.filter(p => p.id !== productId);
      localStorage.setItem('gp_fb_products', JSON.stringify(updated));
    },
    async getOrders(): Promise<Order[]> {
      await delay(200);
      const saved = localStorage.getItem('gp_fb_orders');
      return saved ? JSON.parse(saved) : [];
    },
    async saveOrder(order: Order): Promise<void> {
      const orders = await this.getOrders();
      orders.unshift(order);
      localStorage.setItem('gp_fb_orders', JSON.stringify(orders));
    },
    async updateOrder(orderId: string, status: Order['status']): Promise<void> {
      const orders = await this.getOrders();
      const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('gp_fb_orders', JSON.stringify(updated));
    },
    async getPurohits(): Promise<Purohit[]> {
      const saved = localStorage.getItem('gp_fb_purohits');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('gp_fb_purohits', JSON.stringify(PUROHITS));
      return PUROHITS;
    },
    async savePurohits(purohits: Purohit[]): Promise<void> {
      localStorage.setItem('gp_fb_purohits', JSON.stringify(purohits));
    },
    async getBookings(): Promise<Booking[]> {
      const saved = localStorage.getItem('gp_fb_bookings');
      return saved ? JSON.parse(saved) : [];
    },
    async saveBooking(booking: Booking): Promise<void> {
      const bookings = await this.getBookings();
      bookings.unshift(booking);
      localStorage.setItem('gp_fb_bookings', JSON.stringify(bookings));
    },
    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
      const bookings = await this.getBookings();
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
      localStorage.setItem('gp_fb_bookings', JSON.stringify(updated));
    },
    async markBookingWhatsappSent(bookingId: string): Promise<void> {
      const bookings = await this.getBookings();
      const now = new Date().toISOString();
      const updated = bookings.map(b =>
        b.id === bookingId
          ? { ...b, whatsappDispatchStatus: 'Sent' as const, whatsappDispatchedAt: now }
          : b
      );
      localStorage.setItem('gp_fb_bookings', JSON.stringify(updated));
    },
    async getAparaPeetas(): Promise<AparaPeeta[]> {
      const saved = localStorage.getItem('gp_fb_apara_peetas');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('gp_fb_apara_peetas', JSON.stringify(APARA_PEETAS));
      return APARA_PEETAS;
    },
    async saveAparaPeetas(peetas: AparaPeeta[]): Promise<void> {
      localStorage.setItem('gp_fb_apara_peetas', JSON.stringify(peetas));
    },
    async getAparaBookings(): Promise<AparaBooking[]> {
      const saved = localStorage.getItem('gp_fb_apara_bookings');
      return saved ? JSON.parse(saved) : [];
    },
    async saveAparaBooking(booking: AparaBooking): Promise<void> {
      const list = await this.getAparaBookings();
      list.unshift(booking);
      localStorage.setItem('gp_fb_apara_bookings', JSON.stringify(list));
    },
    async updateAparaBookingStatus(bookingId: string, status: AparaBooking['status']): Promise<void> {
      const list = await this.getAparaBookings();
      const updated = list.map(b => b.id === bookingId ? { ...b, status } : b);
      localStorage.setItem('gp_fb_apara_bookings', JSON.stringify(updated));
    },
    async markAparaWhatsappSent(bookingId: string): Promise<void> {
      const list = await this.getAparaBookings();
      const now = new Date().toISOString();
      const updated = list.map(b =>
        b.id === bookingId
          ? { ...b, whatsappDispatchStatus: 'Sent' as const, whatsappDispatchedAt: now }
          : b
      );
      localStorage.setItem('gp_fb_apara_bookings', JSON.stringify(updated));
    },
    async saveBookingsList(bookings: Booking[]): Promise<void> {
      localStorage.setItem('gp_fb_bookings', JSON.stringify(bookings));
    },
    async saveAparaBookingsList(list: AparaBooking[]): Promise<void> {
      localStorage.setItem('gp_fb_apara_bookings', JSON.stringify(list));
    },
    async getTickets(): Promise<SupportTicket[]> {
      const saved = localStorage.getItem('gp_fb_tickets');
      return saved ? JSON.parse(saved) : [];
    },
    async saveTickets(tickets: SupportTicket[]): Promise<void> {
      localStorage.setItem('gp_fb_tickets', JSON.stringify(tickets));
    },
    async getNotifications(): Promise<EventNotification[]> {
      const saved = localStorage.getItem('gp_fb_notifications');
      return saved ? JSON.parse(saved) : [];
    },
    async saveNotifications(list: EventNotification[]): Promise<void> {
      localStorage.setItem('gp_fb_notifications', JSON.stringify(list));
    }
  }
};
