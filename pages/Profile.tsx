import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon, MapPin, Lock, Bell, Save, Loader2, Globe, Camera,
  CalendarCheck, Package, Phone, ExternalLink, CheckCircle2, Sparkles, X
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { PAN_INDIA_LANGUAGES, LanguageCode, getLanguageMeta } from '../i18n/languages';

type ProfileTab = 'personal' | 'bookings' | 'language' | 'address' | 'security' | 'notifications';

export const Profile: React.FC = () => {
  const {
    user, updateProfile, isAuthLoading, addToast,
    language, setLanguage, t,
    bookings, aparaBookings, orders,
    pushPermission, pushEnabled, setPushEnabled, requestPushPermission, sendTestPush,
  } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Khammam');
  const [pincode, setPincode] = useState('507002');
  const [notifications, setNotifications] = useState({ email: true, sms: false });

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
      setCity(user.city || 'Khammam');
      setPincode(user.pincode || '507002');
      if (user.notifications) {
        setNotifications(user.notifications);
      }
    }
  }, [user, navigate, language]);

  if (!user) return null;

  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const myPurohitBookings = bookings.filter(
    b => b.userId === user.id || b.userEmail === user.email || (cleanPhone && b.userPhone.replace(/\D/g, '') === cleanPhone)
  );
  const myAparaBookings = aparaBookings.filter(
    b => b.userId === user.id || b.userEmail === user.email || (cleanPhone && b.userPhone.replace(/\D/g, '') === cleanPhone)
  );
  const myOrders = orders.filter(
    o => o.userId === user.id || o.userEmail === user.email
  );
  const totalBookingsCount = myPurohitBookings.length + myAparaBookings.length + myOrders.length;

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
    addToast('Password updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const currentLangMeta = getLanguageMeta(language);

  const tabs: { id: ProfileTab; label: string; icon: React.ComponentType<{ size?: number }>; badge?: number }[] = [
    { id: 'personal', label: t('tabPersonal'), icon: UserIcon },
    { id: 'bookings', label: t('tabBookings'), icon: CalendarCheck, badge: totalBookingsCount },
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
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                  {totalBookingsCount} Bookings &amp; Orders
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
                    className={`flex items-center justify-between px-5 py-4 font-cinzel text-xs tracking-widest uppercase transition-colors border-l-4 ${
                      isActive
                        ? 'border-maroon bg-maroon/5 text-maroon font-bold'
                        : 'border-transparent text-text-md hover:bg-cream/50 hover:text-maroon'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={17} />
                      {tab.label}
                    </span>
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
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
                      Upload a clear photo for your Guru Padukam devotee/purohit profile.
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
                          <X size={13} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed rounded"
                    />
                    <p className="text-[0.65rem] text-gray-400 mt-1">Email cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
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

            {/* MY BOOKINGS & ORDERS */}
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

                {totalBookingsCount === 0 ? (
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
                    {/* Purohit Bookings */}
                    {myPurohitBookings.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          🙏 Purohit Bookings ({myPurohitBookings.length})
                        </h3>
                        {myPurohitBookings.map(b => (
                          <div key={b.id} className="p-4 border border-gold/30 rounded-md bg-cream/30 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-maroon text-gold-pale rounded">
                                  {b.id}
                                </span>
                                <span className="ml-2 font-serif font-bold text-maroon">{b.occasion}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                  ₹{b.total} Token Paid
                                </span>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                  {b.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-text-md grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <div><strong>Purohit:</strong> {b.purohitName}</div>
                              <div><strong>Date &amp; Time:</strong> {b.date} at {b.time}</div>
                              <div className="sm:col-span-2"><strong>Venue:</strong> {b.address}, {b.city} - {b.pincode}</div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gold/20 text-xs">
                              <span className="text-green-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                {b.shipBefore30Min ? 'Pooja Essentials scheduled 30 mins prior' : 'Guru Padukam End-to-End Support Active'}
                              </span>
                              <Link to="/track-order" className="font-bold text-maroon underline">
                                Track / Manage →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Apara Bookings */}
                    {myAparaBookings.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          🕉️ Apara Seva Bookings ({myAparaBookings.length})
                        </h3>
                        {myAparaBookings.map(a => (
                          <div key={a.id} className="p-4 border border-gold/30 rounded-md bg-amber-50/40 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-maroon text-gold-pale rounded">
                                  {a.id}
                                </span>
                                <span className="ml-2 font-serif font-bold text-maroon">{a.ceremonyType}</span>
                              </div>
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                ₹{a.tokenFee} Confirmed · {a.status}
                              </span>
                            </div>
                            <div className="text-xs text-text-md grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <div><strong>Peeta:</strong> {a.peetaName}</div>
                              <div><strong>Date &amp; Mode:</strong> {a.date} ({a.ritualMode})</div>
                              <div><strong>Group:</strong> {a.purohitGroup} · {a.attendeeCount} Guests</div>
                              <div className="flex items-center gap-1">
                                <Phone size={12} className="text-green-700" />
                                <strong>Organizer:</strong>{' '}
                                <a href={`tel:${a.peetaPhone}`} className="text-maroon underline font-semibold">
                                  {a.peetaPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Marketplace Orders */}
                    {myOrders.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-maroon flex items-center gap-2">
                          <Package size={16} /> Marketplace Orders ({myOrders.length})
                        </h3>
                        {myOrders.map(o => (
                          <div key={o.id} className="p-4 border border-gold/30 rounded-md bg-white space-y-2">
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                    Selecting a language immediately updates the Guru Padukam website and <strong>PadukaAI Concierge</strong> across all 14 Pan-India supported languages.
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
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">Shipping &amp; Ritual Address</h2>
                <p className="text-sm text-text-md">This address will be used by default for your Purohit bookings and orders.</p>

                <div>
                  <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Complete Address *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    rows={3}
                    placeholder="House/Flat No., Street, Landmark"
                    className="w-full px-4 py-3 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 resize-none rounded"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">City / Town *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      required
                      placeholder="e.g. Khammam"
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Postal PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="e.g. 507002"
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
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <form onSubmit={handleSavePassword} className="space-y-6 animate-slide-up">
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">Change Password</h2>

                <div className="max-w-md space-y-5">
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon bg-cream/10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-widest uppercase text-text-md mb-2">Confirm New Password</label>
                    <input
                      type="password"
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
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              </form>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications} className="space-y-6 animate-slide-up">
                <h2 className="font-cinzel text-xl font-bold text-maroon border-b border-gold/20 pb-3">Notification Preferences</h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer p-4 border border-gold/20 hover:bg-cream/30 transition-colors rounded">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                      className="w-5 h-5 accent-maroon"
                    />
                    <div>
                      <div className="font-cinzel font-bold text-maroon">Email Notifications</div>
                      <div className="text-sm text-text-md">Receive order updates and exclusive offers via email.</div>
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
                      <div className="font-cinzel font-bold text-maroon">SMS &amp; WhatsApp Notifications</div>
                      <div className="text-sm text-text-md">Get real-time Purohit arrival and delivery tracking updates on your phone.</div>
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
                          Instant desktop/mobile alerts for bookings, Apara checklists, 30-min samagri dispatch &amp; Purohit swaps.
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
    </div>
  );
};
