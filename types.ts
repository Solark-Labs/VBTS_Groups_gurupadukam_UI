import { LanguageCode } from './i18n/languages';

// ─── Products & Cart ─────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  nameTe: string;
  price: number;
  origPrice: number;
  discount: string;
  image: string;
  desc: string;
  category: 'powder' | 'thread' | 'combo' | 'items' | 'return-gifts' | 'flowers' | 'prasad' | 'essentials';
  badge?: { text: string; type: 'org' | 'new' | 'sale' | 'lim' };
  stock: number;
  deliverySpeed?: string; // e.g. "In 15–30 mins"
}

export interface CartItem extends Product {
  qty: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  bookingId?: string;
  paymentMethod?: 'Cashfree' | 'Wallet';
  createdAt: string;
}

// ─── Users & Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;       // Mandatory for booking & order coordination
  address: string;     // Mandatory for doorstep services & deliveries
  city?: string;
  pincode?: string;
  role: 'user' | 'purohit' | 'admin';
  preferredLanguage?: LanguageCode;
  profileImage?: string;
  walletBalance?: number;
  walletTransactions?: WalletTransaction[];
  createdAt: string;
  notifications?: { email: boolean; sms: boolean; push?: boolean };
  // Purohit KYC & Role Policy Fields
  aadhaarLast4?: string;
  aadhaarDocPreview?: string;
  kycVerified?: boolean;
  kycRupeePaid?: boolean;
  kycCfOrderId?: string;
  kycCfPaymentId?: string;
  kycVerifiedAt?: string;
  readyToShowVerification?: boolean;
  vedicSampradaya?: string;
  experienceYears?: number;
  acceptedRolePolicyAt?: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  password?: string;
  role?: 'user' | 'purohit' | 'admin';
  preferredLanguage?: LanguageCode;
  profileImage?: string;
  aadhaarLast4?: string;
  aadhaarDocPreview?: string;
  kycVerified?: boolean;
  kycRupeePaid?: boolean;
  kycCfOrderId?: string;
  kycCfPaymentId?: string;
  kycVerifiedAt?: string;
  readyToShowVerification?: boolean;
  vedicSampradaya?: string;
  experienceYears?: number;
  acceptedRolePolicyAt?: string;
}

// ─── GeoLocation ──────────────────────────────────────────────────────────────
export interface GeoLocation {
  lat: number;
  lng: number;
  mapUrl: string;
  directionsUrl: string;
  formattedAddress?: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  shippingAddress: string;
  location?: GeoLocation;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  trackingUrl?: string;
  paymentMethod?: string;
}

// ─── Toasts ───────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

// ─── Purohits ─────────────────────────────────────────────────────────────────
export interface Purohit {
  id: string;
  name: string;
  nameTe: string;
  image: string;
  phone?: string;
  specializations: string[];
  experience: number;
  rating: number;
  reviews: number;
  availability: 'now' | 'today' | 'scheduled';
  nextSlot?: string;
  languages: string[];
  location: string;
  verified: boolean;
  aadhaarVerified?: boolean;
  kycRupeeVerified?: boolean;
  completedPoojas: number;
  bio: string;
  galleryImages?: string[];
  reviewsList?: AparaReview[];
}

// ─── Service Categories ───────────────────────────────────────────────────────
export interface ServiceCategory {
  id: string;
  name: string;
  nameTe: string;
  icon: string;
  description: string;
  providerCount: number;
  badgeText: string;
  route: string;
}

// ─── Pooja Packages ───────────────────────────────────────────────────────────
export interface PoojaPackage {
  id: string;
  name: string;
  nameTe: string;
  occasion: string;
  includes: string[];
  image: string;
  badge?: string;
  popular?: boolean;
}

