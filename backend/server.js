
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const app = express();
app.use(express.json({limit: process?.env?.API_PAYLOAD_MAX_SIZE || "7mb"}));

app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-proxy');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const PORT = Number(process?.env?.PORT || process?.env?.API_BACKEND_PORT || 5000);
const API_BACKEND_HOST = process?.env?.API_BACKEND_HOST || "0.0.0.0";

const GOOGLE_CLOUD_LOCATION = process?.env?.GOOGLE_CLOUD_LOCATION || '';
const GOOGLE_CLOUD_PROJECT = process?.env?.GOOGLE_CLOUD_PROJECT || '';
const PROXY_HEADER = process?.env?.PROXY_HEADER || '';
const VERTEX_PROXY_ENABLED = Boolean(GOOGLE_CLOUD_PROJECT && GOOGLE_CLOUD_LOCATION && PROXY_HEADER);
if (!VERTEX_PROXY_ENABLED) {
  console.warn("[Backend] Vertex AI proxy env vars not set; /api-proxy and /ws-proxy disabled, core booking/payment APIs active.");
}

app.set('trust proxy', 1 /* number of proxies between user and server */);

// IMPORTANT: Vertex AI Studio Rate Limiting
// This rate limiting configuration protects your backend APIs from abuse.
// Removing it exposes your service to DoS attacks and unexpected costs.
const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Set ratelimit window at 15min (in ms)
    max: 100, // Limit each IP to 100 requests per window 
    standardHeaders: true, // Return rate limit info in the "RateLimit-*" headers
    legacyHeaders: false, // no "X-RateLimit-*" headers
    message: {
      error: 'Too many requests',
      message: 'You have exceed the request limit, please try again later.'
    },
});
// Apply the rate limiter to the /api-proxy route before the main proxy logic
app.use('/api-proxy', proxyLimiter);

const API_CLIENT_MAP = [
 {
    name: "VertexGenAi:generateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:generateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:generateContent`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "VertexGenAi:predict",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:predict",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:predict`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "VertexGenAi:streamGenerateContent",
    patternForProxy: "https://aiplatform.googleapis.com/{{version}}/publishers/google/models/{{model}}:streamGenerateContent",
    getApiEndpoint: (context, params) => {
      return `https://aiplatform.clients6.google.com/${params['version']}/projects/${context.projectId}/locations/${context.region}/publishers/google/models/${params['model']}:streamGenerateContent`;
    },
    isStreaming: true,
    transformFn: (response) => {
        let normalizedResponse = response.trim();
        while (normalizedResponse.startsWith(',') || normalizedResponse.startsWith('[')) {
          normalizedResponse = normalizedResponse.substring(1).trim();
        }
        while (normalizedResponse.endsWith(',') || normalizedResponse.endsWith(']')) {
          normalizedResponse = normalizedResponse.substring(0, normalizedResponse.length - 1).trim();
        }

        if (!normalizedResponse.length) {
          return {result: null, inProgress: false};
        }

        if (!normalizedResponse.endsWith('}')) {
          return {result: normalizedResponse, inProgress: true};
        }

        try {
          const parsedResponse = JSON.parse(`${normalizedResponse}`);
          const transformedResponse = `data: ${JSON.stringify(parsedResponse)}\n\n`;
          return {result: transformedResponse, inProgress: false};
        } catch (error) {
          throw new Error(`Failed to parse response: ${error}.`);
        }
    },
  },
 {
    name: "ReasoningEngine:query",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:query",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:query`;
    },
    isStreaming: false,
    transformFn: null,
  },
 {
    name: "ReasoningEngine:streamQuery",
    patternForProxy: "https://{{endpoint_location}}-aiplatform.googleapis.com/{{version}}/projects/{{project_id}}/locations/{{location_id}}/reasoningEngines/{{engine_id}}:streamQuery",
    getApiEndpoint: (context, params) => {
      return `https://${params['endpoint_location']}-aiplatform.clients6.google.com/v1beta1/projects/${params['project_id']}/locations/${params['location_id']}/reasoningEngines/${params['engine_id']}:streamQuery`;
    },
    isStreaming: true,
    transformFn: null,
  },
].map((client) => ({ ...client, patternInfo: parsePattern(client.patternForProxy) }));

