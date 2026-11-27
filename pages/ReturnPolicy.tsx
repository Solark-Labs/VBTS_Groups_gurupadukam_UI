import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';

export const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream pt-[96px] pb-16">
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-1 rounded-full text-xs font-semibold text-gold-lt uppercase tracking-wider mb-3">
            <RefreshCcw size={14} /> Returns &amp; Refunds
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Cancellation, Return &amp; Refund Policy</h1>
          <p className="text-sm text-cream/70 max-w-xl mx-auto">
            Standard policy governing cancellations, replacements, and refunds on gurupadukam.com.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <CheckCircle size={18} className="text-gold" /> 1. Order Cancellations &amp; Physical Returns
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Before Dispatch:</strong> Physical marketplace orders may be cancelled before dispatch by contacting customer support.</li>
              <li><strong>Damaged / Defective / Incorrect Items:</strong> Eligible non-perishable items received damaged, defective, or incorrect must be reported within <strong>48 hours</strong> of delivery with photo/video evidence for a replacement or refund.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-gold" /> 2. Non-Returnable Items &amp; Service Bookings
            </h2>
            <p className="text-text-md">
              Perishable goods (such as fresh flowers or consumables), opened hygiene-sensitive items, and customized bulk items are not eligible for return unless received damaged or incorrect. For scheduled service bookings, rescheduling requests are supported subject to provider availability; nominal booking convenience tokens may be non-refundable once confirmed, except where a service cannot be fulfilled by the platform.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">3. Refund Timeline</h2>
            <p className="text-text-md">
              Once a return or cancellation is verified and approved, refunds are initiated to the original payment method and typically reflect within <strong>5–7 business days</strong>, depending on your bank or payment provider.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Phone size={18} className="text-gold" /> 4. Grievance &amp; Refund Support
            </h2>
            <div className="bg-cream p-4 rounded border border-gold/30 text-xs space-y-1">
              <p><strong>Phone / WhatsApp:</strong> {BRAND_CONTACT.phoneDisplay}</p>
              <p><strong>Email:</strong> {BRAND_CONTACT.email}</p>
              <p><strong>Hours:</strong> 7 Days a Week</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <Link to="/shipping-policy" className="text-maroon hover:underline font-semibold">&larr; Shipping Policy</Link>
            <Link to="/" className="text-maroon hover:underline font-semibold">Return to Home &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
