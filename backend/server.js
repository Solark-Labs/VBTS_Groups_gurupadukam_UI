
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import dotenv from 'dotenv';
import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });
dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1 /* number of proxies between user and server */);

app.use('/api-proxy', express.json({ limit: process?.env?.API_PAYLOAD_MAX_SIZE || '7mb' }));
app.use(express.json({ limit: '1mb' }));

// Security headers (anti-XSS, clickjacking, MIME-sniffing, HSTS)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  const allowedOrigins = new Set([
    'https://gurupadukam.com',
    'https://www.gurupadukam.com',
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
      : []),
  ]);
  const reqOrigin = req.headers.origin;
  if (reqOrigin && (allowedOrigins.has(reqOrigin) || !process.env.VERCEL)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-proxy');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

function sanitizeText(value, maxLen = 500) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// ─── Phase 1: Server-side Auth, Roles, OTP & Supabase Helper ─────────────────
const JWT_SECRET =
  process.env.JWT_SECRET ||
  crypto
    .createHash('sha256')
    .update(
      process.env.SMTP_PASS ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.CASHFREE_SECRET_KEY ||
        'gurupadukam_fallback_secret_change_in_env'
    )
    .digest('hex');
const userAccountStore = new Map();
const otpCodeStore = new Map();
const emailOtpStore = new Map();
const verifiedEmailStore = new Map();

function hashPasswordScrypt(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPasswordScrypt(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expectedHex] = stored.split(':');
  const derived = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

function signAuthToken(payload, expiresInSec = 7 * 24 * 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }
  const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const claims = verifyAuthToken(token);
  if (!claims) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  req.authUser = claims;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.authUser || !roles.includes(req.authUser.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
}

async function supabaseRest(table, method = 'GET', body = null, query = '') {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=representation',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) return null;
  return res.json();
}

const PORT = Number(process?.env?.PORT || process?.env?.API_BACKEND_PORT || 5000);
const API_BACKEND_HOST = process?.env?.API_BACKEND_HOST || "0.0.0.0";

const GOOGLE_CLOUD_LOCATION = process?.env?.GOOGLE_CLOUD_LOCATION || '';
const GOOGLE_CLOUD_PROJECT = process?.env?.GOOGLE_CLOUD_PROJECT || '';
const PROXY_HEADER = process?.env?.PROXY_HEADER || '';
const VERTEX_PROXY_ENABLED = Boolean(GOOGLE_CLOUD_PROJECT && GOOGLE_CLOUD_LOCATION && PROXY_HEADER);
if (!VERTEX_PROXY_ENABLED) {
  console.warn("[Backend] Vertex AI proxy env vars not set; /api-proxy and /ws-proxy disabled, core booking/payment APIs active.");
}

// General & Strict DoS Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded. Please try again shortly.' },
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Too many payment or booking attempts. Please wait a moment.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts', message: 'Too many authentication attempts. Please wait 15 minutes.' },
});
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/payments', strictLimiter);
app.use('/api/purohit/kyc', strictLimiter);
app.use('/api/bookings', strictLimiter);
app.use('/api/tickets', strictLimiter);

app.post('/api/auth/verify-admin', (req, res) => {
  const email = sanitizeText(req.body?.email, 120).toLowerCase();
  const password = String(req.body?.password || '');
  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const configuredPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!configuredEmail || !configuredPassword) {
    return res.status(403).json({
      verified: false,
      message: 'Admin portal login is locked. Configure Firebase Admins or ADMIN_EMAIL/ADMIN_PASSWORD on the server.',
    });
  }

  if (email !== configuredEmail || password !== configuredPassword) {
    return res.status(401).json({
      verified: false,
      message: 'Invalid administrator credentials.',
    });
  }

  return res.json({
    verified: true,
    user: {
      id: 'admin_verified',
      name: 'Guru Padukam Administrator',
      email: configuredEmail,
      phone: '9949730175',
      address: 'Madhuranagar, Khammam',
      city: 'Khammam',
      pincode: '507002',
      role: 'admin',
      createdAt: new Date().toISOString(),
      notifications: { email: true, sms: true, push: true },
    },
  });
});

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
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'gp-data')
  : path.resolve(process.cwd(), 'data');
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
  if (process.env.NODE_ENV === 'production' || process.env.CASHFREE_ENV === 'PRODUCTION') {
    return res.status(403).json({ success: false, message: 'Sandbox payment simulation is disabled in production.' });
  }
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

// Cashfree Webhook — authoritative server-side payment confirmation
app.post('/api/payments/cashfree/webhook', (req, res) => {
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  if (webhookSecret) {
    if (!signature || !timestamp) {
      return res.status(401).json({ success: false, message: 'Missing Cashfree webhook signature headers.' });
    }
    const rawBody = JSON.stringify(req.body || {});
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');
    if (String(signature) !== expectedSig) {
      return res.status(401).json({ success: false, message: 'Invalid Cashfree webhook signature.' });
    }
  }

  const eventData = req.body?.data || {};
  const cfOrderId = eventData?.order?.order_id;
  const orderStatus = eventData?.order?.order_status || eventData?.payment?.payment_status;
  const cfPaymentId = eventData?.payment?.cf_payment_id;
  if (cfOrderId && cashfreeOrderStore.has(cfOrderId)) {
    const existing = cashfreeOrderStore.get(cfOrderId);
    existing.status = orderStatus === 'PAID' || orderStatus === 'SUCCESS' ? 'PAID' : 'FAILED';
    existing.cfPaymentId = cfPaymentId ? String(cfPaymentId) : existing.cfPaymentId;
    existing.webhookVerifiedAt = new Date().toISOString();
    cashfreeOrderStore.set(cfOrderId, existing);
    savePersistedLedger();
  }
  return res.json({ received: true });
});