// Uses Google Application Default Credentials (ADC).
// Users need to run "gcloud auth application-default login" in order to use the proxy.
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePattern(pattern) {
  const paramRegex = /\{\{(.*?)\}\}/g;
  const params = [];
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = paramRegex.exec(pattern)) !== null) {
    params.push(match[1]);
    const literalPart = pattern.substring(lastIndex, match.index);
    parts.push(escapeRegex(literalPart));
    parts.push(`(?<${match[1]}>[^/]+)`);
    lastIndex = paramRegex.lastIndex;
  }
  parts.push(escapeRegex(pattern.substring(lastIndex)));
  const regexString = parts.join('');

  return {regex: new RegExp(`^${regexString}$`), params};
}

function extractParams(patternInfo, url) {
  const match = url.match(patternInfo.regex);
  if (!match) return null;
  const params = {};
  patternInfo.params.forEach((paramName, index) => {
    params[paramName] = match[index + 1];
  });
  return params;
}

async function getAccessToken(res) {
  try {
    const authClient = await auth.getClient();
    const token = await authClient.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('[Node Proxy] Authentication error:', error);
    if (!res) return null;
    if (error.code === 'ERR_GCLOUD_NOT_LOGGED_IN' || (error.message && error.message.includes('Could not load the default credentials'))) {
      res.status(401).json({
        error: 'Authentication Required',
        message: 'Google Cloud Application Default Credentials not found or invalid. Please run "gcloud auth application-default login" and try again.',
      });
    } else {
      res.status(500).json({ error: `Authentication failed: ${error.message}` });
    }
    return null;
  }
}

function getRequestHeaders(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'X-Goog-User-Project': GOOGLE_CLOUD_PROJECT,
    'Content-Type': 'application/json',
  };
}

// --- Health Check Endpoint ---
app.get('/api/health', (_req, res) => {
  const hasCashfreeKeys = Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
  const cashfreeMode = hasCashfreeKeys
    ? (process.env.CASHFREE_ENV === 'PRODUCTION' ? 'live' : 'sandbox')
    : 'local-sandbox';
  return res.json({
    ok: true,
    service: 'guru-padukam-backend',
    cashfreeMode,
    vertexProxyEnabled: VERTEX_PROXY_ENABLED,
    timestamp: new Date().toISOString(),
  });
});

