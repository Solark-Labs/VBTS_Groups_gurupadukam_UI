-- Guru Padukam — Supabase PostgreSQL Schema & Row-Level Security (Phase 1)
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1. Users (server-enforced roles: never trust client role claims)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text unique,
  password_hash text,
  role text not null default 'user' check (role in ('user', 'purohit', 'admin')),
  address text default '',
  city text default 'Khammam',
  pincode text default '507002',
  preferred_language text default 'en',
  wallet_balance integer not null default 0 check (wallet_balance >= 0),
  kyc_verified boolean not null default false,
  kyc_cf_payment_id text,
  vedic_sampradaya text,
  experience_years integer,
  created_at timestamptz not null default now()
);

-- 2. WhatsApp / SMS OTP Codes
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Payment Orders (status updated ONLY by Cashfree webhook / server verify)
create table if not exists public.payment_orders (
  cf_order_id text primary key,
  booking_id text,
  user_id uuid references public.users(id),
  amount integer not null check (amount > 0),
  purpose text not null default 'BOOKING_TOKEN',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAID', 'FAILED')),
  cf_payment_id text,
  webhook_verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Purohit Ceremony Bookings
create table if not exists public.bookings (
  id text primary key,
  user_id uuid references public.users(id),
  user_name text not null,
  user_phone text not null,
  purohit_id text not null,
  occasion text not null,
  ceremony_date date not null,
  ceremony_time text not null,
  address text not null,
  city text default 'Khammam',
  pincode text,
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'REFUNDED')),
  booking_status text not null default 'Awaiting Purohit Approval',
  cf_order_id text references public.payment_orders(cf_order_id),
  cf_payment_id text,
  created_at timestamptz not null default now()
);

-- 5. Marketplace Products & Orders
create table if not exists public.products (
  id text primary key,
  name text not null,
  name_te text,
  price integer not null check (price >= 0),
  orig_price integer,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  image text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.users(id),
  user_name text not null,
  user_phone text not null,
  shipping_address text not null,
  items jsonb not null,
  total integer not null check (total >= 0),
  status text not null default 'Processing',
  created_at timestamptz not null default now()
);

-- 6. Wallet Ledger (immutable audit trail)
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  amount integer not null,
  tx_type text not null check (tx_type in ('CREDIT', 'DEBIT')),
  reason text not null,
  booking_id text,
  created_at timestamptz not null default now()
);

-- 7. Support Tickets
create table if not exists public.support_tickets (
  id text primary key,
  booking_id text,
  user_name text not null,
  user_phone text not null,
  category text not null,
  severity text not null default 'Normal',
  description text not null,
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

-- Enable Row-Level Security on all tables
alter table public.users enable row level security;
alter table public.otp_codes enable row level security;
alter table public.payment_orders enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.support_tickets enable row level security;

-- Public read-only catalog for products
create policy "Public can view products"
  on public.products for select using (true);

-- Users can only read their own profile, bookings, orders, and wallet
create policy "Users view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users view own wallet"
  on public.wallet_transactions for select using (auth.uid() = user_id);
