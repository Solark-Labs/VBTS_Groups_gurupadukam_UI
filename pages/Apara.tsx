import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MapPin, Navigation, Star, ShieldCheck, Phone, Lock, Unlock,
  Users, Utensils, Video, Home as HomeIcon, Building2, Clock,
  CheckCircle, MessageCircle, X, ExternalLink, Copy, Calendar, Sparkles
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { AparaPeeta, AparaBooking, AparaRitualMode, AparaFoodPackage, GeoLocation } from '../types';
import { APARA_CEREMONY_TYPES, BRAND_CONTACT } from '../constants';
import { LocationPicker, buildGeoLocation } from '../components/LocationPicker';
import {
  calculateDistanceKm,
  getOneDayPriorDate,
  getAparaPriorDispatchInfo,
  buildAparaOrganizerWhatsAppUrl,
} from '../utils/whatsapp';
import { CashfreeOrderResponse, createCashfreeTokenOrder } from '../services/paymentService';
import { CashfreeCheckoutModal } from '../components/CashfreeCheckoutModal';
import { SplashOverlay } from '../components/SplashOverlay';

export const Apara: React.FC = () => {
  const {
    aparaPeetas,
    user,
    createAparaBooking,
    markAparaWhatsappSent,
    addAparaReview,
    addToast,
    t,
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Devotee Reference Coordinates for Live Distance Calculation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 17.2473, lng: 80.1514 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Filters
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gp_apara_splash_seen') !== '1';
    } catch {
      return false;
    }
  });
  const [ceremonyFilter, setCeremonyFilter] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | AparaRitualMode>('all');
  const [foodFilter, setFoodFilter] = useState<'all' | AparaFoodPackage>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(999);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

  // Selected Peeta for Booking vs Reviews
  const [selectedPeeta, setSelectedPeeta] = useState<AparaPeeta | null>(null);
  const [reviewPeeta, setReviewPeeta] = useState<AparaPeeta | null>(null);

  // New Review Form
  const [revRating, setRevRating] = useState<number>(5);
  const [revCeremony, setRevCeremony] = useState<string>(APARA_CEREMONY_TYPES[2]);
  const [revComment, setRevComment] = useState<string>('');

  // Booking Form State
  const [ceremonyType, setCeremonyType] = useState<string>(APARA_CEREMONY_TYPES[2]);
  const [bookDate, setBookDate] = useState<string>('');
  const [bookTime, setBookTime] = useState<string>('08:30');
  const [ritualMode, setRitualMode] = useState<AparaRitualMode>('offline-home');
  const [purohitGroup, setPurohitGroup] = useState<string>('Group of 3 Purohits');
  const [foodPackage, setFoodPackage] = useState<AparaFoodPackage>('with-food');
  const [attendeeCount, setAttendeeCount] = useState<number>(25);
  const [foodMenuType, setFoodMenuType] = useState<string>('4 Curries & 4 Pickles + Sweets & Hot');
  const [preferredItems, setPreferredItems] = useState<string>('');
  const [customizations, setCustomizations] = useState<string>('');

  const [bookName, setBookName] = useState(user?.name || '');
  const [bookPhone, setBookPhone] = useState(user?.phone || '');
  const [bookEmail, setBookEmail] = useState(user?.email || '');
  const [bookAddress, setBookAddress] = useState(user?.address || '');
  const [bookCity, setBookCity] = useState(user?.city || 'Khammam');
  const [bookPincode, setBookPincode] = useState(user?.pincode || '507002');
  const [bookLocation, setBookLocation] = useState<GeoLocation>(() =>
    buildGeoLocation(17.2473, 80.1514, 'Khammam, Telangana')
  );
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<AparaBooking | null>(null);
  const [pendingCashfree, setPendingCashfree] = useState<{
    order: CashfreeOrderResponse;
    bookingDraft: AparaBooking;
  } | null>(null);

  useEffect(() => {
    const bookId = searchParams.get('book');
    if (bookId) {
      const found = aparaPeetas.find(p => p.id === bookId);
      if (found) openBookingModal(found);
    }
  }, [searchParams, aparaPeetas]);

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

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      addToast('GPS is not supported in this browser.', 'error');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setBookLocation(buildGeoLocation(coords.lat, coords.lng, 'Current GPS Location'));
        setIsDetectingGps(false);
        addToast('Location updated! Peetas sorted by nearest distance.', 'success');
      },
      () => {
        setIsDetectingGps(false);
        addToast('Could not detect GPS permission. Using Khammam center.', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const peetasWithDistance = useMemo(() => {
    return aparaPeetas
      .map(peeta => ({
        ...peeta,
        distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, peeta.lat, peeta.lng),
      }))
      .filter(p => {
      const matchCeremony = !ceremonyFilter || p.services.some(s =>
        s.toLowerCase().includes(ceremonyFilter.toLowerCase()) || ceremonyFilter.toLowerCase().includes(s.toLowerCase())
      );
      const matchMode =
        modeFilter === 'all' ||
        (modeFilter === 'online' && p.supportsOnline) ||
        (modeFilter === 'offline-home' && p.supportsHomeService) ||
        (modeFilter === 'offline-venue' && p.supportsVenueVisit);
      const matchFood =
        foodFilter === 'all' ||
        foodFilter === 'without-food' ||
        (foodFilter === 'with-food' && p.supportsFoodPackage);
      const matchDist = p.distanceKm <= maxDistanceKm;
      return matchCeremony && matchMode && matchFood && matchDist;
      })
      .sort((a, b) => (sortBy === 'distance' ? a.distanceKm - b.distanceKm : b.rating - a.rating));
  }, [aparaPeetas, userCoords, ceremonyFilter, modeFilter, foodFilter, maxDistanceKm, sortBy]);

  useEffect(() => {
    if (!selectedPeeta) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPeeta(null);
        setConfirmedBooking(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPeeta]);

  const openBookingModal = (peeta: AparaPeeta) => {
    setSelectedPeeta(peeta);
    setConfirmedBooking(null);
    if (peeta.groupOptions.length > 0 && !peeta.groupOptions.includes(purohitGroup)) {
      setPurohitGroup(peeta.groupOptions[0]);
    }
    if (modeFilter === 'online' && peeta.supportsOnline) {
      setRitualMode('online');
    } else if (!peeta.supportsHomeService && peeta.supportsVenueVisit) {
      setRitualMode('offline-venue');
    } else {
      setRitualMode('offline-home');
    }
    if (peeta.foodPresets.length > 0) {
      setFoodMenuType(peeta.foodPresets[0]);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in or register first to confirm your ₹11 Apara booking.', 'info');
      navigate('/login');
      return;
    }
    if (!selectedPeeta) return;

    const cleanPhone = bookPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (ritualMode === 'offline-home' && !bookAddress.trim()) {
      addToast('Home address is mandatory for Home Service ceremonies.', 'error');
      return;
    }

    setIsBooking(true);

    const priorDate = getOneDayPriorDate(bookDate);
    const twoDaysPriorDate = getOneDayPriorDate(priorDate);
    const bookingId = 'APR' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: AparaBooking = {
      id: bookingId,
      userId: user.id,
      userName: bookName || user.name,
      userPhone: cleanPhone,
      userEmail: bookEmail || user.email,
      peetaId: selectedPeeta.id,
      peetaName: selectedPeeta.name,
      peetaPhone: selectedPeeta.phone || BRAND_CONTACT.phoneRaw,
      peetaAddress: selectedPeeta.address,
      ceremonyType,
      date: bookDate,
      time: bookTime,
      ritualMode,
      purohitGroup,
      foodPackage,
      attendeeCount: Number(attendeeCount) || 10,
      foodMenuType: foodPackage === 'with-food' ? foodMenuType : undefined,
      preferredItems: foodPackage === 'with-food' ? preferredItems : undefined,
      customizations: foodPackage === 'with-food' ? customizations : undefined,
      address: ritualMode === 'offline-home' ? bookAddress : selectedPeeta.address,
      city: ritualMode === 'offline-home' ? bookCity : selectedPeeta.city,
      pincode: bookPincode,
      location: ritualMode === 'offline-home'
        ? bookLocation
        : buildGeoLocation(selectedPeeta.lat, selectedPeeta.lng, selectedPeeta.address),
      status: 'Confirmed',
      tokenFee: BRAND_CONTACT.bookingTokenFee,
      contactRevealed: true,
      priorDispatchDate: priorDate,
      foodEditableUntil: twoDaysPriorDate,
      emergencyReplacementGuaranteed: true,
      whatsappDispatchStatus: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    const cfOrder = await createCashfreeTokenOrder({
      bookingRef: bookingId,
      customerName: bookName || user.name,
      customerPhone: cleanPhone,
      customerEmail: bookEmail || user.email,
    });
    setPendingCashfree({ order: cfOrder, bookingDraft: newBooking });
    setIsBooking(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewPeeta) return;
    if (!revComment.trim()) {
      addToast('Please write a brief feedback note.', 'error');
      return;
    }
    addAparaReview(reviewPeeta.id, {
      userName: user?.name || 'Verified Devotee',
      rating: revRating,
      ceremonyType: revCeremony,
      comment: revComment.trim(),
    });
    // Refresh active review modal view from updated list
    setRevComment('');
    setRevRating(5);
    setReviewPeeta(null);
  };

  const formatMaskedPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return `+${clean.slice(0, 2)} ${clean.slice(2, 7)} •••••`;
  };

  const priorPreviewInfo = getAparaPriorDispatchInfo(bookDate);
  const dismissSplash = () => {
    try {
      localStorage.setItem('gp_apara_splash_seen', '1');
    } catch {
      // Ignore storage error
    }
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-cream pt-[96px]">

      {/* ─── APARA SPLASH SCREEN (REUSABLE PRODUCTION-GRADE OVERLAY) ─── */}
      <SplashOverlay
        visible={showSplash}
        onDismiss={dismissSplash}
        eyebrow="ॐ पितृभ्यो नमः"
        title={t('aparaSplashTitle')}
        subtitle={t('aparaSplashSub')}
        features={[
          { icon: '🕉️', title: t('aparaSplashP1Title'), desc: t('aparaSplashP1Desc') },
          { icon: '🍛', title: t('aparaSplashP2Title'), desc: t('aparaSplashP2Desc') },
          { icon: '🛡️', title: t('aparaSplashP3Title'), desc: t('aparaSplashP3Desc') },
        ]}
        ctaLabel={t('aparaSplashCta')}
      />

      {/* HERO */}
      <section className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk py-12 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 opacity-5 pointer-events-none bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('/logo.png')" }} />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-1.5 rounded-full">
            <Sparkles size={13} className="text-gold" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-gold-lt">
              {t('aparaBadge')}
            </span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,4vw,3.3rem)] font-bold text-cream leading-tight">
            {t('aparaTitle')}
          </h1>
          <p className="text-sm sm:text-base text-cream/85 max-w-3xl mx-auto">
            {t('aparaDesc')}
          </p>

          {/* GPS & Distance Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-2 bg-gold text-maroon-dk font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm shadow hover:bg-gold-lt transition-colors"
            >
              <Navigation size={14} />
              {isDetectingGps ? 'Detecting GPS…' : t('aparaDetectGps')}
            </button>
            <div className="bg-white/10 border border-gold/30 text-cream text-xs px-3.5 py-2.5 rounded-sm flex items-center gap-2">
              <MapPin size={13} className="text-gold" />
              <span>Ref Location: {userCoords.lat.toFixed(3)}°N, {userCoords.lng.toFixed(3)}°E</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSplash(true)}
              className="inline-flex items-center gap-1.5 border border-gold/40 bg-maroon-dk/60 text-gold-lt font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-gold/20 transition-colors"
            >
              <Sparkles size={13} /> {t('aparaHowItWorks')}
            </button>
          </div>
        </div>
      </section>

      {/* FILTER BAR & PEETA GRID */}
      <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="bg-white border border-gold/20 p-5 rounded-sm shadow-sm space-y-4">
            <h3 className="font-cinzel text-xs font-bold tracking-widest uppercase text-maroon border-b border-gold/15 pb-2.5">
              {t('aparaFilterTitle')}
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-md mb-1.5">{t('aparaCeremonyType')}</label>
              <select
                value={ceremonyFilter}
                onChange={e => setCeremonyFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
              >
                <option value="">{t('aparaAllCeremonies')}</option>
                {APARA_CEREMONY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-md mb-1.5">Ritual Mode</label>
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
              >
                <option value="all">All Modes (Online / Offline)</option>
                <option value="offline-home">Offline — Home Service</option>
                <option value="offline-venue">Offline — Visit Peeta Venue</option>
                <option value="online">Online — Video Sankalpam</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-md mb-1.5">Food / Bhojanam</label>
              <select
                value={foodFilter}
                onChange={e => setFoodFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
              >
                <option value="all">Both (With or Without Food)</option>
                <option value="with-food">With Traditional Bhojanam</option>
                <option value="without-food">Ritual Only (Without Food)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-md mb-1.5">Maximum Distance</label>
              <select
                value={maxDistanceKm}
                onChange={e => setMaxDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
              >
                <option value={999}>Any Distance</option>
                <option value={5}>Within 5 km</option>
                <option value={15}>Within 15 km</option>
                <option value={100}>Within 100 km</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-md mb-1.5">Sort Peetas By</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`py-2 text-xs font-bold rounded-sm border transition-colors ${sortBy === 'distance' ? 'bg-maroon text-gold-pale border-maroon' : 'bg-white text-text-md border-gold/30'}`}
                >
                  Nearest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`py-2 text-xs font-bold rounded-sm border transition-colors ${sortBy === 'rating' ? 'bg-maroon text-gold-pale border-maroon' : 'bg-white text-text-md border-gold/30'}`}
                >
                  Top Rated
                </button>
              </div>
            </div>

            {(ceremonyFilter || modeFilter !== 'all' || foodFilter !== 'all' || maxDistanceKm !== 999) && (
              <button
                type="button"
                onClick={() => {
                  setCeremonyFilter('');
                  setModeFilter('all');
                  setFoodFilter('all');
                  setMaxDistanceKm(999);
                }}
                className="w-full py-2 border border-maroon text-maroon text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={13} /> Reset All Filters
              </button>
            )}
          </div>

          {/* Guru Padukam Concierge & Guarantees Card */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm space-y-2.5">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Guru Padukam ₹11 Support
            </div>
            <ul className="text-xs text-amber-950/90 space-y-1.5 leading-relaxed">
              <li>• <strong>2-Day Prior Food Edits:</strong> Customize curries, sweets &amp; guest count up to 2 days before the ritual.</li>
              <li>• <strong>Emergency Swap Guarantee:</strong> If any organization closes on emergency, we immediately assign the next available team ASAP.</li>
              <li>• <strong>1-Day Prior Checklist:</strong> Sent to organizer WhatsApp automatically.</li>
            </ul>
          </div>
        </aside>

        {/* PEETAS LISTING */}
        <div className="flex-1 space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="font-cinzel text-xs tracking-widest uppercase text-text-md">
              Showing <strong className="text-maroon">{peetasWithDistance.length}</strong> Verified Apara Peetas
            </span>
          </div>

          {peetasWithDistance.length === 0 ? (
            <div className="bg-white border border-gold/20 p-12 text-center rounded-sm">
              <p className="font-cinzel text-base text-text-md">No Apara Peetas match your current filters or distance radius.</p>
              <button
                type="button"
                onClick={() => {
                  setCeremonyFilter('');
                  setModeFilter('all');
                  setFoodFilter('all');
                  setMaxDistanceKm(999);
                }}
                className="mt-4 px-5 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {peetasWithDistance.map((peeta) => (
                <div
                  key={peeta.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/apara/${peeta.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/apara/${peeta.id}`); } }}
                  className="bg-white border border-gold/25 hover:border-gold rounded-sm p-6 shadow-sm hover:shadow-lg transition-all space-y-4 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={peeta.image}
                          alt={peeta.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gold/40 bg-cream"
                        />
                        {peeta.verified && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xl font-bold text-maroon">
                            {peeta.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-800 border border-green-200 px-2.5 py-0.5 rounded-full">
                            <MapPin size={11} /> {peeta.distanceKm} km away
                          </span>
                        </div>
                        <p className="font-telugu text-xs text-text-lt mt-0.5">{peeta.nameTe} · Lead: {peeta.organizerName}</p>
                        <p className="text-xs text-text-md mt-1 flex items-center gap-1.5">
                          <Building2 size={12} className="text-gold-dk shrink-0" />
                          {peeta.address}
                        </p>
                      </div>
                    </div>

                    {/* Rating & Experience */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setReviewPeeta(peeta); }}
                        className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
                      >
                        <Star size={13} className="text-gold fill-gold" />
                        <span className="font-bold text-xs text-maroon">{peeta.rating}</span>
                        <span className="text-[11px] text-text-md">({peeta.reviewCount} reviews)</span>
                      </button>
                      <span className="text-[11px] text-text-lt font-medium">{peeta.experienceYears}+ yrs Vedic Seva</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-md leading-relaxed">{peeta.bio}</p>

                  {/* Sub-categories: Group Size, Modes, Food */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-cream/60 border border-gold/15 p-3.5 rounded-sm text-xs">
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-maroon mb-1 flex items-center gap-1">
                        <Users size={12} /> Purohit Group Options
                      </div>
                      <div className="text-text-dk font-medium">{peeta.groupOptions.join(' · ')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-maroon mb-1 flex items-center gap-1">
                        <Video size={12} /> Modes &amp; Venue
                      </div>
                      <div className="text-text-dk font-medium">
                        {[
                          peeta.supportsOnline && 'Online',
                          peeta.supportsHomeService && 'Home Service',
                          peeta.supportsVenueVisit && `Peeta Venue (up to ${peeta.maxGuestsAtVenue} guests)`,
                        ].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-maroon mb-1 flex items-center gap-1">
                        <Utensils size={12} /> Food Customization
                      </div>
                      <div className="text-text-dk font-medium">
                        Ritual Only OR Bhojanam (3/4 Curries &amp; Pickles, Sweets/Hot)
                      </div>
                    </div>
                  </div>

                  {/* Services Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {peeta.services.map(s => (
                      <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-maroon/5 text-maroon border border-maroon/15 px-2.5 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Masked Contact + Actions */}
                  <div className="border-t border-gold/15 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-xs bg-ivory border border-gold/25 px-3 py-2 rounded-sm">
                      <Lock size={13} className="text-maroon shrink-0" />
                      <span className="text-text-md">
                        Direct Contact: <strong className="font-mono text-maroon">{peeta.phone ? formatMaskedPhone(peeta.phone) : '+91 ••••• •••••'}</strong>
                        <span className="text-[11px] text-text-lt ml-1.5">(Revealed on ₹11 token)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openBookingModal(peeta); }}
                        className="flex-1 sm:flex-initial bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase px-6 py-2.5 clip-btn hover:bg-maroon-md transition-colors shadow"
                      >
                        {t('navBook11')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ APARA BOOKING & CUSTOMIZATION MODAL ══════════════ */}
      {selectedPeeta && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-text-dk/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-cream shadow-2xl rounded-sm overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-maroon p-5 flex justify-between items-start">
              <div>
                <div className="font-cinzel text-xs tracking-widest uppercase text-gold mb-1">
                  {confirmedBooking ? '₹11 Paid · Contact Unlocked' : 'Apara Seva Booking · ₹11 Token'}
                </div>
                <h2 className="font-serif text-xl font-bold text-cream">{selectedPeeta.name}</h2>
                <p className="font-telugu text-xs text-cream/70">{selectedPeeta.nameTe} · {selectedPeeta.organizerName}</p>
              </div>
              <button
                onClick={() => { setSelectedPeeta(null); setConfirmedBooking(null); }}
                className="text-cream/60 hover:text-cream"
              >
                <X size={20} />
              </button>
            </div>

            {confirmedBooking ? (
              /* ─── POST-BOOKING: CONTACT REVEALED + 1-DAY PRIOR WHATSAPP CHECKLIST ─── */
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-green-50 border border-green-300 p-4 rounded-sm space-y-2">
                  <div className="flex items-center gap-2 text-green-900 font-cinzel text-sm font-bold">
                    <Unlock size={18} className="text-green-600" />
                    Direct Peeta Contact Revealed! (Booking {confirmedBooking.id})
                  </div>
                  <div className="bg-white border border-green-200 p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-text-lt">Organization Lead &amp; Phone</div>
                      <div className="text-base font-bold text-maroon">
                        +{confirmedBooking.peetaPhone.slice(0, 2)} {confirmedBooking.peetaPhone.slice(2)}
                      </div>
                      <div className="text-xs text-text-md">{confirmedBooking.peetaAddress}</div>
                    </div>
                    <a
                      href={`tel:+${confirmedBooking.peetaPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-maroon-md"
                    >
                      <Phone size={14} /> Call Peeta Directly
                    </a>
                  </div>
                </div>

                {/* 1-Day Prior Checklist Card */}
                <div className="bg-white border border-gold/30 p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
                      <Calendar size={14} /> 1-Day Prior Organizer Checklist
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900">
                      Prior Alert Date: {confirmedBooking.priorDispatchDate || '1 Day Before'}
                    </span>
                  </div>

                  <div className="text-xs text-text-dk bg-cream/70 p-3.5 rounded-sm border border-gold/15 space-y-1.5">
                    <div><strong>Ceremony:</strong> {confirmedBooking.ceremonyType} on <strong>{confirmedBooking.date}</strong> at <strong>{confirmedBooking.time}</strong></div>
                    <div><strong>Mode:</strong> {confirmedBooking.ritualMode === 'online' ? 'Online Video Sankalpam' : confirmedBooking.ritualMode === 'offline-home' ? 'Offline — Home Service' : 'Offline — At Peeta Venue'}</div>
                    <div><strong>Purohit Team:</strong> {confirmedBooking.purohitGroup}</div>
                    <div><strong>Total Attendees:</strong> {confirmedBooking.attendeeCount} Members</div>
                    <div>
                      <strong>Food Package:</strong>{' '}
                      {confirmedBooking.foodPackage === 'with-food'
                        ? `With Bhojanam (${confirmedBooking.foodMenuType})`
                        : 'Without Food (Ritual Only)'}
                    </div>
                    {confirmedBooking.preferredItems && (
                      <div><strong>Preferred Items:</strong> {confirmedBooking.preferredItems}</div>
                    )}
                    {confirmedBooking.customizations && (
                      <div><strong>Customizations:</strong> {confirmedBooking.customizations}</div>
                    )}
                    {confirmedBooking.location && (
                      <div className="pt-1">
                        <a
                          href={confirmedBooking.location.directionsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-maroon font-bold underline inline-flex items-center gap-1"
                        >
                          Open Google Maps Directions <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-text-md leading-relaxed">
                    So the Peeta organizer stays cautious and prepares all items on time (<strong>1 day prior: {confirmedBooking.priorDispatchDate}</strong>), send this complete checklist &amp; Google Maps link to their WhatsApp:
                  </p>

                  <a
                    href={buildAparaOrganizerWhatsAppUrl(confirmedBooking)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => markAparaWhatsappSent(confirmedBooking.id)}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#1fb858] text-white font-cinzel text-xs font-bold tracking-widest uppercase rounded-sm shadow flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={17} /> Send Checklist &amp; Map to Peeta WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `Booking ${confirmedBooking.id} | ${confirmedBooking.ceremonyType} on ${confirmedBooking.date} ${confirmedBooking.time} | ${confirmedBooking.purohitGroup} | Attendees: ${confirmedBooking.attendeeCount} | Food: ${confirmedBooking.foodPackage === 'with-food' ? confirmedBooking.foodMenuType : 'Without Food'} | Preferred: ${confirmedBooking.preferredItems || 'None'}`
                      );
                      addToast('Checklist copied to clipboard!', 'success');
                    }}
                    className="w-full py-2.5 border border-gold/40 text-maroon font-cinzel text-xs font-bold uppercase rounded-sm hover:bg-gold/10 flex items-center justify-center gap-1.5"
                  >
                    <Copy size={13} /> Copy Checklist Summary
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setSelectedPeeta(null); setConfirmedBooking(null); navigate('/track-order'); }}
                    className="flex-1 py-3 bg-maroon text-gold-pale font-cinzel text-xs font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md"
                  >
                    View My Bookings
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedPeeta(null); setConfirmedBooking(null); }}
                    className="px-5 py-3 border border-maroon/30 text-maroon font-cinzel text-xs font-bold uppercase rounded-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* ─── BOOKING FORM ─── */
              <form onSubmit={handleBookSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {!user && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-sm text-sm text-amber-900">
                    <strong>Login Required:</strong> Please{' '}
                    <button type="button" onClick={() => { setSelectedPeeta(null); navigate('/login'); }} className="font-bold underline text-maroon">
                      sign in or register
                    </button>{' '}
                    to unlock Peeta contact with ₹11 token.
                  </div>
                )}

                {/* 1. Ceremony, Date & Mode */}
                <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                  <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">
                    1. Ceremony, Schedule &amp; Ritual Mode
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Ceremony Type *</label>
                    <select
                      required
                      value={ceremonyType}
                      onChange={e => setCeremonyType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                    >
                      {selectedPeeta.services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">Ceremony Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookDate}
                        onChange={e => setBookDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">Time *</label>
                      <input
                        type="time"
                        required
                        value={bookTime}
                        onChange={e => setBookTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                      />
                    </div>
                  </div>

                  {bookDate && (
                    <div className="text-[11px] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-sm text-amber-900">
                      🗓️ <strong>1-Day Prior WhatsApp Alert:</strong> Items checklist will be scheduled for dispatch on <strong>{priorPreviewInfo.formattedPrior}</strong>.
                    </div>
                  )}

                  {/* Ritual Mode Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1.5">Ritual Mode *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedPeeta.supportsHomeService && (
                        <button
                          type="button"
                          onClick={() => setRitualMode('offline-home')}
                          className={`p-2.5 rounded-sm border text-left transition-all ${
                            ritualMode === 'offline-home'
                              ? 'border-maroon bg-maroon/5 ring-1 ring-maroon'
                              : 'border-gold/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-maroon">
                            <HomeIcon size={13} /> Offline: Home
                          </div>
                          <div className="text-[10px] text-text-lt mt-0.5">Peeta visits your home</div>
                        </button>
                      )}
                      {selectedPeeta.supportsVenueVisit && (
                        <button
                          type="button"
                          onClick={() => setRitualMode('offline-venue')}
                          className={`p-2.5 rounded-sm border text-left transition-all ${
                            ritualMode === 'offline-venue'
                              ? 'border-maroon bg-maroon/5 ring-1 ring-maroon'
                              : 'border-gold/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-maroon">
                            <Building2 size={13} /> Offline: Peeta Venue
                          </div>
                          <div className="text-[10px] text-text-lt mt-0.5">Visit organization hall</div>
                        </button>
                      )}
                      {selectedPeeta.supportsOnline && (
                        <button
                          type="button"
                          onClick={() => setRitualMode('online')}
                          className={`p-2.5 rounded-sm border text-left transition-all ${
                            ritualMode === 'online'
                              ? 'border-maroon bg-maroon/5 ring-1 ring-maroon'
                              : 'border-gold/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-maroon">
                            <Video size={13} /> Online Sankalpam
                          </div>
                          <div className="text-[10px] text-text-lt mt-0.5">Live video guidance</div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Purohit Group Size */}
                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">Purohit Group Size *</label>
                    <select
                      value={purohitGroup}
                      onChange={e => setPurohitGroup(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                    >
                      {selectedPeeta.groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* 2. Food Package & Customizations */}
                <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                  <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">
                    2. Attendee Count &amp; Food Package
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFoodPackage('with-food')}
                      disabled={!selectedPeeta.supportsFoodPackage}
                      className={`p-3 rounded-sm border text-left ${
                        foodPackage === 'with-food'
                          ? 'border-maroon bg-maroon/5 ring-1 ring-maroon'
                          : 'border-gold/30 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-maroon flex items-center gap-1.5">
                        <Utensils size={13} /> With Food (Bhojanam)
                      </div>
                      <div className="text-[10px] text-text-lt mt-0.5">Curries, pickles, sweets &amp; hot</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodPackage('without-food')}
                      className={`p-3 rounded-sm border text-left ${
                        foodPackage === 'without-food'
                          ? 'border-maroon bg-maroon/5 ring-1 ring-maroon'
                          : 'border-gold/30 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-maroon">Without Food</div>
                      <div className="text-[10px] text-text-lt mt-0.5">Ritual &amp; Purohits only</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dk mb-1">How Many People Will Attend? *</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        max={500}
                        required
                        value={attendeeCount}
                        onChange={e => setAttendeeCount(Number(e.target.value))}
                        className="w-28 px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                      />
                      {[10, 25, 50, 100].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setAttendeeCount(cnt)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-sm border ${
                            attendeeCount === cnt ? 'bg-maroon text-gold-pale border-maroon' : 'bg-cream border-gold/30 text-maroon'
                          }`}
                        >
                          {cnt} People
                        </button>
                      ))}
                    </div>
                  </div>

                  {foodPackage === 'with-food' && (
                    <div className="space-y-3 pt-1 border-t border-gold/15">
                      <div>
                        <label className="block text-xs font-semibold text-text-dk mb-1">Food Menu Type *</label>
                        <select
                          value={foodMenuType}
                          onChange={e => setFoodMenuType(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                        >
                          {selectedPeeta.foodPresets.map(f => <option key={f} value={f}>{f}</option>)}
                          <option value="Custom Menu">Custom Menu (Mention below)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-dk mb-1">Preferred Curries, Pickles, Sweets &amp; Hot Items</label>
                        <input
                          type="text"
                          value={preferredItems}
                          onChange={e => setPreferredItems(e.target.value)}
                          placeholder="e.g. Bobbatlu, Payasam, Garelu, Pulihora, Gutti Vankaya, Gongura Pickle"
                          className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-dk mb-1">Food Customizations / Dietary Notes</label>
                        <textarea
                          rows={2}
                          value={customizations}
                          onChange={e => setCustomizations(e.target.value)}
                          placeholder="e.g. Strictly no onion/garlic, low spice for elders, traditional banana leaf serving…"
                          className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Devotee Details & Google Maps */}
                <div className="bg-white border border-gold/20 p-4 rounded-sm space-y-3">
                  <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">
                    3. Devotee Details &amp; Location
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={bookName}
                        onChange={e => setBookName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-dk mb-1">Mobile Number (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={bookPhone}
                        onChange={e => setBookPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9949730175"
                        className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon"
                      />
                    </div>
                  </div>

                  {ritualMode === 'offline-home' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-dk mb-1">Home Ceremony Address *</label>
                        <textarea
                          required
                          rows={2}
                          value={bookAddress}
                          onChange={e => setBookAddress(e.target.value)}
                          placeholder="House/Flat No, Street, Landmark"
                          className="w-full px-3 py-2 text-sm border border-gold/30 bg-cream/30 rounded-sm focus:outline-none focus:border-maroon resize-none"
                        />
                      </div>
                      <LocationPicker
                        compact
                        value={bookLocation}
                        onChange={setBookLocation}
                        onAddressDetected={(det) => {
                          if (det.address) setBookAddress(det.address);
                          if (det.city) setBookCity(det.city);
                          if (det.pincode) setBookPincode(det.pincode);
                        }}
                      />
                    </>
                  )}

                  {ritualMode === 'offline-venue' && (
                    <div className="bg-ivory border border-gold/30 p-3 rounded-sm text-xs flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-bold text-maroon">Peeta Venue Address:</div>
                        <div className="text-text-md">{selectedPeeta.address}</div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPeeta.lat},${selectedPeeta.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-maroon underline"
                      >
                        Directions to Peeta <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Submit ₹11 */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-xs text-amber-950 space-y-1">
                  <div className="font-bold">What your ₹11 Guru Padukam Token includes:</div>
                  <div>✓ Full Guru Padukam concierge support at every step · ✓ Purohits will contact you shortly · ✓ Food customizable up to 2 days prior · ✓ Emergency Peeta swap guarantee</div>
                </div>
                <button
                  type="submit"
                  disabled={isBooking || !user}
                  className="w-full py-4 bg-maroon text-gold-pale font-cinzel font-bold tracking-widest uppercase clip-btn hover:bg-maroon-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                >
                  {isBooking ? 'Confirming & Activating Concierge…' : '🙏 Pay ₹11 Token & Confirm Support'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ RATINGS & FEEDBACK MODAL ══════════════ */}
      {reviewPeeta && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-text-dk/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-cream shadow-2xl rounded-sm overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-maroon p-5 flex justify-between items-start">
              <div>
                <div className="font-cinzel text-xs uppercase tracking-widest text-gold mb-1">Devotee Ratings &amp; Feedback</div>
                <h3 className="font-serif text-lg font-bold text-cream">{reviewPeeta.name}</h3>
              </div>
              <button onClick={() => setReviewPeeta(null)} className="text-cream/60 hover:text-cream">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Summary */}
              <div className="bg-white border border-gold/25 p-4 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-maroon font-serif">{reviewPeeta.rating}</div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={14} className={n <= Math.round(reviewPeeta.rating) ? 'text-gold fill-gold' : 'text-gray-300'} />
                      ))}
                    </div>
                    <div className="text-xs text-text-lt mt-0.5">Based on {reviewPeeta.reviewCount} verified ceremonies</div>
                  </div>
                </div>
                <ShieldCheck size={24} className="text-green-600" />
              </div>

              {/* Submit Feedback Form */}
              <form onSubmit={handleReviewSubmit} className="bg-white border border-gold/25 p-4 rounded-sm space-y-3">
                <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">Share Your Experience</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-md">Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star size={20} className={star <= revRating ? 'text-gold fill-gold' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
                <select
                  value={revCeremony}
                  onChange={e => setRevCeremony(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm"
                >
                  {reviewPeeta.services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea
                  rows={2}
                  required
                  value={revComment}
                  onChange={e => setRevComment(e.target.value)}
                  placeholder="How was the Peeta's punctuality, Vedic rituals, and Bhojanam quality?"
                  className="w-full px-3 py-2 text-xs border border-gold/30 bg-cream/30 rounded-sm resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-maroon text-gold-pale font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-maroon-md"
                >
                  Submit Feedback
                </button>
              </form>

              {/* Existing Reviews */}
              <div className="space-y-3">
                <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-text-md">Recent Devotee Feedback</div>
                {reviewPeeta.reviewsList.map(r => (
                  <div key={r.id} className="bg-white border border-gold/15 p-3.5 rounded-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-maroon">{r.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={11} className={n <= r.rating ? 'text-gold fill-gold' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-text-lt uppercase tracking-wider">{r.ceremonyType} · {r.date}</div>
                    <p className="text-xs text-text-md leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
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
          description={`Apara Seva: ${pendingCashfree.bookingDraft.ceremonyType} (${pendingCashfree.bookingDraft.peetaName})`}
          onSuccess={() => {
            createAparaBooking(pendingCashfree.bookingDraft);
            setConfirmedBooking(pendingCashfree.bookingDraft);
            addToast(`₹11 Cashfree Payment Verified! ${pendingCashfree.bookingDraft.peetaName} contact revealed.`, 'success');
            setPendingCashfree(null);
          }}
          onCancel={(reason) => {
            setPendingCashfree(null);
            addToast(reason || 'Payment not completed — Apara booking was NOT confirmed.', 'error');
          }}
        />
      )}
    </div>
  );
};