// --- Proxy Endpoint ---
app.post('/api-proxy', async (req, res) => {
  if (!VERTEX_PROXY_ENABLED) {
    return res.status(503).json({ error: 'Vertex AI proxy is not configured on this server.' });
  }

  // Check for the custom header added by the shim
  if (req.headers['x-app-proxy'] !== PROXY_HEADER) {
    return res.status(403).send('Forbidden: Request must originate from the Vertex App shim.');
  }

  const { originalUrl, method, headers, body } = req.body;
  if (!originalUrl) {
    return res.status(400).send('Bad Request: originalUrl is required.');
  }

  // 1. Find the matching API client
  const apiClient = API_CLIENT_MAP.find(p => {
    // We store extractedParams on req for use later if needed, though getVertexUrl takes it as arg.
    req.extractedParams = extractParams(p.patternInfo, originalUrl);
    return req.extractedParams !== null;
  });

  if (!apiClient) {
    console.error(`[Node Proxy] No API client handler found for URL: ${originalUrl}`);
    return res.status(404).json({ error: `No proxy handler found for URL: ${originalUrl}` });
  }

  const extractedParams = req.extractedParams;
  console.log(`[Node Proxy] Matched API client: ${apiClient.name}`);
  try {
    // 2. Get authenticated access token
    const accessToken = await getAccessToken(res);
    if (!accessToken) return;

    // 3. Construct the full API URL using env-set GOOGLE_CLOUD_PROJECT/LOCATION and extracted params
    const context = {projectId: GOOGLE_CLOUD_PROJECT, region: GOOGLE_CLOUD_LOCATION};
    const apiUrl = apiClient.getApiEndpoint(context, extractedParams);
    console.log(`[Node Proxy] Forwarding to Vertex API: ${apiUrl}`);

    // 4. Prepare headers for the API call
    const apiHeaders = getRequestHeaders(accessToken);

    const apiFetchOptions = {
      method: method || 'POST',
      headers: {...apiHeaders, ...headers},
      body: body ? body : undefined,
    };

    // 5. Make the call to the API
    const apiResponse = await fetch(apiUrl, apiFetchOptions);

    // 6. Respond to the client based on stream type
    if (apiClient.isStreaming) {
      console.log(`[Node Proxy] Sending STREAMING response for ${apiClient.name}`);
      // Set headers for a streaming JSON response
      res.writeHead(apiResponse.status, {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
      });
      // Immediately send headers
      res.flushHeaders();

      if (!apiResponse.body) {
        console.error('[Node Proxy] Streaming response has no body.');
        return res.end(JSON.stringify({ error: 'Streaming response body is null' }));
      }

      const decoder = new TextDecoder();
      let deltaChunk = '';
      apiResponse.body.on('data', (encodedChunk) => {
        if (res.writableEnded) return; // Prevent writing after res.end()

        try {
          if (!apiClient.transformFn) {
            res.write(encodedChunk);
          } else {
            const decodedChunk = decoder.decode(encodedChunk, { stream: true });
            deltaChunk = deltaChunk + decodedChunk;

            const {result, inProgress} = apiClient.transformFn(deltaChunk);
            if (result && !inProgress) {
              deltaChunk = '';
              res.write(new TextEncoder().encode(result));
            }
          }
        } catch (error) {
          console.error(`[Node Proxy] Error processing streaming response for ${apiClient.name}`);
          console.error(error);
        }
      });

      apiResponse.body.on('end', () => {
        deltaChunk = '';
        console.log(`[Node Proxy] Vertex stream finished and all data processed for ${apiClient.name}`);
        res.end();
      });

      apiResponse.body.on('error', (streamError) => {
        console.error('[Node Proxy] Error from Vertex stream:', streamError);
        if (!res.writableEnded) {
          res.end(JSON.stringify({ proxyError: 'Stream error from Vertex AI', details: streamError.message }));
        }
      });

      res.on('error', (resError) => {
        console.error('[Node Proxy] Error writing to client response:', resError);
        // The source stream might need to be destroyed if an error occurs here.
        if (apiResponse.body && typeof apiResponse.body.destroy === 'function') {
             apiResponse.body.destroy(resError);
        }
      });
    } else {
      // Non-streaming response handling
      console.log(`[Node Proxy] Sending JSON response for ${apiClient.name}`);
      const data = await apiResponse.json();
      res.status(apiResponse.status).json(data);
    }
  } catch (error) {
    console.error(`[Node Proxy] Error proxying request for ${apiClient.name}`);
    console.error(error)
    res.status(500).json({ error: error });
  }
});

// ─── Cashfree ₹11 Token Payment Verification, Booking State & Wallet Ledger ───
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LEDGER_FILE = path.join(DATA_DIR, 'gp-ledger.json');

function loadPersistedLedger() {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
      return {
        orders: new Map(Object.entries(parsed.orders || {})),
        bookings: new Map(Object.entries(parsed.bookings || {})),
        wallets: new Map(Object.entries(parsed.wallets || {})),
        tickets: parsed.tickets || [],
        purohitKyc: new Map(Object.entries(parsed.purohitKyc || {})),
      };
    }
  } catch (err) {
    console.warn('[Ledger] Starting fresh ledger store:', err?.message);
  }
  return {
    orders: new Map(),
    bookings: new Map(),
    wallets: new Map(),
    tickets: [],
    purohitKyc: new Map(),
  };
}

const persisted = loadPersistedLedger();
const cashfreeOrderStore = persisted.orders;
const bookingLedgerStore = persisted.bookings;
const walletLedgerStore = persisted.wallets;
const ticketLedgerStore = persisted.tickets;
const purohitKycStore = persisted.purohitKyc;

function savePersistedLedger() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      LEDGER_FILE,
      JSON.stringify(
        {
          orders: Object.fromEntries(cashfreeOrderStore),
          bookings: Object.fromEntries(bookingLedgerStore),
          wallets: Object.fromEntries(walletLedgerStore),
          tickets: ticketLedgerStore,
          purohitKyc: Object.fromEntries(purohitKycStore),
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error('[Ledger] Failed to persist ledger:', err?.message);
  }
}

function getOrCreateWallet(userId) {
  if (!walletLedgerStore.has(userId)) {
    walletLedgerStore.set(userId, { balance: 0, transactions: [] });
  }
  return walletLedgerStore.get(userId);
}

