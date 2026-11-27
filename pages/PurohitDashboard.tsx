import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, MapPin, Navigation, Package,
  Phone, RefreshCw, ShieldAlert, Truck, UserCheck, ExternalLink, Sparkles, Camera, Upload
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Booking } from '../types';
import { getBookingMapDirectionsUrl } from '../utils/whatsapp';

export const PurohitDashboard: React.FC = () => {
  const {
    purohits,
    aparaPeetas,
    bookings,
    products,
    requestBookingHandoff,
    acceptBookingHandoff,
    attachSamagriToBooking,
    uploadPurohitPhoto,
    uploadAparaPhoto,
    addToast,
  } = useAppContext();

  const [activePurohitId, setActivePurohitId] = useState<string>(purohits[0]?.id || 'pr1');
  const [selectedAparaId, setSelectedAparaId] = useState<string>(aparaPeetas[0]?.id || 'ap1');
  const [handoffBookingId, setHandoffBookingId] = useState<string | null>(null);
  const [handoffReason, setHandoffReason] = useState<string>('');
  const [samagriBookingId, setSamagriBookingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
                return (
                  <div key={b.id} className="bg-white border border-gold/25 p-5 rounded-sm shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cinzel font-bold text-maroon text-base">{b.id}</span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {b.status}
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
                          📅 <strong>{b.date}</strong> · ⏰ <strong>{b.time}</strong> · ₹{b.total} Token Confirmed
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
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

                    {/* Complete Devotee & Samagri Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-cream/60 border border-gold/15 p-3.5 rounded-sm text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-maroon uppercase tracking-wider text-[10px]">Devotee &amp; Doorstep Details</div>
                        <div><strong>Host:</strong> {b.userName} (+91 {b.userPhone})</div>
                        <div className="flex items-start gap-1">
                          <MapPin size={12} className="text-maroon shrink-0 mt-0.5" />
                          <span>{b.address}, {b.city} – {b.pincode}</span>
                        </div>
                        {b.notes && <div><strong>Gotram / Notes:</strong> {b.notes}</div>}
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-bold text-maroon uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Truck size={12} /> Pooja Items / 30-Min Prior Shipping
                        </div>
                        <div>
                          <strong>Mode:</strong>{' '}
                          {b.samagriMode === 'marketplace-30min'
                            ? 'Guru Padukam Express (Ships 30 mins before event)'
                            : b.samagriMode === 'purohit-brings'
                            ? 'Purohit brings Pooja Items'
                            : 'Family arranges Pooja Items'}
                        </div>
                        {b.samagriItems && b.samagriItems.length > 0 && (
                          <div className="text-green-800 bg-green-50 border border-green-200 px-2 py-1 rounded-sm">
                            <strong>Scheduled Items (30-min prior):</strong> {b.samagriItems.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Purohit Actions: Order 30-min prior items OR Emergency Handoff */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gold/10">
                      <button
                        type="button"
                        onClick={() => {
                          setSamagriBookingId(samagriBookingId === b.id ? null : b.id);
                          setSelectedItems(b.samagriItems || []);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold/20 text-maroon border border-gold/40 px-3.5 py-2 rounded-sm hover:bg-gold/30 transition-colors"
                      >
                        <Package size={14} /> Order Pooja Items (Ships 30 min prior)
                      </button>

                      {b.handoffStatus !== 'requested' && (
                        <button
                          type="button"
                          onClick={() => setHandoffBookingId(handoffBookingId === b.id ? null : b.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-300 px-3.5 py-2 rounded-sm hover:bg-red-100 transition-colors"
                        >
                          <RefreshCw size={13} /> Emergency Handoff (Opt Out)
                        </button>
                      )}
                    </div>

                    {/* Inline Samagri 30-Min Prior Selector */}
                    {samagriBookingId === b.id && (
                      <div className="bg-ivory border border-gold/30 p-4 rounded-sm space-y-3 animate-fade-in">
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

                    {/* Inline Emergency Handoff Form */}
                    {handoffBookingId === b.id && (
                      <form onSubmit={handleRequestHandoff} className="bg-red-50 border border-red-200 p-4 rounded-sm space-y-3 animate-fade-in">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
