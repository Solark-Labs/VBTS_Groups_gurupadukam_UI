/**
 * Cashfree Payment Gateway + ₹11 Token Verification & Devotee Wallet Service.
 * Strictly requires payment completion (`PAID`) before verification passes.
 */

const API_BASE_URL = String((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function authHeaders(): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('gp_auth_token') : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export interface CashfreeOrderResponse {
  success: boolean;
  mode: 'cashfree-live' | 'cashfree-sandbox-local';
  cfOrderId: string;
  paymentSessionId: string;
  amount: number;
  currency: 'INR';
  status: 'ACTIVE';
}

export interface CashfreeVerifyResponse {
  verified: boolean;
  cfOrderId: string;
  cfPaymentId?: string;
  amount: number;
  status: 'PAID' | 'FAILED' | 'NOT_PAID';
  verifiedAt?: string;
  mode: 'cashfree-live' | 'cashfree-sandbox-local';
  message?: string;
}

export function getApiBaseUrl(): string {
  return ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
}

export function hasApiBackend(): boolean {
  if (getApiBaseUrl()) return true;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
}

const localSandboxOrders = new Map<string, { status: 'ACTIVE' | 'PAID' | 'FAILED'; amount: number; method?: string }>();

export async function createCashfreeTokenOrder(params: {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount?: number;
  purpose?: 'BOOKING_TOKEN' | 'PUROHIT_KYC';
}): Promise<CashfreeOrderResponse> {
  const orderAmount = params.amount ?? 11;
  const res = await fetch(`${API_BASE_URL}/api/payments/cashfree/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: params.bookingRef,
      amount: orderAmount,
      purpose: params.purpose || 'BOOKING_TOKEN',
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Payment gateway server is unavailable. Please try again later.');
  }
  const data: CashfreeOrderResponse = await res.json();
  if (!data.cfOrderId || !data.paymentSessionId) {
    throw new Error('Invalid payment order response from server.');
  }
  return data;
}

export async function verifyCashfreeTokenPayment(params: {
  cfOrderId: string;
  bookingRef: string;
  userId: string;
  expectedAmount?: number;
}): Promise<CashfreeVerifyResponse> {
  const expectedAmount = params.expectedAmount ?? 11;
  try {
    const res = await fetch(`${API_BASE_URL}/api/payments/cashfree/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cfOrderId: params.cfOrderId,
        bookingId: params.bookingRef,
        userId: params.userId,
        expectedAmount,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.verified && data.status === 'PAID') {
      return data;
    }
    return {
      verified: false,
      cfOrderId: params.cfOrderId,
      amount: expectedAmount,
      status: data.status || 'FAILED',
      mode: 'cashfree-live',
      message: data.message || `₹${expectedAmount} payment not confirmed by Cashfree.`,
    };
  } catch {
    return {
      verified: false,
      cfOrderId: params.cfOrderId,
      amount: expectedAmount,
      status: 'FAILED',
      mode: 'cashfree-live',
      message: 'Unable to reach payment verification server. Payment not confirmed.',
    };
  }
}

export async function syncPurohitKycToBackend(params: {
  email: string;
  name: string;
  phone: string;
  aadhaarLast4: string;
  kycCfOrderId: string;
  kycCfPaymentId: string;
  readyToShowVerification: boolean;
  vedicSampradaya?: string;
}): Promise<void> {
  if (!hasApiBackend()) return;
  try {
    await fetch(`${API_BASE_URL}/api/purohit/kyc`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(params),
    });
  } catch {
    // Persisted locally in AppContext/localStorage
  }
}

export async function syncBookingCreateToBackend(booking: unknown): Promise<void> {
  if (!hasApiBackend()) return;
  try {
    await fetch(`${API_BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(booking),
    });
  } catch {
    // Local state persists immediately in AppContext/localStorage
  }
}

export async function syncBookingNoteToBackend(params: {
  bookingId: string;
  actor: 'Devotee' | 'Purohit' | 'Admin';
  note?: string;
  advancePaidToPurohit?: number;
  acknowledgeAdvance?: boolean;
}): Promise<void> {
  if (!hasApiBackend()) return;
  try {
    await fetch(`${API_BASE_URL}/api/bookings/update-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Persisted locally in AppContext
  }
}

export async function syncDevoteeCancelToBackend(params: {
  bookingId: string;
  reason: string;
  actionType?: 'cancel' | 'swap';
}): Promise<void> {
  if (!hasApiBackend()) return;
  try {
    await fetch(`${API_BASE_URL}/api/bookings/devotee-cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Persisted locally in AppContext
  }
}

export async function syncPurohitActionToBackend(params: {
  bookingId: string;
  userId: string;
  action: 'accept' | 'accept_finalize' | 'reject' | 'reschedule';
  reason?: string;
  finalDate?: string;
  finalTime?: string;
  nakshatram?: string;
}): Promise<void> {
  if (!hasApiBackend()) return;
  try {
    await fetch(`${API_BASE_URL}/api/bookings/purohit-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Local state persists immediately in AppContext/localStorage
  }
}