app.post('/api/payments/cashfree/create-order', async (req, res) => {
  try {
    const { bookingId, amount = 11, purpose = 'BOOKING_TOKEN', customerName, customerPhone, customerEmail } = req.body || {};
    const orderAmount = Number(amount) || 11;
    const cfOrderId = `CF_ORD_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const cfBaseUrl =
      process.env.CASHFREE_ENV === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    if (appId && secretKey) {
      const cfRes = await fetch(cfBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey,
        },
        body: JSON.stringify({
          order_id: cfOrderId,
          order_amount: orderAmount,
          order_currency: 'INR',
          customer_details: {
            customer_id: String(customerPhone || 'devotee').replace(/\D/g, '') || 'devotee',
            customer_name: customerName || 'Devotee',
            customer_email: customerEmail || 'care.gurupadukam@gmail.com',
            customer_phone: String(customerPhone || '9949730175').replace(/\D/g, '').slice(-10) || '9949730175',
          },
          order_note: `Guru Padukam ₹${orderAmount} ${purpose === 'PUROHIT_KYC' ? 'Purohit KYC Witness' : 'Booking Token'} (${bookingId || 'NEW'})`,
        }),
      });
      const cfData = await cfRes.json();
      if (!cfRes.ok) {
        return res.status(cfRes.status).json({ success: false, error: cfData });
      }
      cashfreeOrderStore.set(cfOrderId, { bookingId, amount: orderAmount, purpose, status: cfData.order_status || 'ACTIVE' });
      savePersistedLedger();
      return res.json({
        success: true,
        mode: 'cashfree-live',
        cfOrderId: cfData.order_id,
        paymentSessionId: cfData.payment_session_id,
        amount: orderAmount,
        currency: 'INR',
        status: cfData.order_status || 'ACTIVE',
      });
    }

    const session = `cf_session_${Math.random().toString(36).slice(2, 14)}`;
    cashfreeOrderStore.set(cfOrderId, { bookingId, amount: orderAmount, purpose, status: 'ACTIVE' });
    savePersistedLedger();
    return res.json({
      success: true,
      mode: 'cashfree-sandbox-local',
      cfOrderId,
      paymentSessionId: session,
      amount: orderAmount,
      currency: 'INR',
      status: 'ACTIVE',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || 'Cashfree order creation failed' });
  }
});

app.post('/api/payments/cashfree/sandbox-action', (req, res) => {
  const { cfOrderId, action, method } = req.body || {};
  if (!cfOrderId || !cashfreeOrderStore.has(cfOrderId)) {
    return res.status(404).json({ success: false, message: 'Cashfree order not found' });
  }
  const existing = cashfreeOrderStore.get(cfOrderId);
  if (action === 'PAY') {
    existing.status = 'PAID';
    existing.method = method || 'UPI';
    existing.paidAt = new Date().toISOString();
    cashfreeOrderStore.set(cfOrderId, existing);
    savePersistedLedger();
    return res.json({ success: true, cfOrderId, status: 'PAID' });
  }
  existing.status = 'FAILED';
  cashfreeOrderStore.set(cfOrderId, existing);
  savePersistedLedger();
  return res.json({ success: false, cfOrderId, status: 'FAILED', message: 'Payment failed or cancelled by user' });
});

app.post('/api/payments/cashfree/verify', async (req, res) => {
  try {
    const { cfOrderId, bookingId, userId, expectedAmount } = req.body || {};
    if (!cfOrderId) {
      return res.status(400).json({ verified: false, error: 'cfOrderId is required' });
    }

    const storedOrder = cashfreeOrderStore.get(cfOrderId);
    const verifyAmount = Number(expectedAmount || storedOrder?.amount || 11);

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const cfBaseUrl =
      process.env.CASHFREE_ENV === 'PRODUCTION'
        ? `https://api.cashfree.com/pg/orders/${encodeURIComponent(cfOrderId)}`
        : `https://sandbox.cashfree.com/pg/orders/${encodeURIComponent(cfOrderId)}`;

    let verified = false;
    let mode = 'cashfree-sandbox-local';
    let cfPaymentId = `CF_PAY_${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (appId && secretKey) {
      mode = 'cashfree-live';
      const cfRes = await fetch(cfBaseUrl, {
        method: 'GET',
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey,
        },
      });
      const cfData = await cfRes.json();
      verified = cfRes.ok && cfData.order_status === 'PAID' && Number(cfData.order_amount) >= verifyAmount;
    } else {
      verified = Boolean(storedOrder && storedOrder.status === 'PAID');
    }

    if (!verified) {
      return res.status(402).json({
        verified: false,
        cfOrderId,
        amount: verifyAmount,
        status: 'FAILED',
        message: `₹${verifyAmount} payment was NOT completed/received by Cashfree.`,
      });
    }

    const verifiedAt = new Date().toISOString();
    if (storedOrder?.purpose !== 'PUROHIT_KYC') {
      bookingLedgerStore.set(bookingId || cfOrderId, {
        bookingId,
        userId,
        cfOrderId,
        cfPaymentId,
        amount: verifyAmount,
        paymentStatus: 'PAID',
        bookingStatus: 'Awaiting Purohit Approval',
        verifiedAt,
      });
    }
    savePersistedLedger();

    return res.json({
      verified: true,
      cfOrderId,
      cfPaymentId,
      amount: verifyAmount,
      status: 'PAID',
      verifiedAt,
      mode,
    });
  } catch (err) {
    return res.status(500).json({ verified: false, error: err?.message || 'Verification error' });
  }
});

app.post('/api/purohit/kyc', (req, res) => {
  const { email, name, phone, aadhaarLast4, kycCfOrderId, kycCfPaymentId, readyToShowVerification = true, vedicSampradaya } = req.body || {};
  if (!email || !aadhaarLast4 || !kycCfPaymentId) {
    return res.status(400).json({ success: false, message: 'Email, masked Aadhaar last 4 digits, and ₹1 KYC payment ID are required.' });
  }
  const key = String(email).trim().toLowerCase();
  const record = {
    email: key,
    name: name || 'Verified Purohit',
    phone: phone || '',
    aadhaarLast4: String(aadhaarLast4).slice(-4),
    kycVerified: true,
    kycRupeePaid: true,
    kycCfOrderId,
    kycCfPaymentId,
    readyToShowVerification: Boolean(readyToShowVerification),
    vedicSampradaya: vedicSampradaya || '',
    verifiedAt: new Date().toISOString(),
  };
  purohitKycStore.set(key, record);
  savePersistedLedger();
  return res.json({ success: true, kyc: record });
});

app.get('/api/purohit/kyc', (_req, res) => {
  return res.json({ kycRecords: Array.from(purohitKycStore.values()) });
});

app.post('/api/bookings/create', (req, res) => {
  const booking = req.body || {};
  if (!booking.id) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }
  const existing = bookingLedgerStore.get(booking.id) || {};
  const initialEvent = {
    id: `TL_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'System',
    action: `Booking Created & ₹11 Verified (${booking.paymentMethod || 'Cashfree'})`,
    details: `${booking.occasion} on ${booking.date} (${booking.time}) routed to ${booking.purohitName}`,
  };
  const record = {
    ...existing,
    ...booking,
    bookingId: booking.id,
    paymentStatus: booking.paymentStatus || existing.paymentStatus || 'Verified',
    bookingStatus: booking.status || 'Awaiting Purohit Approval',
    timeline: booking.timeline || [initialEvent],
    createdAt: existing.createdAt || new Date().toISOString(),
  };
  bookingLedgerStore.set(booking.id, record);
  savePersistedLedger();
  return res.json({ success: true, booking: record });
});

