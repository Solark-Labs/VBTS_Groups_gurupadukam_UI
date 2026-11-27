import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, User, Phone, MapPin, Mail, Lock, Globe, Camera, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { PAN_INDIA_LANGUAGES, LanguageCode } from '../i18n/languages';

export const Login: React.FC = () => {
  const { login, register, isAuthLoading, language, setLanguage, t } = useAppContext();
  const navigate = useNavigate();

  // Mode: 'login' vs 'register'
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'user' | 'purohit' | 'admin'>('user');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Mandatory Registration Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Khammam');
  const [regPincode, setRegPincode] = useState('507002');
  const [regPassword, setRegPassword] = useState('');
  const [regLanguage, setRegLanguage] = useState<LanguageCode>(language);
  const [regProfileImage, setRegProfileImage] = useState<string | undefined>(undefined);
  const [termsAgreed, setTermsAgreed] = useState(true);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRegProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    const finalEmail =
      role === 'admin' && !loginEmail.includes('admin')
        ? `admin_${loginEmail}`
        : role === 'purohit' && !loginEmail.includes('purohit')
        ? `purohit_${loginEmail}`
        : loginEmail;

    await login(finalEmail);
    navigate(role === 'admin' ? '/admin' : role === 'purohit' ? '/purohit-dashboard' : '/');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      alert('Please agree to the Privacy Policy & Terms of Service to continue.');
      return;
    }

    await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      city: regCity,
      pincode: regPincode,
      role,
      preferredLanguage: regLanguage,
      profileImage: regProfileImage,
    });

    navigate(role === 'admin' ? '/admin' : role === 'purohit' ? '/purohit-dashboard' : '/');
  };

  const handleQuickDemo = async (asAdmin: boolean) => {
    if (asAdmin) {
      await register({
        name: 'Vedic Administrator',
        email: 'admin@gurupadukam.com',
        phone: '9949730175',
        address: 'Madhuranagar, Gollagudem',
        city: 'Khammam',
        pincode: '507002',
        role: 'admin',
      });
      navigate('/admin');
    } else {
      await register({
        name: 'Devotee Family',
        email: 'devotee@gurupadukam.com',
        phone: '9949730175',
        address: 'Near Temple, Madhuranagar',
        city: 'Khammam',
        pincode: '507002',
        role: 'user',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-24 bg-gradient-to-br from-maroon-dk via-maroon to-maroon-dk overflow-hidden pt-[110px]">
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain pointer-events-none" style={{ backgroundImage: "url('/logo.png')" }} />

      <div className="max-w-xl w-full bg-cream/95 backdrop-blur-md p-8 sm:p-10 shadow-2xl rounded-lg border border-gold/40 relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src="/logo.png"
              alt="Guru Padukam"
              className="w-16 h-16 mx-auto rounded-full border-2 border-gold/60 bg-cream object-cover p-0.5 shadow-md"
            />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-maroon">Guru Padukam Portal</h1>
          <p className="text-xs text-text-md mt-1 font-medium">
            {mode === 'register' ? t('registerSubtitle') : t('loginSubtitle')}
          </p>
        </div>

        {/* Tab Switcher: Register vs Login */}
        <div className="flex bg-maroon-dk/10 p-1 rounded-md mb-6 border border-maroon/15">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'register' ? 'bg-maroon text-gold-pale shadow' : 'text-maroon hover:text-maroon-dk'
            }`}
          >
            {t('createAccount')}
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'login' ? 'bg-maroon text-gold-pale shadow' : 'text-maroon hover:text-maroon-dk'
            }`}
          >
            {t('existingSignIn')}
          </button>
        </div>

        {/* Role Toggle */}
        <div className="flex justify-center flex-wrap gap-4 mb-6 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer text-text-dk">
            <input
              type="radio"
              name="role"
              checked={role === 'user'}
              onChange={() => setRole('user')}
              className="accent-maroon"
            />
            <span>Devotee / Customer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-text-dk">
            <input
              type="radio"
              name="role"
              checked={role === 'purohit'}
              onChange={() => setRole('purohit')}
              className="accent-maroon"
            />
            <span>Purohit / Apara Peeta</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-text-dk">
            <input
              type="radio"
              name="role"
              checked={role === 'admin'}
              onChange={() => setRole('admin')}
              className="accent-maroon"
            />
            <span>Platform Admin</span>
          </label>
        </div>

        {/* ─── REGISTRATION FORM (MANDATORY DETAILS) ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Profile Photo Upload + Preferred Language */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-white/80 border border-gold/30 rounded-md">
              <div className="relative shrink-0">
                {regProfileImage ? (
                  <div className="relative">
                    <img
                      src={regProfileImage}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setRegProfileImage(undefined)}
                      title="Remove photo"
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-maroon/10 border border-dashed border-maroon/40 flex items-center justify-center text-maroon">
                    <Camera size={22} />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-maroon">
                    Profile Photo (Optional)
                  </span>
                  <label className="cursor-pointer text-[11px] font-bold px-3 py-1 bg-gold/20 text-maroon border border-gold/40 rounded hover:bg-gold/30 transition-colors">
                    {regProfileImage ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon mb-1 flex items-center gap-1">
                    <Globe size={12} /> {t('preferredLanguage')} *
                  </label>
                  <select
                    value={regLanguage}
                    onChange={e => {
                      const nextLang = e.target.value as LanguageCode;
                      setRegLanguage(nextLang);
                      setLanguage(nextLang);
                    }}
                    className="w-full px-3 py-2 bg-white border border-gold/40 text-text-dk rounded text-xs font-medium focus:outline-none focus:border-maroon"
                  >
                    {PAN_INDIA_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name}) — {l.region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Subba Rao / Smt. Lakshmi"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                  Mobile / WhatsApp *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="10-digit number (e.g. 9949730175)"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="devotee@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                Ceremonial / Doorstep Address *
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-text-lt" />
                <textarea
                  required
                  rows={2}
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Landmark (where rituals or delivery takes place)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={regCity}
                  onChange={e => setRegCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  value={regPincode}
                  onChange={e => setRegPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
            </div>

            {/* Legal Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-md">
                <input
                  type="checkbox"
                  required
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 accent-maroon"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/privacy" target="_blank" className="text-maroon underline font-semibold">Privacy Policy</Link>
                  {', '}
                  <Link to="/terms" target="_blank" className="text-maroon underline font-semibold">Terms of Service</Link>
                  {' and '}
                  <Link to="/shipping-policy" target="_blank" className="text-maroon underline font-semibold">Shipping Policy</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-gold-pale font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : t('completeRegistration')}
            </button>
          </form>
        )}

        {/* ─── LOGIN FORM ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                Registered Email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@gurupadukam.com' : 'devotee@example.com'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-gold-pale font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : `Sign In as ${role === 'admin' ? 'Administrator' : 'Devotee'}`}
            </button>
          </form>
        )}

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-gold/20 text-center">
          <p className="text-xs text-text-lt mb-3">Quick One-Click Demo Access:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo(false)}
              className="flex-1 py-2 px-3 border border-gold/40 bg-white hover:bg-gold/10 text-maroon text-xs font-semibold rounded transition-colors"
            >
              Demo Devotee Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo(true)}
              className="flex-1 py-2 px-3 border border-gold/40 bg-white hover:bg-gold/10 text-maroon text-xs font-semibold rounded transition-colors"
            >
              Demo Admin Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
