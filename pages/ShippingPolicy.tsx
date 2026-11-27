import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream pt-[96px] pb-16">
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 text-cream text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3.5 py-1 rounded-full text-xs font-semibold text-gold-lt uppercase tracking-wider mb-3">
            <Truck size={14} /> Shipping &amp; Delivery
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Shipping &amp; Delivery Policy</h1>
          <p className="text-sm text-cream/70 max-w-xl mx-auto">
            Standard order processing, dispatch timelines, and tracking details across India.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gold/20 p-8 sm:p-10 rounded-lg shadow-sm space-y-7 text-text-dk text-sm leading-relaxed">
          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <Clock size={18} className="text-gold" /> 1. Order Processing &amp; Delivery Timelines
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-text-md">
              <li><strong>Express Local Dispatch:</strong> Eligible essentials and scheduled ceremony kits in supported local zones are dispatched prior to scheduled event times or within the estimated express window shown at checkout.</li>
              <li><strong>Standard Domestic Shipping:</strong> Most physical orders are processed within 1–2 business days and delivered within 3–7 business days depending on destination PIN code and courier availability.</li>
            </ul>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-gold" /> 2. Shipping Charges
            </h2>
            <p className="text-text-md">
              Shipping fees, if applicable, are calculated and displayed transparently prior to final order confirmation. Orders meeting the free-shipping threshold shown on the checkout screen qualify for complimentary standard shipping.
            </p>
          </div>

          <div className="border-b border-gold/15 pb-6">
            <h2 className="text-xl font-bold text-maroon font-serif mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-gold" /> 3. Tracking, Delays &amp; Address Accuracy
            </h2>
            <p className="text-text-md">
              Users are responsible for providing accurate shipping addresses, landmarks, and active contact numbers. You can track orders anytime on the <Link to="/track-order" className="text-maroon underline font-semibold">Track Order</Link> page. Delivery timelines are estimates and may vary due to weather, public holidays, or carrier delays.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-maroon font-serif mb-2">4. Support</h2>
            <p className="text-text-md">
              For shipment inquiries, contact {BRAND_CONTACT.phoneDisplay} or email{' '}
              <a href={`mailto:${BRAND_CONTACT.email}`} className="text-maroon underline">{BRAND_CONTACT.email}</a>.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <Link to="/terms" className="text-maroon hover:underline font-semibold">&larr; Terms &amp; Conditions</Link>
            <Link to="/return-policy" className="text-maroon hover:underline font-semibold">Return &amp; Refund Policy &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
