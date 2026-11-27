import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, Phone } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream pt-[96px] pb-16">
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-1 rounded-full text-xs font-semibold text-gold-lt uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Privacy Policy
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-cream/70 max-w-xl mx-auto">
            Last Updated: November 2026 · {BRAND_CONTACT.businessName} (gurupadukam.com)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Eye size={20} className="text-gold" /> 1. Overview &amp; Scope
            </h2>
            <p className="text-text-md">
              This Privacy Policy explains how <strong>{BRAND_CONTACT.businessName}</strong> ({BRAND_CONTACT.legalEntityNote}), operating{' '}
              <a href={BRAND_CONTACT.website} className="text-maroon underline font-semibold">gurupadukam.com</a>, collects, uses, stores, and protects your personal data when you register, book Purohit or Apara services, purchase Marketplace essentials, or interact with PadukaAI.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <FileText size={20} className="text-gold" /> 2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Account &amp; Profile Details:</strong> Full name, email address, 10-digit mobile/WhatsApp number, ceremonial/delivery address, city, PIN code, preferred Pan-India language, and optional profile photograph.</li>
              <li><strong>Booking, Wallet &amp; Payment Verification Data:</strong> Ceremony type, date, schedule time, location coordinates shared via Google Maps, Guru Padukam Wallet balance &amp; ₹11 credit/debit ledger entries, and transaction reference IDs verified through <strong>Cashfree Payments</strong>. We never store your full card number, CVV, UPI PIN, or net-banking passwords.</li>
              <li><strong>Device &amp; Notification Preferences:</strong> Session storage, cookies, and browser push notification permissions when explicitly authorized by you to receive live booking status alerts.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Lock size={20} className="text-gold" /> 3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li>To verify your ₹11 token payment via Cashfree before dispatching your ceremony request to the chosen Purohit or Apara Peeta.</li>
              <li>To credit ₹11 back into your Guru Padukam Devotee Wallet automatically if a Purohit declines due to scheduling conflicts, and allow reuse on subsequent bookings.</li>
              <li>To send real-time browser push notifications, WhatsApp directions, SMS/email confirmations, and 30-minute prior samagri dispatch alerts.</li>
              <li>To prevent fraud, resolve incident tickets, fulfill tax/regulatory duties, and provide full English &amp; Telugu localization.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">4. Data Sharing &amp; Security</h2>
            <p className="text-text-md">
              We do not sell or rent your personal data. Necessary contact and ceremonial address details are shared only with your selected Purohit/Apara organization, logistics partners, and RBI-compliant payment gateway partner (<strong>Cashfree Payments</strong>) strictly to complete your requested service. All communications use industry-standard HTTPS encryption.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">5. DPDP Act, 2023 &amp; User Rights</h2>
            <p className="text-text-md mb-2">
              In accordance with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, you have the right to access, correct, update, or request erasure of your personal data, and to withdraw consent at any time.
            </p>
            <p className="text-text-md">
              We do <strong>not</strong> collect, store, or process Aadhaar numbers or Aadhaar card images online. You may review, edit, or request deletion of your personal data via your Profile page or by emailing{' '}
              <a href={`mailto:${BRAND_CONTACT.email}`} className="text-maroon underline font-semibold">{BRAND_CONTACT.email}</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 6. Contact &amp; Grievance Officer
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Grievance Officer:</strong> Operations &amp; Compliance Lead, {BRAND_CONTACT.businessName}</p>
              <p><strong>Business Name:</strong> {BRAND_CONTACT.businessName} ({BRAND_CONTACT.legalEntityNote})</p>
              <p><strong>Address:</strong> {BRAND_CONTACT.address}</p>
              <p><strong>Phone / WhatsApp:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email} (Response within 48 hours)</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/about" className="text-maroon hover:underline font-semibold">&larr; About &amp; Contact Us</Link>
            <Link to="/terms" className="text-maroon hover:underline font-semibold">Terms &amp; Conditions &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