app.get('/api/bookings', (_req, res) => {
  return res.json({ bookings: Array.from(bookingLedgerStore.values()) });
});

app.post('/api/bookings/update-note', (req, res) => {
  const { bookingId, actor = 'Devotee', note, advancePaidToPurohit, acknowledgeAdvance } = req.body || {};
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required' });
  }
  const existing = bookingLedgerStore.get(bookingId) || { bookingId, timeline: [] };
  const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
  if (note) existing.notes = note;
  if (typeof advancePaidToPurohit === 'number') {
    existing.advancePaidToPurohit = advancePaidToPurohit;
  }
  if (acknowledgeAdvance && actor === 'Devotee') existing.advanceAcknowledgedByDevotee = true;
  if (acknowledgeAdvance && actor === 'Purohit') existing.advanceAcknowledgedByPurohit = true;

  timeline.push({
    id: `TL_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    action: acknowledgeAdvance
      ? `Advance / Settlement Acknowledged by ${actor}`
      : 'Booking Notes / Advance Details Updated',
    details: [
      note ? `Note: ${note}` : null,
      typeof advancePaidToPurohit === 'number' ? `Direct Advance Reported: ₹${advancePaidToPurohit}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  });
  existing.timeline = timeline;
  bookingLedgerStore.set(bookingId, existing);
  savePersistedLedger();
  return res.json({ success: true, booking: existing });
});

