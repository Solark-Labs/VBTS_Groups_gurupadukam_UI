import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Star, X, CheckCircle, Clock, MapPin, Languages, Handshake, MessageCircle, Navigation, ExternalLink, Copy, ShieldCheck, Wallet } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Purohit, Booking, GeoLocation } from '../types';
import { POOJA_OCCASIONS, BRAND_CONTACT } from '../constants';
import { LocationPicker, buildGeoLocation } from '../components/LocationPicker';
import { buildPurohitWhatsAppUrl, getBookingMapDirectionsUrl, getReminderWindowInfo } from '../utils/whatsapp';
import { CashfreeOrderResponse, createCashfreeTokenOrder } from '../services/paymentService';
import { CashfreeCheckoutModal } from '../components/CashfreeCheckoutModal';
import { SplashOverlay } from '../components/SplashOverlay';
import { localizeDynamic } from '../i18n/languages';

type AvailFilter = 'all' | 'now' | 'today' | 'scheduled';

export const Purohits: React.FC = () => {
  const { purohits, user, walletBalance, debitWalletForBooking, createBooking, markBookingWhatsappSent, addToast, t, language } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [availFilter, setAvailFilter] = useState<AvailFilter>(
    searchParams.get('avail') === 'now' ? 'now' : 'all'
  );
  const [immediateMode, setImmediateMode] = useState<boolean>(searchParams.get('avail') === 'now');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [specFilter, setSpecFilter] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
    const av = searchParams.get('avail');
    if (av === 'now') {
      setAvailFilter('now');
      setImmediateMode(true);
    }
    const bookId = searchParams.get('book');
    if (bookId) {
      const found = purohits.find(p => p.id === bookId);
      if (found) setSelectedPurohit(found);
    }
  }, [searchParams, purohits]);

  const [selectedPurohit, setSelectedPurohit] = useState<Purohit | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gp_purohits_splash_seen') !== '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!selectedPurohit) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPurohit(null);
        setConfirmedBooking(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPurohit]);

  const dismissSplash = () => {
    try {
      localStorage.setItem('gp_purohits_splash_seen', '1');
    } catch {
      // Ignore storage error
    }
    setShowSplash(false);
  };

  // Booking form
  const [bookName, setBookName] = useState(user?.name || '');
  const [bookPhone, setBookPhone] = useState(user?.phone || '');
  const [bookEmail, setBookEmail] = useState(user?.email || '');
  const [bookAddress, setBookAddress] = useState(user?.address || '');
  const [bookCity, setBookCity] = useState(user?.city || 'Khammam');
  const [bookPincode, setBookPincode] = useState(user?.pincode || '507002');
  const [bookOccasion, setBookOccasion] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookLocation, setBookLocation] = useState<GeoLocation>(() =>
    buildGeoLocation(17.2473, 80.1514, 'Khammam, Telangana')
  );
  const [reminderHoursBefore, setReminderHoursBefore] = useState<number>(2);
  const [samagriMode, setSamagriMode] = useState<'devotee-arranges' | 'purohit-brings' | 'marketplace-30min'>('marketplace-30min');
  const [payVia, setPayVia] = useState<'Cashfree' | 'Wallet'>(walletBalance >= 11 ? 'Wallet' : 'Cashfree');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [pendingCashfree, setPendingCashfree] = useState<{
    order: CashfreeOrderResponse;
    bookingDraft: Omit<Booking, 'paymentStatus' | 'cashfreeOrderId' | 'cashfreePaymentId'>;
  } | null>(null);

  useEffect(() => {
    setPayVia(walletBalance >= 11 ? 'Wallet' : 'Cashfree');
  }, [walletBalance]);

  useEffect(() => {
    if (user) {
      if (!bookName) setBookName(user.name || '');
      if (!bookPhone) setBookPhone(user.phone || '');
      if (!bookEmail) setBookEmail(user.email || '');
      if (!bookAddress) setBookAddress(user.address || '');
      if (!bookCity && user.city) setBookCity(user.city);
      if (!bookPincode && user.pincode) setBookPincode(user.pincode);
    }
  }, [user]);

  const allLocalities = useMemo(() => {
    const set = new Set<string>();
    purohits.forEach(p => {
      p.location.split(/[,&]/).forEach(part => {
        const clean = part.trim();
        if (clean) set.add(clean);
      });
    });
    return Array.from(set).sort();
  }, [purohits]);

  const allSpecializations = useMemo(() => {
    const set = new Set<string>();
    purohits.forEach(p => p.specializations.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [purohits]);

  const filtered = useMemo(() => {
    return purohits.filter(p => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.specializations.some(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase().split(' ')[0])) ||
        p.location.toLowerCase().includes(q);
      // In Immediate Booking Mode, strictly restrict to Purohits available RIGHT NOW at the selected location
      const matchAvail = immediateMode
        ? p.availability === 'now'
        : availFilter === 'all' || p.availability === availFilter;
      const matchLocation =
        !locationFilter ||
        p.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchSpec =
        !specFilter ||
        p.specializations.some(s => s.toLowerCase().includes(specFilter.toLowerCase()));
      return matchSearch && matchAvail && matchLocation && matchSpec;
    });
  }, [purohits, search, availFilter, immediateMode, locationFilter, specFilter]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login or register to confirm your ₹11 booking.', 'info');
      navigate('/login');
      return;
    }
    const cleanPhone = bookPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      addToast('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.', 'error');
      return;
    }
    if (!bookAddress.trim()) {
      addToast('Ceremony doorstep address is required.', 'error');
      return;
    }
    if (!bookPincode || bookPincode.replace(/\D/g, '').length !== 6) {
      addToast('Please enter a valid 6-digit postal PIN code.', 'error');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (!bookDate || bookDate < todayStr) {
      addToast('Please select today or a future ceremony date.', 'error');
      return;
    }
    if (!selectedPurohit) return;

    setIsBooking(true);
    const bookingId = 'BKG' + Math.floor(100000 + Math.random() * 900000);
    let paymentMethodUsed: 'Cashfree' | 'Wallet' = payVia;

    if (payVia === 'Wallet' && walletBalance >= 11) {
      const ok = debitWalletForBooking(
        BRAND_CONTACT.bookingTokenFee,
        `Reused ₹11 Guru Padukam Wallet token for ${selectedPurohit.name}`,
        bookingId
      );
      if (ok) {
        const walletBooking: Booking = {
          id: bookingId,
          userId: user.id,
          userName: bookName || user.name,
          userPhone: cleanPhone,
          userEmail: bookEmail || user.email,
          purohitId: selectedPurohit.id,
          purohitName: selectedPurohit.name,
          purohitPhone: selectedPurohit.phone || BRAND_CONTACT.phoneRaw,
          occasion: bookOccasion,
          date: bookDate,
          time: bookTime,
          address: bookAddress,
          city: bookCity,
          pincode: bookPincode,
          location: bookLocation,
          notes: bookNotes,
          status: 'Awaiting Purohit Approval',
          bookingType: immediateMode ? 'immediate' : 'scheduled',
          total: BRAND_CONTACT.bookingTokenFee,
          paymentMethod: 'Wallet',
          paymentStatus: 'Verified',
          whatsappDispatchStatus: 'Scheduled',
          reminderHoursBefore,
          samagriMode,
          shipBefore30Min: samagriMode === 'marketplace-30min',
          handoffStatus: 'none',
          locality: bookCity || 'Khammam',
        };
        createBooking(walletBooking);
        addToast(`₹11 Wallet applied! Booking ${bookingId} sent to ${selectedPurohit.name}.`, 'success');
        setIsBooking(false);
        setConfirmedBooking(walletBooking);
        setBookOccasion(''); setBookDate(''); setBookTime(''); setBookNotes('');
        return;
      }
      paymentMethodUsed = 'Cashfree';
    } else {
      paymentMethodUsed = 'Cashfree';
    }

    // Create Cashfree order (status ACTIVE / unpaid) and require user authorization inside CashfreeCheckoutModal
    const cfOrder = await createCashfreeTokenOrder({
      bookingRef: bookingId,
      customerName: bookName || user.name,
      customerPhone: cleanPhone,
      customerEmail: bookEmail || user.email,
    });

    setPendingCashfree({
      order: cfOrder,
      bookingDraft: {
        id: bookingId,
        userId: user.id,
        userName: bookName || user.name,
        userPhone: cleanPhone,
        userEmail: bookEmail || user.email,
        purohitId: selectedPurohit.id,
        purohitName: selectedPurohit.name,
        purohitPhone: selectedPurohit.phone || BRAND_CONTACT.phoneRaw,
        occasion: bookOccasion,
        date: bookDate,
        time: bookTime,
        address: bookAddress,
        city: bookCity,
        pincode: bookPincode,
        location: bookLocation,
        notes: bookNotes,
        status: 'Awaiting Purohit Approval',
        bookingType: immediateMode ? 'immediate' : 'scheduled',
        total: BRAND_CONTACT.bookingTokenFee,
        paymentMethod: paymentMethodUsed,
        whatsappDispatchStatus: 'Scheduled',
        reminderHoursBefore,
        samagriMode,
        shipBefore30Min: samagriMode === 'marketplace-30min',
        handoffStatus: 'none',
        locality: bookCity || 'Khammam',
      },
    });
    setIsBooking(false);
  };

  const AvailBadge = ({ avail, slot }: { avail: Purohit['availability']; slot?: string }) => {
    if (avail === 'now') return (
      <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Available Now
      </span>
    );
    if (avail === 'today') return (
      <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
        <Clock size={11} /> {slot}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full">
        <Clock size={11} /> {slot || 'Scheduled'}
      </span>
    );
  };

  const isTe = language === 'te';

  return (
    <div className="min-h-screen bg-cream pt-[96px]">

      <SplashOverlay
        visible={showSplash}
        onDismiss={dismissSplash}
        eyebrow={isTe ? 'గురు పాదుకం · ధృవీకరించబడిన పురోహితులు' : 'Guru Padukam · Verified Vedic Purohits'}
        title={isTe ? 'కేవలం ₹11 టోకెన్‌తో పురోహితుడిని బుక్ చేయండి' : 'Book Verified Purohits @ ₹11 Token'}
        subtitle={
          isTe
            ? 'ఆధార్ + ₹1 KYC ద్వారా ధృవీకరించబడిన పండితులను ఎంచుకోండి — స్పష్టమైన సమయం, పారదర్శక దక్షిణ.'
            : 'Choose Aadhaar + ₹1 KYC verified Vedic scholars with live availability and direct Dakshina clarity.'
        }
        features={
          isTe
            ? [
                { icon: '🙏', title: 'నేరుగా కార్డుపై క్లిక్ చేయండి', desc: 'ఏ పురోహిత కార్డుపైనైనా క్లిక్ చేసి పూర్తి ప్రొఫైల్, వేద పరిచయం & ఫోటోలు చూడండి.' },
                { icon: '🕰️', title: 'నక్షత్రం & ముహూర్తం ఖరారు', desc: '₹11 చెల్లించిన తర్వాత పురోహితుడు మీకు కాల్ చేసి నక్షత్రం ప్రకారం ముహూర్తం ఖరారు చేస్తారు.' },
                { icon: '🔄', title: 'ఉచిత తేదీ మార్పిడి & ₹11 వాలెట్ హామీ', desc: 'పురోహితుడు రద్దు చేస్తే ₹11 మీ వాలెట్‌లో చేరుతుంది — మరో పురోహితుడిని బుక్ చేయవచ్చు.' },
              ]
            : [
                { icon: '🙏', title: 'Click Any Card for Full Profile & Photos', desc: 'Inspect reviews, ceremony photos, languages, and verified KYC status directly on click.' },
                { icon: '🕰️', title: 'Nakshatram & Muhurtham Finalized By Call', desc: 'Post ₹11 token verification, your Purohit contacts you to finalize Muhurtham & trigger reminders.' },
                { icon: '🔄', title: 'Zero-Loss ₹11 Wallet Protection', desc: 'Need a date swap or Purohit reschedules? Reuse ₹11 seamlessly with another verified Purohit.' },
              ]
        }
        ctaLabel={isTe ? 'పురోహితులను చూడండి →' : 'Browse Verified Purohits →'}
      />

      {/* HERO */}
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/logo.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dk via-maroon-dk/90 to-maroon-dk/70" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-500/10 px-3.5 py-1.5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[12px] font-medium tracking-wide text-green-300">
              {purohits.filter(p => p.availability === 'now').length} Purohits Available Immediately in Khammam · Confirm @ ₹11
            </span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,3.8vw,3.2rem)] font-bold text-cream mb-2 leading-tight">
            {t('purTitle')}
          </h1>
          <p className="text-base text-cream/85 max-w-2xl mx-auto mb-5">
            {t('purDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto">
            <div className="flex items-stretch flex-1 shadow-md rounded-md overflow-hidden bg-white border border-gold/30">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-lt" size={16} />
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('purSearchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 text-text-dk text-sm focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSplash(true)}
              className="px-4 py-2.5 border border-gold/40 bg-maroon-dk/70 text-gold-lt font-bold text-xs uppercase tracking-wider rounded-md hover:bg-gold/20 transition-colors shrink-0"
            >
              ✦ {isTe ? 'ఎలా పనిచేస్తుంది?' : 'How ₹11 Booking Works'}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR FILTERS + IMMEDIATE BOOKING MODE */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Immediate Purohit Booking Mode Box */}
          <div className={`border p-5 shadow-sm rounded-sm space-y-3 transition-colors ${
            immediateMode ? 'bg-green-50 border-green-400' : 'bg-white border-gold/25'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-cinzel text-xs font-bold tracking-wider uppercase text-maroon flex items-center gap-1.5">
                ⚡ Immediate Booking
              </span>
              <input
                type="checkbox"
                checked={immediateMode}
                onChange={e => {
                  const next = e.target.checked;
                  setImmediateMode(next);
                  if (next) setAvailFilter('now');
                }}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-text-md leading-snug">
              Need a Purohit <strong>right now</strong>? Restricts booking strictly to priests currently available at your location.
            </p>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-maroon mb-1">
                Location / Area
              </label>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-gold/30 bg-white rounded-sm focus:outline-none focus:border-maroon"
              >
                <option value="">All Service Locations</option>
                {allLocalities.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-gold/15 p-5 shadow-sm rounded-sm">
            <h3 className="font-cinzel text-xs font-bold tracking-widest uppercase text-text-dk border-b border-gold/15 pb-3 mb-4">{t('purAvail')}</h3>
            <div className="space-y-2">
              {([['all', t('purAll')], ['now', t('purAvailNow')], ['today', t('purAvailToday')], ['scheduled', t('purScheduled')]] as [AvailFilter, string][]).map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="avail"
                    disabled={immediateMode && val !== 'now'}
                    checked={(immediateMode ? 'now' : availFilter) === val}
                    onChange={() => setAvailFilter(val)}
                    className="accent-maroon w-4 h-4"
                  />
                  <span className={`font-cinzel text-xs tracking-widest uppercase group-hover:text-maroon transition-colors ${availFilter === val ? 'text-maroon font-bold' : 'text-text-md'}`}>{label}</span>
                  {val === 'now' && <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gold/15 p-5 shadow-sm rounded-sm">
            <h3 className="font-cinzel text-xs font-bold tracking-widest uppercase text-text-dk border-b border-gold/15 pb-3 mb-4">{t('purRitual')}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="spec" checked={specFilter === ''} onChange={() => setSpecFilter('')} className="accent-maroon w-4 h-4" />
                <span className={`font-cinzel text-xs tracking-widest uppercase ${specFilter === '' ? 'text-maroon font-bold' : 'text-text-md'}`}>{t('purAllRituals')}</span>
              </label>
              {allSpecializations.map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="spec" checked={specFilter === s} onChange={() => setSpecFilter(s)} className="accent-maroon w-4 h-4" />
                  <span className={`font-cinzel text-[0.65rem] tracking-widest uppercase group-hover:text-maroon transition-colors ${specFilter === s ? 'text-maroon font-bold' : 'text-text-md'}`}>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {(search || availFilter !== 'all' || specFilter || immediateMode || locationFilter) && (
            <button onClick={() => { setSearch(''); setAvailFilter('all'); setSpecFilter(''); setImmediateMode(false); setLocationFilter(''); }}
              className="w-full py-2.5 border border-maroon text-maroon font-cinzel text-xs tracking-widest uppercase hover:bg-maroon/5 transition-colors flex items-center justify-center gap-2">
              <X size={12} /> {t('purReset')}
            </button>
          )}
        </aside>

        {/* PUROHIT GRID */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="font-cinzel text-xs tracking-widest uppercase text-text-md">
              {t('mktShowing')} <strong className="text-maroon">{filtered.length}</strong> {filtered.length === 1 ? (language === 'te' ? 'పురోహితుడు' : 'Purohit') : t('navPurohits')}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-text-md font-cinzel text-lg">No purohits match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/purohits/${p.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/purohits/${p.id}`); } }}
                  className="bg-white border border-gold/20 hover:border-gold shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 rounded-sm flex flex-col cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative shrink-0">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-gold/30" />
                      {p.verified && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center" title="Aadhaar + ₹1 KYC Verified">
                          <CheckCircle size={9} className="text-white" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-cinzel text-sm font-bold text-text-dk group-hover:text-maroon leading-tight">
                            {language === 'te' ? p.nameTe : p.name}
                          </div>
                          <p className="font-telugu text-[0.65rem] text-text-lt mt-0.5">
                            {language === 'te' ? p.name : p.nameTe}
                          </p>
                        </div>
                        <AvailBadge avail={p.availability} slot={p.nextSlot} />
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-gold fill-gold" />
                          <span className="font-cinzel text-[0.65rem] font-bold text-maroon">{p.rating}</span>
                          <span className="text-text-lt text-[0.6rem]">({p.reviews})</span>
                        </div>
                        <span className="text-text-lt text-[0.6rem]">·</span>
                        <span className="font-cinzel text-[0.6rem] text-text-lt uppercase tracking-widest">
                          {p.completedPoojas.toLocaleString()} {t('poojasDone')}
                        </span>
                        {p.verified && (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Aadhaar + ₹1 KYC Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-text-md mb-4 leading-relaxed">{p.bio}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.specializations.slice(0, 4).map(s => (
                      <span key={s} className="text-[0.55rem] font-bold tracking-widest uppercase bg-maroon/5 text-maroon border border-maroon/15 px-2 py-0.5 rounded-full">
                        {localizeDynamic(s, language)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[0.62rem] text-text-lt mb-4">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {p.location}</span>
                    <span className="flex items-center gap-1"><Languages size={10} /> {p.languages.join(', ')}</span>
                    <span>{p.experience}yr exp</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gold/10 pt-4 mt-auto gap-2 flex-wrap">
                    <div>
                      <div className="text-[0.6rem] text-text-lt uppercase tracking-widest flex items-center gap-1">
                        <Handshake size={11} className="text-gold-dk" /> {t('directQuote')}
                      </div>
                      <div className="font-cinzel text-sm font-bold text-maroon">{t('bookingTokenLabel')}</div>
                    </div>
                    <button
                      type="button"
                      disabled={immediateMode && p.availability !== 'now'}
                      onClick={e => {
                        e.stopPropagation();
                        if (immediateMode && p.availability !== 'now') {
                          addToast(`${p.name} is not available right now. Choose an "Available Now" Purohit.`, 'error');
                          return;
                        }
                        if (immediateMode) {
                          const today = new Date().toISOString().split('T')[0];
                          const soon = new Date(Date.now() + 30 * 60 * 1000);
                          const hh = String(soon.getHours()).padStart(2, '0');
                          const mm = String(soon.getMinutes()).padStart(2, '0');
                          setBookDate(today);
                          setBookTime(`${hh}:${mm}`);
                        }
                        setSelectedPurohit(p);
                      }}
                      className="bg-maroon text-gold-pale font-cinzel text-[0.65rem] font-bold tracking-widest uppercase px-5 py-2.5 clip-btn hover:bg-maroon-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {immediateMode && p.availability !== 'now'
                        ? 'Unavailable Now'
                        : immediateMode
                        ? '⚡ Immediate Book @ ₹11'
                        : t('navBook11')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedPurohit && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-text-dk/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-cream shadow-2xl rounded-sm overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-maroon p-5 flex justify-between items-start">
              <div>
                <div className="font-cinzel text-xs tracking-widest uppercase text-gold mb-1">
                  {confirmedBooking ? 'Booking Confirmed · Purohit Dispatch' : '₹11 Token Confirmation'}
                </div>
                <h2 className="font-cinzel text-lg font-bold text-cream">{selectedPurohit.name}</h2>
                <p className="font-telugu text-xs text-cream/60 mt-0.5">{selectedPurohit.nameTe}</p>
              </div>
              <button
                type="button"
                aria-label="Close booking modal"
                onClick={() => { setSelectedPurohit(null); setConfirmedBooking(null); }}
                className="text-cream/60 hover:text-cream transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {confirmedBooking ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-sm flex items-start gap-3">
                  <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={22} />
                  <div>
                    <div className="font-cinzel text-sm font-bold text-green-900">
                      ₹11 Verified · Request Sent to {confirmedBooking.purohitName} ({confirmedBooking.id})
                    </div>
                    <p className="text-xs text-green-800 mt-1">
                      Payment verified via <strong>{confirmedBooking.paymentMethod || 'Cashfree'}</strong>
                      {confirmedBooking.cashfreePaymentId && (
                        <> (Txn: <code className="font-mono">{confirmedBooking.cashfreePaymentId}</code>)</>
                      )}
                      . Status: <strong>{confirmedBooking.status}</strong>. If the Purohit declines due to schedule, ₹11 is instantly credited to your Wallet with a push notification!
                    </p>
                  </div>
                </div>

                {/* Google Maps Pinned Location & Prior Dispatch Box */}
                <div className="bg-white border border-gold/30 p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
                      <Navigation size={14} /> Purohit Navigation &amp; WhatsApp Dispatch
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                      {getReminderWindowInfo(confirmedBooking.date, confirmedBooking.time, confirmedBooking.reminderHoursBefore || 2).label}
                    </span>
                  </div>

                  <div className="text-xs text-text-md space-y-1 bg-cream/60 p-3 rounded-sm border border-gold/15">
                    <div><strong>Devotee:</strong> {confirmedBooking.userName} (+91 {confirmedBooking.userPhone})</div>
                    <div><strong>Address:</strong> {confirmedBooking.address}, {confirmedBooking.city} – {confirmedBooking.pincode}</div>
                    {confirmedBooking.location && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-green-700 font-semibold">
                          GPS Pin: {confirmedBooking.location.lat.toFixed(4)}° N, {confirmedBooking.location.lng.toFixed(4)}° E
                        </span>
                        <a
                          href={getBookingMapDirectionsUrl(confirmedBooking)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-maroon font-bold underline inline-flex items-center gap-0.5"
                        >
                          Open Google Maps <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-text-md leading-relaxed">
                    So <strong>{confirmedBooking.purohitName}</strong> reaches your doorstep hassle-free before{' '}
                    <strong>{confirmedBooking.time}</strong>, send the Google Maps directions &amp; ceremony details straight to his WhatsApp now (or our coordinator will auto-send it{' '}
                    <strong>{confirmedBooking.reminderHoursBefore || 2} hours prior</strong> to the scheduled time):
                  </p>

                  <a
                    href={buildPurohitWhatsAppUrl(confirmedBooking)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => markBookingWhatsappSent(confirmedBooking.id)}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#1fb858] text-white font-cinzel text-xs font-bold tracking-widest uppercase rounded-sm shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={17} /> Send Location &amp; Map to Purohit on WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const mapLink = getBookingMapDirectionsUrl(confirmedBooking);
                      navigator.clipboard?.writeText(
                        `Guru Padukam Booking ${confirmedBooking.id}\nRitual: ${confirmedBooking.occasion} on ${confirmedBooking.date} at ${confirmedBooking.time}\nDevotee: ${confirmedBooking.userName} (+91 ${confirmedBooking.userPhone})\nAddress: ${confirmedBooking.address}, ${confirmedBooking.city} - ${confirmedBooking.pincode}\nGoogle Maps: ${mapLink}`
                      );
                      addToast('Booking & Google Maps link copied to clipboard!', 'success');
                    }}
                    className="w-full py-2.5 border border-gold/40 text-maroon font-cinzel text-xs font-bold tracking-wider uppercase rounded-sm hover:bg-gold/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={13} /> Copy Details &amp; Map Link
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPurohit(null);
                      setConfirmedBooking(null);
                      navigate('/track-order');
                    }}
                    className="flex-1 py-3 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors"
                  >
                    View My Bookings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPurohit(null);
                      setConfirmedBooking(null);
                    }}
                    className="px-5 py-3 border border-maroon/30 text-maroon font-cinzel text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-maroon/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleBook} className="flex-1 overflow-y-auto p-6 space-y-4">
              {!user && (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-sm text-sm text-amber-900">
                  <span className="font-bold">Login Required:</span> User details are mandatory for purohit dispatch. Please{' '}
                  <button type="button" onClick={() => { setSelectedPurohit(null); navigate('/login'); }} className="font-bold underline text-maroon hover:text-maroon-dk">
                    sign in or register
                  </button>{' '}
                  to book.
                </div>
              )}

              {/* Devotee Contact Information (Mandatory) */}
              <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                <div className="font-cinzel text-xs font-bold tracking-widest uppercase text-maroon flex items-center justify-between">
                  <span>Devotee Details (Mandatory)</span>
                  <span className="text-[10px] text-text-lt font-normal lowercase tracking-normal">for coordination &amp; dispatch</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookName}
                      onChange={e => setBookName(e.target.value)}
                      placeholder="Devotee / Host Name"
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Mobile Number (10 digits) *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 text-xs bg-gray-100 border border-r-0 border-gold/30 text-gray-600 rounded-l-sm">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={bookPhone}
                        onChange={e => setBookPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9949730175"
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-r-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dk mb-1">Ceremony Doorstep Address *</label>
                  <textarea
                    required
                    value={bookAddress}
                    onChange={e => setBookAddress(e.target.value)}
                    rows={2}
                    placeholder="House / Flat / Shop / Plot number, Street, Landmark"
                    className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={bookCity}
                      onChange={e => setBookCity(e.target.value)}
                      placeholder="e.g. Khammam"
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Postal PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={bookPincode}
                      onChange={e => setBookPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 507002"
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Google Maps Location Picker */}
              <LocationPicker
                value={bookLocation}
                onChange={setBookLocation}
                onAddressDetected={(det) => {
                  if (det.address) setBookAddress(det.address);
                  if (det.city) setBookCity(det.city);
                  if (det.pincode) setBookPincode(det.pincode);
                }}
              />

              {/* WhatsApp Map Dispatch Preference */}
              <div className="bg-green-50/70 border border-green-200 p-3.5 rounded-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                    <MessageCircle size={14} className="text-green-600" />
                    Purohit WhatsApp Map Dispatch
                  </span>
                  <select
                    value={reminderHoursBefore}
                    onChange={e => setReminderHoursBefore(Number(e.target.value))}
                    className="text-xs font-semibold border border-green-300 bg-white text-green-900 px-2 py-1 rounded-sm focus:outline-none"
                  >
                    <option value={2}>2 hours prior to Muhurtham</option>
                    <option value={1}>1 hour prior to Muhurtham</option>
                    <option value={3}>3 hours prior to Muhurtham</option>
                    <option value={12}>Night before / 12 hrs prior</option>
                  </select>
                </div>
                <p className="text-[11px] text-green-800">
                  Your pinned Google Maps directions &amp; contact details will be ready to dispatch to the purohit&apos;s WhatsApp prior to the scheduled time.
                </p>
              </div>

              {/* Ritual Details */}
              <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                <div className="font-cinzel text-xs font-bold tracking-widest uppercase text-maroon">
                  Ceremony Schedule
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dk mb-1">Ritual / Occasion *</label>
                  <select
                    required
                    value={bookOccasion}
                    onChange={e => setBookOccasion(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                  >
                    <option value="">Select Pooja / Ceremony</option>
                    {POOJA_OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    <option value="Other">Other (mention in notes)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Ceremony Date *</label>
                    <input
                      type="date"
                      aria-label="Ceremony Date"
                      required
                      value={bookDate}
                      onChange={e => setBookDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Muhurtham Time *</label>
                    <input
                      type="time"
                      aria-label="Muhurtham Time"
                      required
                      value={bookTime}
                      onChange={e => setBookTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dk mb-1">Pooja Samagri / Items Arrangement *</label>
                  <select
                    value={samagriMode}
                    onChange={e => setSamagriMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
                  >
                    <option value="marketplace-30min">Order from Guru Padukam (Shipped 30 mins before event)</option>
                    <option value="purohit-brings">Purohit brings Pooja Items</option>
                    <option value="devotee-arranges">Family will arrange Pooja Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dk mb-1">Special Notes / Gotram / Requests</label>
                  <textarea
                    value={bookNotes}
                    onChange={e => setBookNotes(e.target.value)}
                    rows={2}
                    placeholder="Specify Gotram, custom ritual requests, or samagri preferences…"
                    className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm resize-none"
                  />
                </div>
              </div>

              {/* Cashfree PG / Wallet Token Summary */}
              <div className="bg-white border-2 border-gold/40 p-4 rounded-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs font-bold tracking-widest uppercase text-maroon flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-green-700" /> ₹11 Token Verification (Cashfree / Wallet)
                  </span>
                  <span className="font-cinzel text-xl font-bold text-maroon">₹11</span>
                </div>

                {walletBalance >= 11 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayVia('Wallet')}
                      className={`p-2.5 text-left rounded border text-xs transition-all ${
                        payVia === 'Wallet'
                          ? 'border-green-600 bg-green-50 text-green-900 font-bold'
                          : 'border-gold/30 bg-cream/30 text-text-dk'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-green-700" />
                        Use ₹11 Wallet Balance
                      </div>
                      <div className="text-[10px] font-normal mt-0.5">Available: ₹{walletBalance} · ₹0 extra</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayVia('Cashfree')}
                      className={`p-2.5 text-left rounded border text-xs transition-all ${
                        payVia === 'Cashfree'
                          ? 'border-maroon bg-maroon/5 text-maroon font-bold'
                          : 'border-gold/30 bg-cream/30 text-text-dk'
                      }`}
                    >
                      <div>Pay ₹11 via Cashfree PG</div>
                      <div className="text-[10px] font-normal mt-0.5">UPI / Cards / NetBanking</div>
                    </button>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-950 space-y-1">
                  <div>
                    <strong>Zero-Loss Guarantee:</strong> We verify your ₹11 payment before notifying the Purohit. You can <strong>swap dates free anytime</strong>, and if the Purohit declines due to a tight schedule, <strong>₹11 goes straight to your Wallet</strong> to book another Purohit!
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBooking || !user}
                className="w-full py-4 bg-maroon text-gold-pale font-cinzel font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gold-pale/30 border-t-gold-pale rounded-full animate-spin" />
                    Verifying ₹11 Payment &amp; Dispatching…
                  </>
                ) : payVia === 'Wallet' && walletBalance >= 11 ? (
                  '💳 Confirm Using ₹11 Wallet Balance'
                ) : (
                  '🔒 Pay ₹11 via Cashfree & Verify Booking'
                )}
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {pendingCashfree && (
        <CashfreeCheckoutModal
          order={pendingCashfree.order}
          bookingRef={pendingCashfree.bookingDraft.id}
          userId={pendingCashfree.bookingDraft.userId}
          customerName={pendingCashfree.bookingDraft.userName}
          customerPhone={pendingCashfree.bookingDraft.userPhone}
          description={`Purohit Booking: ${pendingCashfree.bookingDraft.occasion} (${pendingCashfree.bookingDraft.purohitName})`}
          onSuccess={({ cfOrderId, cfPaymentId }) => {
            const finalizedBooking: Booking = {
              ...pendingCashfree.bookingDraft,
              paymentMethod: 'Cashfree',
              paymentStatus: 'Verified',
              cashfreeOrderId: cfOrderId,
              cashfreePaymentId: cfPaymentId,
            };
            createBooking(finalizedBooking);
            addToast(
              `₹11 Cashfree Payment Verified (${cfPaymentId})! Sent to ${finalizedBooking.purohitName}.`,
              'success'
            );
            setPendingCashfree(null);
            setConfirmedBooking(finalizedBooking);
            setBookOccasion('');
            setBookDate('');
            setBookTime('');
            setBookNotes('');
          }}
          onCancel={(reason) => {
            setPendingCashfree(null);
            addToast(reason || 'Payment not completed — booking was NOT confirmed.', 'error');
          }}
        />
      )}
    </div>
  );
};
