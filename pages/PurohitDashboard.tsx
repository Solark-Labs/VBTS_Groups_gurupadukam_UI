import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, MapPin, Navigation, Package,
  Phone, RefreshCw, ShieldAlert, ShieldCheck, BadgeCheck, Truck, UserCheck, ExternalLink, Sparkles, Camera, Upload, X
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Booking } from '../types';
import { getBookingMapDirectionsUrl } from '../utils/whatsapp';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import { CashfreeOrderResponse, createCashfreeTokenOrder, syncPurohitKycToBackend } from '../services/paymentService';
import { CashfreeCheckoutModal } from '../components/CashfreeCheckoutModal';

export const PurohitDashboard: React.FC = () => {
  const {
    user,
    updateProfile,
    purohits,
    aparaPeetas,
    bookings,
    products,
    requestBookingHandoff,
    acceptBookingHandoff,
    purohitRespondToBooking,
    attachSamagriToBooking,
    uploadPurohitPhoto,
    uploadAparaPhoto,
    addToast,
  } = useAppContext();

  const [activePurohitId, setActivePurohitId] = useState<string>(purohits[0]?.id || 'pr1');
  const [selectedAparaId, setSelectedAparaId] = useState<string>(aparaPeetas[0]?.id || 'ap1');
  const [handoffBookingId, setHandoffBookingId] = useState<string | null>(null);
  const [handoffReason, setHandoffReason] = useState<string>('');
  const [muhurthamBookingId, setMuhurthamBookingId] = useState<string | null>(null);
  const [muhurthamDate, setMuhurthamDate] = useState<string>('');
  const [muhurthamTime, setMuhurthamTime] = useState<string>('08:30');
  const [nakshatramNote, setNakshatramNote] = useState<string>('Rohini Nakshatram · Abhijit Muhurtham');
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Tight schedule / Muhurtham timing conflict');
  const [samagriBookingId, setSamagriBookingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [kycAadhaarInput, setKycAadhaarInput] = useState('');
  const [pendingKycOrder, setPendingKycOrder] = useState<CashfreeOrderResponse | null>(null);

  const activePurohit = purohits.find(p => p.id === activePurohitId) || purohits[0];

  // Bookings assigned to this purohit
  const myBookings = bookings.filter(b => b.purohitId === activePurohit.id);

  // Urgent locality handoffs popped for other purohits in the locality
  const localityHandoffs = bookings.filter(
    b =>
      b.handoffStatus === 'requested' &&
      b.purohitId !== activePurohit.id
  );

  const handleRequestHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffBookingId) return;
    requestBookingHandoff(
      handoffBookingId,
      handoffReason.trim() || 'Unavoidable personal/travel emergency — requesting immediate locality replacement'
    );
    setHandoffBookingId(null);
    setHandoffReason('');
  };

  const handleScheduleSamagri = (booking: Booking) => {
    if (selectedItems.length === 0) {
      addToast('Select at least one pooja kit/item to schedule 30-min prior shipping.', 'error');
      return;
    }
    attachSamagriToBooking(booking.id, 'marketplace-30min', selectedItems);
    setSamagriBookingId(null);
    setSelectedItems([]);
  };

  const toggleItem = (name: string) => {
    setSelectedItems(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handlePhotoUpload = (target: 'purohit' | 'apara', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Please upload an image under 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'purohit') {
          uploadPurohitPhoto(activePurohit.id, reader.result);
        } else {
          uploadAparaPhoto(selectedAparaId, reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-cream pt-[104px] pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header + Purohit Switcher */}
        <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-cream p-6 rounded-sm shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gold flex items-center gap-1.5 mb-1">
              <Sparkles size={13} /> Purohit Partner Operations Portal
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {activePurohit?.name}
            </h1>
            <p className="text-xs text-cream/75 mt-1">
              Locality: <strong>{activePurohit?.location}</strong> · Full ceremony details, 30-min prior marketplace samagri &amp; emergency handoff
            </p>
          </div>

          <div className="bg-white/10 border border-gold/30 p-3 rounded-sm w-full md:w-auto">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-lt mb-1">
              Switch Active Purohit View (Demo)
            </label>
            <select
              value={activePurohitId}
              onChange={e => setActivePurohitId(e.target.value)}
              className="w-full md:w-64 px-3 py-1.5 text-xs font-semibold bg-white text-maroon rounded-sm focus:outline-none"
            >
              {purohits.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location.split(',')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── PUROHIT VERIFICATION & KYC READINESS BAR (AADHAAR + ₹1 WITNESS) ─── */}
        <div className="bg-white border-2 border-gold/40 p-4 sm:p-5 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 border border-green-300 flex items-center justify-center shrink-0 text-green-700">
              <BadgeCheck size={22} />
            </div>
            <div>
              <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-2 flex-wrap">
                Purohit Verification Status
                {(user?.kycVerified || activePurohit?.verified) ? (
                  <span className="text-[10px] bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-full">
                    ✓ Aadhaar (XXXX-XXXX-{user?.aadhaarLast4 || '4829'}) + ₹1 KYC Verified
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                    Pending ₹1 Witness KYC
                  </span>
                )}
              </div>
              <p className="text-xs text-text-md mt-1">
                Always keep your verification card ready to present at the devotee&apos;s venue or to Guru Padukam team upon request.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowVerificationCard(true)}
              className="inline-flex items-center gap-1.5 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-maroon-md shadow-sm"
            >
              <ShieldCheck size={14} /> Show Verification Badge
            </button>
          </div>
        </div>

        {user?.role === 'purohit' && !user?.kycVerified && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-maroon">Complete Your Mandatory Purohit Aadhaar + ₹1 Witness KYC</div>
              <p className="text-amber-950">Enter your 12-digit Aadhaar number and pay ₹1 via Cashfree to unlock your verified digital ID badge.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={kycAadhaarInput}
                onChange={e => setKycAadhaarInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="12-digit Aadhaar"
                className="px-3 py-2 border border-gold/40 bg-white rounded-sm font-mono text-xs w-40"
              />
              <button
                type="button"
                onClick={async () => {
                  if (kycAadhaarInput.replace(/\D/g, '').length !== 12) {
                    addToast('Please enter a valid 12-digit Aadhaar number first.', 'error');
                    return;
                  }
                  const cfOrder = await createCashfreeTokenOrder({
                    bookingRef: `KYC_DASH_${Date.now().toString().slice(-5)}`,
                    customerName: user.name,
                    customerPhone: user.phone || '9949730175',
                    customerEmail: user.email,
                    amount: 1,
                    purpose: 'PUROHIT_KYC',
                  });
                  setPendingKycOrder(cfOrder);
                }}
                className="px-4 py-2 bg-green-700 text-white font-bold rounded-sm hover:bg-green-800"
              >
                Verify Aadhaar + Pay ₹1 →
              </button>
            </div>
          </div>
        )}

        {/* ─── LOCALITY EMERGENCY HANDOFF POP-UP ALERTS ─── */}
        {localityHandoffs.length > 0 && (
          <div className="bg-red-50 border-2 border-red-400 p-5 rounded-sm shadow-lg space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-red-900 font-cinzel text-sm font-bold uppercase tracking-wider">
                <ShieldAlert size={18} className="text-red-600 animate-pulse" />
                Urgent Locality Handoff Pop-Up ({localityHandoffs.length} Available)
              </div>
              <span className="text-[11px] font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                First Purohit to Accept Gets Auto-Assigned
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localityHandoffs.map(hb => (
                <div key={hb.id} className="bg-white border border-red-200 p-4 rounded-sm space-y-2.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-cinzel font-bold text-maroon text-sm">{hb.id}</span>
                      <div className="font-bold text-text-dk text-sm">{hb.occasion}</div>
                      <div className="text-xs text-text-md">
                        📅 {hb.date} at <strong>{hb.time}</strong> · Locality: {hb.locality || hb.city}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      ₹11 Token Confirmed
                    </span>
                  </div>

                  <div className="text-xs text-text-md bg-cream/70 p-2.5 rounded-sm border border-gold/15 space-y-1">
                    <div><strong>Devotee:</strong> {hb.userName} (+91 {hb.userPhone})</div>
                    <div><strong>Address:</strong> {hb.address}, {hb.city} - {hb.pincode}</div>
                    {hb.handoffReason && <div className="text-red-700"><strong>Emergency Note:</strong> {hb.handoffReason}</div>}
                  </div>

                  <button
                    type="button"
                    onClick={() => acceptBookingHandoff(hb.id, activePurohit)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-cinzel text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <UserCheck size={15} /> Accept Handoff &amp; Auto-Assign to Me
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PUROHIT & APARA GALLERY PHOTO UPLOAD (PUROHIT ONLY) ─── */}
        <div className="bg-white border border-gold/25 p-5 rounded-sm shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
              <Camera size={14} /> Upload to My Purohit Profile
            </div>
            <p className="text-xs text-text-md">
              Add real ceremony photos for <strong>{activePurohit?.name}</strong> (visible to devotees on your profile).
            </p>
            <label className="inline-flex items-center gap-1.5 bg-maroon text-gold-pale text-xs font-bold px-3.5 py-2 rounded-sm cursor-pointer hover:bg-maroon-md">
              <Upload size={13} /> Upload Purohit Ceremony Photo
              <input type="file" accept="image/*" onChange={e => handlePhotoUpload('purohit', e)} className="hidden" />
            </label>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-gold/15 pt-3 md:pt-0 md:pl-4">
            <div className="font-cinzel text-xs font-bold uppercase tracking-wider text-maroon flex items-center gap-1.5">
              <Camera size={14} /> Upload to Apara Peeta Gallery
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedAparaId}
                onChange={e => setSelectedAparaId(e.target.value)}
                className="flex-1 min-w-[180px] px-2.5 py-1.5 text-xs border border-gold/30 bg-cream/30 rounded-sm"
              >
                {aparaPeetas.map(ap => (
                  <option key={ap.id} value={ap.id}>{ap.name}</option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1.5 bg-gold/25 border border-gold/40 text-maroon text-xs font-bold px-3.5 py-2 rounded-sm cursor-pointer hover:bg-gold/35">
                <Upload size={13} /> Upload Peeta Photo
                <input type="file" accept="image/*" onChange={e => handlePhotoUpload('apara', e)} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* ─── MY ASSIGNED CEREMONIES ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel text-lg font-bold text-maroon uppercase tracking-wider">
              My Assigned Ceremonies ({myBookings.length})
            </h2>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white border border-gold/20 p-10 text-center rounded-sm space-y-2">
              <p className="font-cinzel text-base text-text-md">No ceremonies currently assigned to {activePurohit?.name}.</p>
              <p className="text-xs text-text-lt">
                Book a Purohit from the Purohits page or switch Purohit view above to inspect assigned bookings and test Emergency Handoff.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myBookings.map(b => {
                const mapUrl = getBookingMapDirectionsUrl(b);
                const latestEvent = b.timeline && b.timeline.length > 0 ? b.timeline[b.timeline.length - 1] : null;
                return (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDetailBooking(b)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDetailBooking(b); } }}
                    className="bg-white border border-gold/25 hover:border-maroon/60 p-5 rounded-sm shadow-sm hover:shadow-md transition-all space-y-4 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cinzel font-bold text-maroon text-base">{b.id}</span>
                          {b.bookingType === 'immediate' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                              ⚡ Immediate Booking
                            </span>
                          )}
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            b.status === 'Muhurtham Finalized' || b.status === 'Confirmed'
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : b.status === 'Rejected by Purohit' || b.status === 'Cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {b.status}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            ✓ ₹{b.total} Verified ({b.paymentMethod || 'Cashfree'})
                          </span>
                          {b.handoffStatus === 'requested' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 animate-pulse">
                              Handoff Broadcasted to Locality
                            </span>
                          )}
                          {b.handoffStatus === 'reassigned' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                              ✓ Auto-Assigned via Handoff
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg font-bold text-text-dk mt-1">{b.occasion}</h3>
                        <p className="text-xs text-text-md">
                          📅 <strong>{b.date}</strong> · ⏰ <strong>{b.time}</strong> · Host: <strong>{b.userName}</strong> (+91 {b.userPhone})
                          {b.nakshatram && <> · ✨ <strong>Nakshatram:</strong> {b.nakshatram}</>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-maroon text-gold-pale text-xs font-bold px-3.5 py-2 rounded-sm hover:bg-maroon-md transition-colors"
                        >
                          <Navigation size={13} /> Google Maps <ExternalLink size={11} />
                        </a>
                        <a
                          href={`tel:+91${b.userPhone}`}
                          className="inline-flex items-center gap-1.5 border border-maroon/30 text-maroon text-xs font-bold px-3 py-2 rounded-sm hover:bg-maroon/5 transition-colors"
                        >
                          <Phone size={13} /> Call Devotee
                        </a>
                      </div>
                    </div>

                    {/* Purohit Quick Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gold/10" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center gap-2">
                        {b.status !== 'Rejected by Purohit' && b.status !== 'Cancelled' && b.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMuhurthamBookingId(muhurthamBookingId === b.id ? null : b.id);
                              setMuhurthamDate(b.date);
                              setMuhurthamTime(b.time);
                              setNakshatramNote(b.nakshatram || 'Rohini Nakshatram · Abhijit Muhurtham');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-3.5 py-2 rounded-sm hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <CheckCircle2 size={14} />
                            {b.muhurthamFinalized ? 'Update Nakshatram / Muhurtham' : 'Accept & Set Muhurtham'}
                          </button>
                        )}
                        {(b.status === 'Awaiting Purohit Approval' || b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Muhurtham Finalized') && (
                          <button
                            type="button"
                            onClick={() => setRejectBookingId(rejectBookingId === b.id ? null : b.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-2 rounded-sm hover:bg-amber-200 transition-colors"
                          >
                            Cancel Prior to Ritual (₹11 Wallet)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSamagriBookingId(samagriBookingId === b.id ? null : b.id);
                            setSelectedItems(b.samagriItems || []);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold/20 text-maroon border border-gold/40 px-3.5 py-2 rounded-sm hover:bg-gold/30 transition-colors"
                        >
                          <Package size={14} /> Order Pooja Items
                        </button>
                      </div>

                      {b.handoffStatus !== 'requested' && b.status !== 'Rejected by Purohit' && b.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => setHandoffBookingId(handoffBookingId === b.id ? null : b.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-300 px-3.5 py-2 rounded-sm hover:bg-red-100 transition-colors"
                        >
                          <RefreshCw size={13} /> Emergency Handoff
                        </button>
                      )}
                    </div>

                    {/* Inline Forms (Stop card click propagation inside) */}
                    {muhurthamBookingId === b.id && (
                      <form
                        onClick={e => e.stopPropagation()}
                        onSubmit={e => {
                          e.preventDefault();
                          purohitRespondToBooking(b.id, 'accept', {
                            finalDate: muhurthamDate,
                            finalTime: muhurthamTime,
                            nakshatram: nakshatramNote,
                          });
                          setMuhurthamBookingId(null);
                        }}
                        className="bg-green-50 border border-green-300 p-4 rounded-sm space-y-3 animate-fade-in"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-bold text-green-950">
                            1. Contact {b.userName} (+91 {b.userPhone}) &rarr; 2. Decide Muhurtham by Nakshatram &rarr; 3. Finalize &amp; Trigger Guru Padukam Team
                          </div>
                          <a
                            href={`tel:+91${b.userPhone}`}
                            className="text-[11px] font-bold px-2.5 py-1 bg-white border border-green-400 text-green-800 rounded"
                          >
                            📞 Call Devotee First
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-green-900 mb-1">Nakshatram / Thithi *</label>
                            <input
                              type="text"
                              required
                              value={nakshatramNote}
                              onChange={e => setNakshatramNote(e.target.value)}
                              placeholder="e.g. Rohini Nakshatram · Shukla Dashami"
                              className="w-full px-2.5 py-2 text-xs border border-green-300 bg-white rounded-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-green-900 mb-1">Finalized Date *</label>
                            <input
                              type="date"
                              required
                              value={muhurthamDate}
                              onChange={e => setMuhurthamDate(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs border border-green-300 bg-white rounded-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-green-900 mb-1">Finalized Muhurtham Time *</label>
                            <input
                              type="time"
                              required
                              value={muhurthamTime}
                              onChange={e => setMuhurthamTime(e.target.value)}
                              className="w-full px-2.5 py-2 text-xs border border-green-300 bg-white rounded-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-green-800"
                          >
                            Finalize Muhurtham &amp; Notify Guru Padukam Team
                          </button>
                          <button
                            type="button"
                            onClick={() => setMuhurthamBookingId(null)}
                            className="px-3 py-2 border border-green-300 text-green-900 text-xs font-bold rounded-sm"
                          >
                            Close
                          </button>
                        </div>
                      </form>
                    )}

                    {rejectBookingId === b.id && (
                      <form
                        onClick={e => e.stopPropagation()}
                        onSubmit={e => {
                          e.preventDefault();
                          purohitRespondToBooking(b.id, 'reject', { reason: rejectReason });
                          setRejectBookingId(null);
                        }}
                        className="bg-amber-50 border border-amber-300 p-4 rounded-sm space-y-2.5 animate-fade-in"
                      >
                        <div className="text-xs font-bold text-amber-950">
                          Cancel Prior to Ritual (Mandatory Reason) — ₹11 goes directly to Devotee&apos;s Wallet + Push Alert
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Tight schedule / Muhurtham timing conflict', 'Out of town / Travel unavoidable', 'Family medical emergency'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setRejectReason(preset)}
                              className="text-[10px] px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-full hover:bg-amber-100"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          required
                          minLength={5}
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Mandatory cancellation reason (e.g. Tight schedule / Muhurtham overlap)"
                          className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-sm focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-amber-900"
                          >
                            Confirm Cancel &amp; Credit ₹11 Wallet
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectBookingId(null)}
                            className="px-3 py-2 border border-amber-300 text-amber-900 text-xs font-bold rounded-sm"
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    )}

                    {samagriBookingId === b.id && (
                      <div onClick={e => e.stopPropagation()} className="bg-ivory border border-gold/30 p-4 rounded-sm space-y-3 animate-fade-in">
                        <div className="font-cinzel text-xs font-bold text-maroon uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={13} /> Select Pooja Items for 30-Min Prior Dispatch
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                          {products.map(prod => (
                            <label key={prod.id} className="flex items-center gap-2 text-xs bg-white p-2 border border-gold/20 rounded-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(prod.name)}
                                onChange={() => toggleItem(prod.name)}
                                className="accent-maroon"
                              />
                              <span className="font-medium text-text-dk flex-1">{prod.name}</span>
                              <span className="font-bold text-maroon">₹{prod.price}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleScheduleSamagri(b)}
                          className="px-4 py-2 bg-maroon text-gold-pale text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} /> Confirm 30-Min Prior Shipment
                        </button>
                      </div>
                    )}

                    {handoffBookingId === b.id && (
                      <form onClick={e => e.stopPropagation()} onSubmit={handleRequestHandoff} className="bg-red-50 border border-red-200 p-4 rounded-sm space-y-3 animate-fade-in">
                        <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Emergency Handoff — Alert Locality Purohits
                        </div>
                        <input
                          type="text"
                          required
                          value={handoffReason}
                          onChange={e => setHandoffReason(e.target.value)}
                          placeholder="Brief emergency reason (e.g., family medical emergency / travel conflict)"
                          className="w-full px-3 py-2 text-xs border border-red-300 bg-white rounded-sm focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-700"
                          >
                            Broadcast to Locality Purohits
                          </button>
                          <button
                            type="button"
                            onClick={() => setHandoffBookingId(null)}
                            className="px-3 py-2 border border-red-300 text-red-800 text-xs font-bold rounded-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {b.devoteeCancelStatus === 'requested' && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded text-xs text-red-900">
                        <strong>Devotee Requested Cancellation / Swap:</strong> {b.devoteeCancelReason} (Routed to Purohit &amp; Admin)
                      </div>
                    )}

                    <div className="pt-2 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-text-md">
                        {latestEvent
                          ? <><strong>Latest Action:</strong> {latestEvent.actor} — {latestEvent.action}</>
                          : 'Click card to inspect venue details, advance acknowledgment & full timeline'}
                      </span>
                      <span className="font-bold text-maroon text-[11px] underline">
                        Open Neat View &amp; Timeline →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Neat Booking Details Modal (Purohit View) */}
      {selectedDetailBooking && (
        <BookingDetailsModal
          booking={bookings.find(x => x.id === selectedDetailBooking.id) || selectedDetailBooking}
          viewerRole="Purohit"
          onClose={() => setSelectedDetailBooking(null)}
        />
      )}

      {/* Digital Purohit Verification Card Modal (Always Ready to Show Devotees) */}
      {showVerificationCard && (
        <div
          className="fixed inset-0 z-[9995] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVerificationCard(false)}
        >
          <div
            className="max-w-md w-full bg-cream border-2 border-gold rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk p-5 text-center text-cream relative">
              <button
                type="button"
                onClick={() => setShowVerificationCard(false)}
                className="absolute top-3.5 right-3.5 text-cream/75 hover:text-gold"
                aria-label="Close Verification Card"
              >
                <X size={20} />
              </button>
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold-lt mb-1">
                gurupadukam.com · Verified Purohit ID
              </div>
              <h3 className="font-serif text-xl font-bold">{user?.role === 'purohit' ? user.name : activePurohit?.name}</h3>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={user?.profileImage || activePurohit?.image || '/logo.png'}
                  alt="Verified Purohit"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow"
                />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                    <BadgeCheck size={13} /> Aadhaar + ₹1 Witness KYC Active
                  </div>
                  <div className="text-text-dk"><strong>Masked Aadhaar ID:</strong> <span className="font-mono">XXXX-XXXX-{user?.aadhaarLast4 || '4829'}</span></div>
                  <div className="text-text-md"><strong>₹1 KYC Witness Ref:</strong> <span className="font-mono">{user?.kycCfPaymentId || 'CF_KYC_VERIFIED'}</span></div>
                </div>
              </div>
              <div className="bg-white border border-gold/30 rounded-lg p-3 space-y-1">
                <div><strong>Vedic Sampradaya:</strong> {user?.vedicSampradaya || activePurohit?.specializations.slice(0, 2).join(', ')}</div>
                <div><strong>Location:</strong> {user?.city || activePurohit?.location}</div>
                <div className="text-green-800 font-semibold">✓ Ready for venue / devotee verification inspection</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ₹1 Dashboard KYC Completion Cashfree Modal */}
      {pendingKycOrder && user && (
        <CashfreeCheckoutModal
          order={pendingKycOrder}
          bookingRef={pendingKycOrder.cfOrderId}
          userId={user.id}
          customerName={user.name}
          customerPhone={user.phone || '9949730175'}
          description="₹1 Purohit KYC Witness Verification to GuruPadukam.com"
          onSuccess={async receipt => {
            const last4 = kycAadhaarInput.replace(/\D/g, '').slice(-4);
            await updateProfile({
              aadhaarLast4: last4,
              kycVerified: true,
              kycRupeePaid: true,
              kycCfOrderId: receipt.cfOrderId,
              kycCfPaymentId: receipt.cfPaymentId,
              kycVerifiedAt: new Date().toISOString(),
              readyToShowVerification: true,
            });
            syncPurohitKycToBackend({
              email: user.email,
              name: user.name,
              phone: user.phone || '',
              aadhaarLast4: last4,
              kycCfOrderId: receipt.cfOrderId,
              kycCfPaymentId: receipt.cfPaymentId,
              readyToShowVerification: true,
              vedicSampradaya: user.vedicSampradaya,
            });
            setPendingKycOrder(null);
            addToast(`Aadhaar + ₹1 KYC Verified (${receipt.cfPaymentId})! Your Verification Badge is live.`, 'success');
          }}
          onCancel={msg => {
            setPendingKycOrder(null);
            addToast(msg || '₹1 KYC verification payment cancelled.', 'error');
          }}
        />
      )}
    </div>
  );
};
