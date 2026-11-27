import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, CheckCircle, AlertCircle, Phone, Wallet, Calendar, ShieldAlert } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';

export const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream pt-[96px] pb-16">
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-1 rounded-full text-xs font-semibold text-gold-lt uppercase tracking-wider mb-3">
            <RefreshCcw size={14} /> Refund &amp; Cancellation Policy
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Refund &amp; Cancellation Policy</h1>
          <p className="text-sm text-cream/70 max-w-2xl mx-auto">
            Clear rules on the ₹11 booking token, tiered pre-event cancellations, direct Purohit advance responsibility &amp; wallet credits · {BRAND_CONTACT.businessName}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          {/* 1. Core ₹11 Policy */}
          <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-lg space-y-3">
            <div className="font-cinzel text-sm font-bold text-maroon uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              1. ₹11 Token Fee Policy: No Cash Refunds / Categorized Cancellation Rules
            </div>
            <p className="text-text-dk text-xs sm:text-sm leading-relaxed">
              <strong>{BRAND_CONTACT.businessName} (gurupadukam.com)</strong> collects only a nominal <strong>₹11 Confirmation Token</strong> via Cashfree Payment Gateway. <strong>Cash refunds to bank/UPI/card accounts are not offered</strong> once the ₹11 token is verified. Instead, our cancellation and rescheduling rules protect both devotees and Purohits fairly:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-white border border-gold/30 p-3.5 rounded-md">
                <div className="font-bold text-maroon text-xs mb-1">⚡ Immediate Bookings (Live Availability)</div>
                <p className="text-xs text-text-md">
                  When booking a Purohit available immediately at that time and location, <strong>no cancellation option applies</strong> and no refund is issued.
                </p>
              </div>
              <div className="bg-white border border-gold/30 p-3.5 rounded-md">
                <div className="font-bold text-maroon text-xs mb-1">📅 Standard Pre-Event Rituals (&ge; 3 Days Prior)</div>
                <p className="text-xs text-text-md">
                  Devotees can request a <strong>cancellation or free date swap at least 3 days prior</strong> to the ritual (routes to Purohit &amp; Admin). On the <strong>same day</strong>, only speak directly with the Purohit — only the Purohit holds authority to accept changes.
                </p>
              </div>
              <div className="bg-white border border-gold/30 p-3.5 rounded-md">
                <div className="font-bold text-maroon text-xs mb-1">🏛️ Major Events: Marriage / Griha Pravesh (&ge; 10 Days Prior)</div>
                <p className="text-xs text-text-md">
                  For major events (Marriage/Vivah, Griha Pravesh, Upanayanam, Yagnam, Bhoomi Pooja), devotees may request a <strong>date swap or cancellation at least 10 days prior</strong>. Every request routes directly to both the Purohit &amp; Guru Padukam Admin.
                </p>
              </div>
              <div className="bg-white border border-gold/30 p-3.5 rounded-md">
                <div className="font-bold text-maroon text-xs flex items-center gap-1.5 mb-1">
                  <Wallet size={14} className="text-green-700" /> Purohit Cancels &rarr; ₹11 Auto-Wallet Credit
                </div>
                <p className="text-xs text-text-md">
                  If the Purohit cancels prior to the ritual due to a tight schedule (with mandatory reason), <strong>₹11 goes straight to your Wallet</strong> so you can choose the next available Purohit or contact us directly.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Critical Direct Advance Disclaimer */}
          <div className="bg-red-50/70 border-2 border-red-200 p-5 rounded-lg space-y-2.5">
            <div className="font-cinzel text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-600 shrink-0" />
              2. Direct Advance &amp; Dakshina Disclaimer (100% Direct Between Devotee &amp; Purohit)
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-text-dk">
              <li>
                <strong>Calendar Blocking Rule — No Refund Without Valid Reason Close to Date:</strong> Verified Purohits reserve and block their sacred calendar exclusively for your ritual. Cancellations made within restricted windows (&lt; 3 days for standard rituals or &lt; 10 days for major events) without a valid mutual reason carry <strong>NO refund</strong>.
              </li>
              <li>
                <strong>No Involvement in Private Advance Payments:</strong> <strong>{BRAND_CONTACT.website} does NOT participate in, process, hold, or take responsibility for any advance payment or Dakshina settled privately between you and the Purohit.</strong> All advance/Dakshina discussions and transactions beyond the ₹11 token are 100% direct between you and the Purohit.
              </li>
              <li>
                <strong>Mutual Acknowledgment Required:</strong> If you pay an advance directly to the Purohit, discuss terms clearly and record both parties&apos; mutual acknowledgment along with the advance amount on your booking activity notes. Guru Padukam cannot process refunds for direct private payments.
              </li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <CheckCircle size={18} className="text-gold" /> 3. Marketplace Physical Pooja Items Policy (Partner Store Fulfillment)
            </h2>
            <p className="text-text-md leading-relaxed mb-3">
              Pooja Samagri, essentials, fresh flowers, prasad, and return gifts listed on the {BRAND_CONTACT.businessName} Marketplace are fulfilled directly by independent partner Pooja Store owners and merchants — operating on a hyperlocal aggregator model (similar to food-delivery marketplaces). <strong>{BRAND_CONTACT.businessName} acts strictly as a technology platform connecting devotees with local merchants.</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-text-md">
              <li><strong>Store Owner Sole Responsibility:</strong> The respective partner Pooja Store / merchant bears sole legal and operational responsibility for product authenticity, Vedic purity, shelf life, pricing, packaging, stock availability, and final order fulfillment.</li>
              <li><strong>Cancellations Once Accepted / Packed:</strong> Because partner stores begin preparing, packing, or dispatching express and perishable pooja orders immediately upon acceptance, <strong>orders generally cannot be cancelled or refunded once accepted or packed by the merchant</strong>.</li>
              <li><strong>Damaged, Missing, or Incorrect Items (Report Within 24–48 Hours):</strong> If a partner store delivers damaged, spoiled, missing, or wrong items, submit your Order ID with clear unboxing photo/video evidence from <strong>My Bookings</strong>, the <strong>Order Tracker</strong>, WhatsApp ({BRAND_CONTACT.phoneDisplay}), or email ({BRAND_CONTACT.email}).</li>
              <li><strong>How Guru Padukam Stands With You:</strong> While refund or replacement approval rests with the fulfilling store owner, the <strong>{BRAND_CONTACT.businessName} Support Team takes active responsibility to understand your concern thoroughly and speak directly with the merchant on your behalf</strong> to mediate a fair resolution (replacement, store credit, or merchant-approved refund).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 4. Support &amp; Grievance Desk
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Business Name:</strong> {BRAND_CONTACT.businessName} ({BRAND_CONTACT.legalEntityNote})</p>
              <p><strong>Address:</strong> {BRAND_CONTACT.address}</p>
              <p><strong>Phone / WhatsApp:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <Link to="/terms" className="text-maroon hover:underline font-semibold">&larr; Terms &amp; Conditions</Link>
            <Link to="/shipping-policy" className="text-maroon hover:underline font-semibold">Shipping Policy &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
