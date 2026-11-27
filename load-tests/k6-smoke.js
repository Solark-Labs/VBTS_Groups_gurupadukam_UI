import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // ramp up to 20 VUs
    { duration: '1m', target: 50 },   // sustain 50 VUs
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],     // < 1% errors
    http_req_duration: ['p(95)<600'],   // 95% of requests < 600ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://gurupadukam.com';

export default function () {
  // 1. Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, { 'home 200': (r) => r.status === 200 });

  // 2. Backend health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, { 'health 200': (r) => r.status === 200 });

  // 3. Reject unauthenticated booking creation (401/403)
  const unauthRes = http.post(
    `${BASE_URL}/api/bookings/create`,
    JSON.stringify({ booking: { id: 'LOAD_TEST' } }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(unauthRes, { 'unauth booking blocked': (r) => r.status === 401 || r.status === 403 });

  sleep(1);
}
