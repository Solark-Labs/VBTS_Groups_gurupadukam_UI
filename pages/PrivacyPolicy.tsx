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
            Last Updated: November 2026 · Guru Padukam (gurupadukam.com)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Eye size={20} className="text-gold" /> 1. Overview &amp; Acceptance
            </h2>
            <p>
              This Privacy Policy describes how <strong>Guru Padukam</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating{' '}
              <a href="https://gurupadukam.com" className="text-maroon underline font-semibold">gurupadukam.com</a>, collects, uses, stores, and protects your information when you access our website, mobile interfaces, or services. By using the Platform, you agree to the practices described in this Privacy Policy.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <FileText size={20} className="text-gold" /> 2. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Account &amp; Profile Information:</strong> Name, email address, phone number, residential/service address, city, PIN code, preferred language, and optional profile image.</li>
              <li><strong>Transaction &amp; Booking Data:</strong> Service bookings, product orders, scheduling timestamps, location coordinates you choose to share, and payment reference identifiers. Payments are processed by third-party payment gateways; we do not store raw card numbers or CVV codes.</li>
              <li><strong>Device, Usage &amp; Notification Data:</strong> Browser type, IP address, session logs, cookies/local storage preferences, and browser push notification permissions when explicitly granted by you.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Lock size={20} className="text-gold" /> 3. How We Use Information
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li>To create and manage your user account, fulfill orders, and coordinate scheduled services.</li>
              <li>To send transactional updates, invoices, delivery alerts, and service notifications via email, SMS, WhatsApp, or browser push notifications.</li>
              <li>To provide customer support, resolve incident tickets, prevent fraud, and improve platform reliability and localization.</li>
              <li>To comply with applicable legal obligations, regulatory requests, and tax requirements.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">4. Information Sharing &amp; Third Parties</h2>
            <p className="text-text-md">
              We do not sell your personal information. We share only necessary details with independent service providers, logistics/courier partners, payment processors, and cloud infrastructure providers strictly to deliver the services you request, or when required by applicable law.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">5. Cookies, Security &amp; Data Retention</h2>
            <p className="text-text-md">
              We use essential cookies and browser storage to preserve authentication sessions, cart items, and language preferences. We implement industry-standard technical and organizational safeguards (including HTTPS encryption) to protect data. However, no method of electronic transmission is 100% secure. We retain personal information only as long as necessary to provide services or comply with legal obligations.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">6. Your Rights &amp; Policy Changes</h2>
            <p className="text-text-md">
              You may access, update, or request deletion of your account information at any time through your Profile settings or by contacting us. We may update this Privacy Policy periodically, and continued use of the Platform constitutes acceptance of the revised policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 7. Contact Information
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Company:</strong> Guru Padukam (gurupadukam.com)</p>
              <p><strong>Address:</strong> {BRAND_CONTACT.address}</p>
              <p><strong>Phone:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/" className="text-maroon hover:underline font-semibold">&larr; Return to Home</Link>
            <Link to="/terms" className="text-maroon hover:underline font-semibold">Terms &amp; Conditions &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
