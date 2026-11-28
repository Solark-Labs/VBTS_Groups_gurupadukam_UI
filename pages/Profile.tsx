import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon, MapPin, Lock, Bell, Save, Loader2, Globe, Camera,
  CalendarCheck, Package, Phone, ExternalLink, CheckCircle2, Sparkles, X,
  Wallet, RefreshCw, XCircle, ShieldCheck, Navigation
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { PAN_INDIA_LANGUAGES, LanguageCode, getLanguageMeta } from '../i18n/languages';
import { BRAND_CONTACT } from '../constants';
import { getBookingCancellationPolicy } from '../utils/bookingRules';
import { Booking, AparaBooking, Order } from '../types';
import { firebaseMock } from '../services/firebaseMock';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import { InvoiceModal } from '../components/InvoiceModal';

type ProfileTab =
  | 'personal'
  | 'bookings'
  | 'cancelled'
  | 'refunds'
  | 'language'
  | 'address'
  | 'security'
  | 'notifications';

export const Profile: React.FC = () => {
  const {
    user, updateProfile, changePassword, isAuthLoading, addToast,
    language, setLanguage, t,
    bookings, aparaBookings, orders,
    walletBalance, walletTransactions,
    pushPermission, pushEnabled, setPushEnabled, requestPushPermission, sendTestPush,
  } = useAppContext();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [selectedDetail, setSelectedDetail] = useState<{
    booking?: Booking;
    apara?: AparaBooking;
    order?: Order;
  } | null>(null);
  const [showInvoiceOrder, setShowInvoiceOrder] = useState<Order | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);
  const [locAutoAttempted, setLocAutoAttempted] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false });

  // Category filter
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState<'all' | 'ritual' | 'apara' | 'orders'>('all');

  // Password State (Mock)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name || '');
      setPhone(user.phone || '');
      setProfileImage(user.profileImage);
      setSelectedLang(user.preferredLanguage || language);
      setAddress(user.address || '');
      setCity(user.city || '');
      setPincode(user.pincode || '');
      if (user.notifications) {
        setNotifications(user.notifications);
      }
    }
  }, [user, navigate, language]);

  if (!user) return null;

  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const allMyPurohitBookings = bookings.filter(
    b => b.userId === user.id || b.userEmail === user.email || (cleanPhone && b.userPhone.replace(/\D/g, '') === cleanPhone)
  );
  const activePurohitBookings = allMyPurohitBookings.filter(
    b => b.status !== 'Rejected by Purohit' && b.status !== 'Cancelled'
  );
  const cancelledPurohitBookings = allMyPurohitBookings.filter(
    b => b.status === 'Rejected by Purohit' || b.status === 'Cancelled'
  );

  const allMyApara = aparaBookings.filter(
    b => b.userId === user.id || b.userEmail === user.email || (cleanPhone && b.userPhone.replace(/\D/g, '') === cleanPhone)
  );
  const activeAparaBookings = allMyApara.filter(a => a.status !== 'Cancelled');
  const cancelledAparaBookings = allMyApara.filter(a => a.status === 'Cancelled');

  const allMyOrders = orders.filter(
    o => o.userId === user.id || o.userEmail === user.email
  );
  const activeOrders = allMyOrders.filter(o => o.status !== 'Cancelled');
  const cancelledOrders = allMyOrders.filter(o => o.status === 'Cancelled');

  const activeBookingsCount = activePurohitBookings.length + activeAparaBookings.length + activeOrders.length;
  const cancelledCount = cancelledPurohitBookings.length + cancelledAparaBookings.length + cancelledOrders.length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setProfileImage(dataUrl);
        await updateProfile({ profileImage: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setProfileImage(undefined);
    await updateProfile({ profileImage: undefined });
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, phone, profileImage });
  };

  const handleSaveLanguage = async (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    await updateProfile({ preferredLanguage: langCode });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ address, city, pincode });
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ notifications });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }
    const ok = await changePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const isTe = language === 'te';

  const detectLocation = useCallback((silent = false) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (!silent) addToast(isTe ? 'ఈ బ్రౌజర్‌లో స్థానం గుర్తింపు అందుబాటులో లేదు.' : 'Location detection is not supported in this browser.', 'error');
      return;
    }
    setIsDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data?.address || {};
          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
          const detectedPin = String(addr.postcode || '').replace(/\D/g, '').slice(0, 6);
          if (detectedCity) setCity(detectedCity);
          if (detectedPin) setPincode(detectedPin);
          if (!address && data?.display_name) {
            setAddress(String(data.display_name).split(',').slice(0, 3).join(', ').trim());
          }
          if (!silent) {
            addToast(
              isTe ? 'మీ స్థానం & పిన్ కోడ్ గుర్తించబడ్డాయి!' : 'Location & PIN code detected!',
              'success'
            );
          }
        } catch {
          if (!silent) addToast(isTe ? 'దయచేసి నగరం & పిన్ నమోదు చేయండి.' : 'Could not fetch address details. Please enter manually.', 'info');
        } finally {
          setIsDetectingLoc(false);
        }
      },
      () => {
        setIsDetectingLoc(false);
        if (!silent) addToast(isTe ? 'స్థానం అనుమతి నిరాకరించబడింది.' : 'Location permission denied.', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [addToast, address, isTe]);

  useEffect(() => {
    if (activeTab === 'address' && !locAutoAttempted && (!city || !pincode || !address)) {
      setLocAutoAttempted(true);
      detectLocation(true);
    }
  }, [activeTab, locAutoAttempted, city, pincode, address, detectLocation]);

  const currentLangMeta = getLanguageMeta(language);

  const tabs: { id: ProfileTab; label: string; icon: React.ComponentType<{ size?: number }>; badge?: number | string }[] = [
    { id: 'personal', label: t('tabPersonal'), icon: UserIcon },
    { id: 'bookings', label: t('tabBookings'), icon: CalendarCheck, badge: activeBookingsCount },
    { id: 'cancelled', label: isTe ? 'రద్దు చేసినవి' : 'Cancelled', icon: XCircle, badge: cancelledCount },
    { id: 'refunds', label: isTe ? 'వాలెట్ & వాపసు' : 'Wallet & Refunds', icon: Wallet, badge: walletBalance > 0 ? `₹${walletBalance}` : undefined },
    { id: 'language', label: t('tabLanguage'), icon: Globe },
    { id: 'address', label: t('tabAddress'), icon: MapPin },
    { id: 'security', label: t('tabSecurity'), icon: Lock },
    { id: 'notifications', label: t('tabNotifications'), icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-8 pt-28">
      <div className="max-w-6xl mx-auto">

        {/* Top Profile Header Card */}
        <div className="mb-8 bg-white border border-gold/30 rounded-lg shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gold shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-maroon text-gold-lt flex items-center justify-center font-serif text-2xl font-bold border-2 border-gold shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                title={profileImage ? t('changePhoto') : t('uploadPhoto')}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold text-maroon-dk flex items-center justify-center shadow cursor-pointer hover:scale-105 transition-transform border border-white"
              >
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-maroon tracking-wider uppercase">
                {t('myProfile')}
              </h1>
              <p className="text-sm text-text-md mt-0.5">{user.name} · {user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-maroon/10 text-maroon border border-maroon/20">
                  Role: {user.role}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold/20 text-maroon-dk border border-gold/40 flex items-center gap-1">
                  <Globe size={11} /> {currentLangMeta.nativeName} ({currentLangMeta.name})
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200 flex items-center gap-1">
                  <Wallet size={11} /> Wallet: ₹{walletBalance}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/purohits"
              className="px-4 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded hover:bg-maroon-md transition-colors"
            >
              🙏 {t('navBook11')}
            </Link>
            <Link
              to="/track-order"
              className="px-4 py-2 border border-gold/50 text-maroon text-xs font-bold uppercase tracking-wider rounded hover:bg-gold/10 transition-colors"
            >
              📍 Track ID
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-gold/20 shadow-sm rounded-lg overflow-hidden flex flex-col">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-5 py-3.5 font-cinzel text-xs tracking-wider uppercase transition-colors border-l-4 ${
                      isActive
                        ? 'border-maroon bg-maroon/5 text-maroon font-bold'
                        : 'border-transparent text-text-md hover:bg-cream/50 hover:text-maroon'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      {tab.label}
                    </span>
                    {tab.badge !== undefined && tab.badge !== 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-maroon text-gold-pale">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-gold/20 shadow-sm rounded-lg p-6 md:p-8">

            {/* Personal Info + Profile Photo */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonal} className="space-y-6 animate-slide-up">
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">
                  {t('tabPersonal')}
                </h2>

                {/* Photo Upload Box */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-cream/40 border border-gold/25 rounded-md">
                  {profileImage ? (
                    <img src={profileImage} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gold shadow" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-maroon/10 border border-dashed border-maroon/40 flex items-center justify-center text-maroon">
                      <Camera size={26} />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="font-cinzel text-sm font-bold text-maroon">
                      {profileImage ? t('changePhoto') : t('uploadPhoto')}
                    </div>
                    <p className="text-xs text-text-md mt-0.5">
                      {isTe
                        ? 'మీ గురు పాదుకం ప్రొఫైల్ కోసం స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి.'
                        : 'Upload a clear photo for your Guru Padukam devotee/purohit profile.'}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                      <label className="cursor-pointer px-4 py-1.5 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded hover:bg-maroon-md transition-colors">
                        {profileImage ? t('changePhoto') : t('uploadPhoto')}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 border border-red-300 text-red-700 text-xs font-bold rounded hover:bg-red-50 flex items-center gap-1"
                        >
                          <X size={13} /> {isTe ? 'తొలగించండి' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'పూర్తి పేరు' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'ఇమెయిల్ చిరునామా' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded"
                    />
                    <p className="text-[0.65rem] text-gray-400 mt-1">
                      {isTe ? 'ఇమెయిల్ మార్చలేరు.' : 'Email cannot be changed.'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'ఫోన్ నంబర్' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={isTe ? '10-అంకెల మొబైల్ నంబర్' : '10-digit mobile (starts with 6-9)'}
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="bg-maroon text-gold-pale px-8 py-3 clip-btn hover:bg-maroon-md transition-colors flex items-center gap-2 font-cinzel tracking-widest uppercase text-sm disabled:opacity-70"
                  >
                    {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {t('saveChanges')}
                  </button>
                </div>
              </form>
            )}

            {/* ACTIVE BOOKINGS & ORDERS (CATEGORIZED + SUPPORT + FREE DATE SWAP) */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-slide-up">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-3">
                  <h2 className="font-cinzel text-xl font-bold text-maroon">{t('myBookingsTitle')}</h2>
                  <Link
                    to="/track-order"
                    className="text-xs font-bold text-maroon underline flex items-center gap-1"
                  >
                    Open Full Tracker <ExternalLink size={12} />
                  </Link>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: `All (${activeBookingsCount})` },
                    { id: 'ritual', label: `🙏 Ritual Bookings (${activePurohitBookings.length})` },
                    { id: 'apara', label: `🕉️ Apara Seva (${activeAparaBookings.length})` },
                    { id: 'orders', label: `📦 Marketplace Orders (${activeOrders.length})` },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setBookingCategoryFilter(cat.id as any)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        bookingCategoryFilter === cat.id
                          ? 'bg-maroon text-gold-pale border-maroon shadow-sm'
                          : 'bg-cream/60 text-maroon border-gold/30 hover:bg-gold/15'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {activeBookingsCount === 0 ? (
                  <div className="text-center py-12 bg-cream/40 border border-gold/20 rounded-lg space-y-4">
                    <CalendarCheck size={36} className="mx-auto text-gold-dk" />
                    <p className="text-sm text-text-md max-w-md mx-auto">{t('noBookingsYet')}</p>
                    <div className="flex justify-center gap-3">
                      <Link to="/purohits" className="px-5 py-2.5 bg-maroon text-gold-pale text-xs font-bold uppercase rounded">
                        Book Purohit (₹11)
                      </Link>
                      <Link to="/apara" className="px-5 py-2.5 border border-maroon text-maroon text-xs font-bold uppercase rounded">
                        Explore Apara Peetas
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(bookingCategoryFilter === 'all' || bookingCategoryFilter === 'ritual') && activePurohitBookings.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          🙏 Ritual Bookings ({activePurohitBookings.length})
                        </h3>
                        {activePurohitBookings.map(b => {
                          const policy = getBookingCancellationPolicy(b);
                          const latestEvent = b.timeline && b.timeline.length > 0 ? b.timeline[b.timeline.length - 1] : null;
                          return (
                            <div
                              key={b.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedDetail({ booking: b })}
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ booking: b }); } }}
                              className="p-4 border border-gold/30 hover:border-maroon/60 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-maroon text-gold-pale rounded">
                                    {b.id}
                                  </span>
                                  <span className="ml-2 font-serif font-bold text-base text-maroon">{b.occasion}</span>
                                  {b.bookingType === 'immediate' && (
                                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                                      ⚡ Immediate
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                    ₹{b.total} Verified ({b.paymentMethod || 'Cashfree'})
                                  </span>
                                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    b.status === 'Muhurtham Finalized' || b.status === 'Confirmed'
                                      ? 'bg-green-100 text-green-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {b.status}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs text-text-md grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                <div><strong>Purohit:</strong> {b.purohitName}</div>
                                <div><strong>Date &amp; Time:</strong> {b.date} at {b.time}</div>
                                {b.nakshatram && (
                                  <div className="sm:col-span-2 text-maroon font-medium">
                                    <strong>Nakshatram / Muhurtham:</strong> {b.nakshatram}
                                  </div>
                                )}
                                <div className="sm:col-span-2 text-text-lt"><strong>Venue:</strong> {b.address}, {b.city} – {b.pincode}</div>
                              </div>

                              <div className="pt-2 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="text-[11px] text-text-md">
                                  {latestEvent
                                    ? <><strong>{language === 'te' ? 'తాజా చర్య:' : 'Latest action:'}</strong> {latestEvent.actor} — {latestEvent.action}</>
                                    : policy.canDevoteeSelfCancelOrSwap
                                    ? (language === 'te' ? 'ఉచిత తేదీ మార్పు & చర్యల చరిత్ర అందుబాటులో ఉంది' : 'Free date swap & full record available')
                                    : (language === 'te' ? 'పూర్తి వివరాలు చూడటానికి క్లిక్ చేయండి' : 'Click to inspect details & actions')}
                                </span>
                                <span className="font-bold text-maroon text-[11px] underline">
                                  {language === 'te' ? 'పూర్తి వివరాలు & టైమ్‌లైన్ →' : 'Open Neat View & Actions →'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(bookingCategoryFilter === 'all' || bookingCategoryFilter === 'apara') && activeAparaBookings.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          🕉️ Apara Seva Bookings ({activeAparaBookings.length})
                        </h3>
                        {activeAparaBookings.map(a => (
                          <div
                            key={a.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedDetail({ apara: a })}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ apara: a }); } }}
                            className="p-4 border border-gold/30 hover:border-maroon/60 rounded-lg bg-amber-50/40 hover:shadow-md transition-all cursor-pointer space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-maroon text-gold-pale rounded">
                                  {a.id}
                                </span>
                                <span className="ml-2 font-serif font-bold text-base text-maroon">{a.ceremonyType}</span>
                              </div>
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                ₹{a.tokenFee} Confirmed · {a.status}
                              </span>
                            </div>
                            <div className="text-xs text-text-md grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <div><strong>Peeta:</strong> {a.peetaName}</div>
                              <div><strong>Date &amp; Mode:</strong> {a.date} ({a.ritualMode})</div>
                            </div>
                            <div className="pt-2 border-t border-gold/20 flex justify-between items-center text-xs">
                              <a
                                href={`tel:${a.peetaPhone}`}
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-maroon font-bold underline"
                              >
                                <Phone size={12} /> {a.peetaPhone}
                              </a>
                              <span className="font-bold text-maroon text-[11px] underline">
                                {language === 'te' ? 'వివరాలు & సహాయం చూడండి →' : 'Open Neat View & Support →'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(bookingCategoryFilter === 'all' || bookingCategoryFilter === 'orders') && activeOrders.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          <Package size={16} /> Marketplace Orders ({activeOrders.length})
                        </h3>
                        {activeOrders.map(o => (
                          <div
                            key={o.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedDetail({ order: o })}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ order: o }); } }}
                            className="p-4 border border-gold/30 hover:border-maroon/60 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gold/25 text-maroon-dk rounded">
                                  {o.id}
                                </span>
                                <span className="ml-2 text-xs text-text-lt">
                                  {new Date(o.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-maroon">₹{o.total}</span>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">
                                  {o.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-text-md">
                              {o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
                            </div>
                            <div className="pt-2 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-[11px] text-text-lt">
                                {language === 'te'
                                  ? 'స్టోర్ యజమాని బాధ్యత · సమస్య ఉంటే మా బృందం వ్యాపారితో మాట్లాడుతుంది'
                                  : 'Fulfilled by Partner Store · Click to view items or escalate concern'}
                              </span>
                              <span className="font-bold text-maroon text-[11px] underline">
                                {language === 'te' ? 'ఆర్డర్ వివరాలు చూడండి →' : 'Open Order Details →'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CANCELLED / DECLINED BY PUROHIT TAB */}
            {activeTab === 'cancelled' && (
              <div className="space-y-6 animate-slide-up">
                <div className="border-b border-gold/20 pb-3">
                  <h2 className="font-cinzel text-xl font-bold text-maroon flex items-center gap-2">
                    <XCircle size={20} className="text-red-600" /> {isTe ? 'రద్దు చేసిన & పురోహితులు నిరాకరించిన బుకింగ్‌లు' : 'Cancelled & Purohit-Declined Bookings'}
                  </h2>
                  <p className="text-xs text-text-md mt-1">
                    {isTe
                      ? 'పురోహితుడు రద్దు చేస్తే వారి కారణం ఇక్కడ కనిపిస్తుంది, ₹11 నేరుగా మీ వాలెట్‌లో చేరుతుంది, మరియు మీరు మరో పురోహితుడిని వెంటనే బుక్ చేయవచ్చు.'
                      : 'If a Purohit cancels prior to your ritual, you see their exact reason, your ₹11 goes straight to your Wallet, and you can either choose the next available Purohit or contact Guru Padukam directly.'}
                  </p>
                </div>

                {cancelledCount === 0 ? (
                  <div className="text-center py-12 bg-cream/40 border border-gold/20 rounded-lg space-y-2">
                    <CheckCircle2 size={34} className="mx-auto text-green-600" />
                    <div className="font-cinzel text-sm font-bold text-maroon">
                      {isTe ? 'రద్దు చేసిన లేదా నిరాకరించిన బుకింగ్‌లు లేవు' : 'No Cancelled or Declined Bookings'}
                    </div>
                    <p className="text-xs text-text-md">
                      {isTe ? 'మీ పూజా సమయాలన్నీ సజావుగా సాగుతున్నాయి!' : 'All your ceremonial slots are running smoothly!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cancelledPurohitBookings.map(b => (
                      <div
                        key={b.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedDetail({ booking: b })}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetail({ booking: b }); } }}
                        className="p-4 border border-red-200 hover:border-red-400 bg-red-50/40 rounded-lg space-y-2.5 cursor-pointer transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-red-700 text-white rounded">
                              {b.id}
                            </span>
                            <span className="ml-2 font-serif font-bold text-maroon">{b.occasion}</span>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs text-text-md space-y-1">
                          <div><strong>Purohit:</strong> {b.purohitName} · <strong>Scheduled:</strong> {b.date} at {b.time}</div>
                          {b.purohitActionReason && (
                            <div className="text-red-800 bg-white border border-red-200 px-2.5 py-1.5 rounded">
                              <strong>Purohit Cancellation Reason:</strong> {b.purohitActionReason}
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t border-red-200 flex flex-wrap items-center justify-between gap-2">
                          {b.refundCreditedToWallet ? (
                            <span className="text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                              ✓ ₹{b.total} Credited to Wallet
                            </span>
                          ) : (
                            <span className="text-xs text-text-lt">No cash refund applicable</span>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://wa.me/${BRAND_CONTACT.phoneRaw}?text=${encodeURIComponent(`Namaste Guru Padukam 🙏 Booking ${b.id} was cancelled (${b.purohitActionReason || 'schedule issue'}). Please assist us urgently.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="px-3.5 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded hover:brightness-95"
                            >
                              Contact Guru Padukam Directly
                            </a>
                            <Link
                              to="/purohits?avail=now"
                              onClick={e => e.stopPropagation()}
                              className="px-4 py-1.5 bg-maroon text-gold-pale text-xs font-bold uppercase rounded hover:bg-maroon-md"
                            >
                              Choose Next Available Purohit →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    {cancelledAparaBookings.map(a => (
                      <div key={a.id} className="p-4 border border-red-200 bg-red-50/40 rounded-md text-xs">
                        <strong>{a.id}</strong> — {a.ceremonyType} ({a.peetaName}) · Status: {a.status}
                      </div>
                    ))}

                    {cancelledOrders.map(o => (
                      <div key={o.id} className="p-4 border border-red-200 bg-red-50/40 rounded-md text-xs">
                        <strong>{o.id}</strong> — ₹{o.total} Marketplace Order · Status: {o.status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WALLET & REFUNDS TAB */}
            {activeTab === 'refunds' && (
              <div className="space-y-6 animate-slide-up">
                <div className="border-b border-gold/20 pb-3">
                  <h2 className="font-cinzel text-xl font-bold text-maroon flex items-center gap-2">
                    <Wallet size={20} className="text-gold-dk" /> {isTe ? 'గురు పాదుకం వాలెట్ & వాపసు వివరాలు' : 'Guru Padukam Wallet & Refunds Ledger'}
                  </h2>
                  <p className="text-xs text-text-md mt-1">
                    {isTe
                      ? 'పురోహితుడు రద్దు చేసినప్పుడు వాలెట్‌లో చేరిన ₹11 క్రెడిట్లు మరియు వినియోగ వివరాలు.'
                      : 'Verified ₹11 credits from Purohit schedule declines and reuse history (per our No Cash Refund / Zero-Loss Wallet Policy).'}
                  </p>
                </div>

                {/* Balance Banner */}
                <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-cream p-6 rounded-lg shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-gold-lt font-bold">
                      {isTe ? 'అందుబాటులో ఉన్న భక్తుల వాలెట్ బ్యాలెన్స్' : 'Available Devotee Wallet Balance'}
                    </div>
                    <div className="font-cinzelDeco text-4xl font-bold text-gold mt-1">
                      ₹{walletBalance}
                    </div>
                    <p className="text-xs text-cream/80 mt-1">
                      {walletBalance >= 11
                        ? (isTe ? 'మళ్లీ చెల్లించకుండా తదుపరి పురోహితుడిని బుక్ చేయడానికి సిద్ధంగా ఉంది!' : 'Ready to book your next Purohit without paying Cashfree again!')
                        : (isTe ? 'పురోహితుడు రద్దు చేస్తే ₹11 వెంటనే ఇక్కడ కనిపిస్తుంది.' : 'Any ₹11 credited when a Purohit declines appears instantly here.')}
                    </p>
                  </div>
                  <Link
                    to="/purohits"
                    className="px-5 py-2.5 bg-gold text-maroon-dk font-cinzel text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-gold-lt transition-colors shrink-0"
                  >
                    {walletBalance >= 11
                      ? (isTe ? 'ఇప్పుడే ₹11 వాలెట్ వాడండి →' : 'Use ₹11 Wallet Now →')
                      : (isTe ? 'పురోహితులను చూడండి' : 'Browse Purohits')}
                  </Link>
                </div>

                {/* Cashfree Token Protection Note */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-maroon shrink-0 mt-0.5" />
                  <div>
                    <strong>How ₹11 Cashfree &amp; Wallet Verification Works:</strong> Your ₹11 booking token is verified via Cashfree Payment Gateway before reaching the Purohit. If the Purohit declines due to a tight schedule, ₹11 enters this Wallet automatically and you get an instant Push Notification.
                  </div>
                </div>

                {/* Transactions Ledger */}
                <div className="space-y-3">
                  <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon">
                    Wallet &amp; Refund Transactions ({walletTransactions.length})
                  </h3>

                  {walletTransactions.length === 0 ? (
                    <div className="text-center py-10 bg-cream/40 border border-gold/20 rounded-lg text-xs text-text-md">
                      No wallet credits or debits yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gold/20 border border-gold/25 rounded-md overflow-hidden">
                      {walletTransactions.map(tx => (
                        <div key={tx.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-maroon flex items-center gap-2">
                              <span className="font-mono text-[11px] bg-cream px-2 py-0.5 rounded border border-gold/25">
                                {tx.id}
                              </span>
                              <span>{tx.reason}</span>
                            </div>
                            <div className="text-[11px] text-text-lt mt-1">
                              {new Date(tx.createdAt).toLocaleString()}
                              {tx.bookingId && <> · Booking: <strong>{tx.bookingId}</strong></>}
                            </div>
                          </div>
                          <span className={`font-cinzel font-bold text-sm px-3 py-1 rounded-full shrink-0 ${
                            tx.type === 'credit'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {tx.type === 'credit' ? `+₹${tx.amount} Credited` : `-₹${tx.amount} Used`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAN-INDIA LANGUAGE PREFERENCE */}
            {activeTab === 'language' && (
              <div className="space-y-6 animate-slide-up">
                <div className="border-b border-gold/20 pb-3">
                  <h2 className="font-cinzel text-xl font-bold text-maroon flex items-center gap-2">
                    <Globe size={20} /> {t('preferredLanguage')}
                  </h2>
                  <p className="text-xs text-text-md mt-1">{t('languageDesc')}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 text-xs text-amber-950 flex items-center gap-2.5">
                  <Sparkles size={16} className="text-maroon shrink-0" />
                  <span>
                    {language === 'te'
                      ? 'భాషను ఎంచుకున్న వెంటనే గురు పాదుకం వెబ్‌సైట్ మరియు PadukaAI 100% పూర్తిగా మారతాయి.'
                      : 'Selecting English or తెలుగు immediately switches 100% of Guru Padukam website & PadukaAI Concierge.'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PAN_INDIA_LANGUAGES.map(lang => {
                    const active = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSaveLanguage(lang.code)}
                        className={`text-left p-3.5 rounded-md border transition-all flex items-center justify-between ${
                          active
                            ? 'border-maroon bg-maroon text-gold-pale shadow-md'
                            : 'border-gold/30 bg-cream/30 hover:border-maroon/50 hover:bg-gold/10 text-text-dk'
                        }`}
                      >
                        <div>
                          <div className={`text-base font-bold ${active ? 'text-gold-lt' : 'text-maroon'}`}>
                            {lang.nativeName}
                          </div>
                          <div className={`text-xs font-semibold ${active ? 'text-cream' : 'text-text-dk'}`}>
                            {lang.name}
                          </div>
                          <div className={`text-[10px] ${active ? 'text-cream/75' : 'text-text-lt'}`}>
                            {lang.region}
                          </div>
                        </div>
                        {active && <CheckCircle2 size={18} className="text-gold shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Address */}
            {activeTab === 'address' && (
              <form onSubmit={handleSaveAddress} className="space-y-6 animate-slide-up">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-3">
                  <h2 className="font-cinzel text-xl font-bold text-maroon">
                    {isTe ? 'డెలివరీ & పూజా చిరునామా' : 'Shipping & Ritual Address'}
                  </h2>
                  <button
                    type="button"
                    disabled={isDetectingLoc}
                    onClick={() => detectLocation(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon bg-gold/20 hover:bg-gold/30 border border-gold/40 px-3 py-1.5 rounded transition-colors disabled:opacity-60"
                  >
                    {isDetectingLoc ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                    {isDetectingLoc
                      ? (isTe ? 'గుర్తిస్తోంది…' : 'Detecting…')
                      : (isTe ? 'నా స్థానం & పిన్ గుర్తించండి' : 'Detect My Location & PIN')}
                  </button>
                </div>
                <p className="text-sm text-text-md">
                  {isTe
                    ? 'మీ పురోహిత బుకింగ్‌లు మరియు ఆర్డర్ల కోసం ఈ చిరునామా ఉపయోగించబడుతుంది.'
                    : 'This address will be used by default for your Purohit bookings and orders.'}
                </p>

                <div>
                  <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                    {isTe ? 'పూర్తి చిరునామా *' : 'Complete Address *'}
                  </label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    rows={3}
                    placeholder={isTe ? 'ఇంటి నం., వీధి, గుర్తు చిహ్నం' : 'House/Flat No., Street, Landmark'}
                    className="w-full px-4 py-3 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 resize-none rounded"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'నగరం / పట్టణం *' : 'City / Town *'}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      required
                      placeholder={isTe ? 'నగరం / పట్టణం' : 'Enter city / town'}
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'పిన్ కోడ్ *' : 'Postal PIN Code *'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder={isTe ? '6-అంకెల పిన్ కోడ్' : '6-digit PIN'}
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="bg-maroon text-gold-pale px-8 py-3 clip-btn hover:bg-maroon-md transition-colors flex items-center gap-2 font-cinzel tracking-widest uppercase text-sm disabled:opacity-70"
                  >
                    {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isTe ? 'చిరునామా సేవ్ చేయండి' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* Security */}
            {activeTab === 'security' && (() => {
              const hasPw = firebaseMock.auth.hasPasswordProvider();
              return (
              <form onSubmit={handleSavePassword} className="space-y-6 animate-slide-up">
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">
                  {hasPw
                    ? (isTe ? 'పాస్‌వర్డ్ మార్చండి' : 'Change Password')
                    : (isTe ? 'ఇమెయిల్ సైన్-ఇన్ కోసం పాస్‌వర్డ్ సెట్ చేయండి' : 'Set Password for Email Sign-In')}
                </h2>
                {!hasPw && (
                  <p className="text-xs text-text-md">
                    {isTe
                      ? 'మీరు Google తో సైన్ ఇన్ చేశారు. ఇమెయిల్ & పాస్‌వర్డ్‌తో కూడా లాగిన్ అవ్వడానికి దిగువన పాస్‌వర్డ్‌ను సెట్ చేయండి.'
                      : 'You signed in with Google. Set a password below so you can also sign in with your email and password.'}
                  </p>
                )}

                <div className="max-w-md space-y-5">
                  {hasPw && (
                    <div>
                      <label htmlFor="profile-current-password" className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                        {isTe ? 'ప్రస్తుత పాస్‌వర్డ్' : 'Current Password'}
                      </label>
                      <input
                        id="profile-current-password"
                        aria-label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="profile-new-password" className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'కొత్త పాస్‌వర్డ్' : 'New Password'}
                    </label>
                    <input
                      id="profile-new-password"
                      aria-label="New Password"
                      type="password"
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-confirm-password" className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">
                      {isTe ? 'కొత్త పాస్‌వర్డ్ నిర్ధారించండి' : 'Confirm New Password'}
                    </label>
                    <input
                      id="profile-confirm-password"
                      aria-label="Confirm New Password"
                      type="password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-maroon text-gold-pale px-8 py-3 clip-btn hover:bg-maroon-md transition-colors flex items-center gap-2 font-cinzel tracking-widest uppercase text-sm"
                  >
                    <Lock size={16} /> {hasPw ? (isTe ? 'పాస్‌వర్డ్ అప్‌డేట్ చేయండి' : 'Update Password') : (isTe ? 'పాస్‌వర్డ్ సెట్ చేయండి' : 'Set Password')}
                  </button>
                </div>
              </form>
              );
            })()}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications} className="space-y-6 animate-slide-up">
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">
                  {isTe ? 'నోటిఫికేషన్ ప్రాధాన్యతలు' : 'Notification Preferences'}
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer p-4 border border-gold/20 hover:bg-cream/30 transition-colors rounded">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                      className="w-5 h-5 accent-maroon"
                    />
                    <div>
                      <div className="font-cinzel font-bold text-maroon">
                        {isTe ? 'ఇమెయిల్ నోటిఫికేషన్లు' : 'Email Notifications'}
                      </div>
                      <div className="text-sm text-text-md">
                        {isTe ? 'ఆర్డర్ మరియు బుకింగ్ అప్‌డేట్‌లను ఇమెయిల్ ద్వారా పొందండి.' : 'Receive order updates and exclusive offers via email.'}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer p-4 border border-gold/20 hover:bg-cream/30 transition-colors rounded">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={e => setNotifications({ ...notifications, sms: e.target.checked })}
                      className="w-5 h-5 accent-maroon"
                    />
                    <div>
                      <div className="font-cinzel font-bold text-maroon">
                        {isTe ? 'SMS & వాట్సాప్ నోటిఫికేషన్లు' : 'SMS & WhatsApp Notifications'}
                      </div>
                      <div className="text-sm text-text-md">
                        {isTe ? 'పురోహిత రాక మరియు డెలివరీ ట్రాకింగ్ అప్‌డేట్‌లను ఫోన్‌లో పొందండి.' : 'Get real-time Purohit arrival and delivery tracking updates on your phone.'}
                      </div>
                    </div>
                  </label>

                  <div className="p-4 border border-gold/20 bg-amber-50/40 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushPermission === 'granted' && pushEnabled}
                        onChange={e => {
                          if (e.target.checked && pushPermission !== 'granted') {
                            requestPushPermission();
                          } else {
                            setPushEnabled(e.target.checked);
                          }
                        }}
                        className="w-5 h-5 accent-maroon"
                      />
                      <div>
                        <div className="font-cinzel font-bold text-maroon">Browser Push Notifications</div>
                        <div className="text-sm text-text-md">
                          Instant alerts when a Purohit accepts/declines, ₹11 enters your Wallet, or samagri dispatches.
                        </div>
                      </div>
                    </label>
                    <div className="flex gap-2 shrink-0">
                      {pushPermission !== 'granted' ? (
                        <button
                          type="button"
                          onClick={requestPushPermission}
                          className="px-4 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase rounded hover:bg-maroon-md"
                        >
                          Enable Browser Push
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={sendTestPush}
                          className="px-4 py-2 border border-maroon text-maroon text-xs font-bold uppercase rounded hover:bg-maroon/5"
                        >
                          Send Test Push
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="bg-maroon text-gold-pale px-8 py-3 clip-btn hover:bg-maroon-md transition-colors flex items-center gap-2 font-cinzel tracking-widest uppercase text-sm disabled:opacity-70"
                  >
                    {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Preferences
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      {selectedDetail && (
        <BookingDetailsModal
          booking={
            selectedDetail.booking
              ? bookings.find(b => b.id === selectedDetail.booking?.id) || selectedDetail.booking
              : null
          }
          aparaBooking={
            selectedDetail.apara
              ? aparaBookings.find(a => a.id === selectedDetail.apara?.id) || selectedDetail.apara
              : null
          }
          order={
            selectedDetail.order
              ? orders.find(o => o.id === selectedDetail.order?.id) || selectedDetail.order
              : null
          }
          viewerRole="Devotee"
          onClose={() => setSelectedDetail(null)}
          onOpenInvoice={ord => {
            setSelectedDetail(null);
            setShowInvoiceOrder(ord);
          }}
        />
      )}

      {showInvoiceOrder && (
        <InvoiceModal order={showInvoiceOrder} onClose={() => setShowInvoiceOrder(null)} />
      )}
    </div>
  );
};
