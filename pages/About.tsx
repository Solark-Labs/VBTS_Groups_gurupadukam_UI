import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Clock, Sparkles, BellRing } from 'lucide-react';
import { BRAND_CONTACT } from '../constants';
import { useAppContext } from '../contexts/AppContext';

export const About: React.FC = () => {
  const { t } = useAppContext();

  const values = [
    {
      icon: '🙏',
      title: '₹11 Token Booking & Direct Dakshina',
      desc: 'No inflated fixed packages. Pay a small ₹11 token to confirm your verified Purohit or Apara Peeta — our Purohits contact you promptly and Dakshina remains transparent.',
    },
    {
      icon: '🕉️',
      title: 'Apara Seva & Emergency Swap',
      desc: 'Dedicated Pitru Peetas for Last Rites, Masikam, Abdikam, Samvatsarikam & Mahalaya Paksha — Online, Home, or Venue with 2-day prior Bhojanam customization & emergency team replacement.',
    },
    {
      icon: '⚡',
      title: 'Essentials in 30 Mins & Return Gifts',
      desc: 'Need camphor, fresh flowers, homa samagri, or vehicle pooja kits? Order from our Marketplace or schedule items automatically 30 minutes before your ceremony.',
    },
    {
      icon: '🌏',
      title: 'Pan-India in 14 Languages + PadukaAI',
      desc: 'Use Guru Padukam and talk to PadukaAI Concierge in 14 Indian languages, book priests directly from chat, report delays, and track every booking by ID or mobile number.',
    },
    {
      icon: '🗺️',
      title: 'Google Maps & WhatsApp Dispatch',
      desc: 'Pick exact ceremony coordinates on Google Maps so Purohits receive one-tap directions on WhatsApp prior to the scheduled muhurtham.',
    },
    {
      icon: '🔔',
      title: '20-Day Handoff & Live Push Alerts',
      desc: 'If an assigned Purohit has an emergency prior to the event, locality auto-handoff reassigns another verified priest while keeping families updated via instant push & event alerts.',
    },
  ];

  const stats = [
    { label: 'Confirmation Token', value: '₹11', sub: 'Across all rituals' },
    { label: 'Pan-India Languages', value: '14', sub: 'Website & PadukaAI' },
    { label: 'Samagri Delivery', value: '30 Mins', sub: 'Prior to ceremony' },
    { label: 'Support & Incidents', value: '24×7', sub: 'Admin & Emergency Swap' },
  ];

  return (
    <div className="bg-cream min-h-screen pt-[100px]">
      {/* HERO */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk overflow-hidden">
        <div
          className="absolute right-0 top-0 w-80 h-80 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/logo.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dk via-maroon-dk/85 to-maroon-dk/60" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-4">
            {t('aboutBadge')}
          </div>
          <h1 className="font-cinzelDeco text-[clamp(2.2rem,5.5vw,4.2rem)] font-bold text-cream mb-5 drop-shadow-2xl">
            {t('aboutTitle')}
          </h1>
          <p className="font-garamond text-xl text-cream/75 leading-relaxed max-w-2xl mx-auto">
            {t('aboutDesc')}
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-gold/20 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label} className="p-4 rounded-lg bg-cream/40 border border-gold/20">
              <div className="font-cinzelDeco text-2xl sm:text-3xl font-bold text-maroon">{s.value}</div>
              <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-text-dk mt-1">{s.label}</div>
              <div className="text-[11px] text-text-lt mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="py-16 px-6 bg-ivory border-b border-gold/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-cinzel text-sm tracking-[0.25em] uppercase text-maroon mb-3">✦ Our Mission</div>
            <h2 className="font-cinzel text-3xl font-bold text-maroon mb-5 leading-tight">
              {t('aboutMission')}
            </h2>
            <p className="font-garamond italic text-xl text-text-md leading-relaxed mb-5">
              We believe families should spend sacred occasions together with peace of mind — not running around markets for samagri, coordinating directions, or worrying about last-minute disruptions.
            </p>
            <p className="text-base text-text-dk leading-loose mb-5">
              Headquartered at <strong>{BRAND_CONTACT.address}</strong> and built for devotees across India in <strong>14 regional languages</strong>, Guru Padukam hand-holds every ritual — from Griha Pravesh, Vehicle Pooja, and Homas to solemn Apara ceremonies, Pitru Peeta bookings, and pure organic pooja essentials.
            </p>
            <div className="bg-white border border-gold/25 p-5 rounded-sm text-sm text-text-dk space-y-1.5">
              <div><strong>📍 Address:</strong> {BRAND_CONTACT.address}</div>
              <div><strong>📞 Phone / WhatsApp:</strong> {BRAND_CONTACT.phoneDisplay}</div>
              <div><strong>✉️ Email:</strong> {BRAND_CONTACT.email}</div>
            </div>
          </div>

          {/* Official Brand Showcase Card */}
          <div className="bg-gradient-to-br from-maroon-dk via-maroon to-maroon-dk p-8 sm:p-10 rounded-xl shadow-2xl border-2 border-gold/40 text-center text-cream space-y-5">
            <img
              src="/logo.png"
              alt="Guru Padukam Official Logo"
              className="w-32 h-32 mx-auto rounded-full border-4 border-gold/60 bg-cream object-cover p-1 shadow-xl"
            />
            <div>
              <h3 className="font-cinzelDeco text-2xl font-bold text-gold-lt">Guru Padukam</h3>
              <p className="font-telugu text-sm text-cream/80 mt-1">గురు పాదుకం · మీ పవిత్ర పూజా సహాయకులు</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div className="bg-white/10 border border-gold/25 rounded p-3 flex items-center gap-2">
                <Globe size={16} className="text-gold shrink-0" />
                <span>14 Indian Languages</span>
              </div>
              <div className="bg-white/10 border border-gold/25 rounded p-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold shrink-0" />
                <span>Verified Vedic Scholars</span>
              </div>
              <div className="bg-white/10 border border-gold/25 rounded p-3 flex items-center gap-2">
                <Clock size={16} className="text-gold shrink-0" />
                <span>30-Min Ritual Kits</span>
              </div>
              <div className="bg-white/10 border border-gold/25 rounded p-3 flex items-center gap-2">
                <BellRing size={16} className="text-gold shrink-0" />
                <span>Live Push &amp; WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 px-6 bg-maroon-dk relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="font-cinzel text-sm tracking-[0.28em] uppercase text-gold mb-2">✦ Our Promise</div>
            <h2 className="font-cinzel text-3xl font-bold text-cream tracking-widest uppercase">
              {t('aboutPromise')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(v => (
              <div
                key={v.title}
                className="border border-gold/20 p-7 bg-cream/5 hover:bg-gold/10 hover:border-gold/40 transition-all hover:-translate-y-1 rounded-sm"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-cinzel text-sm tracking-widest uppercase text-gold-lt mb-3">{v.title}</h3>
                <p className="text-sm text-cream/75 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-ivory border-t border-gold/10 text-center">
        <h2 className="font-cinzel text-2xl font-bold text-maroon tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
          <Sparkles size={20} className="text-gold" /> {t('aboutExplore')}
        </h2>
        <p className="font-garamond text-lg text-text-md italic mb-8">
          Confirm your Purohit or Apara Peeta with ₹11, or order pooja essentials delivered before your ceremony.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/purohits"
            className="bg-maroon text-gold-pale font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-maroon-md transition-colors text-sm"
          >
            Book Purohit @ ₹11
          </Link>
          <Link
            to="/apara"
            className="border-2 border-maroon text-maroon font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-maroon/5 transition-colors text-sm"
          >
            Explore Apara Seva
          </Link>
          <Link
            to="/marketplace"
            className="border-2 border-gold-dk text-maroon font-cinzel font-bold tracking-widest uppercase px-8 py-3.5 clip-btn hover:bg-gold/10 transition-colors text-sm"
          >
            Shop Marketplace
          </Link>
        </div>
      </section>
    </div>
  );
};
