import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { SERVICE_CATEGORIES, NADASWARAM_TROUPES, BRAND_CONTACT } from '../constants';
import { useAppContext } from '../contexts/AppContext';

export const Services: React.FC = () => {
  const { t } = useAppContext();
  const [searchParams] = useSearchParams();
  const activeCat = searchParams.get('cat');

  useEffect(() => {
    if (activeCat) {
      const el = document.getElementById(`service-cat-${activeCat}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [activeCat]);
  const comingSoonServices = [
    {
      cat: 'decoration',
      title: 'Flower Decoration',
      nameTe: 'పుష్ప అలంకరణ',
      desc: 'Fresh floral mandap designs, home entrance torans, and traditional flower arrangements for House Warming, Weddings & Navaratris.',
      icon: '🌸',
    },
    {
      cat: 'photography',
      title: 'Event Photography',
      nameTe: 'ఈవెంట్ ఫోటోగ్రఫీ',
      desc: 'Professional photographers capturing every sacred moment while you relax and enjoy the event with your relatives.',
      icon: '📸',
    },
    {
      cat: 'venue',
      title: 'Venue & Mandap Setup',
      nameTe: 'వేదిక అలంకరణ',
      desc: 'Complete mandap setup, stage decoration, lighting, and venue transformation for all pooja & family ceremonies.',
      icon: '🏠',
    },
  ];

  return (
    <div className="min-h-screen bg-cream pt-[100px]">

      {/* HERO */}
      <section className="relative py-16 px-6 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/logo.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dk via-maroon-dk/85 to-maroon/55" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-3">{t('svcBadge')}</div>
          <h1 className="font-cinzelDeco text-[clamp(2rem,5vw,3.8rem)] font-bold text-cream mb-4 drop-shadow-xl">{t('svcTitle')}</h1>
          <p className="font-garamond text-xl text-cream/75 max-w-2xl mx-auto italic">
            {t('svcDesc')}
          </p>
        </div>
      </section>

      {/* ALL SERVICE CATEGORIES */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-2xl font-bold text-text-dk tracking-widest uppercase">{t('svcBrowseByCat')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                to={cat.route}
                key={cat.id}
                className="group bg-white border border-gold/15 p-6 hover:border-maroon/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer text-center rounded-sm flex flex-col"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <h3 className="font-cinzel text-xs font-bold tracking-widest uppercase text-text-dk group-hover:text-maroon transition-colors mb-1">{cat.name}</h3>
                <p className="font-telugu text-[0.65rem] text-text-lt mb-3">{cat.nameTe}</p>
                <p className="text-xs text-text-md leading-relaxed flex-1">{cat.description}</p>
                <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between items-center">
                  <span className="text-[0.6rem] text-text-lt">{cat.providerCount}+ providers</span>
                  <span className="font-cinzel text-[0.6rem] font-bold text-maroon uppercase">{cat.badgeText}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NADASWARAM TROUPES */}
      <section id="service-cat-nadaswaram" className={`py-16 px-6 bg-ivory border-y border-gold/10 scroll-mt-28 ${activeCat === 'nadaswaram' ? 'ring-2 ring-gold/60' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎵</span>
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-maroon">Auspicious Music</div>
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-text-dk tracking-widest uppercase">Nadaswaram Troupes</h2>
            <p className="font-telugu text-sm text-text-md mt-1">నాదస్వరం బృందాలు — Confirm with ₹11 token &amp; negotiate directly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NADASWARAM_TROUPES.map((troupe) => (
              <div key={troupe.id} className="bg-white border border-gold/15 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all rounded-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-maroon/10 border border-gold/20 flex items-center justify-center text-2xl">🎵</div>
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-text-dk">{troupe.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-gold fill-gold" />
                      <span className="font-cinzel text-[0.65rem] font-bold text-maroon">{troupe.rating}</span>
                      <span className="text-text-lt text-[0.6rem]">({troupe.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-cream/70 p-2.5 rounded-sm text-center">
                    <div className="font-cinzel text-sm font-bold text-maroon">{troupe.members}</div>
                    <div className="text-[0.55rem] text-text-lt uppercase tracking-widest">Members</div>
                  </div>
                  <div className="bg-cream/70 p-2.5 rounded-sm text-center">
                    <div className="font-cinzel text-sm font-bold text-maroon">{troupe.experience}yr</div>
                    <div className="text-[0.55rem] text-text-lt uppercase tracking-widest">Experience</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                  <div>
                    <div className="text-[0.6rem] text-text-lt uppercase tracking-widest">Booking</div>
                    <div className="font-cinzel text-sm font-bold text-maroon">₹11 Token · Direct Quote</div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest ${troupe.availability === 'now' ? 'text-green-700' : troupe.availability === 'today' ? 'text-yellow-700' : 'text-text-lt'}`}>
                    <span className={`w-2 h-2 rounded-full ${troupe.availability === 'now' ? 'bg-green-500 animate-pulse' : troupe.availability === 'today' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                    {troupe.availability === 'now' ? 'Available Now' : troupe.availability === 'today' ? 'Available Today' : 'Scheduled'}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(`Namaste! I want to enquire about ${troupe.name} on gurupadukam.com`)}`}
                  target="_blank" rel="noreferrer"
                  className="block text-center w-full mt-4 py-2.5 bg-maroon text-gold-pale font-cinzel text-[0.65rem] font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADDITIONAL SERVICES */}
      {comingSoonServices.map((svc, si) => (
        <section key={svc.cat} className={`py-14 px-6 ${si % 2 === 0 ? 'bg-cream' : 'bg-ivory'} border-b border-gold/10`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="text-5xl mb-3">{svc.icon}</div>
              <h2 className="font-cinzel text-2xl font-bold text-text-dk tracking-widest uppercase mb-2">{svc.title}</h2>
              <p className="font-telugu text-sm text-text-md mb-4">{svc.nameTe}</p>
              <p className="font-garamond text-lg text-text-md leading-relaxed italic mb-6">{svc.desc}</p>
              <a
                href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(`Namaste! I need assistance with ${svc.title}.`)}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-maroon text-gold-pale px-5 py-2.5 clip-btn font-cinzel text-xs tracking-widest uppercase font-bold hover:bg-maroon-md transition-colors"
              >
                Request Assistance
              </a>
            </div>
            <div className="flex-1 w-full bg-gradient-to-br from-maroon-dk to-maroon h-56 rounded-sm flex items-center justify-center border border-gold/20">
              <div className="text-center">
                <div className="text-5xl mb-3">{svc.icon}</div>
                <div className="font-cinzel text-sm font-bold text-gold tracking-widest uppercase">{svc.title}</div>
                <div className="font-cinzel text-xs text-cream/60 mt-1 tracking-widest uppercase">Custom Quote · Direct Assist</div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 px-6 bg-maroon text-center">
        <h2 className="font-cinzel text-2xl font-bold text-cream tracking-widest uppercase mb-3">We Assist You End-to-End</h2>
        <p className="font-garamond text-lg text-cream/75 italic mb-7">
          Call {BRAND_CONTACT.phoneDisplay} or chat on WhatsApp — we arrange everything for your event.
        </p>
        <a
          href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=Hello%20Guru%20Padukam!%20I%20need%20help%20with%20pooja%20services.`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-green-500 transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" className="w-5 h-5" />
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
};
