import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import {
  auth,
  db,
  storage,
  googleProvider,
  isFirebaseConfigured,
  firebaseProjectDebug,
} from './firebase';
import {
  User,
  Product,
  Order,
  Booking,
  Purohit,
  AparaPeeta,
  AparaBooking,
  SupportTicket,
  EventNotification,
  RegistrationData,
} from '../types';
import { INITIAL_PRODUCTS, PUROHITS, APARA_PEETAS } from '../constants';
import { getApiBaseUrl } from './paymentService';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function mapFirebaseAuthError(err: any): Error {
  const code = err?.code || '';
  if (code) {
    console.error('[Firebase Auth Error]', code, err?.message);
  }
  if (code === 'auth/configuration-not-found') {
    return new Error(
      `Firebase Auth not initialized for project "${firebaseProjectDebug.projectId}" (${firebaseProjectDebug.authDomain}). In Firebase Console → Authentication → Sign-in method: enable Email/Password and toggle Google OFF → Save → ON (with support email) → Save.`
    );
  }
  if (code === 'auth/operation-not-allowed') {
    return new Error(
      'This sign-in method is disabled in Firebase Console → Authentication → Sign-in method.'
    );
  }
  if (code === 'auth/unauthorized-domain') {
    return new Error(
      'This domain is not authorized in Firebase Console → Authentication → Settings → Authorized domains.'
    );
  }
  if (code === 'auth/email-already-in-use') {
    return new Error('An account with this email already exists. Please sign in instead.');
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return new Error('Invalid email or password.');
  }
  if (code === 'auth/popup-closed-by-user') {
    return new Error('Google sign-in popup was closed before completing.');
  }
  return err instanceof Error ? err : new Error('Authentication failed. Please try again.');
}

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(`gp_salt_v1_${password}`);
    const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(unescape(encodeURIComponent(`gp_salt_v1_${password}`)));
}

/**
 * Upload a base64 Data URL to Firebase Storage; returns download URL or falls back to original string if Storage is not configured.
 */
export async function uploadDataUrlToStorage(
  storagePath: string,
  dataUrl?: string
): Promise<string | undefined> {
  if (!dataUrl) return undefined;
  if (!dataUrl.startsWith('data:')) return dataUrl;
  if (!isFirebaseConfigured || !storage) return dataUrl;

  try {
    const fileRef = ref(storage, storagePath);
    await uploadString(fileRef, dataUrl, 'data_url');
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.warn('[Firebase Storage] Upload failed, keeping local reference:', err);
    return dataUrl;
  }
}

const PRIVATE_COLLECTIONS = new Set([
  'orders',
  'bookings',
  'aparaBookings',
  'tickets',
  'notifications',
  'users',
  'wallets',
]);

async function readCollection<T extends { id: string }>(
  colName: string,
  lsKey: string
): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    if (PRIVATE_COLLECTIONS.has(colName) && !auth?.currentUser) {
      const saved = localStorage.getItem(lsKey);
      return saved ? JSON.parse(saved) : [];
    }
    try {
      const snap = await getDocs(collection(db, colName));
      return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
    } catch (err) {
      console.warn(`[Firestore] Failed to read ${colName}:`, err);
    }
  }
  const saved = localStorage.getItem(lsKey);
  return saved ? JSON.parse(saved) : [];
}

async function writeCollectionItem<T extends { id: string }>(
  colName: string,
  lsKey: string,
  item: T
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, colName, item.id), item, { merge: true });
    } catch (err) {
      console.warn(`[Firestore] Failed to write ${colName}/${item.id}:`, err);
    }
  }
  const saved = localStorage.getItem(lsKey);
  const list: T[] = saved ? JSON.parse(saved) : [];
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  localStorage.setItem(lsKey, JSON.stringify(list));
}

