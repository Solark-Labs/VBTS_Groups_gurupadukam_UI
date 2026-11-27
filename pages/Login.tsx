import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2, User, Phone, MapPin, Mail, Lock, Globe, Camera, X,
  ShieldCheck, Upload, CheckCircle2, BadgeCheck, FileCheck
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { PAN_INDIA_LANGUAGES, LanguageCode } from '../i18n/languages';
import { CashfreeOrderResponse, createCashfreeTokenOrder } from '../services/paymentService';
import { CashfreeCheckoutModal } from '../components/CashfreeCheckoutModal';

export const Login: React.FC = () => {
  const { login, register, isAuthLoading, language, setLanguage, addToast, t } = useAppContext();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'user' | 'purohit' | 'admin'>('user');

  // Login states
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

  // Separate Role-Specific Policies
  const [devoteePolicyAgreed, setDevoteePolicyAgreed] = useState(false);
  const [purohitPolicyAgreed, setPurohitPolicyAgreed] = useState(false);

  // Purohit Mandatory KYC States (Aadhaar ID + ₹1 Witness Verification)
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocPreview, setAadhaarDocPreview] = useState<string | undefined>(undefined);
  const [vedicSampradaya, setVedicSampradaya] = useState('');
  const [experienceYears, setExperienceYears] = useState<string>('5');
  const [readyToShowId, setReadyToShowId] = useState(false);
  const [kycRupeeReceipt, setKycRupeeReceipt] = useState<{ cfOrderId: string; cfPaymentId: string } | null>(null);
  const [pendingKycOrder, setPendingKycOrder] = useState<CashfreeOrderResponse | null>(null);
  const [startingKycPay, setStartingKycPay] = useState(false);

  const isTe = language === 'te';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setRegProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Please upload an Aadhaar card image under 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAadhaarDocPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const cleanAadhaarDigits = aadhaarNumber.replace(/\D/g, '');
  const isAadhaarValid = cleanAadhaarDigits.length === 12 && Boolean(aadhaarDocPreview);

  const startPurohitKycRupeePay = async () => {
    if (!regName.trim() || regPhone.replace(/\D/g, '').length < 10) {
      addToast('Enter your Full Legal Name and 10-digit Mobile Number before ₹1 KYC payment.', 'error');
      return;
    }
    if (!isAadhaarValid) {
      addToast('Enter your 12-digit Aadhaar Number and upload Aadhaar ID image first.', 'error');
      return;
    }
    setStartingKycPay(true);
    try {
      const cfOrder = await createCashfreeTokenOrder({
        bookingRef: `KYC_PR_${Date.now().toString().slice(-6)}`,
        customerName: regName.trim(),
        customerPhone: regPhone.replace(/\D/g, '').slice(-10),
        customerEmail: regEmail.trim() || 'purohit@gurupadukam.com',
        amount: 1,
        purpose: 'PUROHIT_KYC',
      });
      setPendingKycOrder(cfOrder);
    } finally {
      setStartingKycPay(false);
    }
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

    if (role === 'purohit') {
      if (!purohitPolicyAgreed || !readyToShowId) {
        addToast('Please accept the Purohit Code of Conduct and confirm readiness to show verification ID.', 'error');
        return;
      }
      if (!isAadhaarValid) {
        addToast('Purohit Registration requires 12-digit Aadhaar ID number + Aadhaar document upload.', 'error');
        return;
      }
      if (!kycRupeeReceipt) {
        addToast('Please complete the ₹1 KYC Witness Payment to gurupadukam.com via Cashfree.', 'error');
        return;
      }
    } else if (!devoteePolicyAgreed) {
      addToast('Please read and agree to the Devotee Registration Policies & Terms to continue.', 'error');
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
      ...(role === 'purohit' && kycRupeeReceipt
        ? {
            aadhaarLast4: cleanAadhaarDigits.slice(-4),
            aadhaarDocPreview,
            kycVerified: true,
            kycRupeePaid: true,
            kycCfOrderId: kycRupeeReceipt.cfOrderId,
            kycCfPaymentId: kycRupeeReceipt.cfPaymentId,
            kycVerifiedAt: new Date().toISOString(),
            readyToShowVerification: readyToShowId,
            vedicSampradaya: vedicSampradaya.trim() || 'Smarttha / Krishna Yajurveda',
            experienceYears: Number(experienceYears) || 5,
            acceptedRolePolicyAt: new Date().toISOString(),
          }
        : {
            acceptedRolePolicyAt: new Date().toISOString(),
          }),
    });

    navigate(role === 'admin' ? '/admin' : role === 'purohit' ? '/purohit-dashboard' : '/');
  };

  const handleQuickDemo = async (demoRole: 'user' | 'purohit' | 'admin') => {
    if (demoRole === 'admin') {
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
    } else if (demoRole === 'purohit') {
      await register({
        name: 'Brahmasri Subrahmanyam Sharma',
        email: 'purohit@gurupadukam.com',
        phone: '9949730175',
        address: 'Madhuranagar Temple Lane',
        city: 'Khammam',
        pincode: '507002',
        role: 'purohit',
        aadhaarLast4: '4829',
        kycVerified: true,
        kycRupeePaid: true,
        kycCfPaymentId: 'CF_KYC_DEMO_1RUPEE',
        kycVerifiedAt: new Date().toISOString(),
        readyToShowVerification: true,
        vedicSampradaya: 'Krishna Yajurveda',
        experienceYears: 25,
      });
      navigate('/purohit-dashboard');
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
      <div className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain pointer-events-none" style={{ backgroundImage: "url('/logo.png')" }} />

      <div className="max-w-2xl w-full bg-cream/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl rounded-lg border border-gold/40 relative z-10">

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
        <div className="flex bg-maroon-dk/10 p-1 rounded-md mb-5 border border-maroon/15">
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

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs font-semibold">
          {([
            { id: 'user', title: isTe ? 'భక్తులు / కుటుంబం' : 'Devotee / Family', sub: 'Book @ ₹11' },
            { id: 'purohit', title: isTe ? 'పురోహితులు / పీఠం' : 'Purohit / Peeta', sub: 'Aadhaar + ₹1 KYC' },
            { id: 'admin', title: 'Platform Admin', sub: 'Operations' },
          ] as const).map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRole(item.id)}
              className={`p-2.5 rounded-md border text-center transition-all ${
                role === item.id
                  ? 'bg-maroon text-gold-pale border-maroon shadow'
                  : 'bg-white text-text-dk border-gold/30 hover:border-maroon/40'
              }`}
            >
              <div className="font-bold text-[11px] sm:text-xs">{item.title}</div>
              <div className={`text-[10px] mt-0.5 ${role === item.id ? 'text-gold-lt' : 'text-text-lt'}`}>
                {item.sub}
              </div>
            </button>
          ))}
        </div>

        {/* ─── REGISTRATION FORM ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Profile Photo + Preferred Language */}
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
                    Profile Photo {role === 'purohit' ? '(Recommended for Devotee Trust)' : '(Optional)'}
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
                Full Legal Name (As Per ID) *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lt" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder={role === 'purohit' ? 'e.g. Brahmasri Subrahmanyam Sharma' : 'e.g. Subba Rao / Smt. Lakshmi'}
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
                    placeholder={role === 'purohit' ? 'sharma.purohit@example.com' : 'devotee@example.com'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gold/40 text-text-dk rounded text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-maroon mb-1">
                {role === 'purohit' ? 'Service Area / Residence Address *' : 'Ceremonial / Doorstep Address *'}
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-text-lt" />
                <textarea
                  required
                  rows={2}
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Landmark"
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

            {/* ─── SEPARATE ROLE POLICIES & MANDATORY PUROHIT KYC ─── */}
            {role === 'purohit' ? (
              <div className="bg-amber-50/90 border-2 border-gold/60 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-2.5 border-b border-gold/30 pb-3">
                  <ShieldCheck size={20} className="text-maroon shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon">
                      Purohit Verification (Mandatory Aadhaar KYC + ₹1 Witness Payment)
                    </h3>
                    <p className="text-[11px] text-amber-950 mt-0.5 leading-snug">
                      Every Purohit on gurupadukam.com must verify Aadhaar identity and complete a nominal <strong>₹1 verification payment</strong> to witness bank/UPI credentials, and remain always ready to show verification to devotees or platform support.
                    </p>
                  </div>
                </div>

                {/* Vedic Lineage & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-maroon mb-1">
                      Vedic Sampradaya / Veda Branch *
                    </label>
                    <input
                      type="text"
                      required
                      value={vedicSampradaya}
                      onChange={e => setVedicSampradaya(e.target.value)}
                      placeholder="e.g. Krishna Yajurveda / Smartha"
                      className="w-full px-3 py-2 text-xs border border-gold/40 bg-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-maroon mb-1">
                      Years of Vedic Experience *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={75}
                      required
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gold/40 bg-white rounded"
                    />
                  </div>
                </div>

                {/* Step 1: Aadhaar Verification */}
                <div className="bg-white border border-gold/30 rounded-md p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-maroon flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-gold-dk" /> Step 1: Aadhaar ID Verification
                    </span>
                    {isAadhaarValid && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        ✓ Ready (XXXX-XXXX-{cleanAadhaarDigits.slice(-4)})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-md mb-1">
                        12-Digit Aadhaar Number *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={aadhaarNumber}
                        onChange={e => setAadhaarNumber(formatAadhaar(e.target.value))}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full px-3 py-2 text-xs font-mono border border-gold/40 bg-cream/30 rounded focus:outline-none focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-md mb-1">
                        Upload Aadhaar ID Card Image *
                      </label>
                      <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 bg-cream border border-gold/40 rounded text-xs font-bold text-maroon hover:bg-gold/15">
                        <Upload size={13} />
                        {aadhaarDocPreview ? 'Change Aadhaar File ✓' : 'Upload Aadhaar Photo'}
                        <input type="file" accept="image/*" onChange={handleAadhaarUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                  {aadhaarDocPreview && (
                    <div className="flex items-center gap-2 text-[11px] text-green-800 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded">
                      <FileCheck size={14} /> Aadhaar card preview attached (only masked last 4 digits shared on verification badge).
                    </div>
                  )}
                </div>

                {/* Step 2: ₹1 KYC Witness Payment */}
                <div className="bg-white border border-gold/30 rounded-md p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-maroon">
                        Step 2: ₹1 KYC Witness Payment to gurupadukam.com
                      </div>
                      <p className="text-[11px] text-text-md">
                        Pay ₹1 via Cashfree (UPI/Card) to witness your verified bank/UPI identity &amp; activate Purohit onboarding.
                      </p>
                    </div>
                    {kycRupeeReceipt ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 border border-green-300 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={13} /> ₹1 Witness Paid ({kycRupeeReceipt.cfPaymentId})
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={startingKycPay}
                        onClick={startPurohitKycRupeePay}
                        className="px-4 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-maroon-md disabled:opacity-60"
                      >
                        {startingKycPay ? 'Opening Cashfree…' : 'Pay ₹1 KYC Verification →'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Purohit Code of Conduct & Verification Readiness Policies */}
                <div className="bg-white border border-maroon/20 rounded-md p-3 space-y-2 text-[11px] text-text-dk">
                  <div className="font-bold uppercase tracking-wider text-maroon text-[10px]">
                    Purohit Partner Policies (Separate From Devotee Policies)
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-text-md">
                    <li><strong>Always Ready to Show Verification:</strong> Keep your Aadhaar &amp; Guru Padukam digital KYC badge ready for verification by devotees or platform admins at any ceremony.</li>
                    <li><strong>Direct Contact &amp; Muhurtham Duty:</strong> Call the devotee after receiving a ₹11 token, finalize Nakshatram/Muhurtham, and record any direct advance transparently.</li>
                    <li><strong>Strict Calendar Discipline:</strong> Cancel prior to the ceremony only with a valid reason so ₹11 returns to the devotee wallet, or trigger Locality Emergency Handoff.</li>
                  </ul>
                  <label className="flex items-start gap-2 cursor-pointer pt-1 font-medium text-text-dk">
                    <input
                      type="checkbox"
                      checked={readyToShowId}
                      onChange={e => setReadyToShowId(e.target.checked)}
                      className="mt-0.5 accent-maroon"
                    />
                    <span>I confirm my Aadhaar KYC is genuine and I am always ready to show my verification ID at ceremonies.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer font-medium text-text-dk">
                    <input
                      type="checkbox"
                      checked={purohitPolicyAgreed}
                      onChange={e => setPurohitPolicyAgreed(e.target.checked)}
                      className="mt-0.5 accent-maroon"
                    />
                    <span>
                      I agree to the <strong>Purohit Partner Code of Conduct</strong>,{' '}
                      <Link to="/terms" target="_blank" className="text-maroon underline font-semibold">Terms &amp; Conditions</Link>, and{' '}
                      <Link to="/privacy" target="_blank" className="text-maroon underline font-semibold">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              /* ─── DEVOTEE REGISTRATION POLICIES ─── */
              <div className="bg-white border border-gold/35 rounded-lg p-4 space-y-2.5 text-xs">
                <div className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gold-dk" /> Devotee Policies &amp; Protection Summary
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-text-md">
                  <li><strong>₹11 Online Token Only:</strong> Direct ceremony Dakshina/advance is negotiated directly with your Purohit and acknowledged on your booking card.</li>
                  <li><strong>Zero-Loss Swaps &amp; Cancellation Windows:</strong> Free date swap (`≥3 days` standard / `≥10 days` major rituals). Purohit declines auto-credit `₹11` to your Wallet. Same-day or immediate bookings follow direct Purohit rules.</li>
                  <li><strong>Partner Store Orders:</strong> Marketplace items are fulfilled by partner stores; Guru Padukam Support speaks directly with merchants on your behalf if issues occur.</li>
                </ul>
                <label className="flex items-start gap-2 cursor-pointer pt-1 text-[11px] text-text-dk">
                  <input
                    type="checkbox"
                    required
                    checked={devoteePolicyAgreed}
                    onChange={e => setDevoteePolicyAgreed(e.target.checked)}
                    className="mt-0.5 accent-maroon"
                  />
                  <span>
                    I accept the <strong>Devotee Policies</strong>,{' '}
                    <Link to="/terms" target="_blank" className="text-maroon underline font-semibold">Terms &amp; Conditions</Link>,{' '}
                    <Link to="/return-policy" target="_blank" className="text-maroon underline font-semibold">Refund &amp; Cancellation Policy</Link>, and{' '}
                    <Link to="/privacy" target="_blank" className="text-maroon underline font-semibold">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-gold-pale font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isAuthLoading
                ? <Loader2 className="animate-spin" size={16} />
                : role === 'purohit'
                ? 'Complete Verified Purohit Registration'
                : t('completeRegistration')}
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
                  placeholder={role === 'admin' ? 'admin@gurupadukam.com' : role === 'purohit' ? 'purohit@gurupadukam.com' : 'devotee@example.com'}
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
              {isAuthLoading
                ? <Loader2 className="animate-spin" size={16} />
                : `Sign In as ${role === 'admin' ? 'Administrator' : role === 'purohit' ? 'Purohit Partner' : 'Devotee'}`}
            </button>
          </form>
        )}

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-gold/20 text-center">
          <p className="text-xs text-text-lt mb-3">Quick One-Click Demo Access:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="py-2 px-3 border border-gold/40 bg-white hover:bg-gold/10 text-maroon text-xs font-semibold rounded transition-colors"
            >
              Demo Devotee
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('purohit')}
              className="py-2 px-3 border border-gold/40 bg-white hover:bg-gold/10 text-maroon text-xs font-semibold rounded transition-colors"
            >
              Demo Verified Purohit
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 border border-gold/40 bg-white hover:bg-gold/10 text-maroon text-xs font-semibold rounded transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>

      {/* ₹1 KYC Witness Payment Cashfree Modal */}
      {pendingKycOrder && (
        <CashfreeCheckoutModal
          order={pendingKycOrder}
          bookingRef={pendingKycOrder.cfOrderId}
          userId={regEmail || regPhone || 'purohit_kyc'}
          customerName={regName || 'Purohit Applicant'}
          customerPhone={regPhone || '9949730175'}
          description="₹1 Purohit KYC Witness Verification to GuruPadukam.com"
          onSuccess={receipt => {
            setKycRupeeReceipt(receipt);
            setPendingKycOrder(null);
            addToast(`₹1 KYC Witness Payment Verified (${receipt.cfPaymentId})! Complete your registration below.`, 'success');
          }}
          onCancel={msg => {
            setPendingKycOrder(null);
            addToast(msg || '₹1 KYC verification payment was not completed.', 'error');
          }}
        />
      )}
    </div>
  );
};