// ─── Auth & WhatsApp OTP Routes ──────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role, address, city, pincode } = req.body || {};
  const normalizedEmail = sanitizeText(email, 120).toLowerCase();
  if (!name || !normalizedEmail || !password || String(password).length < 6) {
    return res.status(400).json({ success: false, message: 'Name, email, and password (min 6 chars) are required.' });
  }
  if (userAccountStore.has(normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'Account already exists.' });
  }
  // Server enforces role: never allow self-registration as admin
  const safeRole = role === 'purohit' ? 'purohit' : 'user';
  const userRecord = {
    id: `usr_${crypto.randomUUID()}`,
    name: sanitizeText(name, 100),
    email: normalizedEmail,
    phone: sanitizeText(phone, 15).replace(/\D/g, '').slice(-10),
    passwordHash: hashPasswordScrypt(password),
    role: safeRole,
    address: sanitizeText(address, 250),
    city: sanitizeText(city, 60) || 'Khammam',
    pincode: sanitizeText(pincode, 10),
    createdAt: new Date().toISOString(),
  };
  userAccountStore.set(normalizedEmail, userRecord);
  await supabaseRest('users', 'POST', {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    phone: userRecord.phone,
    password_hash: userRecord.passwordHash,
    role: userRecord.role,
    address: userRecord.address,
    city: userRecord.city,
    pincode: userRecord.pincode,
  }).catch(() => null);

  const token = signAuthToken({ id: userRecord.id, email: userRecord.email, role: userRecord.role });
  const { passwordHash: _ph, ...publicUser } = userRecord;
  return res.json({ success: true, token, user: publicUser });
});

app.post('/api/auth/check-email', (req, res) => {
  const normalizedEmail = sanitizeText(req.body?.email, 120).toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return res.status(400).json({ exists: false, message: 'Valid email is required.' });
  }
  const existing = userAccountStore.get(normalizedEmail);
  return res.json({
    exists: Boolean(existing),
    role: existing?.role || null,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = sanitizeText(email, 120).toLowerCase();
  const existing = userAccountStore.get(normalizedEmail);
  if (!existing || !verifyPasswordScrypt(password || '', existing.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const token = signAuthToken({ id: existing.id, email: existing.email, role: existing.role });
  const { passwordHash: _ph, ...publicUser } = existing;
  return res.json({ success: true, token, user: publicUser });
});

app.post('/api/auth/otp/send', async (req, res) => {
  const cleanPhone = String(req.body?.phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required.' });
  }
  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = crypto.createHash('sha256').update(`${cleanPhone}:${code}`).digest('hex');
  otpCodeStore.set(cleanPhone, { codeHash, expiresAt: Date.now() + 5 * 60 * 1000 });

  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `91${cleanPhone}`,
        type: 'text',
        text: { body: `Your Guru Padukam verification OTP is ${code}. Valid for 5 minutes.` },
      }),
    }).catch(() => null);
  }
  return res.json({ success: true, message: 'OTP dispatched via WhatsApp.' });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const cleanPhone = String(req.body?.phone || '').replace(/\D/g, '').slice(-10);
  const code = String(req.body?.code || '').trim();
  const entry = otpCodeStore.get(cleanPhone);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
  }
  const expectedHash = crypto.createHash('sha256').update(`${cleanPhone}:${code}`).digest('hex');
  if (entry.codeHash !== expectedHash) {
    return res.status(401).json({ success: false, message: 'Invalid OTP.' });
  }
  otpCodeStore.delete(cleanPhone);
  return res.json({ success: true, verified: true, phone: cleanPhone });
});