async function syncCollectionList<T extends { id: string }>(
  colName: string,
  lsKey: string,
  items: T[]
): Promise<void> {
  localStorage.setItem(lsKey, JSON.stringify(items));
  if (isFirebaseConfigured && db) {
    const firestoreDb = db;
    try {
      const batch = writeBatch(firestoreDb);
      items.forEach((item) => {
        batch.set(doc(firestoreDb, colName, item.id), item, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn(`[Firestore] Failed batch sync for ${colName}:`, err);
    }
  }
}

async function checkIsAdminSafe(uid: string): Promise<boolean> {
  if (!db) return false;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

async function buildOrMergeGoogleUser(fbUser: FirebaseAuthUser): Promise<User> {
  const uid = fbUser.uid;
  const providerProfile = fbUser.providerData?.[0];
  const googleName = fbUser.displayName || providerProfile?.displayName || '';
  const googleEmail = (fbUser.email || providerProfile?.email || '').toLowerCase();
  const googlePhoto = fbUser.photoURL || providerProfile?.photoURL || undefined;
  const googlePhoneRaw = fbUser.phoneNumber || providerProfile?.phoneNumber || '';
  const googlePhone = googlePhoneRaw ? googlePhoneRaw.replace(/\D/g, '').slice(-10) : '';

  const isAdminUser = await checkIsAdminSafe(uid);

  if (db) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const existing = userSnap.data() as User;
        if ((existing as any).disabled && auth) {
          await signOut(auth);
          throw new Error('This account has been disabled by an administrator.');
        }
        const merged: User = {
          ...existing,
          id: uid,
          name: existing.name || googleName || (googleEmail ? googleEmail.split('@')[0] : 'Devotee'),
          email: existing.email || googleEmail,
          phone: existing.phone || googlePhone,
          profileImage: existing.profileImage || googlePhoto,
          role: isAdminUser ? 'admin' : existing.role === 'admin' ? 'user' : existing.role,
        };
        await setDoc(userRef, merged, { merge: true }).catch(() => {});
        return merged;
      }

      const newUser: User = {
        id: uid,
        name: googleName || (googleEmail ? googleEmail.split('@')[0] : 'Devotee'),
        email: googleEmail,
        phone: googlePhone,
        address: '',
        city: '',
        pincode: '',
        role: isAdminUser ? 'admin' : 'user',
        profileImage: googlePhoto,
        createdAt: new Date().toISOString(),
        notifications: { email: true, sms: true, push: true },
      };
      await setDoc(userRef, newUser, { merge: true }).catch(() => {});
      return newUser;
    } catch (err: any) {
      if (err?.message?.includes('disabled')) throw err;
      console.warn('[Firestore] Falling back to Firebase Auth profile for Google user:', err);
    }
  }

  return {
    id: uid,
    name: googleName || (googleEmail ? googleEmail.split('@')[0] : 'Devotee'),
    email: googleEmail,
    phone: googlePhone,
    address: '',
    city: '',
    pincode: '',
    role: isAdminUser ? 'admin' : 'user',
    profileImage: googlePhoto,
    createdAt: new Date().toISOString(),
    notifications: { email: true, sms: true, push: true },
  };
}

export const firebaseMock = {
  isFirebaseConfigured,

  auth: {
    async signInWithGoogle(): Promise<User> {
      if (!isFirebaseConfigured || !auth || !db || !googleProvider) {
        throw new Error(
          'Google Sign-In requires Firebase configuration (VITE_FIREBASE_* env vars). Please sign in with Email & Password.'
        );
      }
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        return await buildOrMergeGoogleUser(cred.user);
      } catch (err: any) {
        if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, googleProvider);
          throw new Error('Redirecting to Google Sign-In...');
        }
        throw mapFirebaseAuthError(err);
      }
    },

    async handleGoogleRedirectResult(): Promise<User | null> {
      if (!isFirebaseConfigured || !auth || !db) return null;
      try {
        const cred = await getRedirectResult(auth);
        if (!cred?.user) return null;
        return await buildOrMergeGoogleUser(cred.user);
      } catch {
        return null;
      }
    },

    async register(data: RegistrationData): Promise<User> {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }
      if (!data.password || data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Public registration can NEVER create an Admin account
      const safeRole: 'user' | 'purohit' = data.role === 'purohit' ? 'purohit' : 'user';

      if (isFirebaseConfigured && auth && db) {
        let cred;
        try {
          cred = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);
        } catch (err) {
          throw mapFirebaseAuthError(err);
        }
        const uid = cred.user.uid;

        const profilePhotoUrl = await uploadDataUrlToStorage(
          `profiles/${uid}/avatar_${Date.now()}.jpg`,
          data.profileImage
        );
        const aadhaarDocUrl = await uploadDataUrlToStorage(
          `kyc-docs/${uid}/aadhaar_${Date.now()}.jpg`,
          data.aadhaarDocPreview
        );

        const user: User = {
          id: uid,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: cleanPhone,
          address: data.address.trim(),
          city: data.city.trim(),
          pincode: data.pincode.trim(),
          role: safeRole,
          preferredLanguage: data.preferredLanguage || 'en',
          profileImage: profilePhotoUrl,
          aadhaarLast4: data.aadhaarLast4,
          aadhaarDocPreview: aadhaarDocUrl,
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
          notifications: { email: true, sms: true, push: true },
        };

        await setDoc(doc(db, 'users', uid), user).catch((err) => {
          console.warn('[Firestore] Could not save user doc during register:', err);
        });
        await sendEmailVerification(cred.user).catch((err) => {
          console.warn('[Firebase Auth] Verification email dispatch skipped:', err?.message);
        });

        if (safeRole === 'purohit' && data.kycVerified) {
          const purohitRecord: Purohit = {
            id: `p_${uid}`,
            name: user.name,
            nameTe: user.name,
            image: profilePhotoUrl || '/logo.png',
            phone: cleanPhone,
            specializations: ['Ganapathi Homam', 'Satyanarayana Vratham', 'Griha Pravesh'],
            experience: Number(data.experienceYears) || 5,
            rating: 5.0,
            reviews: 1,
            availability: 'now',
            languages: ['Telugu', 'English', 'Sanskrit'],
            location: `${data.city.trim() || 'Khammam'} (${data.pincode.trim() || '507002'})`,
            verified: true,
            aadhaarVerified: true,
            kycRupeeVerified: Boolean(data.kycRupeePaid),
            completedPoojas: 0,
            bio: `${data.vedicSampradaya || 'Vedic Scholar'} · Aadhaar + ₹1 KYC verified on Guru Padukam.`,
          };
          await setDoc(doc(db, 'purohits', purohitRecord.id), purohitRecord, { merge: true }).catch(() => {});
        }

        return user;
      }

      // Local fallback (when Firebase keys are not yet configured)
      await delay(300);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      if (savedUsers[normalizedEmail] && savedUsers[normalizedEmail]._pwHash) {
        throw new Error('An account with this email already exists. Please sign in or use Forgot Password.');
      }

      const passwordHash = await hashPassword(data.password);
      const uid = `usr_${Date.now()}`;
      const user: User = {
        id: uid,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        address: data.address.trim(),
        city: data.city.trim(),
        pincode: data.pincode.trim(),
        role: safeRole,
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
        notifications: { email: true, sms: true, push: true },
      };

      savedUsers[normalizedEmail] = { ...user, _pwHash: passwordHash };
      localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      return user;
    },

    async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
      await delay(300);
      const normalizedEmail = email.trim().toLowerCase();
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const record = savedUsers[normalizedEmail];
      if (record?._pwHash && (await hashPassword(currentPassword)) !== record._pwHash) {
        throw new Error('Current password is incorrect.');
      }
      if (record) {
        record._pwHash = await hashPassword(newPassword);
        savedUsers[normalizedEmail] = record;
        localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      }
    },

    async login(email: string, password?: string): Promise<User> {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error('Email and password are required.');
      }

      if (isFirebaseConfigured && auth && db) {
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (err) {
          throw mapFirebaseAuthError(err);
        }
        const uid = cred.user.uid;
        const isAdminUser = await checkIsAdminSafe(uid);
        const userSnap = await getDoc(doc(db, 'users', uid));

        if (userSnap.exists()) {
          const data = userSnap.data() as User;
          if ((data as any).disabled) {
            await signOut(auth);
            throw new Error('This account has been disabled by an administrator.');
          }
          return {
            ...data,
            id: uid,
            role: isAdminUser ? 'admin' : data.role === 'admin' ? 'user' : data.role,
          };
        }

        if (isAdminUser) {
          return {
            id: uid,
            name: cred.user.displayName || 'Guru Padukam Admin',
            email: normalizedEmail,
            phone: '',
            address: '',
            role: 'admin',
            createdAt: new Date().toISOString(),
            notifications: { email: true, sms: true, push: true },
          };
        }

        // Do NOT recreate deleted user documents when Firestore profile was removed
        await signOut(auth);
        throw new Error('Account data was removed or does not exist. Please register again.');
      }

      // Local fallback with real password verification (NO auto-create, NO email.includes('admin'))
      await delay(300);
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      const record = savedUsers[normalizedEmail];
      if (!record) {
        throw new Error('Account not found. Please register first.');
      }
      const pwHash = await hashPassword(password);
      if (record._pwHash && record._pwHash !== pwHash) {
        throw new Error('Incorrect password. Please try again.');
      }
      const { _pwHash, ...cleanUser } = record;
      // Never trust client-side admin role in local mode
      return {
        ...cleanUser,
        role: cleanUser.role === 'purohit' ? 'purohit' : 'user',
      };
    },

    async verifyAdminLogin(email: string, password: string): Promise<User> {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error('Admin email and password are required.');
      }

      // 1. Check Firebase Auth + Firestore `admins/{uid}` if Firebase is configured
      if (isFirebaseConfigured && auth && db) {
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (err) {
          throw mapFirebaseAuthError(err);
        }
        const uid = cred.user.uid;
        const adminSnap = await getDoc(doc(db, 'admins', uid));
        if (!adminSnap.exists()) {
          await signOut(auth);
          throw new Error('Access denied: This account does not have Administrator privileges.');
        }
        const userSnap = await getDoc(doc(db, 'users', uid));
        const profile = userSnap.exists() ? (userSnap.data() as User) : null;
        return {
          ...(profile || {
            name: 'Guru Padukam Admin',
            phone: '9949730175',
            address: 'Khammam HQ',
            createdAt: new Date().toISOString(),
          }),
          id: uid,
          email: normalizedEmail,
          role: 'admin',
        };
      }

      // 2. Otherwise verify strictly against backend server env (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/verify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.verified) {
        throw new Error(data.message || 'Invalid administrator credentials.');
      }
      return data.user as User;
    },

    async resetPassword(email: string): Promise<void> {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Password reset emails require Firebase Authentication to be configured.');
      }
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    },

    async verifyCurrentSession(fbUser: FirebaseAuthUser): Promise<User | null> {
      if (!isFirebaseConfigured || !auth || !db) return null;
      try {
        await fbUser.reload();
        const uid = fbUser.uid;
        const [adminSnap, userSnap] = await Promise.all([
          getDoc(doc(db, 'admins', uid)),
          getDoc(doc(db, 'users', uid)),
        ]);
        if (!userSnap.exists() && !adminSnap.exists()) {
          await signOut(auth);
          return null;
        }
        if (userSnap.exists()) {
          const data = userSnap.data() as User;
          if ((data as any).disabled) {
            await signOut(auth);
            return null;
          }
          return {
            ...data,
            id: uid,
            role: adminSnap.exists() ? 'admin' : data.role === 'admin' ? 'user' : data.role,
          };
        }
        return {
          id: uid,
          name: fbUser.displayName || 'Guru Padukam Admin',
          email: (fbUser.email || '').toLowerCase(),
          phone: '',
          address: '',
          role: 'admin',
          createdAt: new Date().toISOString(),
          notifications: { email: true, sms: true, push: true },
        };
      } catch {
        // Throws auth/user-not-found or auth/user-token-expired if account was deleted in Firebase Auth Console
        await signOut(auth).catch(() => undefined);
        return null;
      }
    },

    async logout(): Promise<void> {
      if (isFirebaseConfigured && auth) {
        await signOut(auth).catch(() => undefined);
      }
    },

    async updateUser(user: User): Promise<void> {
      const uploadedPhoto = await uploadDataUrlToStorage(
        `profiles/${user.id}/avatar_${Date.now()}.jpg`,
        user.profileImage
      );
      const updatedUser: User = { ...user, profileImage: uploadedPhoto };

      if (isFirebaseConfigured && db) {
        // Never allow client updateUser to escalate role to 'admin'
        const { role, ...safeFields } = updatedUser;
        await setDoc(doc(db, 'users', user.id), safeFields, { merge: true });
      }

      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      if (savedUsers[user.email]) {
        savedUsers[user.email] = { ...savedUsers[user.email], ...updatedUser };
        localStorage.setItem('gp_fb_users', JSON.stringify(savedUsers));
      }
    },

    async getAllUsers(): Promise<User[]> {
      if (isFirebaseConfigured && db) {
        try {
          const snap = await getDocs(collection(db, 'users'));
          return snap.docs.map((d) => ({ ...(d.data() as User), id: d.id }));
        } catch (err) {
          console.warn('[Firestore] Failed to load users:', err);
        }
      }
      const savedUsers = JSON.parse(localStorage.getItem('gp_fb_users') || '{}');
      return Object.values(savedUsers).map((u: any) => {
        const { _pwHash, ...rest } = u;
        return rest as User;
      });
    },
  },

  storage: {
    uploadDataUrl: uploadDataUrlToStorage,
  },

  db: {
    async seedCatalogToFirestore(): Promise<{ products: number; purohits: number; aparaPeetas: number }> {
      await syncCollectionList('products', 'gp_fb_products', INITIAL_PRODUCTS);
      await syncCollectionList('purohits', 'gp_fb_purohits', PUROHITS);
      await syncCollectionList('aparaPeetas', 'gp_fb_apara_peetas', APARA_PEETAS);
      return {
        products: INITIAL_PRODUCTS.length,
        purohits: PUROHITS.length,
        aparaPeetas: APARA_PEETAS.length,
      };
    },

    async getProducts(): Promise<Product[]> {
      const list = await readCollection<Product>('products', 'gp_fb_products');
      if (list.length > 0) return list;
      if (!isFirebaseConfigured) {
        localStorage.setItem('gp_fb_products', JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return [];
    },
    async saveProducts(products: Product[]): Promise<void> {
      await syncCollectionList('products', 'gp_fb_products', products);
    },
    async deleteProduct(productId: string): Promise<void> {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'products', productId)).catch(() => undefined);
      }
      const saved = localStorage.getItem('gp_fb_products');
      const products: Product[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem('gp_fb_products', JSON.stringify(products.filter((p) => p.id !== productId)));
    },

    async getOrders(): Promise<Order[]> {
      if (isFirebaseConfigured && db) {
        if (!auth?.currentUser) {
          const saved = localStorage.getItem('gp_fb_orders');
          return saved ? JSON.parse(saved) : [];
        }
        try {
          const snap = await getDocs(query(collection(db, 'orders'), orderBy('date', 'desc')));
          return snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }));
        } catch {
          return readCollection<Order>('orders', 'gp_fb_orders');
        }
      }
      return readCollection<Order>('orders', 'gp_fb_orders');
    },
    async saveOrder(order: Order): Promise<void> {
      await writeCollectionItem('orders', 'gp_fb_orders', order);
    },
    async updateOrder(orderId: string, status: Order['status']): Promise<void> {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'orders', orderId), { status }).catch(() => undefined);
      }
      const orders = await this.getOrders();
      localStorage.setItem(
        'gp_fb_orders',
        JSON.stringify(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
      );
    },

    async getPurohits(): Promise<Purohit[]> {
      const list = await readCollection<Purohit>('purohits', 'gp_fb_purohits');
      if (list.length > 0) return list;
      if (!isFirebaseConfigured) {
        localStorage.setItem('gp_fb_purohits', JSON.stringify(PUROHITS));
        return PUROHITS;
      }
      return [];
    },
    async savePurohits(purohits: Purohit[]): Promise<void> {
      await syncCollectionList('purohits', 'gp_fb_purohits', purohits);
    },

    async getBookings(): Promise<Booking[]> {
      return readCollection<Booking>('bookings', 'gp_fb_bookings');
    },
    async saveBooking(booking: Booking): Promise<void> {
      await writeCollectionItem('bookings', 'gp_fb_bookings', booking);
    },
    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'bookings', bookingId), { status }).catch(() => undefined);
      }
      const bookings = await this.getBookings();
      localStorage.setItem(
        'gp_fb_bookings',
        JSON.stringify(bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      );
    },
    async markBookingWhatsappSent(bookingId: string): Promise<void> {
      const now = new Date().toISOString();
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'bookings', bookingId), {
          whatsappDispatchStatus: 'Sent',
          whatsappDispatchedAt: now,
        }).catch(() => undefined);
      }
      const bookings = await this.getBookings();
      localStorage.setItem(
        'gp_fb_bookings',
        JSON.stringify(
          bookings.map((b) =>
            b.id === bookingId ? { ...b, whatsappDispatchStatus: 'Sent' as const, whatsappDispatchedAt: now } : b
          )
        )
      );
    },

    async getAparaPeetas(): Promise<AparaPeeta[]> {
      const list = await readCollection<AparaPeeta>('aparaPeetas', 'gp_fb_apara_peetas');
      if (list.length > 0) return list;
      if (!isFirebaseConfigured) {
        localStorage.setItem('gp_fb_apara_peetas', JSON.stringify(APARA_PEETAS));
        return APARA_PEETAS;
      }
      return [];
    },
    async saveAparaPeetas(peetas: AparaPeeta[]): Promise<void> {
      await syncCollectionList('aparaPeetas', 'gp_fb_apara_peetas', peetas);
    },

    async getAparaBookings(): Promise<AparaBooking[]> {
      return readCollection<AparaBooking>('aparaBookings', 'gp_fb_apara_bookings');
    },
    async saveAparaBooking(booking: AparaBooking): Promise<void> {
      await writeCollectionItem('aparaBookings', 'gp_fb_apara_bookings', booking);
    },
    async updateAparaBookingStatus(bookingId: string, status: AparaBooking['status']): Promise<void> {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'aparaBookings', bookingId), { status }).catch(() => undefined);
      }
      const list = await this.getAparaBookings();
      localStorage.setItem(
        'gp_fb_apara_bookings',
        JSON.stringify(list.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      );
    },
    async markAparaWhatsappSent(bookingId: string): Promise<void> {
      const now = new Date().toISOString();
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'aparaBookings', bookingId), {
          whatsappDispatchStatus: 'Sent',
          whatsappDispatchedAt: now,
        }).catch(() => undefined);
      }
      const list = await this.getAparaBookings();
      localStorage.setItem(
        'gp_fb_apara_bookings',
        JSON.stringify(
          list.map((b) =>
            b.id === bookingId ? { ...b, whatsappDispatchStatus: 'Sent' as const, whatsappDispatchedAt: now } : b
          )
        )
      );
    },
    async saveBookingsList(bookings: Booking[]): Promise<void> {
      await syncCollectionList('bookings', 'gp_fb_bookings', bookings);
    },
    async saveAparaBookingsList(list: AparaBooking[]): Promise<void> {
      await syncCollectionList('aparaBookings', 'gp_fb_apara_bookings', list);
    },

    async getTickets(): Promise<SupportTicket[]> {
      return readCollection<SupportTicket>('tickets', 'gp_fb_tickets');
    },
    async saveTickets(tickets: SupportTicket[]): Promise<void> {
      await syncCollectionList('tickets', 'gp_fb_tickets', tickets);
    },

    async getNotifications(): Promise<EventNotification[]> {
      return readCollection<EventNotification>('notifications', 'gp_fb_notifications');
    },
    async saveNotifications(list: EventNotification[]): Promise<void> {
      await syncCollectionList('notifications', 'gp_fb_notifications', list);
    },
  },
};
