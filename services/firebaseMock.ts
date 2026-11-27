import { User, Product, Order, Booking, Purohit, AparaPeeta, AparaBooking, SupportTicket, EventNotification, RegistrationData } from '../types';
import { INITIAL_PRODUCTS, PUROHITS, APARA_PEETAS } from '../constants';

/**
 * This service simulates a Firebase backend using localStorage.
 */

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const hashPassword = async (password: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(`gp_salt_v1:${password}`);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(`gp_salt_v1:${password}`);
};

export const firebaseMock = {
  auth: {
    async signInWithGoogle(email: string): Promise<User> {
      await delay(500);
      const role: User['role'] = email.toLowerCase().includes('purohit') ? 'purohit' : 'user';

      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      if (savedUsers[email]) {
        return savedUsers[email];
      }

      const user: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '',
        address: '',
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
      const normalizedEmail = data.email.trim().toLowerCase();
      if (savedUsers[normalizedEmail]) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      const role: User['role'] =
        data.role === 'purohit' ? 'purohit' : 'user';

      const user: User = {
        id: `usr_${Date.now()}`,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        pincode: data.pincode.trim(),
        role,
        preferredLanguage: data.preferredLanguage || 'en',
        profileImage: data.profileImage,
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

      if (data.password) {
        const passwords = JSON.parse(localStorage.getItem('gp_fb_passwords') || '{}');
        passwords[normalizedEmail] = await hashPassword(data.password);
        localStorage.setItem('gp_fb_passwords', JSON.stringify(passwords));
      }

      savedUsers[user.email] = user;
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      return user;
    },
    async login(email: string, _phone?: string, password?: string): Promise<User> {
      await delay(400);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const normalizedEmail = email.trim().toLowerCase();

      const existing = savedUsers[normalizedEmail];
      if (!existing) {
        throw new Error('No account found for this email. Please register first.');
      }

      const passwords = JSON.parse(localStorage.getItem('gp_fb_passwords') || '{}');
      const storedHash = passwords[normalizedEmail];
      if (!password || !storedHash || (await hashPassword(password)) !== storedHash) {
        throw new Error('Invalid email or password.');
      }

      return existing;
    },
    async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
      await delay(300);
      const normalizedEmail = email.trim().toLowerCase();
      const passwords = JSON.parse(localStorage.getItem('gp_fb_passwords') || '{}');
      const storedHash = passwords[normalizedEmail];
      if (storedHash && (await hashPassword(currentPassword)) !== storedHash) {
        throw new Error('Current password is incorrect.');
      }
      passwords[normalizedEmail] = await hashPassword(newPassword);
      localStorage.setItem('gp_fb_passwords', JSON.stringify(passwords));
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
