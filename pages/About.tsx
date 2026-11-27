import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, ShieldCheck, Clock, Sparkles, BellRing, Phone, Mail,
  MapPin, Building2, Wallet, RefreshCw, BadgeCheck, Handshake
} from 'lucide-react';
import { BRAND_CONTACT } from '../constants';
import { useAppContext } from '../contexts/AppContext';

export const About: React.FC = () => {
  const { language, t } = useAppContext();
  const isTe = language === 'te';

  const whatWeOffer = isTe
    ? [
        {
          icon: '🙏',
          title: 'ధృవీకరించబడిన పురోహితులు (@ ₹11)',
          desc: 'తక్షణ లేదా ముందస్తు బుకింగ్ — ఆధార్ + ₹1 KYC ద్వారా ధృవీకరించబడిన వేద పండితులు.',
        },
        {
          icon: '🕉️',
          title: 'గౌరవప్రదమైన అపర సేవ',
          desc: 'అంత్యక్రియలు, మాసికం & సంవత్సరీకం — ఆన్‌లైన్, ఇల్లు లేదా పీఠంలో భోజన ఏర్పాట్లతో.',
        },
        {
          icon: '🏪',
          title: 'భాగస్వామి పూజా స్టోర్‌లు',
          desc: 'పుష్పాలు, పూజా సామగ్రి & రిటర్న్ గిఫ్ట్‌లు — సమస్య ఉంటే మా బృందమే వ్యాపారితో మాట్లాడుతుంది.',
        },
        {
          icon: '🤖',
          title: 'PadukaAI లైవ్ సహాయకుడు',
          desc: 'తెలుగు & ఇంగ్లీషులో మంత్రాలు, ముహూర్తం సందేహాలు & ఆర్డర్ సహాయం క్షణాల్లో.',
        },
      ]
    : [
        {
          icon: '🙏',
          title: 'Verified Purohits (@ ₹11)',
          desc: 'Instant or scheduled Vedic priests nearby — every scholar verified by Aadhaar ID + ₹1 witness payment.',
        },
        {
          icon: '🕉️',
          title: 'Dignified Apara Seva',
          desc: 'Last Rites, Masikam, Abdikam & Samvatsarikam at Home, Peeta or Online with custom Bhojanam.',
        },
        {
          icon: '🏪',
          title: 'Partner Pooja Marketplace',
          desc: 'Pure samagri, fresh flowers & return gifts from local stores — backed by Guru Padukam merchant mediation.',
        },
        {
          icon: '🤖',
          title: 'PadukaAI Live Guide',
          desc: 'Instant bilingual guidance in English & తెలుగు for rituals, Muhurthams, and bookings.',
        },
      ];

  const whyChooseUs = isTe
    ? [
        {
          icon: BadgeCheck,
          title: 'ఆధార్ + ₹1 KYC ధృవీకరణ',
          desc: 'ప్రతి పురోహితుడి గుర్తింపు ధృవీకరించబడింది మరియు అవసరమైనప్పుడు చూపించడానికి ఎల్లప్పుడూ సిద్ధంగా ఉంటారు.',
        },
        {
          icon: ShieldCheck,
          title: 'ఆన్‌లైన్‌లో కేవలం ₹11 టోకెన్ మాత్రమే',
          desc: 'పెద్ద మొత్తంలో ముందస్తు ఫీజులు లేవు — దక్షిణ గురించి పురోహితుడితో నేరుగా మాట్లాడుకోవచ్చు.',
        },
        {
          icon: RefreshCw,
          title: 'ఉచిత తేదీ మార్పు & ₹11 వాలెట్ రక్షణ',
          desc: 'పురోహితుడు రద్దు చేస్తే ₹11 మీ వాలెట్‌లో చేరుతుంది; మరో పురోహితుడిని అదనపు ఖర్చు లేకుండా బుక్ చేయవచ్చు.',
        },
        {
          icon: Handshake,
          title: 'వ్యాపారితో మీ తరపున మేము మాట్లాడతాము',
          desc: 'పూజా సామగ్రి ఆర్డర్‌లో ఏదైనా సమస్య వస్తే గురు పాదుకం బృందం నేరుగా స్టోర్ యజమానితో మాట్లాడుతుంది.',
        },
        {
          icon: BellRing,
          title: 'నక్షత్రం, ముహూర్తం & రికార్డు టైమ్‌లైన్',
          desc: 'పురోహితుడు సమయం ఖరారు చేసిన వెంటనే అలర్ట్‌లు, పూజా కిట్ సిద్ధం & పూర్తి బుకింగ్ రికార్డు కనిపిస్తుంది.',
        },
        {
          icon: Globe,
          title: '100% తెలుగు & English అనుభవం',
          desc: 'ప్రతి పేజీ, నోటిఫికేషన్ మరియు AI సహాయం మీకు నచ్చిన భాషలో స్పష్టంగా లభిస్తాయి.',
        },
      ]
    : [
        {
          icon: BadgeCheck,
          title: 'Aadhaar + ₹1 Verified Purohits',
          desc: 'Every priest completes Aadhaar KYC + a ₹1 witness verification and stays ready to show credentials anytime.',
        },
        {
          icon: ShieldCheck,
          title: 'Pay Just ₹11 Token Online',
          desc: 'Zero heavy advance fees online — finalize ritual Dakshina directly and honestly with your Purohit.',
        },
        {
          icon: RefreshCw,
          title: 'Free Date Swaps & ₹11 Wallet Safety',
          desc: 'If plans change within swap windows or a Purohit declines, your ₹11 returns straight to your Wallet.',
        },
        {
          icon: Handshake,
          title: 'Dedicated Support & Merchant Advocacy',
          desc: 'Partner stores handle fulfillment; if an issue occurs, our team listens and speaks to the store for you.',
        },
        {
          icon: BellRing,
          title: 'Clear Action Record & Alerts',
          desc: 'Track Nakshatram, finalized Muhurtham, advance acknowledgments, and live status in one neat booking view.',
        },
        {
          icon: Globe,
          title: '100% Bilingual: English & తెలుగు',
          desc: 'Every screen, policy, alert, and PadukaAI conversation works cleanly in English and తెలుగు.',
        },
      ];

  const howItWorks = isTe
    ? [
        { step: '01', title: 'ఎంచుకోండి & ₹11 చెల్లించండి', desc: 'మీరు కోరుకున్న పురోహితుడిని ఎంచుకుని Cashfree ద్వారా ₹11 టోకెన్‌తో బుక్ చేయండి.' },
        { step: '02', title: 'కాల్ & ముహూర్తం ఖరారు', desc: 'పురోహితుడు మీకు కాల్ చేసి నక్షత్రం ప్రకారం ముహూర్తం ఖరారు చేస్తారు — గురు పాదుకం రిమైండర్‌లు పంపుతుంది.' },
        { step: '03', title: 'నిశ్చింతగా పూజ నిర్వహించుకోండి', desc: 'సమయానికి పూరోహితుడు, పూజా సామగ్రి మరియు ప్రత్యక్ష సహాయం అందుబాటులో ఉంటాయి.' },
      ]
    : [
        { step: '01', title: 'Choose & Pay ₹11 Token', desc: 'Browse verified Purohits or Apara Peetas and lock your slot via Cashfree or Wallet.' },
        { step: '02', title: 'Purohit Call & Muhurtham', desc: 'Your Purohit contacts you, fixes the Muhurtham by Nakshatram, and triggers Guru Padukam prep alerts.' },
        { step: '03', title: 'Sacred Ritual With Full Support', desc: 'Enjoy peace of mind with direct Dakshina clarity, mapped directions, and active support.' },
      ];

  return (
    <div className="bg-cream min-h-screen pt-[100px]">
      {/* HERO */}
      <section className="relative py-16 px-6 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk overflow-hidden">
        <div
          className="absolute right-0 top-0 w-80 h-80 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/logo.png')" }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="font-cinzel text-xs tracking-[0.28em] uppercase text-gold">
            {isTe ? 'గురు పాదుకం · మా గురించి' : t('aboutBadge')}
          </div>
          <h1 className="font-cinzelDeco text-[clamp(2.1rem,5vw,3.8rem)] font-bold text-cream leading-tight">
            {isTe ? 'భక్తి, విశ్వాసం & సంపూర్ణ పూజా సహాయం' : t('aboutTitle')}
          </h1>
          <p className="font-garamond text-xl text-cream/85 max-w-2xl mx-auto leading-relaxed">
            {isTe
              ? 'ధృవీకరించబడిన పురోహితులు, గౌరవప్రదమైన అపర సేవ మరియు భాగస్వామి పూజా స్టోర్‌లను కేవలం ₹11 టోకెన్‌తో భక్తులకు చేరువ చేస్తున్న వేదిక.'
              : 'Simple, honest, and fully guided access to verified Vedic Purohits, dignified Apara Seva, and pure partner Pooja Stores — starting with just an ₹11 token.'}
          </p>
        </div>
      </section>

      {/* WHAT WE DO (3 SIMPLE STEPS) */}
      <section className="py-12 px-6 bg-white border-b border-gold/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase text-maroon mb-1">
              {isTe ? '✦ మేము ఏమి చేస్తాము' : '✦ What We Do'}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-dk">
              {isTe ? 'మూడు సులభమైన దశల్లో సంపూర్ణ పూజా అనుభవం' : 'Three Simple Steps to Worry-Free Rituals'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map(item => (
              <div key={item.step} className="bg-cream/50 border border-gold/30 rounded-lg p-6 space-y-2">
                <span className="font-cinzelDeco text-2xl font-bold text-gold-dk">{item.step}</span>
                <h3 className="font-serif text-lg font-bold text-maroon">{item.title}</h3>
                <p className="text-sm text-text-md leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="py-14 px-6 bg-ivory border-b border-gold/15">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase text-maroon mb-1">
              {isTe ? '✦ మేము అందించే సేవలు' : '✦ What We Offer'}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-dk">
              {isTe ? 'ప్రతి భక్తుడి కుటుంబానికి నాలుగు ప్రధాన సేవలు' : 'Four Core Pillars Built Around Your Family'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whatWeOffer.map(o => (
              <div key={o.title} className="bg-white border border-gold/25 rounded-lg p-6 shadow-sm hover:shadow-md transition-all space-y-2.5">
                <div className="text-3xl">{o.icon}</div>
                <h3 className="font-serif text-base font-bold text-maroon leading-snug">{o.title}</h3>
                <p className="text-xs sm:text-sm text-text-md leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY GURUPADUKAM.COM */}
      <section className="py-16 px-6 bg-maroon-dk text-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-cinzel text-xs tracking-[0.28em] uppercase text-gold mb-2">
              ✦ Why gurupadukam.com
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
              {isTe ? 'భక్తులు & పురోహితులు గురు పాదుకంను ఎందుకు నమ్ముతారు?' : 'Why Families & Vedic Scholars Trust GuruPadukam.com'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChooseUs.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border border-gold/25 bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-6 space-y-2.5">
                  <Icon size={22} className="text-gold" />
                  <h3 className="font-serif text-base font-bold text-gold-lt">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-cream/80 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OFFICIAL REGISTERED BUSINESS & CONTACT US */}
      <section id="contact" className="py-16 px-6 bg-cream border-b border-gold/15 scroll-mt-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 text-center bg-gradient-to-br from-maroon-dk via-maroon to-maroon-dk p-8 rounded-xl border border-gold/40 text-cream space-y-4 shadow-xl">
            <img
              src="/logo.png"
              alt="Guru Padukam"
              className="w-24 h-24 mx-auto rounded-full border-4 border-gold/60 bg-cream object-cover p-1"
            />
            <div>
              <h3 className="font-cinzelDeco text-2xl font-bold text-gold-lt">{BRAND_CONTACT.businessName}</h3>
              <p className="text-xs text-cream/80 mt-1">{BRAND_CONTACT.legalEntityNote}</p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px]">
              <span className="bg-white/10 px-3 py-1 rounded-full border border-gold/25 flex items-center gap-1">
                <Wallet size={12} className="text-gold" /> ₹11 Token Safety
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full border border-gold/25 flex items-center gap-1">
                <Clock size={12} className="text-gold" /> Real-Time Support
              </span>
            </div>
          </div>

          <div className="md:col-span-7 bg-white border border-gold/30 p-6 sm:p-8 rounded-xl shadow-sm space-y-4 text-sm text-text-dk">
            <div className="font-cinzel text-xs font-bold uppercase tracking-widest text-maroon border-b border-gold/20 pb-2">
              {isTe ? 'అధికారిక వ్యాపార & సంప్రదింపు వివరాలు' : 'Official Business & Contact Information'}
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 size={17} className="text-maroon mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-maroon">{BRAND_CONTACT.businessName}</div>
                <div className="text-xs text-text-md">{BRAND_CONTACT.legalEntityNote}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={17} className="text-maroon mt-0.5 shrink-0" />
              <span><strong>Registered Address:</strong> {BRAND_CONTACT.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={17} className="text-maroon shrink-0" />
              <span>
                <strong>Phone / WhatsApp:</strong>{' '}
                <a href={`tel:+${BRAND_CONTACT.phoneRaw}`} className="text-maroon underline font-semibold">
                  {BRAND_CONTACT.phoneDisplay}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={17} className="text-maroon shrink-0" />
              <span>
                <strong>Support Email:</strong>{' '}
                <a href={`mailto:${BRAND_CONTACT.email}`} className="text-maroon underline font-semibold">
                  {BRAND_CONTACT.email}
                </a>
              </span>
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                to="/purohits"
                className="bg-maroon text-gold-pale font-cinzel font-bold tracking-wider uppercase px-5 py-2.5 clip-btn hover:bg-maroon-md text-xs"
              >
                {isTe ? 'పురోహితుడిని బుక్ చేయండి (@ ₹11)' : 'Book Verified Purohit @ ₹11'}
              </Link>
              <Link
                to="/apara"
                className="border border-maroon text-maroon font-cinzel font-bold tracking-wider uppercase px-5 py-2.5 rounded-sm hover:bg-maroon/5 text-xs"
              >
                {isTe ? 'అపర సేవ' : 'Explore Apara Seva'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