app.post('/api/auth/email/send-otp', async (req, res) => {
  const email = sanitizeText(req.body?.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(503).json({
      success: false,
      message: 'SMTP email server is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS on the backend.',
    });
  }

  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = crypto.createHash('sha256').update(`${email}:${code}`).digest('hex');
  const expiresAt = Date.now() + 10 * 60 * 1000;
  emailOtpStore.set(email, { codeHash, expiresAt });
  const otpToken = signAuthToken({ purpose: 'email_otp', email, codeHash, expMs: expiresAt }, 600);

  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Guru Padukam" <${smtpUser}>`,
      to: email,
      subject: 'Guru Padukam — Email Verification Code',
      text: `Namaste!\n\nYour Guru Padukam email verification code is: ${code}\n\nThis code is valid for 10 minutes.\n\n— Guru Padukam Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #d4af37; border-radius: 8px; background: #fdfcf7;">
          <h2 style="color: #52101e; margin-top: 0;">Guru Padukam — Email Verification</h2>
          <p style="color: #3e2723;">Namaste! Use the 6-digit verification code below to verify your email address:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #52101e; background: #f7f3eb; padding: 14px; text-align: center; border-radius: 6px; border: 1px solid #d4af37;">
            ${code}
          </div>
          <p style="color: #7c6e65; font-size: 12px; margin-top: 16px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return res.json({ success: true, otpToken, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('[SMTP] Failed to send verification email:', err?.message || err);
    return res.status(502).json({ success: false, message: 'Failed to send verification email. Check SMTP settings.' });
  }
});

app.post('/api/auth/email/verify-otp', (req, res) => {
  const email = sanitizeText(req.body?.email, 120).toLowerCase();
  const code = String(req.body?.code || '').trim();
  const otpToken = typeof req.body?.otpToken === 'string' ? req.body.otpToken : '';

  const expectedHash = crypto.createHash('sha256').update(`${email}:${code}`).digest('hex');

  // Prefer stateless signed otpToken (works across Vercel serverless instances)
  if (otpToken) {
    const claims = verifyAuthToken(otpToken);
    if (!claims || claims.purpose !== 'email_otp' || claims.email !== email || (claims.expMs && claims.expMs < Date.now())) {
      return res.status(400).json({ success: false, message: 'Verification code expired or invalid.' });
    }
    if (claims.codeHash !== expectedHash) {
      return res.status(401).json({ success: false, message: 'Invalid verification code.' });
    }
    emailOtpStore.delete(email);
    verifiedEmailStore.set(email, { verifiedAt: Date.now(), expiresAt: Date.now() + 30 * 60 * 1000 });
    return res.json({ success: true, verified: true, email });
  }

  const entry = emailOtpStore.get(email);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, message: 'Verification code expired or not requested.' });
  }
  if (entry.codeHash !== expectedHash) {
    return res.status(401).json({ success: false, message: 'Invalid verification code.' });
  }
  emailOtpStore.delete(email);
  verifiedEmailStore.set(email, { verifiedAt: Date.now(), expiresAt: Date.now() + 30 * 60 * 1000 });
  return res.json({ success: true, verified: true, email });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ success: true, user: req.authUser });
});

// ─── Phase 3: Meta WhatsApp Business Cloud API Webhook ───────────────────────
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'gp_whatsapp_verify')) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message?.from && message?.text?.body && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const text = String(message.text.body).toLowerCase();
    let reply = 'Namaste from Guru Padukam! 🙏 Visit https://gurupadukam.com/#/purohits to book a Vedic Purohit with a ₹11 token, or reply TRACK <BookingID>.';
    if (text.includes('dakshina') || text.includes('fee') || text.includes('price')) {
      reply = 'You pay only a ₹11 token online to confirm your slot. Ceremony Dakshina is settled directly with the Purohit.';
    } else if (text.includes('apara')) {
      reply = 'For Apara Seva & Shraddha bookings, visit https://gurupadukam.com/#/apara or call +91 99497 30175.';
    }
    await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.from,
        type: 'text',
        text: { body: reply },
      }),
    }).catch(() => null);
  }
  return res.sendStatus(200);
});

app.post('/api/purohit/kyc', requireAuth, requireRole('purohit', 'admin'), (req, res) => {
  const { email, name, phone, kycCfOrderId, kycCfPaymentId, readyToShowVerification = true, vedicSampradaya } = req.body || {};
  if (!email || !kycCfPaymentId) {
    return res.status(400).json({ success: false, message: 'Email and ₹1 witness payment ID are required.' });
  }
  const key = String(email).trim().toLowerCase();
  const record = {
    email: key,
    name: name || 'Verified Purohit',
    phone: phone || '',
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

app.get('/api/purohit/kyc', requireAuth, requireRole('purohit', 'admin'), (_req, res) => {
  return res.json({ kycRecords: Array.from(purohitKycStore.values()) });
});

app.post('/api/bookings/create', requireAuth, (req, res) => {
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

app.get('/api/bookings', requireAuth, (req, res) => {
  const all = Array.from(bookingLedgerStore.values());
  if (req.authUser.role === 'admin' || req.authUser.role === 'purohit') {
    return res.json({ bookings: all });
  }
  return res.json({ bookings: all.filter(b => b.userId === req.authUser.id) });
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

app.get('/api/wallet/:userId', requireAuth, (req, res) => {
  const safeUserId = sanitizeText(req.params.userId, 80) || 'guest';
  if (req.authUser.role !== 'admin' && req.authUser.id !== safeUserId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return res.json(getOrCreateWallet(safeUserId));
});

// Global error handler — ensures malformed JSON or unexpected errors never crash the server
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Payload too large.' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON request body.' });
  }
  console.error('[Backend] Unhandled error:', err?.message || err);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

if (!process.env.VERCEL) {
  const server = app.listen(PORT, API_BACKEND_HOST, () => {
    console.log(`Guru Padukam Backend listening at http://localhost:${PORT}`);
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
}

export default app;