export interface BookingTimelineEvent {
  id: string;
  timestamp: string;
  actor: 'Devotee' | 'Purohit' | 'Admin' | 'System';
  action: string;
  details?: string;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  purohitId: string;
  purohitName: string;
  purohitPhone?: string;
  occasion: string;
  date: string;
  time: string;
  address: string;
  city: string;
  pincode: string;
  location?: GeoLocation;
  notes?: string;
  status: 'Awaiting Purohit Approval' | 'Muhurtham Finalized' | 'Pending' | 'Confirmed' | 'Completed' | 'Rejected by Purohit' | 'Cancellation Requested' | 'Cancelled';
  total: number; // ₹11 booking confirmation token
  bookingType?: 'immediate' | 'scheduled';
  nakshatram?: string;
  muhurthamFinalized?: boolean;
  muhurthamFinalizedAt?: string;
  guruPadukamTeamAction?: string;
  advancePaidToPurohit?: number;
  advanceAcknowledgedByDevotee?: boolean;
  advanceAcknowledgedByPurohit?: boolean;
  devoteeCancelStatus?: 'none' | 'requested' | 'approved' | 'rejected';
  devoteeCancelReason?: string;
  cancellationRoutedTo?: ('Purohit' | 'Admin')[];
  timeline?: BookingTimelineEvent[];
  paymentMethod?: 'Cashfree' | 'Wallet';
  paymentStatus?: 'Pending' | 'Verified';
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  purohitActionReason?: string;
  refundCreditedToWallet?: boolean;
  rescheduleCount?: number;
  whatsappDispatchStatus?: 'Scheduled' | 'Sent';
  whatsappDispatchedAt?: string;
  reminderHoursBefore?: number;
  samagriMode?: 'devotee-arranges' | 'purohit-brings' | 'marketplace-30min';
  samagriItems?: string[];
  shipBefore30Min?: boolean;
  handoffStatus?: 'none' | 'requested' | 'reassigned';
  handoffReason?: string;
  originalPurohitName?: string;
  locality?: string;
}

// ─── Nadaswaram Troupes ───────────────────────────────────────────────────────
export interface NadaswaramTroupe {
  id: string;
  name: string;
  members: number;
  experience: number;
  rating: number;
  reviews: number;
  availability: 'now' | 'today' | 'scheduled';
  location: string;
  image: string;
}

// ─── Apara (Last Rites, Masikams, Abdikams & Samvatsarikam) ──────────────────
export interface AparaReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  ceremonyType: string;
  date: string;
}

export interface AparaPeeta {
  id: string;
  name: string;
  nameTe: string;
  image: string;
  phone: string;
  organizerName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  services: string[];
  groupOptions: string[];
  supportsOnline: boolean;
  supportsHomeService: boolean;
  supportsVenueVisit: boolean;
  supportsFoodPackage: boolean;
  foodPresets: string[];
  maxGuestsAtVenue: number;
  rating: number;
  reviewCount: number;
  reviewsList: AparaReview[];
  experienceYears: number;
  verified: boolean;
  bio: string;
  galleryImages?: string[];
}

export type AparaRitualMode = 'online' | 'offline-home' | 'offline-venue';
export type AparaFoodPackage = 'without-food' | 'with-food';

export interface AparaBooking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  peetaId: string;
  peetaName: string;
  peetaPhone: string;
  peetaAddress: string;
  ceremonyType: string;
  date: string;
  time: string;
  ritualMode: AparaRitualMode;
  purohitGroup: string;
  foodPackage: AparaFoodPackage;
  attendeeCount: number;
  foodMenuType?: string;
  preferredItems?: string;
  customizations?: string;
  address: string;
  city: string;
  pincode: string;
  location?: GeoLocation;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  tokenFee: number;
  contactRevealed: boolean;
  priorDispatchDate: string;
  whatsappDispatchStatus: 'Scheduled' | 'Sent';
  whatsappDispatchedAt?: string;
  createdAt: string;
  foodEditableUntil?: string;
  emergencyReplacementGuaranteed?: boolean;
}

// ─── Support Tickets & Incident Reporting ─────────────────────────────────────
export type TicketCategory =
  | 'Purohit Delay'
  | 'Emergency Swap'
  | 'Samagri / Essentials'
  | 'Food Customization'
  | 'New Request'
  | 'Other';

export interface SupportTicket {
  id: string;
  bookingId?: string;
  userName: string;
  userPhone: string;
  category: TicketCategory;
  severity: 'Normal' | 'Urgent' | 'Emergency';
  description: string;
  status: 'Open' | 'Assigned' | 'Resolved';
  assignedTo?: string;
  createdAt: string;
}

// ─── Event Notifications ──────────────────────────────────────────────────────
export interface EventNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  bookingId?: string;
  read: boolean;
  createdAt: string;
}
