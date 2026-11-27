import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream pt-[96px] pb-16">
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-1 rounded-full text-xs font-semibold text-gold-lt uppercase tracking-wider mb-3">
            <Scale size={14} /> Terms &amp; Conditions
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-cream/70 max-w-xl mx-auto">
            Last Updated: November 2026 · {BRAND_CONTACT.businessName} (gurupadukam.com)
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-gold" /> 1. Platform Scope &amp; Acceptance
            </h2>
            <p className="text-text-md">
              By accessing <strong>gurupadukam.com</strong>, operated by <strong>{BRAND_CONTACT.businessName}</strong> ({BRAND_CONTACT.legalEntityNote}), you agree to these Terms &amp; Conditions. Guru Padukam connects devotees with verified independent Vedic Purohits, Apara Peetas, and organic samagri suppliers.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">2. ₹11 Token Verification &amp; Muhurtham Finalization</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>₹11 Cashfree Token Verification:</strong> Requests are forwarded to your selected Purohit only after your ₹11 confirmation token is verified via Cashfree Payments (or debited from your Guru Padukam Wallet).</li>
              <li><strong>Nakshatram &amp; Muhurtham Finalization:</strong> Upon receiving your verified request, the Purohit contacts you directly, checks Nakshatram and Panchangam suitability, updates the finalized date and Muhurtham time, and locks the booking. Upon finalization, the Guru Padukam team schedules reminders and doorstep pooja essentials.</li>
              <li><strong>Purohit Cancellation Prior to Ritual:</strong> If a Purohit must cancel prior to the ceremony, they must state an explicit reason, and <strong>₹11 is automatically credited to your Guru Padukam Wallet</strong> so you can select the next available Purohit or contact our support team.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">3. Cancellation Windows, Same-Day Rules &amp; Calendar Blocking</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Immediate Bookings:</strong> Live immediate Purohit bookings carry no self-cancellation option once confirmed.</li>
              <li><strong>Same-Day Ceremonies:</strong> On the day of the ceremony, devotees cannot self-cancel; please speak directly with the Purohit, who holds sole discretion to accept or adjust the schedule.</li>
              <li><strong>Pre-Event Standard Rituals (&ge; 3 Days):</strong> Cancellation or date swap requests are permitted at least <strong>3 days prior</strong> to the ceremony date and route to both Purohit and Admin.</li>
              <li><strong>Major Ceremonies — Marriage, Griha Pravesh, Upanayanam (&ge; 10 Days):</strong> Swap or cancellation requests must be raised at least <strong>10 days prior</strong> and route to both Purohit and Guru Padukam Admin.</li>
              <li><strong>No Refund Close to Ritual Date:</strong> Because Purohits block their calendar exclusively for your ceremony, cancellations within restricted windows without a valid reason carry zero refund.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">4. Direct Advance Amount &amp; Dakshina Disclaimer</h2>
            <p className="text-text-md">
              {BRAND_CONTACT.businessName} collects only the <strong>&#8377;11 booking verification token</strong> online via Cashfree. Any Pooja Samagri cost, travel expense, or ceremony Dakshina/advance settled directly with the Purohit is a private arrangement between devotee and Purohit — <strong>{BRAND_CONTACT.businessName} does not intermediate, hold, or refund direct advances</strong>. Devotees are advised to record private advance details in their booking activity log and obtain mutual acknowledgement with the Purohit.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">5. Marketplace Stores — Platform Intermediary &amp; Merchant Responsibility</h2>
            <p className="text-text-md">
              Pooja items, essentials, flowers, and return gifts listed in the Marketplace are offered and fulfilled by independent third-party merchants and pooja store owners. <strong>{BRAND_CONTACT.businessName}</strong> acts solely as a connecting technology platform; the <strong>respective store owner is solely responsible</strong> for item quality, authenticity, freshness, and order fulfillment. Once an order is accepted or dispatched by the store, it cannot be cancelled. If you experience any missing, damaged, or quality concern, <strong>{BRAND_CONTACT.businessName}&rsquo;s Support Team will step in to understand your concern and coordinate directly with the merchant on your behalf</strong> to seek replacement or resolution.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">6. User Accounts, Conduct &amp; Intellectual Property</h2>
            <p className="text-text-md">
              You are responsible for maintaining the confidentiality of your account and providing accurate venue, Nakshatram, and contact details. All platform content, branding, and Vedic guides remain the intellectual property of {BRAND_CONTACT.businessName}.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-gold" /> 7. Limitation of Liability &amp; Governing Law
            </h2>
            <p className="text-text-md">
              Platform services are provided &ldquo;as is&rdquo;. {BRAND_CONTACT.businessName} shall not be liable for indirect or consequential damages, and aggregate platform liability shall not exceed the amount paid directly to Guru Padukam for the specific transaction. Governed by the laws of India (jurisdiction: Telangana).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 8. Contact Us
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Business Name:</strong> {BRAND_CONTACT.businessName} ({BRAND_CONTACT.legalEntityNote})</p>
              <p><strong>Address:</strong> {BRAND_CONTACT.address}</p>
              <p><strong>Phone:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/privacy" className="text-maroon hover:underline font-semibold">&larr; Privacy Policy</Link>
            <Link to="/return-policy" className="text-maroon hover:underline font-semibold">Refund &amp; Cancellation Policy &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
