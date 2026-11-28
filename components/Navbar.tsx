import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ShieldCheck, LogOut, ChevronDown, Bell, Globe } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { PAN_INDIA_LANGUAGES, getLanguageMeta } from '../i18n/languages';

export const Navbar: React.FC = () => {
  const {
    cart, setCartOpen, user, isAdmin, logout,
    notifications, markNotificationRead, markAllNotificationsRead,
    pushPermission, pushEnabled, requestPushPermission,
    language, setLanguage, t,
  } = useAppContext();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isServicesOpen, setServicesOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isLangOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const currentLangMeta = getLanguageMeta(language);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setNotifOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setLangOpen(false);
        setServicesOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const textColor = scrolled || !isHome ? 'text-maroon' : 'text-cream';
  const hoverColor = scrolled || !isHome ? 'hover:text-gold-dk' : 'hover:text-gold-lt';

  const serviceLinks = language === 'te'
    ? [
        { label: 'అన్ని సేవలు', path: '/services', icon: '🧭' },
        { label: 'పురోహితుడిని బుక్ చేయండి (₹11)', path: '/purohits', icon: '🙏' },
        { label: 'అపర కర్మలు (అబ్దికం / మాసికం)', path: '/apara', icon: '🕉️' },
        { label: 'నిత్య అవసరాలు', path: '/marketplace?cat=essentials', icon: '⚡' },
        { label: 'రిటర్న్ గిఫ్ట్స్', path: '/marketplace?cat=return-gifts', icon: '🎁' },
        { label: 'నాదస్వరం బృందం', path: '/services?cat=nadaswaram', icon: '🎵' },
        { label: 'పుష్ప అలంకరణ', path: '/services?cat=decoration', icon: '🌸' },
        { label: 'బుకింగ్ / మొబైల్ ట్రాక్', path: '/track-order', icon: '📍' },
        { label: 'పురోహిత పోర్టల్', path: '/purohit-dashboard', icon: '🛕' },
      ]
    : [
        { label: 'All Services', path: '/services', icon: '🧭' },
        { label: 'Book a Purohit (₹11)', path: '/purohits', icon: '🙏' },
        { label: 'Apara (Abdikam / Last Rites)', path: '/apara', icon: '🕉️' },
        { label: 'Everyday Essentials', path: '/marketplace?cat=essentials', icon: '⚡' },
        { label: 'Return Gifts', path: '/marketplace?cat=return-gifts', icon: '🎁' },
        { label: 'Nadaswaram Troupe', path: '/services?cat=nadaswaram', icon: '🎵' },
        { label: 'Flower Decoration', path: '/services?cat=decoration', icon: '🌸' },
        { label: 'Track by ID / Mobile', path: '/track-order', icon: '📍' },
        { label: 'Purohit Operations Portal', path: '/purohit-dashboard', icon: '🛕' },
      ];

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navServices'), path: '/services', hasDropdown: true },
    { label: t('navPurohits'), path: '/purohits' },
    { label: t('navApara'), path: '/apara' },
    { label: t('navMarketplace'), path: '/marketplace' },
    { label: t('navAbout'), path: '/about' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-maroon-dk text-gold-pale/90 overflow-hidden py-2 border-b border-gold/15 fixed top-0 left-0 w-full z-50 text-xs font-medium tracking-wide">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="px-10 flex items-center gap-3 text-[11px] font-semibold tracking-wider uppercase text-gold-lt">
              <span className="text-gold">✦</span> {t('announcementToken')}
              <span className="text-gold">✦</span> {t('announcementEssentials')}
              <span className="text-gold">✦</span> {t('announcementSupport')}
              <span className="text-gold">✦</span> Call: +91 99497 30175
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`fixed top-[33px] left-0 w-full z-50 transition-all duration-300 ${scrolled || !isHome ? 'bg-cream/95 backdrop-blur-md border-b border-gold/20 shadow-sm py-2.5' : 'bg-maroon-dk/85 backdrop-blur-md border-b border-gold/15 py-3'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Guru Padukam"
                className="w-11 h-11 rounded-full object-cover border border-gold/50 bg-cream shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className={`font-serif text-xl font-bold leading-tight tracking-tight transition-colors ${scrolled || !isHome ? 'text-maroon' : 'text-cream drop-shadow-sm'}`}>Guru Padukam</div>
              <div className={`font-telugu text-[11px] font-medium leading-none tracking-normal transition-colors ${scrolled || !isHome ? 'text-gold-dk' : 'text-gold-lt'}`}>గురు పాదుకం · పూజా సేవలు</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex gap-5 xl:gap-7 items-center flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.hasDropdown) {
                return (
                  <li
                    key={link.label}
                    className="relative shrink-0"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/services')}
                      className={`text-[12px] xl:text-[13px] font-semibold tracking-wide uppercase flex items-center gap-1 py-2 whitespace-nowrap transition-colors ${textColor} ${hoverColor}`}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Modern Dropdown */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 transition-all duration-200 z-[100] ${
                        isServicesOpen
                          ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                          : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="bg-white border border-gold/30 shadow-xl rounded-md py-2 overflow-hidden">
                        {serviceLinks.map((sl) => (
                          <Link
                            key={sl.path}
                            to={sl.path}
                            onClick={() => setServicesOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold/10 transition-colors text-text-dk hover:text-maroon group"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform">{sl.icon}</span>
                            <span className="text-[12px] font-semibold tracking-wide uppercase">{sl.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              }
              return (
                <li key={link.label} className="shrink-0">
                  <Link
                    to={link.path}
                    className={`text-[12px] xl:text-[13px] font-semibold tracking-wide uppercase relative group py-2 whitespace-nowrap transition-colors ${textColor} ${hoverColor}`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gold rounded-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link to="/admin" className="text-[11px] tracking-wider uppercase text-maroon font-bold flex items-center gap-1.5 bg-gold/20 px-3 py-1.5 rounded-full border border-gold/40 hover:bg-gold hover:text-maroon-dk transition-all shadow-sm">
                  <ShieldCheck size={13} /> Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Pan-India Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded border border-gold/30 transition-colors ${textColor} ${hoverColor}`}
                title="Select Pan-India Language"
                aria-label="Select Language"
              >
                <Globe size={14} />
                <span className="hidden sm:inline">{currentLangMeta.nativeName}</span>
                <ChevronDown size={12} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gold/30 shadow-2xl rounded-md z-[130] overflow-hidden py-1 text-text-dk">
                  <div className="px-3 py-2 bg-maroon text-gold-pale text-[10px] font-bold uppercase tracking-wider">
                    {language === 'te' ? 'భాష ఎంచుకోండి' : 'Select Language'}
                  </div>
                  {PAN_INDIA_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gold/15 transition-colors ${
                        language === lang.code ? 'bg-maroon/10 text-maroon font-bold' : ''
                      }`}
                    >
                      <span>{lang.nativeName} ({lang.name})</span>
                      <span className="text-[10px] text-text-lt uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Book Now CTA */}
            <Link
              to="/purohits"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gold via-gold-lt to-gold text-maroon-dk font-bold text-[12px] tracking-wider uppercase px-4 py-2 rounded shadow-md hover:brightness-105 transition-all"
            >
              🙏 {t('navBook11')}
            </Link>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-3 border-r border-gold/30 pr-4">
                <Link to="/profile" className={`text-[13px] font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${textColor} ${hoverColor}`}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-gold/60" />
                  ) : (
                    <User size={15} />
                  )}
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className={`transition-colors ${textColor} ${hoverColor}`} title={t('navLogout')}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={`hidden md:flex items-center gap-1.5 transition-colors border-r border-gold/30 pr-4 ${textColor} ${hoverColor}`}>
                <User size={16} />
                <span className="text-[12px] font-bold tracking-wider uppercase">{t('navLogin')}</span>
              </Link>
            )}

            {/* Event Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(o => !o)}
                className={`relative transition-colors ${textColor} ${hoverColor}`}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gold/30 shadow-2xl rounded-md z-[120] overflow-hidden text-text-dk">
                  <div className="px-4 py-2.5 bg-maroon text-gold-pale flex items-center justify-between">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider">
                      {language === 'te' ? `అలర్ట్స్ (${unreadCount})` : `Event Alerts (${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[10px] underline text-gold-lt hover:text-white"
                      >
                        {language === 'te' ? 'అన్నీ చదివినట్లు గుర్తించు' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                  <div className="px-3.5 py-2 bg-amber-50/90 border-b border-gold/20 flex items-center justify-between gap-2 text-[11px]">
                    {pushPermission === 'granted' && pushEnabled ? (
                      <span className="text-green-800 font-semibold">
                        🔔 {language === 'te' ? 'పుష్ అలర్ట్స్ ఆన్‌లో ఉన్నాయి' : 'Notifications Enabled'}
                      </span>
                    ) : (
                      <>
                        <span className="text-maroon font-medium">
                          {language === 'te' ? 'తక్షణ పూజ & పురోహిత అలర్ట్స్ పొందండి' : 'Get live ceremony & arrival alerts'}
                        </span>
                        <button
                          type="button"
                          onClick={requestPushPermission}
                          className="px-2.5 py-1 bg-maroon text-gold-pale rounded text-[10px] font-bold hover:bg-maroon-md shrink-0"
                        >
                          {language === 'te' ? 'ఆన్ చేయండి' : 'Enable Push'}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gold/15">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-xs text-text-lt text-center">No event alerts yet.</div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotifOpen(false);
                            if (n.bookingId) navigate('/track-order');
                          }}
                          className={`w-full text-left p-3 hover:bg-cream transition-colors ${!n.read ? 'bg-amber-50/70' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${n.type === 'urgent' ? 'text-red-700' : 'text-maroon'}`}>
                              {n.title}
                            </span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-text-md mt-0.5 leading-snug">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className={`relative transition-colors ${textColor} ${hoverColor}`} aria-label="Open Cart">
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-maroon-dk font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open Menu">
              <Menu size={22} className={textColor} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-cream p-6 flex flex-col gap-6 animate-fade-in overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Guru Padukam" className="w-10 h-10 rounded-full object-cover border border-gold/40" />
              <div className="font-cinzelDeco text-xl font-bold text-maroon">Guru Padukam</div>
            </div>
            <button className="text-maroon hover:rotate-90 transition-transform" onClick={() => setMobileMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>

          <Link to="/purohits" className="bg-gold text-maroon-dk font-cinzel text-sm font-bold tracking-widest uppercase px-6 py-3 clip-btn text-center shadow-md">
            🙏 Book a Purohit (₹11 Token)
          </Link>

          <div className="flex flex-col gap-4">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-cinzel text-lg font-bold tracking-[0.15em] uppercase text-maroon border-b border-gold/20 pb-3 animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="font-cinzel text-lg font-bold tracking-[0.15em] uppercase text-gold-dk border-b border-gold/20 pb-3">
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="bg-white border border-gold/30 rounded-md p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-maroon mb-1.5 flex items-center gap-1">
              <Globe size={12} /> {language === 'te' ? 'భాష (తెలుగు / English)' : 'Language (English / తెలుగు)'}
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold bg-cream/40 border border-gold/30 rounded text-text-dk"
            >
              {PAN_INDIA_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name}) — {lang.region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            {user ? (
              <>
                <Link to="/profile" className="font-cinzel text-sm tracking-widest uppercase text-text-md">{t('navProfile')}</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="font-cinzel text-sm tracking-widest uppercase text-text-md text-left">
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="font-cinzel text-sm tracking-widest uppercase text-maroon font-bold">
                {t('navLogin')} / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};