app.post('/api/bookings/devotee-cancel', (req, res) => {
  const { bookingId, reason, actionType = 'cancel' } = req.body || {};
  if (!bookingId || !reason || !String(reason).trim()) {
    return res.status(400).json({ success: false, message: 'Valid cancellation/swap reason is mandatory.' });
  }
  const existing = bookingLedgerStore.get(bookingId) || { bookingId, timeline: [] };
  const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
  timeline.push({
    id: `TL_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Devotee',
    action: actionType === 'swap' ? 'Date Swap Requested' : 'Cancellation Requested (Routed to Purohit & Admin)',
    details: String(reason).trim(),
  });
  existing.devoteeCancelStatus = 'requested';
  existing.devoteeCancelReason = String(reason).trim();
  existing.cancellationRoutedTo = ['Purohit', 'Admin'];
  existing.bookingStatus = 'Cancellation Requested';
  existing.timeline = timeline;
  bookingLedgerStore.set(bookingId, existing);
  savePersistedLedger();
  return res.json({ success: true, booking: existing });
});

app.post('/api/bookings/purohit-action', (req, res) => {
  const { bookingId, userId, action, reason, finalDate, finalTime, nakshatram } = req.body || {};
  const existing = bookingLedgerStore.get(bookingId) || { bookingId, userId, amount: 11, paymentStatus: 'PAID', timeline: [] };
  const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];

  if (action === 'reject') {
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is mandatory.' });
    }
    const wallet = getOrCreateWallet(userId || 'guest');
    let tx = null;
    if (!existing.refundedToWallet) {
      wallet.balance += 11;
      tx = {
        id: `WLT_${Date.now()}`,
        amount: 11,
        type: 'credit',
        reason: `Purohit cancelled prior to ritual (${reason}) — ₹11 token credited for booking ${bookingId}`,
        bookingId,
        paymentMethod: 'Cashfree',
        createdAt: new Date().toISOString(),
      };
      wallet.transactions.unshift(tx);
      existing.refundedToWallet = true;
    }
    timeline.push({
      id: `TL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Purohit',
      action: 'Cancelled Prior to Ritual · ₹11 Credited to Wallet',
      details: String(reason).trim(),
    });
    existing.bookingStatus = 'Rejected by Purohit';
    existing.purohitActionReason = String(reason).trim();
    existing.cancelledAt = new Date().toISOString();
    existing.timeline = timeline;
    bookingLedgerStore.set(bookingId, existing);
    savePersistedLedger();
    return res.json({
      success: true,
      bookingStatus: 'Rejected by Purohit',
      walletBalance: wallet.balance,
      walletTransaction: tx,
      timeline,
    });
  }

  if (action === 'accept' || action === 'accept_finalize') {
    existing.bookingStatus = 'Muhurtham Finalized';
    existing.muhurthamFinalized = true;
    existing.muhurthamFinalizedAt = new Date().toISOString();
    if (finalDate) existing.date = finalDate;
    if (finalTime) existing.time = finalTime;
    if (nakshatram) existing.nakshatram = nakshatram;
    existing.guruPadukamTeamAction = 'Reminders & 30-Min Pooja Essentials Scheduled';
    timeline.push({
      id: `TL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Purohit',
      action: 'Muhurtham Finalized Post Devotee Call',
      details: `${finalDate || existing.date} at ${finalTime || existing.time}${nakshatram ? ` · ${nakshatram}` : ''} → Guru Padukam Team Triggered`,
    });
    existing.timeline = timeline;
    bookingLedgerStore.set(bookingId, existing);
    savePersistedLedger();
    return res.json({
      success: true,
      bookingStatus: existing.bookingStatus,
      muhurthamFinalized: true,
      guruPadukamTeamAction: existing.guruPadukamTeamAction,
      booking: existing,
    });
  }

  if (finalDate) existing.date = finalDate;
  if (finalTime) existing.time = finalTime;
  timeline.push({
    id: `TL_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: 'Devotee',
    action: 'Ceremony Date / Time Swapped',
    details: `${existing.date} at ${existing.time}${reason ? ` (${reason})` : ''}`,
  });
  existing.timeline = timeline;
  bookingLedgerStore.set(bookingId, existing);
  savePersistedLedger();
  return res.json({ success: true, bookingStatus: existing.bookingStatus || 'Confirmed', timeline });
});

