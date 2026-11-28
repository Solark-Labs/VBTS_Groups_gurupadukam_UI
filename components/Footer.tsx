import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONTACT } from '../constants';
import { useAppContext } from '../contexts/AppContext';

export const Footer: React.FC = () => {
  const { t } = useAppContext();
  const year = new Date().getFullYear();

  const services = [
    { label: `${t('navBook11')} (${t('navPurohits')})`, path: '/purohits' },
    { label: t('navApara'), path: '/apara' },
    { label: t('catEssentials'), path: '/marketplace?cat=essentials' },
    { label: t('catReturnGifts'), path: '/marketplace?cat=return-gifts' },
    { label: t('svcNadaswaramTitle'), path: '/services?cat=nadaswaram' },
    { label: t('navMarketplace'), path: '/marketplace' },
  ];

  const links = [
    { label: t('navHome'), path: '/' },
    { label: t('navServices'), path: '/services' },
    { label: t('navMarketplace'), path: '/marketplace' },
    { label: `${t('navAbout')} / Contact Us`, path: '/contact' },
    { label: t('footerTrackOrder'), path: '/track-order' },
  ];

  const policies = [
    { label: t('footerPrivacy'), path: '/privacy' },
    { label: t('footerTerms'), path: '/terms' },
    { label: t('footerShipping'), path: '/shipping-policy' },
    { label: t('footerReturns'), path: '/return-policy' },
  ];

  const cities = ['Khammam', 'Madhuranagar', 'Gollagudem', 'Wyra', 'Sathupalli', 'Bhadrachalam', 'Kothagudem', 'Hyderabad'];

  return (
    <footer className="bg-maroon-dk pt-16 pb-8 px-6 text-cream/70">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gold/20 pb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="Guru Padukam"
                className="w-12 h-12 rounded-full border border-gold/40 bg-cream object-cover"
              />
              <div>
                <div className="font-cinzelDeco text-lg text-cream leading-tight">Guru Padukam</div>
                <div className="font-telugu text-xs text-gold">గురు పాదుకం</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-cream/65">
              {t('footerDesc')}
            </p>
            <div className="text-sm leading-loose text-cream/70">
              📍 {BRAND_CONTACT.address}<br />
              📞 <a href={`tel:+${BRAND_CONTACT.phoneRaw}`} className="text-gold-lt hover:text-gold transition-colors">{BRAND_CONTACT.phoneDisplay}</a><br />
              ✉️ <a href={`mailto:${BRAND_CONTACT.email}`} className="text-gold-lt hover:text-gold transition-colors">{BRAND_CONTACT.email}</a>
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="font-cinzel text-xs tracking-[0.2em] uppercase text-gold mb-5">{t('footerServices')}</div>
            <ul className="flex flex-col gap-2.5">
              {services.map(s => (
                <li key={s.path}>
                  <Link to={s.path} className="text-sm hover:text-gold-pale transition-colors hover:translate-x-1 inline-block">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Legal */}
          <div>
            <div className="font-cinzel text-xs tracking-[0.2em] uppercase text-gold mb-5">{t('footerQuickLinks')}</div>
            <ul className="flex flex-col gap-2.5 mb-6">
              {links.map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm hover:text-gold-pale transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="font-cinzel text-xs tracking-[0.2em] uppercase text-gold mb-3">{t('footerPolicies')}</div>
            <ul className="flex flex-col gap-2">
              {policies.map(p => (
                <li key={p.path}>
                  <Link to={p.path} className="text-xs hover:text-gold-pale transition-colors text-cream/70 hover:underline">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities & Booking Promise */}
          <div>
            <div className="font-cinzel text-xs tracking-[0.2em] uppercase text-gold mb-5">Serving Areas</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {cities.map(city => (
                <span key={city} className="text-xs bg-cream/5 border border-gold/15 px-2.5 py-1 rounded-full text-cream/70">
                  {city}
                </span>
              ))}
            </div>

            <div className="bg-cream/5 border border-gold/20 p-4 rounded-sm">
              <div className="font-cinzel text-xs font-bold text-gold uppercase tracking-widest mb-1">₹11 Token Booking</div>
              <p className="text-xs text-cream/65 leading-relaxed">
                Confirm your purohit booking with just ₹11 and negotiate dakshina directly with the purohit.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/85 border-t border-gold/10 pt-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <span>© {year} Guru Padukam (gurupadukam.com). All rights reserved.</span>
            <div className="flex gap-3 text-cream/85">
              <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
              <span>·</span>
              <Link to="/shipping-policy" className="hover:text-gold transition-colors">Shipping</Link>
              <span>·</span>
              <Link to="/return-policy" className="hover:text-gold transition-colors">Returns</Link>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {['UPI ₹11 Token', 'Cashfree', 'COD', 'Net Banking', 'Cards'].map(m => (
              <span key={m} className="bg-cream/5 border border-gold/15 px-2 py-1 font-cinzel text-[0.5rem] tracking-widest uppercase text-gold-pale">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
