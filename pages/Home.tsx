import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Search, Zap, Gift, PhoneCall } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import { SERVICE_CATEGORIES, POOJA_PACKAGES, TESTIMONIALS, POOJA_OCCASIONS, BRAND_CONTACT } from '../constants';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products, purohits, t } = useAppContext();
  const [search, setSearch] = useState('');
  const availableNowCount = purohits.filter(p => p.availability === 'now').length;

  const featuredProducts = products.slice(0, 4);
  const essentialsProducts = products.filter(p => p.category === 'essentials' || p.category === 'flowers' || p.category === 'return-gifts').slice(0, 4);
  const availableNow = purohits.filter(p => p.availability === 'now').slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/purohits?q=${encodeURIComponent(search)}`);
    else navigate('/purohits');
  };

  return (
    <div className="w-full bg-cream">

      {/* ══════════════ HERO (Clean Modern Vedic Layout) ══════════════ */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-maroon-dk via-maroon to-maroon-dk pt-[108px]">
        {/* Subtle Brand Logo Watermark */}
        <div className="absolute right-[-5%] top-[15%] w-[480px] h-[480px] rounded-full opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/logo.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dk via-maroon-dk/90 to-maroon/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-dk via-transparent to-transparent" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              {/* Live Availability Pill */}
              <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-3.5 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[12px] font-medium tracking-wide text-gold-lt">
                  {availableNowCount} {t('heroPill')}
                </span>
              </div>

              <h1 className="font-serif text-[clamp(2.1rem,4.2vw,3.8rem)] font-bold text-cream leading-[1.12] drop-shadow-md mb-3">
                {t('heroTitleLine1')}<br />
                <span className="text-gold">{t('heroTitleLine2')}</span>
              </h1>

              <p className="font-telugu text-[clamp(0.95rem,1.6vw,1.2rem)] font-medium text-gold-lt/90 mb-3">
                మీ పవిత్ర పూజా అవసరాలన్నింటికీ ఒకే వేదిక — గురు పాదుకం
              </p>

              <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-cream/85 leading-relaxed max-w-2xl mb-6 font-normal">
                {t('heroDesc')}
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex items-stretch gap-0 max-w-xl mb-4 shadow-lg rounded-md overflow-hidden border border-gold/30 bg-white">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lt" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('heroSearchPlaceholder')}
                    className="w-full pl-11 pr-4 py-3.5 text-text-dk text-sm focus:outline-none placeholder-text-lt"
                  />
                </div>
                <button type="submit" className="bg-gradient-to-r from-gold via-gold-lt to-gold text-maroon-dk font-bold tracking-wide uppercase text-xs px-6 hover:brightness-105 transition-all">
                  {t('heroFindPurohit')}
                </button>
              </form>

              {/* Quick Occasion Pills */}
              <div>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gold/75 mb-2">{t('heroPopularRituals')}</p>
                <div className="flex flex-wrap gap-2">
                  {POOJA_OCCASIONS.slice(0, 6).map(occ => (
                    <button
                      key={occ}
                      onClick={() => navigate(`/purohits?q=${encodeURIComponent(occ)}`)}
                      className="text-[12px] font-medium px-3 py-1 border border-gold/30 text-gold-lt hover:bg-gold hover:text-maroon-dk transition-all rounded-full bg-black/10"
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Highlight Card */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-maroon-dk/90 border border-gold/30 p-6 rounded-lg shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
                  <img src="/logo.png" alt="Guru Padukam" className="w-12 h-12 rounded-full border border-gold/50 object-cover bg-cream shadow-sm" />
                  <div>
                    <div className="font-serif text-base font-bold text-gold">{t('heroCardTitle')}</div>
                    <div className="text-xs text-cream/70">{t('heroCardSub')}</div>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-cream/85">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                    <span>{t('heroCardB1')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                    <span>{t('heroCardB2')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Zap size={16} className="text-gold mt-0.5 shrink-0" />
                    <span>{t('heroCardB3')}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Gift size={16} className="text-gold mt-0.5 shrink-0" />
                    <span>{t('heroCardB4')}</span>
                  </li>
                </ul>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/purohits')}
                    className="w-full py-3 bg-gradient-to-r from-gold via-gold-lt to-gold text-maroon-dk font-bold text-xs tracking-wider uppercase rounded shadow hover:brightness-105 transition-all"
                  >
                    {t('heroBookNowBtn')}
                  </button>
                  <a
                    href={`tel:+${BRAND_CONTACT.phoneRaw}`}
                    className="w-full py-2.5 border border-gold/30 text-gold-lt font-medium text-xs tracking-wide flex items-center justify-center gap-2 hover:bg-gold/10 rounded transition-colors"
                  >
                    <PhoneCall size={14} /> Need Help? {BRAND_CONTACT.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="relative z-30 bg-maroon-dk/95 border-t border-gold/20 py-3.5">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-around gap-6">
            {[
              { n: '₹11', label: 'Token Booking Confirmation' },
              { n: 'Direct', label: 'Direct Dakshina Negotiation' },
              { n: 'In Minutes', label: 'Everyday Pooja Essentials' },
              { n: 'Doorstep', label: 'Complete Event Supplies' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="font-serif text-lg font-bold text-gold">{stat.n}</span>
                <span className="text-[12px] font-medium uppercase tracking-wider text-cream/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SERVICE CATEGORIES ══════════════ */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-maroon mb-2 flex items-center justify-center gap-3">
              <span className="inline-block w-8 h-[1px] bg-gold" /> {t('homeServicesEyebrow')} <span className="inline-block w-8 h-[1px] bg-gold" />
            </div>
            <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-text-dk">{t('homeServicesTitle')}</h2>
            <p className="text-base text-text-md mt-2 max-w-xl mx-auto">{t('homeServicesSub')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                to={cat.route}
                key={cat.id}
                className="group bg-white border border-gold/20 p-6 hover:border-gold hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center rounded-lg flex flex-col items-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <h3 className="font-semibold text-sm text-text-dk group-hover:text-maroon transition-colors mb-1">{cat.name}</h3>
                <p className="font-telugu text-xs text-text-lt mb-2">{cat.nameTe}</p>
                <p className="text-xs text-text-md leading-relaxed mb-4 line-clamp-2">{cat.description}</p>
                <div className="mt-auto inline-block text-[11px] font-semibold tracking-wide uppercase bg-maroon/5 text-maroon border border-maroon/15 px-3 py-1 rounded-full">
                  {cat.badgeText}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ AVAILABLE NOW – PUROHITS (NO PRICES SHOWCASED) ══════════════ */}
      <section className="py-16 px-6 bg-ivory border-y border-gold/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-green-700">{t('homeAvailBadge')}</span>
              </div>
              <h2 className="font-serif text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold text-text-dk">{t('homeAvailTitle')}</h2>
              <p className="text-sm text-text-md mt-1">{t('homeAvailSub')}</p>
            </div>
            <Link to="/purohits" className="text-xs font-bold tracking-wider uppercase text-maroon flex items-center gap-2 hover:gap-3 transition-all border-b border-maroon/40 pb-0.5">
              {t('homeViewAllPurohits')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableNow.map((p) => (
              <div key={p.id} className="bg-white border border-gold/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-6 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold/40 shadow" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="font-semibold text-sm text-text-dk leading-tight">{p.name}</h3>
                          <p className="font-telugu text-xs text-text-lt mt-0.5">{p.nameTe}</p>
                        </div>
                        {p.verified && (
                          <span className="shrink-0 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">{t('verified')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star size={13} className="text-gold fill-gold" />
                        <span className="text-xs font-bold text-maroon">{p.rating}</span>
                        <span className="text-text-lt text-xs">({p.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.specializations.slice(0, 3).map(s => (
                      <span key={s} className="text-[11px] font-medium bg-maroon/5 text-maroon border border-maroon/15 px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-cream p-2 rounded">
                      <div className="text-sm font-bold text-maroon">{p.experience} yrs</div>
                      <div className="text-[10px] text-text-lt uppercase tracking-wider">{t('experience')}</div>
                    </div>
                    <div className="bg-cream p-2 rounded">
                      <div className="text-sm font-bold text-maroon">{p.completedPoojas.toLocaleString()}</div>
                      <div className="text-[10px] text-text-lt uppercase tracking-wider">{t('poojasDone')}</div>
                    </div>
                    <div className="bg-cream p-2 rounded">
                      <div className="text-xs font-bold text-green-700 mt-0.5">{t('available')}</div>
                      <div className="text-[10px] text-text-lt uppercase tracking-wider">{t('statusLabel')}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gold/15 pt-4 mt-2">
                  <div>
                    <div className="text-[10px] text-text-lt uppercase tracking-wider font-medium">{t('bookingTokenLabel')}</div>
                    <div className="text-sm font-bold text-maroon">{t('directQuote')}</div>
                  </div>
                  <Link to="/purohits" className="bg-maroon hover:bg-maroon-md text-gold-pale font-bold text-xs tracking-wider uppercase px-4 py-2 rounded shadow transition-colors">
                    {t('navBook11')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ EVERYDAY ESSENTIALS IN MINUTES & RETURN GIFTS ══════════════ */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-maroon mb-2 flex items-center gap-2">
                <Zap size={14} className="text-gold" /> Delivered in Minutes · Event Return Gifts
              </div>
              <h2 className="font-cinzel text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-text-dk tracking-wide uppercase">{t('homeEssentialsTitle')}</h2>
              <p className="font-garamond text-lg text-text-md italic mt-1">{t('homeEssentialsSub')}</p>
            </div>
            <Link to="/marketplace?cat=essentials" className="font-cinzel text-xs tracking-widest uppercase text-maroon font-bold flex items-center gap-2 hover:gap-3 transition-all border-b border-maroon/40 pb-1">
              {t('homeExploreEssentials')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {essentialsProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ RITUAL ASSISTANCE PACKAGES (NO RIGID PRICES) ══════════════ */}
      <section className="py-16 px-6 bg-maroon-dk relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-2 flex items-center justify-center gap-3">
              <span className="inline-block w-10 h-[1px] bg-gold" /> Complete Ritual Assistance <span className="inline-block w-10 h-[1px] bg-gold" />
            </div>
            <h2 className="font-cinzel text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-cream tracking-wide uppercase">{t('homeRitualsTitle')}</h2>
            <p className="font-garamond text-lg text-cream/65 italic mt-2">Vehicle Pooja · House Warming · Bhoomi / Shop Pooja · Navaratris · Vratha</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {POOJA_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="relative bg-cream/5 border border-gold/20 hover:border-gold/50 hover:bg-cream/10 transition-all duration-300 hover:-translate-y-2 group rounded-sm overflow-hidden flex flex-col"
              >
                {pkg.popular && (
                  <div className="bg-gold text-maroon-dk font-cinzel text-[0.6rem] font-bold tracking-[0.2em] uppercase text-center py-1.5">
                    ⭐ Most Requested
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="relative h-32 overflow-hidden rounded-sm mb-4">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-dk/80 to-transparent" />
                    {pkg.badge && !pkg.popular && (
                      <span className="absolute top-2 right-2 bg-gold text-maroon-dk font-cinzel text-[0.55rem] font-bold tracking-widest uppercase px-2 py-0.5">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <div className="font-cinzel text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gold mb-1">{pkg.occasion}</div>
                  <h3 className="font-cinzel text-sm font-bold text-cream mb-1">{pkg.name}</h3>
                  <p className="font-telugu text-[0.65rem] text-cream/55 mb-4">{pkg.nameTe}</p>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {pkg.includes.map(inc => (
                      <li key={inc} className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                        <span className="text-[0.68rem] text-cream/75">{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gold/15 pt-4 mt-auto">
                    <div className="font-cinzel text-xs text-gold mb-3 uppercase tracking-widest">{t('directQuote')}</div>
                    <button
                      onClick={() => navigate(`/purohits?q=${encodeURIComponent(pkg.occasion)}`)}
                      className="w-full py-2.5 bg-gold text-maroon-dk font-cinzel text-[0.65rem] font-bold tracking-widest uppercase clip-btn hover:bg-gold-lt transition-colors"
                    >
                      {t('bookPurohit')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ MARKETPLACE PREVIEW ══════════════ */}
      <section className="py-16 px-6 bg-ivory">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-maroon mb-2">Pooja Store</div>
              <h2 className="font-cinzel text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-text-dk tracking-wide uppercase">{t('homeMktTitle')}</h2>
              <p className="font-garamond text-lg text-text-md italic mt-1">{t('homeMktSub')}</p>
            </div>
            <Link to="/marketplace" className="font-cinzel text-xs tracking-widest uppercase text-maroon font-bold flex items-center gap-2 hover:gap-3 transition-all border-b border-maroon/40 pb-1">
              {t('homeShopMkt')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-maroon mb-2 flex items-center justify-center gap-3">
              <span className="inline-block w-10 h-[1px] bg-gold" /> Testimonials <span className="inline-block w-10 h-[1px] bg-gold" />
            </div>
            <h2 className="font-cinzel text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-text-dk tracking-wide uppercase">{t('homeTestimonialsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white border border-gold/15 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-sm flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={13} className="text-gold fill-gold" />)}
                </div>
                <p className="font-garamond text-sm text-text-dk leading-relaxed mb-5 italic flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-gold/10 pt-4">
                  <div className="w-9 h-9 rounded-full bg-maroon flex items-center justify-center font-cinzel text-xs font-bold text-gold-pale">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-cinzel text-xs font-bold text-text-dk">{t.name}</div>
                    <div className="text-[0.6rem] text-text-lt mt-0.5">{t.occasion} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BOTTOM CTA ══════════════ */}
      <section className="py-16 px-6 bg-maroon relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-4xl mb-4">🙏</div>
          <h2 className="font-cinzelDeco text-[clamp(1.8rem,4vw,3rem)] font-bold text-cream mb-3">{t('homeCtaTitle')}</h2>
          <p className="font-garamond text-xl text-cream/75 mb-8 italic">
            {t('homeCtaSub')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/purohits')}
              className="bg-gold text-maroon-dk font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-gold-lt transition-all text-sm"
            >
              {t('navBook11')}
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="border-2 border-gold/50 text-gold font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-gold/10 transition-all text-sm"
            >
              {t('homeShopMkt')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