app.post('/api/tickets', (req, res) => {
  const ticket = {
    id: `TKT_${Date.now()}`,
    ...req.body,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  ticketLedgerStore.unshift(ticket);
  savePersistedLedger();
  return res.json({ success: true, ticket });
});

app.get('/api/wallet/:userId', (req, res) => {
  return res.json(getOrCreateWallet(req.params.userId));
});

const server = app.listen(PORT, API_BACKEND_HOST, () => {
  console.log(`Vertex AI Backend listening at http://localhost:${PORT}`);
});


const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === '/ws-proxy') {
    if (!VERTEX_PROXY_ENABLED) {
      socket.destroy();
      return;
    }
    
    let targetUrl = url.searchParams.get('target');
    if (!targetUrl) {
      console.log('[Node Proxy] Missing target URL');
      socket.destroy();
      return;
    }

    if (targetUrl === 'wss://aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent') {
      const location = GOOGLE_CLOUD_LOCATION === 'global' ? 'us-central1' : GOOGLE_CLOUD_LOCATION;
      targetUrl = `wss://${location}-aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;
    } else {
      console.log('[Node Proxy] Invalid target URL');
      socket.destroy();
      return;
    }

    let accessToken;

    try {
      accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No token');
    } catch (err) {
      console.log('[Node Proxy] Authentication failed');
      socket.destroy();
      return;
    }

    console.log(`[Node Proxy] Initiating upstream connection to: ${targetUrl}`);

    let upstreamWs;

    try {
      upstreamWs = new WebSocket(targetUrl, {
        headers: getRequestHeaders(accessToken)
      });
    } catch (e) {
      console.error('[Node Proxy] Invalid Upstream URL');
      socket.destroy();
      return;
    }

    const initialErrorHandler = (error) => {
      console.error('[Node Proxy] Upstream connection failed:', error);
      upstreamWs.removeEventListener('open', onUpstreamOpen);

      if (socket.writable) {
        socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        socket.destroy();
      }
    };

    upstreamWs.once('error', initialErrorHandler);

    // 5. Handle Successful Upstream Connection
    const onUpstreamOpen = () => {
      // Remove the "bootstrapping" error handler
      upstreamWs.removeListener('error', initialErrorHandler);

      // Perform the HTTP -> WebSocket upgrade for the Client
      wss.handleUpgrade(request, socket, head, (ws) => {

        upstreamWs.on('message', (data, isBinary) => {
          const logMsg = isBinary ? '<Binary Data>' : data.toString();
          console.log(`[Upstream -> Client] [${new Date().toISOString()}]: ${logMsg}`);

          if (ws.readyState === WebSocket.OPEN) {
            if (data === undefined || data === null) {
              console.warn('[Node Proxy] Attempted to send undefined/null data to client');
              return;
            }
            ws.send(data, { binary: isBinary });
          }
        });

        ws.on('message', (data, isBinary) => {
          const logMsg = isBinary ? '<Binary Data>' : data.toString();

          let dataJson = {};
          try {
            dataJson = JSON.parse(data.toString());
          } catch (error) {
            console.error('[Node Proxy] Failed to parse message from client:', error);
            ws.close(1011, 'Failed to parse message');
          }

          if (dataJson['setup']) {
            dataJson['setup']['model'] = `projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/${dataJson['setup']['model']}`;
          }

          if (upstreamWs.readyState === WebSocket.OPEN) {
            upstreamWs.send(JSON.stringify(dataJson), { binary: false });
          }
        });

        upstreamWs.on('error', (error) => {
          console.error('[Node Proxy] Upstream error:', error);
          ws.close(1011, error.message);
        });

        upstreamWs.on('close', (code, reason) => {
          console.log(`[Node Proxy] Upstream closed: ${code} ${reason}`);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close(code, reason);
          }
        });

        ws.on('error', (error) => {
          console.error('[Node Proxy] Client error:', error);
          upstreamWs.close(1011, error.message);
        });

        ws.on('close', (code, reason) => {
          console.log(`[Node Proxy] Client closed: ${code} ${reason}`);
          if (upstreamWs.readyState === WebSocket.OPEN) {
            upstreamWs.close(1000, reason);
          }
        });

        wss.emit('connection', ws, request);
      });
    };

    upstreamWs.once('open', onUpstreamOpen);

  } else {
    // Path did not match
    socket.destroy();
  }
});


