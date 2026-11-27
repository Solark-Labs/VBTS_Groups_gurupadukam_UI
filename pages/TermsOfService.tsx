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
            Last Updated: November 2026 · Standard Terms of Use for gurupadukam.com
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-gold" /> 1. Acceptance of Terms
            </h2>
            <p className="text-text-md">
              By accessing or using <strong>gurupadukam.com</strong> (&ldquo;Platform&rdquo;), operated by <strong>Guru Padukam</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by these Terms &amp; Conditions and all applicable laws. If you do not agree, please discontinue use of the Platform.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">2. Eligibility &amp; User Accounts</h2>
            <p className="text-text-md">
              You must be at least 18 years of age (or using the Platform under the supervision of a parent/guardian) to create an account or place bookings/orders. You are responsible for maintaining the accuracy of your registration details, safeguarding your credentials, and all activity occurring under your account.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">3. Marketplace Services, Bookings &amp; Payments</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Platform Role:</strong> The Platform connects users with independent service professionals/organizations and sells listed physical goods. Prices, availability, and service terms are displayed prior to confirmation.</li>
              <li><strong>Booking Fees &amp; Pricing:</strong> Booking confirmation fees (such as the ₹11 platform token) and product prices are shown at checkout. Additional third-party or independent provider charges, if any, are agreed directly or explicitly stated.</li>
              <li><strong>Taxes:</strong> Applicable taxes and shipping fees are calculated during checkout where required by law.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">4. Acceptable Use &amp; Intellectual Property</h2>
            <p className="text-text-md">
              You agree not to misuse the Platform, submit fraudulent bookings, scrape content, or upload unlawful material. All trademarks, logos, text, graphics, and software on the Platform belong to Guru Padukam or its licensors and may not be reproduced without written permission.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-gold" /> 5. Disclaimer &amp; Limitation of Liability
            </h2>
            <p className="text-text-md">
              Services and products are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the fullest extent permitted by applicable law, Guru Padukam shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the Platform or delays beyond reasonable control (including force majeure events). Our total aggregate liability for any claim shall not exceed the amount paid by you to the Company for the specific transaction in question.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">6. Governing Law &amp; Modifications</h2>
            <p className="text-text-md">
              These Terms are governed by the laws of India, and disputes shall be subject to the exclusive jurisdiction of competent courts in Telangana, India. We reserve the right to update these Terms at any time by posting revised terms on this page.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 7. Contact Us
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Company:</strong> Guru Padukam (gurupadukam.com)</p>
              <p><strong>Phone:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email}</p>
              <p><strong>Address:</strong> {BRAND_CONTACT.address}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/privacy" className="text-maroon hover:underline font-semibold">&larr; Privacy Policy</Link>
            <Link to="/shipping-policy" className="text-maroon hover:underline font-semibold">Shipping Policy &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
